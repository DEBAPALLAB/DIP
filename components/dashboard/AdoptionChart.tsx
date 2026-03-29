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
            <AreaChart
                data={history}
                margin={{ top: 8, right: 12, bottom: 4, left: -20 }}
            >
                <defs>
                    <linearGradient id="colorSupport" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--support)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--support)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neutral)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--neutral)" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorOppose" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--oppose)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--oppose)" stopOpacity={0.05} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
                <XAxis
                    dataKey="step"
                    stroke="var(--border-bright)"
                    tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--muted)" }}
                    label={{ value: "STEP", position: "insideBottom", offset: -2, style: { fontFamily: "var(--mono)", fontSize: 9, fill: "var(--muted)" } }}
                />
                <YAxis
                    stroke="var(--border-bright)"
                    tick={{ fontFamily: "var(--mono)", fontSize: 9, fill: "var(--muted)" }}
                    domain={[0, total]}
                    allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontFamily: "var(--mono)", fontSize: 9, paddingTop: 10 }}
                    formatter={(value) => <span style={{ color: "var(--muted)", textTransform: "uppercase" }}>{value}</span>}
                />
                <Area
                    type="monotone"
                    dataKey="support"
                    stackId="1"
                    stroke="var(--support)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorSupport)"
                    name="support"
                />
                <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="var(--neutral)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorNeutral)"
                    name="neutral"
                />
                <Area
                    type="monotone"
                    dataKey="oppose"
                    stackId="1"
                    stroke="var(--oppose)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorOppose)"
                    name="oppose"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
