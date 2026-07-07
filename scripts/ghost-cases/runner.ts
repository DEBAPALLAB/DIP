/**
 * Headless ghost-case runner.
 * Reuses the REAL production modules so the curve represents "our sim":
 *   - generateAgents (GSS pool + Watts-Strogatz + persona classification)
 *   - calculateDecision (the live prospect-theory decision engine, incl. conviction)
 * Replicates the client runStep() diffusion loop, minus the cosmetic LLM narration.
 */
import fs from "fs";
import path from "path";
import { generateAgents, buildWattsStrogatz, type GSSRespondent } from "../../lib/agentGeneration";
import { calculateDecision } from "../../lib/prompts";
import type { Agent, Scenario, AgentState, SimulationStates, DecisionType } from "../../lib/types";

// Resolve paths from the repo root regardless of the current working directory.
const ROOT = path.resolve(__dirname, "../..");

function loadPool(): GSSRespondent[] {
    const raw = fs.readFileSync(path.join(ROOT, "public/gss_agent_pool.json"), "utf8");
    return JSON.parse(raw.replace(/:\s*NaN/g, ": null"));
}

export interface RunConfig {
    count: number;
    steps: number;
    scenario: Scenario;
    seedFraction: number;   // fraction of top-influence agents seeded (launch marketing cohort)
    marketingDecay?: number; // per-step survival of the artificial marketing "prop" (0..1); models ad-spend taper
    label: string;
}

export interface CurvePoint { step: number; supportPct: number; support: number; oppose: number; neutral: number; avgSupportConviction: number; }

function buildEdges(agents: Agent[]): [number, number][] {
    // generateAgents already built a WS network internally for influence scores,
    // but doesn't return edges. Rebuild the same topology deterministically here
    // is not possible (internal). Instead derive neighbors from a fresh WS graph
    // of the same size — same distribution, which is what matters for diffusion.
    return buildWattsStrogatz(agents.length, 6, 0.15);
}

export async function run(cfg: RunConfig): Promise<CurvePoint[]> {
    const pool = loadPool();
    const agents = await generateAgents(cfg.count, pool);
    const edges = buildEdges(agents);

    // neighbor adjacency
    const neighborMap = new Map<number, number[]>();
    for (const a of agents) neighborMap.set(a.id, []);
    for (const [a, b] of edges) {
        neighborMap.get(a)?.push(b);
        neighborMap.get(b)?.push(a);
    }

    // seed top-influence agents as initial supporters (marketing-driven early adopters)
    const seedCount = Math.round(agents.length * cfg.seedFraction);
    const seededIds = new Set(
        [...agents].sort((x, y) => y.influence_score - x.influence_score).slice(0, seedCount).map(a => a.id)
    );

    let states: SimulationStates = {};
    for (const a of agents) {
        states[a.id] = seededIds.has(a.id)
            ? { decision: "support", reasoning: null, step: 0, pending: false, conviction: 1, isSeeded: true }
            : { decision: "neutral", reasoning: null, step: 0, pending: false };
    }

    const curve: CurvePoint[] = [];
    const snapshot = (step: number) => {
        const vals = Object.values(states);
        const support = vals.filter(s => s.decision === "support").length;
        const oppose = vals.filter(s => s.decision === "oppose").length;
        const neutral = vals.filter(s => s.decision === "neutral").length;
        const supConv = vals.filter(s => s.decision === "support" && typeof s.conviction === "number");
        const avgConv = supConv.length ? supConv.reduce((t, s) => t + (s.conviction || 0), 0) / supConv.length : 0;
        curve.push({ step, support, oppose, neutral, supportPct: Math.round((support / agents.length) * 1000) / 10, avgSupportConviction: Math.round(avgConv * 1000) / 1000 });
    };
    snapshot(0);

    for (let step = 1; step <= cfg.steps; step++) {
        const frozen = { ...states }; // neighbors read from previous step (synchronous update)
        const next: SimulationStates = { ...states };
        for (const agent of agents) {
            if (seededIds.has(agent.id) && step === 0) continue;
            const nbrIds = neighborMap.get(agent.id) || [];
            const neighborStateMap: Record<number, AgentState> = {};
            for (const nid of nbrIds) neighborStateMap[nid] = frozen[nid];
            const neighborAgents = nbrIds.map(id => agents.find(a => a.id === id)!).filter(Boolean);
            const { decision, conviction } = calculateDecision(agent, cfg.scenario, neighborStateMap, neighborAgents);
            // Marketing "prop": seeded launch cohort is artificially held as adopters with a
            // probability that decays each step (ad-spend taper). Once the prop lapses for an
            // agent, the real prospect-theory math decides — this is where the sim does its work.
            const decay = cfg.marketingDecay ?? 0;
            const propHeld = seededIds.has(agent.id) && Math.random() < Math.pow(decay, step);
            next[agent.id] = {
                ...next[agent.id],
                decision: propHeld ? "support" as DecisionType : decision,
                conviction: propHeld ? 1 : conviction,
                step,
                pending: false,
            };
        }
        states = next;
        snapshot(step);
    }
    return curve;
}
