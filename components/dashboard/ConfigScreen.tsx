"use client";

import { useState } from "react";

interface ConfigScreenProps {
    onGenerate: (count: number) => void;
    isGenerating: boolean;
}

const PRESET_COUNTS = [10, 25, 50, 100];

export default function ConfigScreen({
    onGenerate,
    isGenerating,
}: ConfigScreenProps) {
    const [selectedCount, setSelectedCount] = useState<number>(50);
    const [customCount, setCustomCount] = useState<string>("");

    const effectiveCount =
        customCount !== "" ? Math.min(Number(customCount), 200) : selectedCount;

    const handleCustomChange = (v: string) => {
        // Allow only digits
        if (v === "" || /^\d+$/.test(v)) {
            setCustomCount(v);
            if (v !== "") setSelectedCount(-1); // deselect preset
        }
    };

    const handlePresetClick = (c: number) => {
        setSelectedCount(c);
        setCustomCount("");
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                padding: 32,
                fontFamily: "'JetBrains Mono', monospace",
            }}
        >
            {/* Card */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    background: "#0d1520",
                    border: "1px solid #1a2a3a",
                    borderRadius: 6,
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        borderBottom: "1px solid #1a2a3a",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <span
                        style={{
                            fontSize: 9,
                            color: "#ff6b35",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                            fontWeight: 700,
                        }}
                    >
                        SIMULATION CONFIG
                    </span>
                </div>

                <div style={{ padding: "20px 20px 24px" }}>
                    {/* Agent count */}
                    <div style={{ marginBottom: 24 }}>
                        <div
                            style={{
                                fontSize: 9,
                                color: "#4a6070",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 10,
                            }}
                        >
                            AGENT COUNT
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {PRESET_COUNTS.map((c) => {
                                const active = selectedCount === c && customCount === "";
                                return (
                                    <button
                                        key={c}
                                        onClick={() => handlePresetClick(c)}
                                        className={`btn ${active ? "btn-primary" : "btn-ghost"}`}
                                        style={{
                                            padding: "0 14px",
                                            fontSize: 12,
                                        }}
                                    >
                                        {c}
                                    </button>
                                );
                            })}

                            {/* Custom input */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    border: `1px solid ${customCount !== "" ? "#ff6b35" : "#1a2a3a"}`,
                                    borderRadius: 3,
                                    padding: "0 8px",
                                    background: customCount !== "" ? "#ff6b3510" : "transparent",
                                }}
                            >
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="custom"
                                    value={customCount}
                                    onChange={(e) => handleCustomChange(e.target.value)}
                                    style={{
                                        width: 56,
                                        background: "none",
                                        border: "none",
                                        outline: "none",
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: 12,
                                        color: customCount !== "" ? "#ff6b35" : "#4a6070",
                                        padding: "6px 0",
                                    }}
                                />
                                <span style={{ fontSize: 9, color: "#2a3a4a" }}>≤200</span>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 8,
                                fontSize: 9,
                                color: "#2a3a4a",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Selected: {effectiveCount} agents
                        </div>
                    </div>

                    {/* Data source */}
                    <div style={{ marginBottom: 24 }}>
                        <div
                            style={{
                                fontSize: 9,
                                color: "#4a6070",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 10,
                            }}
                        >
                            DATA SOURCE
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "8px 12px",
                                border: "1px solid #00BCD440",
                                borderRadius: 3,
                                background: "#00BCD408",
                            }}
                        >
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#00BCD4",
                                    flexShrink: 0,
                                }}
                            />
                            <div>
                                <div
                                    style={{ fontSize: 11, color: "#cdd9e5", fontWeight: 600 }}
                                >
                                    GSS 2024 Real Respondents
                                </div>
                                <div style={{ fontSize: 9, color: "#4a6070", marginTop: 2 }}>
                                    1,499-record pool · Normalized trait vectors
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Network info */}
                    <div style={{ marginBottom: 24 }}>
                        <div
                            style={{
                                fontSize: 9,
                                color: "#4a6070",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 10,
                            }}
                        >
                            NETWORK TOPOLOGY
                        </div>
                        <div
                            style={{
                                display: "flex",
                                gap: 12,
                            }}
                        >
                            {[
                                { label: "MODEL", value: "Watts-Strogatz" },
                                { label: "K", value: "6 (ring)" },
                                { label: "P", value: "0.15 (rewire)" },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontSize: 8,
                                            color: "#2a3a4a",
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                            marginBottom: 2,
                                        }}
                                    >
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#cdd9e5", fontWeight: 600 }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={() => !isGenerating && onGenerate(effectiveCount)}
                        disabled={isGenerating || effectiveCount < 2}
                        className="btn btn-primary"
                        style={{
                            width: "100%",
                            height: 36,
                            fontSize: 12,
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <span className="live-dot" style={{ width: 8, height: 8 }} />
                                GENERATING POPULATION…
                            </>
                        ) : (
                            `▶ GENERATE POPULATION (${effectiveCount})`
                        )}
                    </button>
                </div>
            </div>

            {/* Footer hint */}
            <div
                style={{
                    marginTop: 16,
                    fontSize: 9,
                    color: "#2a3a4a",
                    letterSpacing: "0.08em",
                    textAlign: "center",
                }}
            >
                Samples {effectiveCount} respondents from GSS pool · Builds social
                network · Classifies personas
            </div>
        </div>
    );
}
