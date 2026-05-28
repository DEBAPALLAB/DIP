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

        const allKeys = (process.env.OPENROUTER_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);
        if (allKeys.length === 0) throw new Error("No API keys found");

        let response = null;
        let finalModel = "";
        let errorMsg = "";

        // Try models sequentially until one succeeds
        for (let i = 0; i < FREE_MODELS.length; i++) {
            const currentModel = FREE_MODELS[(keyRotationIndex + i) % FREE_MODELS.length];
            const currentKey = allKeys[keyRotationIndex % allKeys.length];
            
            console.log(`[API_ROUTE] Attempting with model: ${currentModel}...`);

            const apiCall = async () => {
                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${currentKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://strawberry-platform.vercel.app",
                        "X-Title": "Strawberry Decision Platform",
                    },
                    body: JSON.stringify({
                        model: currentModel,
                        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
                        temperature: 0.3,
                        max_tokens: 500 // Drastically reduced from 4000 to maximize generation speed and minimize timeouts
                    }),
                    signal: AbortSignal.timeout(7000) // 7s timeout to fail fast and fallback immediately if a model is congested or queueing
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Model ${currentModel} HTTP error ${res.status}: ${errText}`);
                }
                return res;
            };

            try {
                const res = await apiCall();
                if (res && res.ok) {
                    response = res;
                    finalModel = currentModel;
                    // Advance index beyond this successful one for next time
                    keyRotationIndex = (keyRotationIndex + i + 1) % FREE_MODELS.length;
                    break;
                }
            } catch (e: any) {
                console.error(`[API_ROUTE] Attempt with ${currentModel} failed: ${e.message}`);
                errorMsg = e.message;
            }
        }

        if (!response) {
            return NextResponse.json({ 
                error: `All authorized models failed or rate-limited. Last error: ${errorMsg}` 
            }, { status: 504 });
        }

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
