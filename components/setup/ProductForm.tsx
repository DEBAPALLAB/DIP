"use client";

import { useState } from "react";
import type { ProductInput } from "@/lib/SimulationContext";
import type { ScenarioParams } from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";

interface ProductFormProps {
    value: ProductInput;
    onChange: (p: ProductInput) => void;
    onNext: () => void;
}

const CATEGORIES = [
    "Consumer Tech",
    "B2B SaaS",
    "Healthcare",
    "Fintech",
    "Education",
    "Consumer Goods",
    "Automotive",
    "Food & Beverage",
    "Entertainment",
    "Other",
];

type PrecisionKey = keyof ScenarioParams;

function normalizePrecisionOverrides(overrides?: Partial<ScenarioParams>): Partial<ScenarioParams> | undefined {
    if (!overrides) return undefined;
    const next: Partial<ScenarioParams> = {};

    (["value", "risk", "loss"] as PrecisionKey[]).forEach((key) => {
        const raw = overrides[key];
        if (typeof raw === "number" && Number.isFinite(raw)) {
            next[key] = Math.min(0.99, Math.max(0.01, raw));
        }
    });

    return Object.keys(next).length > 0 ? next : undefined;
}

function prunePrecisionOverrides(
    overrides: Partial<ScenarioParams> | undefined,
    keys: PrecisionKey[] | "all"
): Partial<ScenarioParams> | undefined {
    if (!overrides) return undefined;
    if (keys === "all") return undefined;

    const next = { ...overrides };
    keys.forEach((key) => {
        delete next[key];
    });

    return normalizePrecisionOverrides(next);
}

