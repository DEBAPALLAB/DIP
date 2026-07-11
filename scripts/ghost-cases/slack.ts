import fs from "fs";
import path from "path";
import { calibrate, reportCase } from "./runner";
import type { Scenario } from "../../lib/types";

// Slack — the canonical viral B2B success. Freemium, high perceived value, low risk,
// low switching loss (it slotted alongside email rather than replacing a paid tool at
// first), strong word-of-mouth within and across teams. This is the S-curve case: slow
// start, steep middle, saturation — the opposite failure mode from Quibi.
const brief = `Slack — free tier + $6.67/user/mo paid. Team messaging that replaces internal email and scattered chat. Instant setup, integrations with the tools teams already use, viral by invitation (one person brings their whole team). Low commitment, cancel anytime.`;

const scenario: Scenario = {
    id: "custom", label: "Slack", tag: "B2B SaaS",
    brief,
    // Very high value, low risk, near-zero loss (freemium removes downside). No competitor
    // block: early Slack added itself alongside email rather than forcing a rip-and-replace.
    params: { value: 0.95, risk: 0.15, loss: 0.08 },
};

// Real Slack DAU trajectory 2013–2016, normalized to % of the window's peak. Digitized
// from public milestones: launch Aug 2013 → ~15k DAU; 1.25M (2015) → 2.3M → 3M → 4M
// (2016), i.e. a rising S-curve approaching saturation. Steps = ~half-year buckets.
const REAL_NORM = [4, 12, 35, 62, 85, 96, 100];

// ⚠️ KNOWN LIMITATION (honest calibration note): the current engine produces a
// launch-spike → dip → mass-market-recovery shape, driven by the seed cohort at t=0 and
// the awareness-floor step. It does NOT yet model smooth *viral acceleration* (adoption
// begetting more adoption faster than awareness spreads), so a monotonic rising S-curve
// like Slack's fits worse than decline-shaped cases (Quibi, Glass). This gap is what the
// Tier 2 roadmap's later diffusion work (adoption-driven awareness) should close. We report
// the real fit rather than tuning until it looks good — that's the point of an anchor set.
async function main() {
    // Tiny launch cohort (room to grow) + no artificial marketing prop; adoption must be
    // earned by the awareness cascade + prospect-theory math each step.
    const STEPS = 6, COUNT = 400, RUNS = 30, DECAY = 0, SEED = 0.02;
    const res = await calibrate({
        count: COUNT, steps: STEPS, scenario, seedFraction: SEED,
        marketingDecay: DECAY, label: "Slack", realNorm: REAL_NORM, runs: RUNS,
    });
    reportCase(res);
    const out = { ...res, params: scenario.params, config: { COUNT, STEPS, RUNS, DECAY, SEED } };
    fs.writeFileSync(path.join(__dirname, "slack.result.json"), JSON.stringify(out, null, 2));
    console.log("\nwrote scripts/ghost-cases/slack.result.json");
}
main();
