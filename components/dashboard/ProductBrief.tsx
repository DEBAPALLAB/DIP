"use client";

import type { Scenario } from "@/lib/types";

interface ProductBriefProps {
    scenario: Scenario;
}

export default function ProductBrief({ scenario }: ProductBriefProps) {
    return (
        <div style={{ padding: 10, height: "100%", overflowY: "auto" }}>
            {/* Product header */}
            <div style={{ marginBottom: 10 }}>
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

            {/* Brief text */}
            <div
                style={{
                    fontSize: 11,
                    color: "var(--text)",
                    lineHeight: 1.7,
                    whiteSpace: "pre-line",
                    marginBottom: 12,
                }}
            >
                {scenario.brief}
            </div>

            {/* Behavioral params */}
            <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    Model Parameters
                </div>

                {[
                    { label: "Perceived Value", value: scenario.params.value, color: "var(--support)" },
                    { label: "Risk Level", value: scenario.params.risk, color: "var(--oppose)" },
                    { label: "Loss Trigger", value: scenario.params.loss, color: "var(--neutral)" },
                ].map(({ label, value, color }) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>
                                {label}
                            </span>
                            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color }}>
                                {(value * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="trait-bar" style={{ height: 4 }}>
                            <div className="trait-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
