"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { StepSnapshot } from "@/lib/types";

interface AdoptionCurveSectionProps {
    history: StepSnapshot[];
    total: number;
    mode: "percent" | "count" | "delta";
    onModeChange: (mode: "percent" | "count" | "delta") => void;
}

export default function AdoptionCurveSection({ history, total, mode, onModeChange }: AdoptionCurveSectionProps) {
    if (!history || history.length === 0) {
        return (
            <div className="results-section results-chart-section results-chart-empty" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 10 }}>AWAITING_CASCADES...</p>
            </div>
        );
    }

    const data = history.map((snap, idx) => {
        const prev = idx > 0 ? history[idx - 1] : undefined;
        const supportDelta = prev ? snap.support - prev.support : 0;
        const neutralDelta = prev ? snap.neutral - prev.neutral : 0;
        const opposeDelta = prev ? snap.oppose - prev.oppose : 0;

        return {
            step: `Step ${snap.step}`,
            Support: mode === "count" ? snap.support : mode === "delta" ? supportDelta : Math.round((snap.support / total) * 100),
            Neutral: mode === "count" ? snap.neutral : mode === "delta" ? neutralDelta : Math.round((snap.neutral / total) * 100),
            Oppose: mode === "count" ? snap.oppose : mode === "delta" ? opposeDelta : Math.round((snap.oppose / total) * 100),
        };
    });

    const axisUnit = mode === "count" ? "agents" : mode === "delta" ? "Δ" : "%";
    const chartLabel = mode === "count" ? "AGENT COUNT" : mode === "delta" ? "STEP DELTA" : "ADOPTION CURVE";

    return (
        <div className="results-chart-section results-card">
            <div className="results-chart-header">
                <div>
                    <h3 className="results-section-title" style={{ marginBottom: 6 }}>{chartLabel}</h3>
                    <div className="results-section-subtitle">SHIFT IN STANCE ACROSS THE FULL RUN</div>
                </div>
                <div className="results-chart-toggle-group" role="tablist" aria-label="chart mode">
                    {[
                        { key: "percent", label: "%" },
                        { key: "count", label: "#" },
                        { key: "delta", label: "Δ" },
                    ].map((item) => (
                        <button
                            key={item.key}
                            className={`results-chart-toggle ${mode === item.key ? "active" : ""}`}
                            onClick={() => onModeChange(item.key as "percent" | "count" | "delta")}
                            type="button"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="supportFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--support)" stopOpacity={0.38} />
                                <stop offset="100%" stopColor="var(--support)" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="neutralFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8a8a8a" stopOpacity={0.26} />
                                <stop offset="100%" stopColor="#8a8a8a" stopOpacity={0.04} />
                            </linearGradient>
                            <linearGradient id="opposeFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--oppose)" stopOpacity={0.32} />
                                <stop offset="100%" stopColor="var(--oppose)" stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="step"
                            tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                        />
                        <YAxis
                            tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                            unit={axisUnit}
                        />
                        <Tooltip
                            contentStyle={{
                                background: "#121212",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: 10,
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                color: "var(--text)",
                                boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                fontFamily: "var(--mono)",
                                fontSize: 10,
                                color: "var(--muted)",
                                paddingTop: 10,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Support"
                            stackId="1"
                            stroke="var(--support)"
                            fill="url(#supportFill)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--support)", strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Neutral"
                            stackId="1"
                            stroke="#8a8a8a"
                            fill="url(#neutralFill)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#8a8a8a", strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Oppose"
                            stackId="1"
                            stroke="var(--oppose)"
                            fill="url(#opposeFill)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--oppose)", strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
