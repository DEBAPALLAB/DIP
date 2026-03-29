"use client";

import { useState } from "react";
import type { ProductInput } from "@/lib/SimulationContext";
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

export default function ProductForm({ value, onChange, onNext }: ProductFormProps) {
    const [benefits, setBenefits] = useState<string[]>(
        value.benefits.length > 0 ? value.benefits : ["", "", "", "", ""]
    );

    const update = (patch: Partial<ProductInput>) => {
        onChange({ ...value, ...patch });
    };

    const handleBenefitChange = (i: number, text: string) => {
        const next = [...benefits];
        next[i] = text;
        setBenefits(next);
        update({ benefits: next.filter((b) => b.trim().length > 0) });
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
        });
    };

    const [isDetecting, setIsDetecting] = useState(false);

    const handleAutoDetect = async () => {
        if (!value.name.trim()) return;
        setIsDetecting(true);
        try {
            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brief: `${value.name}\n${benefits.join("\n")}` }),
            });
            if (res.ok) {
                const data = await res.json();
                update({
                    riskLevel: data.risk > 0.35 ? "high" : data.risk > 0.25 ? "medium" : "low",
                    valueProp: data.value > 0.65 ? "strong" : data.value > 0.5 ? "moderate" : "weak",
                });
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
                                    onClick={() => update({ riskLevel: level })}
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
                                    onClick={() => update({ valueProp: level })}
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
                    onChange={(e) => update({ category: e.target.value })}
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
        </div>
    );
}
