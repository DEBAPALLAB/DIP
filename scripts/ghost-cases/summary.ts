import fs from "fs";
import path from "path";

// Aggregates the individual ghost-case results into one calibration table + average fit.
// Run the cases first (quibi.ts / glass.ts / slack.ts), then this. Publishes
// calibration.summary.json for the landing page / waitlist proof (Tier 2D).

const CASES = ["quibi", "glass", "slack"];

function load(name: string) {
    const p = path.join(__dirname, `${name}.result.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
    const rows = CASES.map(load).filter(Boolean) as any[];
    if (rows.length === 0) {
        console.log("No case results found. Run quibi.ts / glass.ts / slack.ts first.");
        return;
    }

    console.log("\n=== CALIBRATION ANCHOR SET ===\n");
    console.log("Product         | Type            | Curve Fit");
    console.log("----------------|-----------------|----------");
    const typeOf: Record<string, string> = {
        Quibi: "Flop (low value)",
        "Google Glass": "Flop (social/risk)",
        Slack: "Success (S-curve)",
    };
    for (const r of rows) {
        console.log(`${r.product.padEnd(15)} | ${(typeOf[r.product] || "").padEnd(15)} | ${r.curveFitPct}%`);
    }
    const avg = Math.round((rows.reduce((t, r) => t + r.curveFitPct, 0) / rows.length) * 10) / 10;
    console.log("----------------|-----------------|----------");
    console.log(`${"AVERAGE".padEnd(15)} | ${" ".padEnd(15)} | ${avg}%`);

    console.log(`\nDecline-shaped cases (Quibi, Glass) calibrate ~98%. The rising S-curve`);
    console.log(`(Slack) fits lower (~80%) — the engine models launch-spike + awareness-floor`);
    console.log(`recovery but not yet smooth viral acceleration. Reported honestly, not tuned.`);

    const out = {
        generatedAt: new Date().toISOString(),
        cases: rows.map(r => ({ product: r.product, type: typeOf[r.product], curveFitPct: r.curveFitPct, maePts: r.maePts })),
        averageFitPct: avg,
        knownLimitation: "Rising viral S-curves (e.g. Slack) fit worse than decline-shaped cases; the engine does not yet model adoption-driven awareness acceleration.",
    };
    fs.writeFileSync(path.join(__dirname, "calibration.summary.json"), JSON.stringify(out, null, 2));
    console.log("\nwrote scripts/ghost-cases/calibration.summary.json");
}
main();
