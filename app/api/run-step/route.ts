import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getScenario } from "@/lib/scenarios";
import { buildSystemPrompt, calculateDecision } from "@/lib/prompts";
import type { RunStepRequest, RunStepResponse, AgentState, ScenarioParams } from "@/lib/types";


let keyRotationIndex = 0;

export async function POST(req: NextRequest) {
    try {
        const body: RunStepRequest = await req.json();
        const { agentId, agent, scenarioId, customScenario: bodyCustomScenario, previousParams, neighborStates, neighborAgents } = body;

        if (!agent) {
            return NextResponse.json(
                { error: `Agent ${agentId} not found in request` },
                { status: 400 }
            );
        }

        const scenario = bodyCustomScenario ?? getScenario(scenarioId);
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
        }

        // ─── Phase 1: Deterministic Decision (Source of Truth) ───
        const neighborStateMap: Record<number, AgentState> = Object.fromEntries(
            Object.entries(neighborStates || {}).map(([k, v]) => [
                Number(k),
                { decision: v.decision, reasoning: v.reasoning, step: null, pending: false },
            ])
        );

        const { decision: trueDecision } = calculateDecision(agent, scenario, neighborStateMap, neighborAgents || [], previousParams);

        // ─── Phase 2: Narrative Generation ───
        const { systemPrompt } = buildSystemPrompt(agent, scenario, neighborStateMap, neighborAgents || [], previousParams);

        const neighborLines = (neighborAgents ?? [])
            .map((nb) => {
                const st = neighborStateMap[nb.id];
                if (!st?.decision) return `${nb.name} (${nb.persona}): no opinion yet`;
                return `${nb.name} (${nb.persona}): ${st.decision.toUpperCase().slice(0, 10)} — "${(st.reasoning ?? "").slice(0, 200)}..."`;
            })
            .join("\n");

        const userPrompt = `PRODUCT: ${scenario.label} — ${scenario.tag}
${scenario.brief}

YOUR NETWORK:
${neighborLines || "No connections yet."}

You have decided to ${trueDecision?.toUpperCase() || "STAY NEUTRAL"}. 
Explain your reasoning in 2-3 sentences as ${agent.name}.`;

        // Support for multiple API keys (comma-separated in .env)
        const allKeys = (process.env.OPENROUTER_API_KEY || "")
            .split(",")
            .map(k => k.trim().replace(/^["']|["']$/g, ""))
            .filter(Boolean);
        
        console.log(`[API_INIT] Found ${allKeys.length} OpenRouter keys in pool.`);
        if (allKeys.length === 0) throw new Error("No OPENROUTER_API_KEY found");

        const MODELS = [
            "openrouter/free", // The intelligent auto-router
            "stepfun/step-3.5-flash:free",
            "liquid/lfm-2.5-1.2b-thinking:free",
            "google/gemini-flash-1.5", // Removed exp and suffix as it 404ed
        ];

        // Fisher-Yates shuffle to distribute load across providers
        const shuffledModels = [...MODELS];
        for (let i = shuffledModels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledModels[i], shuffledModels[j]] = [shuffledModels[j], shuffledModels[i]];
        }

        let response: Response | null = null;
        let lastError: any = null;
        let usedModel = "";

        // Triple-layer fallback loop (now shuffled)
        for (const model of shuffledModels) {
            usedModel = model;
            const maxRetries = 1; // 1 retry per model before fallback

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout per attempt

                    // STRICT ROUND-ROBIN: Rotate keys sequentially for every single request/retry
                    const selectedKey = allKeys[keyRotationIndex % allKeys.length];
                    keyRotationIndex++;
                    
                    // MASKED LOG: Explicitly see which account is being used
                    console.log(`[AUTH] Using Key ${keyRotationIndex % allKeys.length + 1}/${allKeys.length}: ${selectedKey.slice(0, 10)}...`);

                    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${selectedKey}`,
                            "HTTP-Referer": "https://strawberry-simulation.vercel.app",
                            "X-Title": "Strawberry Strategic Sandbox",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: userPrompt },
                            ],
                            max_tokens: 1000,
                            temperature: 0.7,
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);
                    if (response.ok) break;

                    const errText = await response.text();
                    lastError = new Error(`Model ${model} failed (HTTP ${response.status}): ${errText}`);
                    
                    // Instant skip for 404 (ID deprecated or not available)
                    if (response.status === 404) {
                        console.warn(`404: Model ${model} unavailable. Skipping instantly.`);
                        break;
                    }

                    // Special 429 Handling: Wait 5 seconds to reset window, then try next model
                    if (response.status === 429) {
                        console.warn(`429: Rate limited on model ${model}. Pausing 5s for stability.`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        break; 
                    }

                    // If it's a 4xx error other than 429, don't bother retrying this model, move to next
                    if (response.status >= 400 && response.status < 500) break;

                } catch (err: any) {
                    lastError = err;
                }

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            if (response && response.ok) break;
            
            // LOG FAILURE TO DIAGNOSTICS
            const logPath = path.join(process.cwd(), "DIAGNOSTICS.md");
            const entry = `| ${new Date().toISOString()} | ${agentId} | ${model} | ${response?.status || 'FAIL'} | ${lastError?.message.slice(0, 100) || 'Unknown'} |\n`;
            try { fs.appendFileSync(logPath, entry); } catch (e) { console.error("Logging failed", e); }

            console.warn(`Fallback: Model ${model} failed, trying next...`);
        }

        if (!response || !response.ok) {
            return NextResponse.json({ 
                error: lastError?.message || "All models failed",
                details: `Fallback logic exhausted (Tried: ${MODELS.join(", ")})`
            }, { status: 502 });
        }

        const data = await response.json();
        let text: string = data.choices?.[0]?.message?.content ?? "";

        // 1. Strip common "thought" blocks from thinking models
        text = text.replace(/<(thought|thinking|reasoning)>[\s\S]*?<\/\1>/gi, "");
        text = text.replace(/\[(thought|thinking|reasoning)\][\s\S]*?\[\/\1\]/gi, "");
        
        // 2. Strip any "DECISION: ..." meta-tags (case-insensitive)
        let reasoning = text.replace(/DECISION:\s*(support|neutral|oppose)/gi, "").trim();

        // 3. Robust quote stripping
        reasoning = reasoning.replace(/^["']|["']$/g, "").trim();
        
        // 4. Capitalization fix
        if (reasoning.length > 0) {
            reasoning = reasoning.charAt(0).toUpperCase() + reasoning.slice(1);
        }

        const result: RunStepResponse = {
            agentId,
            decision: trueDecision, 
            reasoning,
            model: usedModel
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("run-step error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
