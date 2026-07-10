import fs from "fs";
import path from "path";
import { run } from "./runner";
import type { Scenario } from "../../lib/types";

const quibiBrief = `Quibi — $4.99/mo (ads) or $7.99/mo. Premium "quick bite" shows under 10 min, mobile-only. No lasting free tier. Competes with free YouTube/TikTok and incumbent Netflix/Hulu.`;

// Quibi params: mediocre perceived value, moderate risk, high loss/waste trigger.
const scenario: Scenario = {
    id: "custom", label: "Quibi", tag: "Streaming",
    brief: quibiBrief,
    params: { value: 0.24, risk: 0.34, loss: 0.44 },
};

// Real Quibi trajectory, normalized to % of peak active adoption (steps = ~months since
// Apr 2020 launch). Digitized from public reporting: ~1.7M downloads wk1 then a rapid
// engagement/retention collapse (only ~8% of 910k free-trial users converted), App Store
// rank falling out of the top 50 within weeks, shutdown announced Oct 2020 / ended Dec 2020.
const REAL_NORM = [100, 35, 15, 8, 5, 3, 0];

async function main() {
    const STEPS = 6, COUNT = 400, RUNS = 25, DECAY = 0.4, SEED = 0.15;
    const agg: number[] = [];
    const conv: number[] = [];
    for (let r = 0; r < RUNS; r++) {
        const curve = await run({ count: COUNT, steps: STEPS, scenario, seedFraction: SEED, marketingDecay: DECAY, label: "Quibi" });
        curve.forEach((pt, i) => { agg[i] = (agg[i] || 0) + pt.supportPct; conv[i] = (conv[i] || 0) + pt.avgSupportConviction; });
    }
    const simPct = agg.map(v => Math.round((v / RUNS) * 100) / 100);
    const simConv = conv.map(v => Math.round((v / RUNS) * 1000) / 1000);

    // Normalize sim to % of its own peak for shape comparison
    const peak = Math.max(...simPct, 1e-6);
    const simNorm = simPct.map(v => Math.round((v / peak) * 1000) / 10);

    // Curve-fit: mean absolute error across normalized points -> fit %
    const n = Math.min(simNorm.length, REAL_NORM.length);
    let mae = 0;
    for (let i = 0; i < n; i++) mae += Math.abs(simNorm[i] - REAL_NORM[i]);
    mae /= n;
    const fit = Math.round((100 - mae) * 10) / 10;

    console.log("sim adoption % (of pop):", simPct.join(" → "));
    console.log("sim avg supporter conviction:", simConv.join(" → "));
    console.log("sim normalized (% of peak):", simNorm.join(" → "));
    console.log("real normalized (% of peak):", REAL_NORM.join(" → "));
    console.log(`\nMean abs error: ${mae.toFixed(1)} pts  →  curve fit ≈ ${fit}%`);

    const out = {
        product: "Quibi", params: scenario.params, config: { COUNT, STEPS, RUNS, DECAY, SEED },
        steps: simPct.map((_, i) => i),
        simAdoptionPct: simPct, simConviction: simConv, simNorm, realNorm: REAL_NORM,
        maePts: Math.round(mae * 10) / 10, curveFitPct: fit,
    };
    fs.writeFileSync(path.join(__dirname, "quibi.result.json"), JSON.stringify(out, null, 2));
    console.log("\nwrote scripts/ghost-cases/quibi.result.json");
}
main();
