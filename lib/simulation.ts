import type { Agent, PersonaType, SimulationStates, StepSnapshot } from "./types";

// ─── Persona Classification ───────────────────────────────────────────────────

/** Centroids for each persona in (risk, social, trust) space */
const PERSONA_CENTROIDS: Record<PersonaType, [number, number, number]> = {
    Influencer: [0.30, 0.35, 0.55],
    "Early Adopter": [0.15, 0.45, 0.35],
    "Price Hawk": [0.40, 0.55, 0.65],
    Pragmatist: [0.50, 0.40, 0.50],
    "Social Follower": [0.40, 0.85, 0.45],
    "Herd Member": [0.75, 0.72, 0.60],
    Skeptic: [0.82, 0.45, 0.35],
    Laggard: [0.80, 0.40, 0.55],
};

/** Classify an agent into a persona by nearest centroid */
export function classifyPersona(agent: Agent): PersonaType {
    let best: PersonaType = "Pragmatist";
    let bestDist = Infinity;

    for (const [persona, [r, s, t]] of Object.entries(PERSONA_CENTROIDS) as [PersonaType, [number, number, number]][]) {
        const d = Math.sqrt(
            (agent.risk - r) ** 2 + (agent.social - s) ** 2 + (agent.trust - t) ** 2
        );
        if (d < bestDist) {
            bestDist = d;
            best = persona;
        }
    }

    return best;
}

// ─── Prospect Theory Utility ──────────────────────────────────────────────────

/**
 * Computes adoption utility using Tversky–Kahneman prospect theory.
 * λ (loss aversion) ≈ 2.25 for median agent.
 */
export function computeUtility(
    agent: Agent,
    scenarioValue: number,
    scenarioRisk: number,
    scenarioLoss: number
): number {
    const lambda = 1.0 + agent.risk * 3.0; // 1.0 → 4.0 range
    const gain = scenarioValue * (1 - agent.risk) * (1 - agent.risk * 0.3);
    const loss = lambda * scenarioLoss * agent.risk;
    return gain - loss;
}

// ─── Snapshot Builder ─────────────────────────────────────────────────────────

/** Computes an adoption snapshot from the current agent states */
export function buildSnapshot(step: number, states: SimulationStates): StepSnapshot {
    const values = Object.values(states);
    return {
        step,
        support: values.filter((s) => s.decision === "support").length,
        neutral: values.filter((s) => s.decision === "neutral").length,
        oppose: values.filter((s) => s.decision === "oppose").length,
        pending: values.filter((s) => s.decision === null).length,
        timestamp: Date.now(),
    };
}

// ─── Percentage Formatters ─────────────────────────────────────────────────────

export function pct(n: number, total: number): string {
    if (total === 0) return "0.0%";
    return ((n / total) * 100).toFixed(1) + "%";
}

export function consensusLabel(states: SimulationStates): string {
    const decided = Object.values(states).filter((s) => s.decision !== null);
    if (decided.length === 0) return "PENDING";
    const support = decided.filter((s) => s.decision === "support").length;
    const oppose = decided.filter((s) => s.decision === "oppose").length;
    const ratio = support / decided.length;
    if (ratio >= 0.7) return "STRONG SUPPORT";
    if (ratio >= 0.5) return "LEAN SUPPORT";
    if (oppose / decided.length >= 0.7) return "STRONG OPPOSE";
    if (oppose / decided.length >= 0.5) return "LEAN OPPOSE";
    return "SPLIT";
}
