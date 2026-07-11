/**
 * Structured Objection Extraction (Tier 2E)
 *
 * A deterministic readout of WHY the market resisted — not an LLM guess on top of
 * aggregates, but a direct decomposition of the decision math. For every agent that
 * did NOT adopt, we recompute the utility components, find the single term that most
 * dragged them down, and attribute it. Barriers are then ranked by influence-weighted
 * impact and grouped by persona + network position, producing findings with zero
 * focus-group equivalent, e.g.:
 *
 *   "Your #1 barrier is LOSS AVERSION, concentrated in Skeptics — and it's amplified
 *    because 3 of the blocked Skeptics are network hubs (top-decile influence)."
 */

import type { Agent, Scenario, SimulationStates, PersonaType } from "./types";
import { calculateDecision, type UtilityComponents } from "./prompts";

export type BarrierKey = keyof Pick<UtilityComponents, "risk" | "loss" | "social" | "switching">;

const BARRIER_LABEL: Record<BarrierKey, string> = {
    risk: "Perceived Risk",
    loss: "Loss Aversion",
    social: "Negative Social Pressure",
    switching: "Switching Cost",
};

export interface PersonaBreakdown {
    persona: PersonaType;
    blockedCount: number;      // agents of this persona blocked primarily by this barrier
    influenceWeight: number;   // summed influence of those agents (network amplification)
    hubCount: number;          // how many are top-decile-influence hubs
}

export interface Barrier {
    key: BarrierKey;
    label: string;
    blockedAgents: number;         // total non-adopters whose dominant drag is this term
    influenceWeightedImpact: number; // Σ(|term| × (influence+0.1)) — the ranking signal
    avgMagnitude: number;          // average raw magnitude of this term among those agents
    topPersonas: PersonaBreakdown[]; // personas most affected, most-impactful first
    headline: string;             // one-line human-readable finding
}

export interface ObjectionReport {
    totalAgents: number;
    nonAdopters: number;
    adopters: number;
    barriers: Barrier[];          // ranked, most-impactful first
    summary: string;              // top-line sentence for the UI
}

interface EdgeLike { 0: number; 1: number }

/**
 * @param interventionExcluded  agent ids the user has manually overridden (muted/locked/
 *   removed) — excluded so the report reflects ORGANIC resistance, not forced states.
 */
