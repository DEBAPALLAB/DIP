"use client";

import { useState, useEffect, useCallback } from "react";
import type { MarketFilters as MF } from "@/lib/SimulationContext";
import type { GSSRespondent } from "@/lib/agentGeneration";
import { classifyPersona, PERSONA_COLORS } from "@/lib/agentGeneration";
import type { PersonaType } from "@/lib/types";
import { useSimulation } from "@/lib/SimulationContext";

interface MarketFiltersProps {
    value: MF;
    onChange: (f: MF) => void;
    onNext: () => void;
    onBack: () => void;
}

const EDU_MAP: Record<string, number> = {
    any: 0,
    "high school": 12,
    "some college": 14,
    "bachelors": 16,
    "graduate": 18,
};

const WRKSTAT_OPTIONS = [
    "any",
    "full-time",
    "part-time",
    "retired",
    "unemployed",
    "in school",
    "keeping house",
];

export default function MarketFilters({ value, onChange, onNext, onBack }: MarketFiltersProps) {
    const { product } = useSimulation();
    const [pool, setPool] = useState<GSSRespondent[]>([]);
    const [filtered, setFiltered] = useState<GSSRespondent[]>([]);
    const [personaDist, setPersonaDist] = useState<Record<string, number>>({});
    const [isDetecting, setIsDetecting] = useState(false);

    // Load pool on mount
    useEffect(() => {
        fetch("/gss_agent_pool.json")
            .then((r) => r.text())
            .then((raw) => {
                const data: GSSRespondent[] = JSON.parse(raw.replace(/:\s*NaN/g, ": null"));
                setPool(data);
            })
            .catch(console.error);
    }, []);

    // Filter pool whenever filters or pool change
    const filterPool = useCallback(() => {
        if (pool.length === 0) return;
        const result = pool.filter((r) => {
            if (r.age < value.ageMin || r.age > value.ageMax) return false;
            if (r.income_percentile * 100 < value.incomeMin || r.income_percentile * 100 > value.incomeMax) return false;
            if (value.education !== "any" && r.educ < (EDU_MAP[value.education] ?? 0)) return false;
            if (value.wrkstat !== "any" && r.wrkstat !== value.wrkstat) return false;
            return true;
        });
        setFiltered(result);

        // Compute persona distribution
        const dist: Record<string, number> = {};
        for (const r of result) {
            const social = isNaN(r.social_conformity) ? 0.5 : r.social_conformity;
            const persona = classifyPersona({
                risk_aversion: r.risk_aversion,
                institutional_trust: r.institutional_trust,
                social_conformity: social,
                budget_sensitivity: r.budget_sensitivity,
                emotional_state: r.emotional_state,
                influence_score: 0.5,
            });
            dist[persona] = (dist[persona] || 0) + 1;
        }
        setPersonaDist(dist);
    }, [pool, value]);

    useEffect(() => {
        filterPool();
    }, [filterPool]);

    const handleAutoFilter = async () => {
        if (!product) return;
        setIsDetecting(true);
        try {
            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brief: `${product.name} - ${product.category}\nBenefits:\n${product.benefits.join("\n")}`
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.market) {
                    onChange({
                        ...value,
                        ...data.market
                    });
                }
            }
        } catch (err) {
            console.error("Auto-filter failed:", err);
        } finally {
            setIsDetecting(false);
        }
    };

    const update = (patch: Partial<MF>) => {
        onChange({ ...value, ...patch });
    };

    const totalFiltered = filtered.length;
    const sortedPersonas = Object.entries(personaDist).sort((a, b) => b[1] - a[1]);

    return (
        <div className="setup-form">
            <div className="setup-form-header">
                <span className="setup-step-tag">STEP 2 OF 4</span>
                <h2 className="setup-step-title">DEFINE YOUR MARKET</h2>
            </div>

            <div className="setup-form-body">
                {/* Base Population */}
                <label className="form-label">Base Population</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    <label className="radio-label">
                        <input type="radio" checked readOnly />
                        <span>US General Population (GSS 2024)</span>
                    </label>
                </div>

                {/* Filters */}
                <div className="filter-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>── OPTIONAL FILTERS ──</span>
                    <button
                        onClick={handleAutoFilter}
                        disabled={isDetecting || !product}
                        style={{
                            background: "none",
                            border: "1px solid var(--orange)",
                            color: "var(--orange)",
                            borderRadius: 3,
                            padding: "2px 6px",
                            fontSize: 9,
                            fontFamily: "var(--mono)",
                            cursor: "pointer",
                            opacity: (isDetecting || !product) ? 0.5 : 1
                        }}
                    >
                        {isDetecting ? "DETECTING..." : "✨ AI AUTO-FILTER"}
                    </button>
                </div>

                <div className="form-row">
                    <div className="form-col">
                        <label className="form-label">Age Range</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                className="form-input form-input-sm"
                                type="number"
                                min={18}
                                max={89}
                                value={value.ageMin}
                                onChange={(e) => update({ ageMin: Number(e.target.value) })}
                            />
                            <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>to</span>
                            <input
                                className="form-input form-input-sm"
                                type="number"
                                min={18}
                                max={89}
                                value={value.ageMax}
                                onChange={(e) => update({ ageMax: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="form-col">
                        <label className="form-label">Income Percentile</label>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                                className="form-input form-input-sm"
                                type="number"
                                min={0}
                                max={100}
                                value={value.incomeMin}
                                onChange={(e) => update({ incomeMin: Number(e.target.value) })}
                            />
                            <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 11 }}>to</span>
                            <input
                                className="form-input form-input-sm"
                                type="number"
                                min={0}
                                max={100}
                                value={value.incomeMax}
                                onChange={(e) => update({ incomeMax: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-col">
                        <label className="form-label">Education</label>
                        <select
                            className="form-select"
                            value={value.education}
                            onChange={(e) => update({ education: e.target.value })}
                        >
                            {Object.keys(EDU_MAP).map((k) => (
                                <option key={k} value={k}>
                                    {k === "any" ? "Any" : k.charAt(0).toUpperCase() + k.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-col">
                        <label className="form-label">Work Status</label>
                        <select
                            className="form-select"
                            value={value.wrkstat}
                            onChange={(e) => update({ wrkstat: e.target.value })}
                        >
                            {WRKSTAT_OPTIONS.map((w) => (
                                <option key={w} value={w}>
                                    {w === "any" ? "Any" : w.charAt(0).toUpperCase() + w.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Preview */}
                <div className="filter-section-title" style={{ marginTop: 20 }}>── PREVIEW ──</div>
                <div className="filter-preview-count">
                    Matching respondents in pool:{" "}
                    <span style={{ color: "var(--bright)", fontWeight: 600 }}>{totalFiltered}</span>
                    {" / "}
                    <span style={{ color: "var(--muted)" }}>{pool.length || "?"}</span>
                </div>

                {/* Persona distribution bars */}
                <div className="persona-dist-list">
                    {sortedPersonas.map(([persona, count]) => {
                        const pct = totalFiltered > 0 ? (count / totalFiltered) * 100 : 0;
                        return (
                            <div key={persona} className="persona-dist-row">
                                <span className="persona-dist-name">{persona}</span>
                                <div className="persona-dist-bar-bg">
                                    <div
                                        className="persona-dist-bar-fill"
                                        style={{
                                            width: `${pct}%`,
                                            background: PERSONA_COLORS[persona as PersonaType] || "var(--muted)",
                                        }}
                                    />
                                </div>
                                <span className="persona-dist-pct">{Math.round(pct)}%</span>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="setup-form-actions">
                    <button className="btn-ghost-setup" onClick={onBack}>
                        ← Back
                    </button>
                    <button className="btn-cta" onClick={onNext} disabled={totalFiltered < 5}>
                        Next: Population Size →
                    </button>
                </div>
            </div>
        </div>
    );
}
