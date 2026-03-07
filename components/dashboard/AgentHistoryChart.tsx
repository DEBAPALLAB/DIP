"use client";

import type { AgentHistoryEntry, DecisionType } from "@/lib/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";

interface AgentHistoryChartProps {
    history: AgentHistoryEntry[];
    agentColor: string;
}

function encodeDecision(d: DecisionType): number {
    if (d === "support") return 1;
    if (d === "oppose") return -1;
    return 0;
}

function lastDecisionColor(history: AgentHistoryEntry[]): string {
    if (history.length === 0) return "#f0b429";
    const last = history[history.length - 1].decision;
    if (last === "support") return "#00d084";
    if (last === "oppose") return "#ff4444";
    return "#f0b429";
}

// Custom dot renderer
function CustomDot(props: {
    cx?: number;
    cy?: number;
    index?: number;
    payload?: { decision: DecisionType };
}) {
    const { cx = 0, cy = 0, payload } = props;
    const d = payload?.decision;
    const c = d === "support" ? "#00d084" : d === "oppose" ? "#ff4444" : "#f0b429";
    return <circle cx={cx} cy={cy} r={3} fill={c} stroke="none" />;
}

export default function AgentHistoryChart({
    history,
    agentColor,
}: AgentHistoryChartProps) {
    if (history.length === 0) return null;

    const data = history.map((h) => ({
        step: h.step + 1,
        value: encodeDecision(h.decision),
        decision: h.decision,
    }));

    const lineColor = lastDecisionColor(history);

    return (
        <div style={{ marginTop: 8 }}>
            <div
                style={{
                    fontSize: 9,
                    color: "#4a6070",
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: "0.12em",
                    marginBottom: 6,
                    textTransform: "uppercase",
                }}
            >
                Decision History
            </div>
            <ResponsiveContainer width="100%" height={60}>
                <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -30 }}>
                    <YAxis domain={[-1.2, 1.2]} hide />
                    <XAxis
                        dataKey="step"
                        tick={{
                            fontSize: 7,
                            fill: "#4a6070",
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                        axisLine={{ stroke: "#1a2332" }}
                        tickLine={false}
                    />
                    <ReferenceLine y={0} stroke="#1a2332" strokeDasharray="2 2" />
                    <Line
                        type="stepAfter"
                        dataKey="value"
                        stroke={lineColor}
                        strokeWidth={2}
                        dot={<CustomDot />}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