export function extractObjections(
    agents: Agent[],
    edges: [number, number][] | EdgeLike[],
    scenario: Scenario,
    states: SimulationStates,
    opts: { interventionExcluded?: Set<number> } = {}
): ObjectionReport {
    const excluded = opts.interventionExcluded ?? new Set<number>();

    // Neighbor adjacency for social recomputation.
    const neighborsOf = new Map<number, number[]>();
    for (const a of agents) neighborsOf.set(a.id, []);
    for (const e of edges as [number, number][]) {
        neighborsOf.get(e[0])?.push(e[1]);
        neighborsOf.get(e[1])?.push(e[0]);
    }
    const agentById = new Map(agents.map((a) => [a.id, a]));

    // Hub threshold = top decile of influence among the population.
    const influences = agents.map((a) => a.influence_score ?? 0).sort((x, y) => y - x);
    const hubThreshold = influences.length ? influences[Math.floor(influences.length * 0.1)] ?? influences[0] : 1;

    // Accumulators per barrier.
    const acc: Record<BarrierKey, {
        agents: number;
        impact: number;
        magSum: number;
        byPersona: Map<PersonaType, PersonaBreakdown>;
    }> = {
        risk: { agents: 0, impact: 0, magSum: 0, byPersona: new Map() },
        loss: { agents: 0, impact: 0, magSum: 0, byPersona: new Map() },
        social: { agents: 0, impact: 0, magSum: 0, byPersona: new Map() },
        switching: { agents: 0, impact: 0, magSum: 0, byPersona: new Map() },
    };

    let nonAdopters = 0;
    let adopters = 0;

    for (const agent of agents) {
        if (excluded.has(agent.id)) continue;
        const st = states[agent.id];
        if (!st) continue;
        if (st.decision === "support") { adopters++; continue; }
        // Unaware agents aren't objecting — they simply haven't heard. Skip them.
        if (st.decision === null) continue;
        // neutral or oppose → a non-adopter we want to explain.
        nonAdopters++;

        // Recompute this agent's decision components against the current neighbor states.
        const nbrIds = neighborsOf.get(agent.id) ?? [];
        const neighborStateMap = Object.fromEntries(
            nbrIds.map((nid) => [nid, states[nid]])
        );
        const neighborAgents = nbrIds.map((id) => agentById.get(id)!).filter(Boolean);
        const signalQuality = typeof st.signalQuality === "number" ? st.signalQuality : 1;
        const { components } = calculateDecision(
            agent, scenario, neighborStateMap, neighborAgents, undefined, true, signalQuality
        );

        // The dominant DRAG is the most-negative component among the barrier terms.
        const candidates: [BarrierKey, number][] = [
            ["risk", components.risk],
            ["loss", components.loss],
            ["social", components.social],
            ["switching", components.switching],
        ];
        let worstKey: BarrierKey | null = null;
        let worstVal = 0; // only terms that actively drag (negative) qualify
        for (const [key, val] of candidates) {
            if (val < worstVal) { worstVal = val; worstKey = key; }
        }
        if (!worstKey) continue; // nothing negative dominated (e.g. purely low positive value)

        const mag = Math.abs(worstVal);
        const influence = agent.influence_score ?? 0;
        const bucket = acc[worstKey];
        bucket.agents++;
        bucket.impact += mag * (influence + 0.1);
        bucket.magSum += mag;

        const pb = bucket.byPersona.get(agent.persona) ?? {
            persona: agent.persona, blockedCount: 0, influenceWeight: 0, hubCount: 0,
        };
        pb.blockedCount++;
        pb.influenceWeight += influence;
        if (influence >= hubThreshold) pb.hubCount++;
        bucket.byPersona.set(agent.persona, pb);
    }

    const barriers: Barrier[] = (Object.keys(acc) as BarrierKey[])
        .filter((k) => acc[k].agents > 0)
        .map((k) => {
            const b = acc[k];
            const topPersonas = [...b.byPersona.values()].sort((x, y) => y.influenceWeight - x.influenceWeight);
            const lead = topPersonas[0];
            const hubNote = lead && lead.hubCount > 0
                ? lead.hubCount > 1
                    ? ` — amplified because ${lead.hubCount} of the blocked ${lead.persona}s are network hubs`
                    : ` — amplified because one blocked ${lead.persona} is a network hub`
                : "";
            const headline = lead
                ? `${BARRIER_LABEL[k]} blocks ${b.agents} agent${b.agents > 1 ? "s" : ""}, concentrated in ${lead.persona}${lead.blockedCount > 1 ? "s" : ""}${hubNote}.`
                : `${BARRIER_LABEL[k]} blocks ${b.agents} agent${b.agents > 1 ? "s" : ""}.`;
            return {
                key: k,
                label: BARRIER_LABEL[k],
                blockedAgents: b.agents,
                influenceWeightedImpact: Math.round(b.impact * 1000) / 1000,
                avgMagnitude: Math.round((b.magSum / b.agents) * 1000) / 1000,
                topPersonas,
                headline,
            };
        })
        .sort((a, b) => b.influenceWeightedImpact - a.influenceWeightedImpact);

    const summary = barriers.length
        ? `Top barrier: ${barriers[0].label} (${barriers[0].blockedAgents} of ${nonAdopters} non-adopters). ${barriers[0].headline}`
        : nonAdopters === 0
            ? "No objections — every aware agent adopted."
            : "Non-adoption is driven by weak positive value rather than a single dominant objection.";

    return {
        totalAgents: agents.length,
        nonAdopters,
        adopters,
        barriers,
        summary,
    };
}
