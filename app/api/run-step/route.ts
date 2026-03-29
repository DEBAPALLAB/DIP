import { NextRequest, NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { buildSystemPrompt, calculateDecision } from "@/lib/prompts";
import type { RunStepRequest, RunStepResponse, AgentState, ScenarioParams } from "@/lib/types";

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
                return `${nb.name} (${nb.persona}): ${st.decision.toUpperCase().slice(0, 10)} — "${(st.reasoning ?? "").slice(0, 90)}..."`;
            })
            .join("\n");

        const userPrompt = `PRODUCT: ${scenario.label} — ${scenario.tag}
${scenario.brief}

YOUR NETWORK:
${neighborLines || "No connections yet."}

You have decided to ${trueDecision?.toUpperCase() || "STAY NEUTRAL"}. 
Explain your reasoning in 2-3 sentences as ${agent.name}.`;

        let response: Response | null = null;
        let lastError: any = null;
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000);

                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://decision-intelligence.app",
                        "X-Title": "Decision Intelligence Platform",
                    },
                    body: JSON.stringify({
                        model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: userPrompt },
                        ],
                        max_tokens: 300,
                        temperature: 0.7,
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                if (response.ok) break;

                const errText = await response.text();
                lastError = new Error(`HTTP ${response.status}: ${errText}`);
                if (response.status >= 400 && response.status < 500 && response.status !== 429) break;

            } catch (err: any) {
                lastError = err;
            }

            if (attempt < maxRetries) {
                const baseWait = response?.status === 429 ? 5000 : 1000;
                await new Promise(resolve => setTimeout(resolve, baseWait * Math.pow(2, attempt)));
            }
        }

        if (!response || !response.ok) {
            return NextResponse.json({ error: lastError?.message || "OpenRouter failed" }, { status: 502 });
        }

        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";

        // Strip any "DECISION: ..." meta-tags from the text (case-insensitive)
        const reasoning = text.replace(/DECISION:\s*(support|neutral|oppose)/gi, "").trim();

        const result: RunStepResponse = {
            agentId,
            decision: trueDecision, // Use our calculated source of truth
            reasoning,
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("run-step error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
