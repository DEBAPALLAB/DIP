import { NextRequest, NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { calculateDecision } from "@/lib/prompts";
import type { RunStepBatchRequest, RunStepBatchResponse, RunStepResponse, AgentState } from "@/lib/types";
import { generateChatCompletion } from "@/lib/ai";
import { guard } from "@/lib/apiGuard";

let keyRotationIndex = 0;

const MAX_BATCH = 50;

export async function POST(req: NextRequest) {
    const gate = await guard(req);
    if (!gate.ok) return gate.response;

    try {
        const body: RunStepBatchRequest = await req.json();
        const { batch, scenarioId, customScenario: bodyCustomScenario, previousParams } = body;

        if (!batch || !Array.isArray(batch) || batch.length === 0) {
            return NextResponse.json({ error: "Empty or invalid batch" }, { status: 400 });
        }

        if (batch.length > MAX_BATCH) {
            return NextResponse.json({ error: "Batch too large." }, { status: 400 });
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

            const isAware = item.isAware ?? true;
            const signalQuality = item.signalQuality ?? 1;
            const { decision, conviction } = calculateDecision(item.agent, scenario, neighborStateMap, item.neighborAgents || [], previousParams, isAware, signalQuality);

            return {
                agentId: item.agentId,
                agent: item.agent,
                decision,
                conviction,
                isAware,
                neighborAgents: item.neighborAgents,
                neighborStateMap
            };
        });

        // ─── Phase 2: Narrative Generation (Optimized for ultra-low token footprint) ───
        // Unaware agents skip the LLM entirely — there's nothing to reason about yet.
        const awareCohort = cohortData.filter(d => d.isAware);

        const cohortListString = awareCohort.map(d => {
            const neighborLines = (d.neighborAgents ?? [])
                .map(nb => `${nb.persona}:${d.neighborStateMap[nb.id]?.decision?.toUpperCase() || "NEUTRAL"}`)
                .join(",");

            return `${d.agentId}|${d.agent.persona}|${(d.decision || "neutral").toUpperCase()}|${neighborLines}`;
        }).join("\n");

        // ULTRA-BRIEF PROMPT (Prevents token-wasting and reduces input size)
        const systemPrompt = `ACT AS A DATA GENERATOR. JSON ARRAY ONLY. NO THINKING. NO PREAMBLE.
Input: agentId|Archetype|Decision|NeighborArchetype:NeighborStance,...
Output format: [{"id": agentId, "reasoning": "ONE concise sentence matching Archetype, explaining their Decision based on Scenario and NeighborStances"}]`;

        const userPrompt = `SCENARIO: ${scenario.brief}\nCOHORT:\n${cohortListString}\n\nOUTPUT JSON NOW.`;

        // AUTHORIZED HIGH-SPEED MODELS (High-capacity models paired with active lightweight fallbacks)
        const FREE_MODELS = [
            "meta-llama/llama-3.1-8b-instruct:free",
            "nousresearch/hermes-3-llama-3.1-8b:free",
            "meta-llama/llama-3.2-3b-instruct:free",
            "openai/gpt-oss-120b:free",
            "z-ai/glm-4.5-air:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "gryphe/mythomax-l2-13b:free",
            "google/gemma-4-31b-it:free"
        ];

        // Prepare rotated free models list
        const rotatedModels = FREE_MODELS.map((_, idx) => FREE_MODELS[(keyRotationIndex + idx) % FREE_MODELS.length]);

        let reasonings: { id: number, reasoning: string }[] = [];
        let finalModel = "local-no-aware-agents";

        // Skip the LLM entirely if nobody in this batch is aware yet — nothing to reason about.
        if (awareCohort.length > 0) {
            let completionResult;
            try {
                completionResult = await generateChatCompletion({
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500,
                    timeoutMs: 12000,
                    openRouterModels: rotatedModels
                });

                // Advance the rotation index if we ended up using OpenRouter
                if (completionResult.source === "openrouter") {
                    const usedIndex = FREE_MODELS.indexOf(completionResult.model);
                    if (usedIndex !== -1) {
                        keyRotationIndex = (usedIndex + 1) % FREE_MODELS.length;
                    }
                }
            } catch (e: any) {
                console.error(`[API_ROUTE] API execution failed: ${e.message}`);
                return NextResponse.json({
                    error: "Simulation service is busy. Please retry shortly."
                }, { status: 504 });
            }

            const text = completionResult.text;
            finalModel = completionResult.model;

            // ─── Phase 3: Rescue Parser (Hyper-Resiliency) ───
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
        }

        // ─── Phase 4: Final Mapping ───
        const results: RunStepResponse[] = cohortData.map(d => {
            if (!d.isAware) {
                return {
                    agentId: d.agentId,
                    decision: d.decision,
                    conviction: d.conviction,
                    reasoning: null,
                    model: undefined
                };
            }
            const aiEntry = reasonings.find(r => r.id === d.agentId);
            return {
                agentId: d.agentId,
                decision: d.decision,
                conviction: d.conviction,
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
