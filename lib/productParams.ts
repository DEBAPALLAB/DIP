import type { ProductInput } from "./SimulationContext";
import type { ScenarioParams, Scenario } from "./types";

// ─── Derive Simulation Parameters ───────────────────────────────────────────────

/**
 * Clamps a parameter to the sustainable 0.01-0.99 range.
 */
function clampParam(value: number): number {
    return Math.min(0.99, Math.max(0.01, value));
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

// Fallback value/risk/loss anchors when there's no AI audit yet, calibrated against
// the ghost-case anchor set (scripts/ghost-cases/) rather than picked as round numbers:
// weak ≈ Quibi/Glass territory (0.24–0.30, both flops), strong ≈ Slack territory (0.95,
// the one validated success). A flat 0.50 for every product regardless of what the user
// typed silently behaved like a mediocre-to-failing product for anyone who hadn't run
// the AI audit yet — this derives the fallback from the form fields instead of discarding them.
const VALUE_PROP_TO_VALUE: Record<ProductInput["valueProp"], number> = {
    weak: 0.28,
    moderate: 0.55,
    strong: 0.80,
};
const RISK_LEVEL_TO_RISK: Record<ProductInput["riskLevel"], number> = {
    low: 0.22,
    medium: 0.40,
    high: 0.62,
};
// Loss trigger tracks risk level too (higher perceived risk categories tend to carry
// a sharper downside if it goes wrong), scaled down since loss aversion already
// amplifies this term heavily inside calculateDecision.
const RISK_LEVEL_TO_LOSS: Record<ProductInput["riskLevel"], number> = {
    low: 0.10,
    medium: 0.20,
    high: 0.38,
};

/**
 * Derives scenario adoption parameters.
 * TRINITY_V4: This engine now relies on LLM "World Knowledge" for benchmarking.
 * Stored AI overrides are the source of truth for value/risk/loss when present;
 * otherwise falls back to the user's own valueProp/riskLevel selections (calibration-
 * anchored above), not a flat placeholder.
 */
export function deriveSimParams(product: ProductInput): ScenarioParams {
    const overrides = product.aiParamOverrides;

    const fallbackValue = VALUE_PROP_TO_VALUE[product.valueProp] ?? VALUE_PROP_TO_VALUE.moderate;
    const fallbackRisk = RISK_LEVEL_TO_RISK[product.riskLevel] ?? RISK_LEVEL_TO_RISK.medium;
    const fallbackLoss = RISK_LEVEL_TO_LOSS[product.riskLevel] ?? RISK_LEVEL_TO_LOSS.medium;

    const value = isFiniteNumber(overrides?.value) ? clampParam(overrides!.value) : fallbackValue;
    const risk = isFiniteNumber(overrides?.risk) ? clampParam(overrides!.risk) : fallbackRisk;
    const loss = isFiniteNumber(overrides?.loss) ? clampParam(overrides!.loss) : fallbackLoss;

    const params: ScenarioParams = { value, risk, loss };

    // Tier 1C: if the market has an entrenched incumbent (competitorDensity) and/or
    // real migration friction (switchingCost), model adoption as switching. An
    // explicit AI competitor override wins; otherwise derive it from the setup form's
    // existing competitorDensity / switchingCost signals (previously unused by the math).
    if (overrides?.competitor) {
        params.competitor = overrides.competitor;
    } else if (product.competitorDensity !== "low" || product.switchingCost !== "low") {
        params.competitor = {
            value: LEVEL_TO_VALUE[product.competitorDensity],
            switchingCost: LEVEL_TO_VALUE[product.switchingCost],
            label: "the incumbent option customers already use",
        };
    }

    return params;
}

// Maps the setup form's low/medium/high enums to a [0,1] intensity for the model.
const LEVEL_TO_VALUE: Record<"low" | "medium" | "high", number> = {
    low: 0.2,
    medium: 0.45,
    high: 0.7,
};

// ─── Build Product Brief ────────────────────────────────────────────────────────

export function buildProductBrief(product: ProductInput): string {
    const benefits = product.benefits
        .filter((b) => b.trim().length > 0)
        .map((b) => `• ${b}`)
        .join("\n");

    return `${product.name} — ${product.price}

Key benefits:
${benefits || "• (none specified)"}

Category: ${product.category || "General"}`;
}

// ─── Build Full Scenario from Product Input ─────────────────────────────────────

export function buildScenarioFromProduct(product: ProductInput): Scenario {
    const params = deriveSimParams(product);
    const brief = buildProductBrief(product);

    return {
        id: "custom",
        label: product.name,
        tag: `${product.category || "General"} · Custom`,
        brief,
        params,
    };
}
