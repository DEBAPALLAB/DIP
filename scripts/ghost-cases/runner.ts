/**
 * Headless ghost-case runner.
 * Reuses the REAL production modules so the curve represents "our sim":
 *   - generateAgents (GSS pool + Watts-Strogatz + persona classification)
 *   - calculateDecision (the live prospect-theory decision engine, incl. conviction)
 * Replicates the client runStep() diffusion loop, minus the cosmetic LLM narration.
 */
import fs from "fs";
import path from "path";
import { generateAgents, buildWattsStrogatz, computeAwareness, computeAwarenessQuality, type GSSRespondent } from "../../lib/agentGeneration";
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
    /**
     * Tier 1B awareness funnel. Default TRUE so ghost cases run the SAME staged-exposure
     * model as production (unaware agents hold no opinion until the cascade reaches them).
     * Set false to reproduce the legacy "everyone aware at step 0" behavior for A/B comparison.
     */
    awarenessFunnel?: boolean;
    /**
     * Tier 2F information degradation. When true (default, requires awarenessFunnel),
     * perceived value fades across word-of-mouth hops. Set false to keep pristine
     * signal for everyone who's aware.
     */
    infoDegradation?: boolean;
}

export interface CurvePoint { step: number; supportPct: number; support: number; oppose: number; neutral: number; avgSupportConviction: number; }

export interface CaseResult {
    product: string;
    simAdoptionPct: number[];
    simConviction: number[];
    simNorm: number[];
    realNorm: number[];
    maePts: number;
    curveFitPct: number;
}

/**
 * Run a ghost case RUNS times, average the curve, normalize to % of peak, and score
 * shape fit against the real (normalized) adoption trajectory. Shared by every case so
 * the calibration methodology is identical across the anchor set (Tier 2D).
 */
export async function calibrate(cfg: RunConfig & { realNorm: number[]; runs: number }): Promise<CaseResult> {
    const agg: number[] = [];
    const conv: number[] = [];
    for (let r = 0; r < cfg.runs; r++) {
        const curve = await run(cfg);
        curve.forEach((pt, i) => { agg[i] = (agg[i] || 0) + pt.supportPct; conv[i] = (conv[i] || 0) + pt.avgSupportConviction; });
    }
    const simPct = agg.map(v => Math.round((v / cfg.runs) * 100) / 100);
    const simConv = conv.map(v => Math.round((v / cfg.runs) * 1000) / 1000);

    const peak = Math.max(...simPct, 1e-6);
    const simNorm = simPct.map(v => Math.round((v / peak) * 1000) / 10);

    const n = Math.min(simNorm.length, cfg.realNorm.length);
    let mae = 0;
    for (let i = 0; i < n; i++) mae += Math.abs(simNorm[i] - cfg.realNorm[i]);
    mae /= n;
    const fit = Math.round((100 - mae) * 10) / 10;

    return {
        product: cfg.label,
        simAdoptionPct: simPct,
        simConviction: simConv,
        simNorm,
        realNorm: cfg.realNorm,
        maePts: Math.round(mae * 10) / 10,
        curveFitPct: fit,
    };
}

export function reportCase(res: CaseResult): void {
    console.log(`\n=== ${res.product} ===`);
    console.log("sim adoption % (of pop):", res.simAdoptionPct.join(" → "));
    console.log("sim normalized (% peak):", res.simNorm.join(" → "));
    console.log("real normalized (% peak):", res.realNorm.join(" → "));
    console.log(`MAE ${res.maePts} pts  →  curve fit ≈ ${res.curveFitPct}%`);
}

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

    const useAwareness = cfg.awarenessFunnel ?? true;
    const useInfoDecay = (cfg.infoDegradation ?? true) && useAwareness;

    let states: SimulationStates = {};
    for (const a of agents) {
        if (seededIds.has(a.id)) {
            states[a.id] = { decision: "support", reasoning: null, step: 0, pending: false, conviction: 1, isSeeded: true };
        } else if (useAwareness) {
            // Tier 1B: non-seeded agents start UNAWARE (no opinion) and only decide
            // once the awareness cascade reaches them — matching production.
            states[a.id] = { decision: null, reasoning: null, step: null, pending: false };
        } else {
            // Legacy: everyone aware at step 0, starting neutral.
            states[a.id] = { decision: "neutral", reasoning: null, step: 0, pending: false };
        }
    }

    // Awareness set carried across steps. The seeded launch cohort is aware from t=0.
    let awareness = new Set<number>(seededIds);
    // Per-agent signal quality (Tier 2F). Seed cohort = pristine 1.0.
    let quality: Record<number, number> = {};
    for (const id of seededIds) quality[id] = 1;

    const curve: CurvePoint[] = [];
    const snapshot = (step: number) => {
        const vals = Object.values(states);
        const support = vals.filter(s => s.decision === "support").length;
        const oppose = vals.filter(s => s.decision === "oppose").length;
        const neutral = vals.filter(s => s.decision === "neutral").length;
        const supConv = vals.filter(s => s.decision === "support" && typeof s.conviction === "number");
        const avgConv = supConv.length ? supConv.reduce((t, s) => t + (s.conviction || 0), 0) / supConv.length : 0;
        // supportPct denominator is the full population — an unaware agent is genuinely
        // not (yet) an adopter, exactly as in the live results view.
        curve.push({ step, support, oppose, neutral, supportPct: Math.round((support / agents.length) * 1000) / 10, avgSupportConviction: Math.round(avgConv * 1000) / 1000 });
    };
    snapshot(0);

    for (let step = 1; step <= cfg.steps; step++) {
        // Grow awareness from everyone who already holds a decision (seed cohort +
        // anyone reached in prior steps), then diffuse one more hop this step.
        if (useAwareness) {
            const prior = new Set<number>([
                ...awareness,
                ...agents.filter(a => states[a.id].decision !== null).map(a => a.id),
            ]);
            awareness = computeAwareness(agents, edges, step, prior);
            if (useInfoDecay) {
                quality = computeAwarenessQuality(agents, edges, prior, awareness, quality, seededIds);
            }
        }

        const frozen = { ...states }; // neighbors read from previous step (synchronous update)
        const next: SimulationStates = { ...states };
        for (const agent of agents) {
            if (seededIds.has(agent.id) && step === 0) continue;
            const nbrIds = neighborMap.get(agent.id) || [];
            const neighborStateMap: Record<number, AgentState> = {};
            for (const nid of nbrIds) neighborStateMap[nid] = frozen[nid];
            const neighborAgents = nbrIds.map(id => agents.find(a => a.id === id)!).filter(Boolean);
            const isAware = !useAwareness || awareness.has(agent.id);
            const signalQuality = useInfoDecay ? (quality[agent.id] ?? 1) : 1;
            const { decision, conviction } = calculateDecision(agent, cfg.scenario, neighborStateMap, neighborAgents, undefined, isAware, signalQuality);
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
