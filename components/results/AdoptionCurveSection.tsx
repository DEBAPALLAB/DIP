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
}

export default function AdoptionCurveSection({ history, total }: AdoptionCurveSectionProps) {
    const data = history.map((snap) => ({
        step: `Step ${snap.step}`,
        Support: Math.round((snap.support / total) * 100),
        Neutral: Math.round((snap.neutral / total) * 100),
        Oppose: Math.round((snap.oppose / total) * 100),
    }));

    return (
        <div className="results-chart-section">
            <h3 className="results-section-title">ADOPTION CURVE</h3>
            <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="step"
                            tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }}
                            axisLine={{ stroke: "var(--border)" }}
                        />
                        <YAxis
                            tick={{ fill: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)" }}
                            axisLine={{ stroke: "var(--border)" }}
                            unit="%"
                        />
                        <Tooltip
                            contentStyle={{
                                background: "var(--panel)",
                                border: "1px solid var(--border)",
                                borderRadius: 3,
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                color: "var(--text)",
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                fontFamily: "var(--mono)",
                                fontSize: 10,
                                color: "var(--muted)",
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Support"
                            stackId="1"
                            stroke="var(--support)"
                            fill="rgba(0, 208, 132, 0.3)"
                        />
                        <Area
                            type="monotone"
                            dataKey="Neutral"
                            stackId="1"
                            stroke="var(--neutral)"
                            fill="rgba(240, 180, 41, 0.2)"
                        />
                        <Area
                            type="monotone"
                            dataKey="Oppose"
                            stackId="1"
                            stroke="var(--oppose)"
                            fill="rgba(255, 68, 68, 0.2)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
