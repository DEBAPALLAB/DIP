import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/apiGuard";
import { extractObjections } from "@/lib/objections";
import { getScenario } from "@/lib/scenarios";
import type { Agent, Scenario, SimulationStates } from "@/lib/types";

/**
 * Structured Objection Extraction (Tier 2E).
 *
 * Deterministic readout of WHY the market resisted — a direct decomposition of the
 * decision math (which utility term dominated each non-adopter, weighted by network
 * influence, grouped by persona). No LLM in the critical path: the barriers ARE the
 * math. This is the "zero focus-group equivalent" finding.
 */
export async function POST(req: NextRequest) {
    const gate = await guard(req);
    if (!gate.ok) return gate.response;

    try {
        const body = await req.json();
        const {
            agents,
            edges,
            states,
            scenarioId,
            customScenario,
        }: {
            agents: Agent[];
            edges: [number, number][];
            states: SimulationStates;
            scenarioId?: string;
            customScenario?: Scenario;
        } = body;

        if (!Array.isArray(agents) || agents.length === 0) {
            return NextResponse.json({ error: "No agents provided." }, { status: 400 });
        }
        if (!states || typeof states !== "object") {
            return NextResponse.json({ error: "No states provided." }, { status: 400 });
        }
        // Hard cap to keep the recompute bounded.
        if (agents.length > 10000) {
            return NextResponse.json({ error: "Population too large." }, { status: 400 });
        }

        const scenario = customScenario ?? getScenario(scenarioId ?? "");

        // Exclude user-overridden agents so the report reflects organic resistance.
        const interventionExcluded = new Set<number>(
            agents
                .filter((a) => {
                    const st = states[a.id];
                    return st?.muted || st?.locked || st?.removed;
                })
                .map((a) => a.id)
        );

        const report = extractObjections(agents, edges ?? [], scenario, states, { interventionExcluded });

        return NextResponse.json({ report });
    } catch (err: any) {
        console.error("Objection map error:", err);
        return NextResponse.json({ error: err.message || "Failed to extract objections" }, { status: 500 });
    }
}
