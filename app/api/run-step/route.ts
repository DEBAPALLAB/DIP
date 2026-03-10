import { NextRequest, NextResponse } from "next/server";
import { getScenario } from "@/lib/scenarios";
import { buildSystemPrompt } from "@/lib/prompts";
import type { RunStepRequest, RunStepResponse, AgentState } from "@/lib/types";

export async function POST(req: NextRequest) {
    try {
        const body: RunStepRequest = await req.json();
        const { agentId, agent, scenarioId, neighborStates, neighborAgents } = body;

        if (!agent) {
            return NextResponse.json(
                { error: `Agent ${agentId} not found in request` },
                { status: 400 }
            );
        }

        const scenario = getScenario(scenarioId);
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "OPENROUTER_API_KEY not set" },
                { status: 500 }
            );
        }

        // Build user prompt dynamically using neighborAgents + neighborStates
        const neighborStateMap: Record<number, AgentState> = Object.fromEntries(
            Object.entries(neighborStates || {}).map(([k, v]) => [
                Number(k),
                { decision: v.decision, reasoning: v.reasoning, step: null, pending: false },
            ])
        );

        const { systemPrompt, calculatedDecision } = buildSystemPrompt(agent, scenario, neighborStateMap);

        const neighborLines = (neighborAgents ?? [])
            .map((nb) => {
                const st = neighborStateMap[nb.id];
                if (!st?.decision)
                    return `${nb.name} (${nb.persona}): no opinion yet`;
                return `${nb.name} (${nb.persona}): ${st.decision.toUpperCase()} — "${(st.reasoning ?? "").slice(0, 90)}..."`;
            })
            .join("\n");

        const userPrompt = `PRODUCT: ${scenario.label} — ${scenario.tag}
${scenario.brief}

YOUR NETWORK:
${neighborLines || "No connections yet."}

What's your honest take on this as ${agent.name}?`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://decision-intelligence.app",
                "X-Title": "Decision Intelligence Platform",
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-preview:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 300,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter error [${response.status}]:`, errText);
            return NextResponse.json(
                { error: `OpenRouter API error ${response.status}: ${errText}` },
                { status: 502 }
            );
        }

        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";

        // Strip the decision line if the LLM accidentally included it anyway
        const reasoning = text.replace(/DECISION:\s*(support|neutral|oppose)/gi, "").trim();

        const result: RunStepResponse = {
            agentId,
            decision: calculatedDecision,
            reasoning,
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("run-step error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
