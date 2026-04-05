import { NextRequest, NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { calculateDecision } from "@/lib/prompts";
import type { RunStepBatchRequest, RunStepBatchResponse, RunStepResponse, AgentState } from "@/lib/types";

let keyRotationIndex = 0;

export async function POST(req: NextRequest) {
    try {
        const body: RunStepBatchRequest = await req.json();
        const { batch, scenarioId, customScenario: bodyCustomScenario, previousParams } = body;

        if (!batch || !Array.isArray(batch) || batch.length === 0) {
            return NextResponse.json({ error: "Empty or invalid batch" }, { status: 400 });
        }

        const scenario = bodyCustomScenario ?? getScenario(scenarioId);
        
        // ─── Phase 1: Deterministic Decisions ───
        const cohortData = batch.map(item => {
            const neighborStateMap: Record<number, AgentState> = Object.fromEntries(
                Object.entries(item.neighborStates || {}).map(([k, v]) => [
                    Number(k),
                    { decision: v.decision, reasoning: v.reasoning, step: null, pending: false },
                ])
            );

            const { decision } = calculateDecision(item.agent, scenario, neighborStateMap, item.neighborAgents || [], previousParams);
            
            return {
                agentId: item.agentId,
                agent: item.agent,
                decision,
                neighborAgents: item.neighborAgents,
                neighborStateMap
            };
        });

        // ─── Phase 2: Narrative Generation ───
        const cohortListString = cohortData.map(d => {
            const neighborLines = (d.neighborAgents ?? [])
                .map(nb => `${nb.name} (${nb.persona}): ${d.neighborStateMap[nb.id]?.decision?.toUpperCase() || "NEUTRAL"}`)
                .join(", ");

            return `ID: ${d.agentId} | NAME: ${d.agent.name} | ARCHETYPE: ${d.agent.persona} | DECISION: ${(d.decision || "neutral").toUpperCase()} | NETWORK: [${neighborLines}]`;
        }).join("\n");

        // ULTRA-BRIEF PROMPT (Prevents token-wasting preamble/reflection)
        const systemPrompt = `ACT AS A DATA GENERATOR.
JSON ARRAY ONLY. NO PREAMBLE. NO THINKING ALOUD.
For each ID, provide ONE concise character-driven sentence explaining their decision.
FORMAT: [{"id": 0, "reasoning": "..."}]`;

        const userPrompt = `SCENARIO: ${scenario.brief}\nCOHORT:\n${cohortListString}\n\nOUTPUT JSON NOW.`;

        // AUTHORIZED FREE MODELS
        const FREE_MODELS = [
            "nvidia/nemotron-3-super-120b-a12b:free",
            "stepfun/step-3.5-flash:free",
            "liquid/lfm-2.5-1.2b-thinking:free",
            "z-ai/glm-4.5-air:free",
            "arcee-ai/trinity-large-preview:free"
        ];

        const allKeys = (process.env.OPENROUTER_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
        if (allKeys.length === 0) throw new Error("No API keys found");

        let response: Response | null = null;
        let lastError: any = null;
        let finalModel = "";

        // Fallback Loop
        for (const model of FREE_MODELS) {
            finalModel = model;
            const key = allKeys[keyRotationIndex % allKeys.length];
            keyRotationIndex++;

            try {
                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${key}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                        temperature: 0.3, // Lower temp = more predictable JSON
                        max_tokens: 4000  // Massive buffer for 10 agents
                    }),
                    signal: AbortSignal.timeout(60000) // 1 minute timeout per model
                });

                if (response.ok) break;
                lastError = await response.text();
            } catch (e) {
                lastError = e;
            }
        }

        if (!response || !response.ok) throw new Error(`Model error: ${lastError}`);

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content ?? "";
        
        // ─── Phase 3: Rescue Parser (Hyper-Resiliency) ───
        let reasonings: { id: number, reasoning: string }[] = [];
        
        const tryParse = (raw: string) => {
            try {
                // 1. Clean markdown headers
                let clean = raw.replace(/```json|```/g, "").trim();
                
                // 2. Extract valid array boundaries
                const start = clean.indexOf('[');
                const end = clean.lastIndexOf(']');
                
                if (start !== -1) {
                    let fragment = clean.substring(start);
                    if (end !== -1 && end > start) {
                        fragment = clean.substring(start, end + 1);
                    } else {
                        // 3. TRUNCATION REPAIR: If it ends abruptly, try to close it
                        // Find the last complete object "}"
                        const lastBrace = fragment.lastIndexOf('}');
                        if (lastBrace !== -1) {
                            fragment = fragment.substring(0, lastBrace + 1) + ']';
                        }
                    }
                    return JSON.parse(fragment);
                }
                return null;
            } catch (e) {
                return null;
            }
        };

        const parsed = tryParse(text);
        if (Array.isArray(parsed)) {
            reasonings = parsed;
        } else if (parsed && (parsed as any).results) {
            reasonings = (parsed as any).results;
        }

        // ─── Phase 4: Final Mapping ───
        const results: RunStepResponse[] = cohortData.map(d => {
            const aiEntry = reasonings.find(r => r.id === d.agentId);
            return {
                agentId: d.agentId,
                decision: d.decision,
                reasoning: aiEntry?.reasoning || "Logic stabilizing in character background...",
                model: finalModel
            };
        });

        return NextResponse.json({ results });

    } catch (err: any) {
        console.error("Batch crash salvaged:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
