import fs from "fs";
import path from "path";
import { calibrate, reportCase } from "./runner";
import type { Scenario } from "../../lib/types";

// Google Glass (Explorer Edition, 2013–2015) — a hyped launch that collapsed on SOCIAL
// REJECTION and risk, not price. Early-adopter buzz, then rapid backlash: privacy panic,
// "Glasshole" stigma, bans in bars/theaters, thin app ecosystem. Explorer program ended
// Jan 2015. This tests a different failure mode from Quibi: high perceived risk + strong
// NEGATIVE social pressure sinking an otherwise novel product.
const brief = `Google Glass Explorer Edition — $1,500 wearable computer with a head-mounted display and camera. Hands-free apps, photo/video capture, notifications. Invite-only "Explorer" launch. Highly visible in public; recording capability draws social suspicion and privacy pushback.`;

const scenario: Scenario = {
    id: "custom", label: "Google Glass", tag: "Consumer Hardware",
    brief,
    // Moderate novelty value, HIGH risk (unproven, socially risky to wear), HIGH loss
    // ($1,500 sunk cost + social embarrassment). Steep, early collapse expected.
    params: { value: 0.30, risk: 0.68, loss: 0.55 },
};

// Real Glass Explorer interest/active-use trajectory, normalized to % of peak. Digitized
// from public signals: strong launch buzz (2013) → search interest and active Explorer
// engagement falling sharply through 2014 → program shutdown Jan 2015. A fast decline,
// slightly slower than Quibi's (hardware sunk cost keeps a residual tail longer).
const REAL_NORM = [100, 48, 26, 14, 7, 3, 0];

async function main() {
    const STEPS = 6, COUNT = 400, RUNS = 30, DECAY = 0.45, SEED = 0.15;
    const res = await calibrate({
        count: COUNT, steps: STEPS, scenario, seedFraction: SEED,
        marketingDecay: DECAY, label: "Google Glass", realNorm: REAL_NORM, runs: RUNS,
    });
    reportCase(res);
    const out = { ...res, params: scenario.params, config: { COUNT, STEPS, RUNS, DECAY, SEED } };
    fs.writeFileSync(path.join(__dirname, "glass.result.json"), JSON.stringify(out, null, 2));
    console.log("\nwrote scripts/ghost-cases/glass.result.json");
}
main();
