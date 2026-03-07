"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import type { StepSnapshot } from "@/lib/types";

interface AdoptionChartProps {
    history: StepSnapshot[];
    total: number;
}

function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: number;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div
            style={{
                background: "var(--panel)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                padding: "8px 12px",
                fontFamily: "var(--mono)",
                fontSize: 11,
            }}
        >
            <div style={{ color: "var(--muted)", marginBottom: 4, fontSize: 9 }}>STEP {label}</div>
            {payload.map((p) => (
                <div key={p.name} style={{ color: p.color, lineHeight: 1.8 }}>
                    {p.name.toUpperCase()}: {p.value}
                </div>
            ))}
        </div>
    );
}

export default function AdoptionChart({ history, total }: AdoptionChartProps) {
    if (history.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "var(--muted)",
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                }}
            >
                RUN SIMULATION TO SEE ADOPTION CURVE
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={history}
                margin={{ top: 8, right: 12, bottom: 4, left: -20 }}
            >
                <CartesianGrid strokeDasharray="2 4" stroke="#1a2332" />
                <XAxis
                    dataKey="step"
                    stroke="#2a3a4a"
                    tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "#4a6070" }}
                    label={{ value: "STEP", position: "insideBottom", offset: -2, style: { fontFamily: "var(--mono)", fontSize: 9, fill: "#4a6070" } }}
                />
                <YAxis
                    stroke="#2a3a4a"
                    tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "#4a6070" }}
                    domain={[0, total]}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 9, paddingTop: 4 }}
                    formatter={(value) => <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>{value}</span>}
                />
                <Line
                    type="monotone"
                    dataKey="support"
                    stroke="var(--support)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--support)" }}
                    name="support"
                />
                <Line
                    type="monotone"
                    dataKey="neutral"
                    stroke="var(--neutral)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--neutral)" }}
                    name="neutral"
                />
                <Line
                    type="monotone"
                    dataKey="oppose"
                    stroke="var(--oppose)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--oppose)" }}
                    name="oppose"
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
