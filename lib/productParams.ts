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

/**
 * Derives scenario adoption parameters.
 * TRINITY_V4: This engine now relies on LLM "World Knowledge" for benchmarking.
 * Stored AI overrides are the source of truth for value/risk/loss.
 */
export function deriveSimParams(product: ProductInput): ScenarioParams {
    const overrides = product.aiParamOverrides;
    
    // Default neutral baseline if AI audit hasn't run yet
    const DEFAULT_VALUE = 0.50;
    const DEFAULT_RISK = 0.40;
    const DEFAULT_LOSS = 0.15;

    const value = isFiniteNumber(overrides?.value) ? clampParam(overrides!.value) : DEFAULT_VALUE;
    const risk = isFiniteNumber(overrides?.risk) ? clampParam(overrides!.risk) : DEFAULT_RISK;
    const loss = isFiniteNumber(overrides?.loss) ? clampParam(overrides!.loss) : DEFAULT_LOSS;

    return { value, risk, loss };
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
