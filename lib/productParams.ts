import type { ProductInput } from "./SimulationContext";
import type { ScenarioParams, Scenario } from "./types";

// ─── Derive Simulation Parameters ───────────────────────────────────────────────

const RISK_MAP: Record<string, number> = { low: 0.20, medium: 0.35, high: 0.55 };
const VALUE_MAP: Record<string, number> = { weak: 0.40, moderate: 0.62, strong: 0.80 };
const LOSS_MAP: Record<string, number> = { low: 0.08, medium: 0.18, high: 0.35 };

function clampParam(value: number): number {
    return Math.min(0.99, Math.max(0.01, value));
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

export function deriveSimParams(product: ProductInput): ScenarioParams {
    const overrides = product.aiParamOverrides;
    const overrideValue = overrides?.value;
    const overrideRisk = overrides?.risk;
    const overrideLoss = overrides?.loss;
    const hasValueOverride = isFiniteNumber(overrideValue);
    const hasRiskOverride = isFiniteNumber(overrideRisk);
    const hasLossOverride = isFiniteNumber(overrideLoss);

    let baseValue = hasValueOverride ? clampParam(overrideValue) : (VALUE_MAP[product.valueProp] ?? 0.62);
    let baseRisk = hasRiskOverride ? clampParam(overrideRisk) : (RISK_MAP[product.riskLevel] ?? 0.35);
    let baseLoss = hasLossOverride ? clampParam(overrideLoss) : (LOSS_MAP[product.riskLevel] ?? 0.18);

    // Parse price to adjust only the fields that are still bucket-driven.
    const priceMatch = product.price.match(/(\d+(?:\.\d+)?)/);
    if (priceMatch) {
        const p = parseFloat(priceMatch[1]);
        if (p > 0) {
            const priceFactor = 50 / p;
            const valueAdj = Math.min(1.4, Math.max(0.6, priceFactor));
            const lossAdj = Math.min(1.5, Math.max(0.5, p / 50));

            if (!hasValueOverride) {
                baseValue *= valueAdj;
            }
            if (!hasLossOverride) {
                baseLoss *= lossAdj;
            }
        }
    }

    return {
        value: clampParam(baseValue),
        risk: clampParam(baseRisk),
        loss: clampParam(baseLoss),
    };
}

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
