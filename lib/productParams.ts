import type { ProductInput } from "./SimulationContext";
import type { ScenarioParams, Scenario } from "./types";

// ─── Derive Simulation Parameters ───────────────────────────────────────────────

const RISK_MAP: Record<string, number> = { low: 0.20, medium: 0.35, high: 0.55 };
const VALUE_MAP: Record<string, number> = { weak: 0.40, moderate: 0.62, strong: 0.80 };
const LOSS_MAP: Record<string, number> = { low: 0.08, medium: 0.18, high: 0.35 };

export function deriveSimParams(product: ProductInput): ScenarioParams {
    let baseValue = VALUE_MAP[product.valueProp] ?? 0.62;
    let baseRisk = RISK_MAP[product.riskLevel] ?? 0.35;
    let baseLoss = LOSS_MAP[product.riskLevel] ?? 0.18;

    // Parse price to adjust value/loss dynamically
    const priceMatch = product.price.match(/(\d+(?:\.\d+)?)/);
    if (priceMatch) {
        const p = parseFloat(priceMatch[1]);
        if (p > 0) {
            // Heuristic pricing logic:
            // $50 is considered our "neutral" anchor for these scenarios.
            // If price drops to $20, it's a 2.5x value multiplier compared to $50.
            const priceFactor = 50 / p;
            
            // Boost value for low prices, penalize for high prices (max 40% swing)
            const valueAdj = Math.min(1.4, Math.max(0.6, priceFactor));
            baseValue *= valueAdj;
            
            // Lower price reduces the "financial loss" impact (max 50% reduction)
            const lossAdj = Math.min(1.5, Math.max(0.5, p / 50));
            baseLoss *= lossAdj;
        }
    }

    return {
        value: Math.min(0.99, baseValue),
        risk: baseRisk,
        loss: Math.min(0.99, baseLoss),
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