export default function ProductForm({ value, onChange, onNext }: ProductFormProps) {
    const [benefits, setBenefits] = useState<string[]>(
        value.benefits.length > 0 ? value.benefits : ["", "", "", "", ""]
    );

    const update = (patch: Partial<ProductInput>, clearPrecision: PrecisionKey[] | "all" = "all") => {
        const nextOverrides =
            patch.aiParamOverrides !== undefined
                ? patch.aiParamOverrides
                : clearPrecision === "all"
                    ? undefined
                    : prunePrecisionOverrides(value.aiParamOverrides, clearPrecision);

        onChange({
            ...value,
            ...patch,
            aiParamOverrides: normalizePrecisionOverrides(nextOverrides),
        });
    };

    const handleBenefitChange = (i: number, text: string) => {
        const next = [...benefits];
        next[i] = text;
        setBenefits(next);
        update({ benefits: next.filter((b) => b.trim().length > 0) }, "all");
    };

    const fillPreset = (scenarioId: string) => {
        const s = SCENARIOS.find((sc) => sc.id === scenarioId);
        if (!s) return;

        const briefLines = s.brief.split("\n").filter((l) => l.trim().startsWith("•"));
        const presetBenefits = briefLines.map((l) => l.replace(/^•\s*/, "").trim());
        while (presetBenefits.length < 5) presetBenefits.push("");
        setBenefits(presetBenefits);

        const priceMatch = s.brief.match(/\$[\d,]+(?:\/\w+)?/);
        const price = priceMatch ? priceMatch[0] : "";

        const catMap: Record<string, string> = {
            ev: "Automotive",
            saas: "B2B SaaS",
            health: "Healthcare",
        };

        onChange({
            ...value,
            name: s.label,
            price,
            benefits: presetBenefits.filter((b) => b.trim().length > 0),
            riskLevel: s.params.risk > 0.35 ? "high" : s.params.risk > 0.25 ? "medium" : "low",
            valueProp: s.params.value > 0.65 ? "strong" : s.params.value > 0.5 ? "moderate" : "weak",
            category: catMap[s.id] || "Other",
            aiParamOverrides: undefined,
        });
    };

    const [isDetecting, setIsDetecting] = useState(false);

    const handleAutoDetect = async () => {
        if (!value.name.trim()) return;
        setIsDetecting(true);
        try {
            const brief = [
                `Name: ${value.name}`,
                `Price: ${value.price}`,
                `Category: ${value.category || "General"}`,
                "Benefits:",
                ...benefits.filter((b) => b.trim().length > 0).map((b) => `- ${b}`),
            ].join("\n");

            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brief }),
            });
            if (res.ok) {
                const data = await res.json();
                update(
                    {
                        riskLevel: data.risk > 0.35 ? "high" : data.risk > 0.25 ? "medium" : "low",
                        valueProp: data.value > 0.65 ? "strong" : data.value > 0.5 ? "moderate" : "weak",
                        aiParamOverrides: {
                            value: typeof data.value === "number" ? data.value : undefined,
                            risk: typeof data.risk === "number" ? data.risk : undefined,
                            loss: typeof data.loss === "number" ? data.loss : undefined,
                        },
                    },
                    "all"
                );
            }
        } catch (err) {
            console.error("Auto-detect failed:", err);
        } finally {
            setIsDetecting(false);
        }
    };

    const isValid = value.name.trim().length > 0 && value.price.trim().length > 0;

    return (
        <div className="setup-form">
            <div className="setup-form-header">
                <span className="setup-step-tag">STEP 1 OF 4</span>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <h2 className="setup-step-title">DEFINE YOUR PRODUCT</h2>
                    <button
                        onClick={handleAutoDetect}
                        disabled={isDetecting || !value.name.trim()}
                        style={{
                            background: "none",
                            border: "1px solid var(--orange)",
                            color: "var(--orange)",
                            borderRadius: 3,
                            padding: "2px 6px",
                            fontSize: 9,
                            fontFamily: "var(--mono)",
                            cursor: "pointer",
                            opacity: (isDetecting || !value.name.trim()) ? 0.5 : 1,
                            textTransform: "uppercase",
                        }}
                    >
                        {isDetecting ? "..." : "✨ AI SYNTHESIZE"}
                    </button>
                </div>
            </div>

            <div className="setup-form-body">
                {/* Product Name */}
                <label className="form-label">Product Name</label>
                <input
                    className="form-input"
                    placeholder="e.g. NovaDrive EV Subscription"
                    value={value.name}
                    onChange={(e) => update({ name: e.target.value })}
                />

                {/* Price */}
                <label className="form-label">Price / Pricing Model</label>
                <input
                    className="form-input"
                    placeholder="e.g. $399/month subscription"
                    value={value.price}
                    onChange={(e) => update({ price: e.target.value })}
                />

                {/* Benefits */}
                <label className="form-label">Key Benefits (one per line, up to 5)</label>
                {benefits.map((b, i) => (
                    <input
                        key={i}
                        className="form-input form-input-benefit"
                        placeholder={i === 0 ? "e.g. Insurance and maintenance included" : ""}
                        value={b}
                        onChange={(e) => handleBenefitChange(i, e.target.value)}
                    />
                ))}

                {/* Risk + Value Row */}
                <div className="form-row">
                    <div className="form-col">
                        <label className="form-label">Perceived Risk Level</label>
                        <div className="toggle-group">
                            {(["low", "medium", "high"] as const).map((level) => (
                                <button
                                    key={level}
                                    className={`toggle-btn ${value.riskLevel === level ? "toggle-btn-active" : ""}`}
                                    onClick={() => update({ riskLevel: level }, ["risk"])}
                                >
                                    {level.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <span className="form-hint">How risky does this feel to a typical buyer?</span>
                    </div>
                    <div className="form-col">
                        <label className="form-label">Value Proposition Strength</label>
                        <div className="toggle-group">
                            {(["weak", "moderate", "strong"] as const).map((level) => (
                                <button
                                    key={level}
                                    className={`toggle-btn ${value.valueProp === level ? "toggle-btn-active" : ""}`}
                                    onClick={() => update({ valueProp: level }, ["value"])}
                                >
                                    {level.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <span className="form-hint">How strong is the core value vs cost?</span>
                    </div>
                </div>

                {/* Category */}
                <label className="form-label">Category (optional)</label>
                <select
                    className="form-select"
                    value={value.category}
                    onChange={(e) => update({ category: e.target.value }, "all")}
                >
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>

                {/* Presets */}
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                    <span className="form-label" style={{ marginBottom: 10, display: "block" }}>
                        Or choose a preset scenario
                    </span>
                    <div className="preset-grid">
                        {SCENARIOS.map((s) => (
                            <button key={s.id} className="preset-card" onClick={() => fillPreset(s.id)}>
                                <span className="preset-name">{s.label}</span>
                                <span className="preset-tag">{s.tag}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Next */}
                <div className="setup-form-actions">
                    <div />
                    <button className="btn-cta" onClick={onNext} disabled={!isValid}>
                        Next: Market →
                    </button>
                </div>
            </div>

            {value.aiParamOverrides && (
                <div
                    style={{
                        marginTop: 14,
                        padding: "10px 12px",
                        border: "1px solid rgba(255,87,34,0.25)",
                        borderRadius: 4,
                        background: "rgba(255,87,34,0.08)",
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        color: "var(--orange)",
                        textTransform: "uppercase",
                    }}
                >
                    Deep precision vectors active ·
                    {` V(${(value.aiParamOverrides.value ?? 0).toFixed(3)})`}
                    {` R(${(value.aiParamOverrides.risk ?? 0).toFixed(3)})`}
                    {` L(${(value.aiParamOverrides.loss ?? 0).toFixed(3)})`}
                </div>
            )}
        </div>
    );
}
