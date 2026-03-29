"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/types";
import { useSimulation } from "@/lib/SimulationContext";

interface ProductBriefProps {
    scenario: Scenario;
}

export default function ProductBrief({ scenario }: ProductBriefProps) {
    const { setScenario } = useSimulation();
    const [isSynthesizing, setIsSynthesizing] = useState(false);

    const handleResynthesize = async () => {
        setIsSynthesizing(true);
        try {
            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brief: scenario.brief }),
            });
            if (res.ok) {
                const data = await res.json();
                if (typeof data.value === "number") {
                    setScenario({
                        ...scenario,
                        params: {
                            value: data.value,
                            risk: data.risk ?? scenario.params.risk,
                            loss: data.loss ?? scenario.params.loss,
                        }
                    });
                }
            }
        } catch (err) {
            console.error("Re-synthesis failed:", err);
        } finally {
            setIsSynthesizing(false);
        }
    };

    return (
        <div style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--bright)", fontWeight: 700, marginBottom: 2 }}>
                        {scenario.label}
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                        }}
                    >
                        {scenario.tag}
                    </div>
                </div>
                <button
                    onClick={handleResynthesize}
                    disabled={isSynthesizing || !scenario.brief}
                    style={{
                        background: "none",
                        border: "1px solid var(--orange)",
                        color: "var(--orange)",
                        borderRadius: 3,
                        padding: "2px 6px",
                        fontSize: 8,
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        opacity: (isSynthesizing || !scenario.brief) ? 0.5 : 1,
                        textTransform: "uppercase",
                    }}
                >
                    {isSynthesizing ? "..." : "✨ AI"}
                </button>
            </div>

            <div
                style={{
                    fontSize: 11,
                    color: "var(--text)",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                }}
            >
                {scenario.brief}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                    MODEL PARAMETERS
                </div>

                {[
                    { label: "Perceived Value", value: scenario.params.value, color: "var(--support)" },
                    { label: "Risk Level", value: scenario.params.risk, color: "var(--oppose)" },
                    { label: "Loss Trigger", value: scenario.params.loss, color: "var(--neutral)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted)", textTransform: "uppercase" }}>
                                {label}
                            </span>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 8, color, fontWeight: 700 }}>
                                {(value * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="trait-bar" style={{ height: 3 }}>
                            <div className="trait-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
