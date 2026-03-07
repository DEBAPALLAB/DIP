"use client";

import type { Agent, AgentState } from "@/lib/types";

interface EgoNetworkGraphProps {
    agent: Agent;
    agents: Agent[];
    edges: [number, number][];
    agentStates: Record<number, AgentState>;
    onSelectAgent: (id: number) => void;
}

function decisionColor(decision: string | null | undefined): string {
    if (decision === "support") return "#00d084";
    if (decision === "oppose") return "#ff4444";
    if (decision === "neutral") return "#f0b429";
    return "#1a2332";
}

export default function EgoNetworkGraph({
    agent,
    agents,
    edges,
    agentStates,
    onSelectAgent,
}: EgoNetworkGraphProps) {
    const neighborIds = edges
        .filter(([a, b]) => a === agent.id || b === agent.id)
        .map(([a, b]) => (a === agent.id ? b : a));

    const neighbors = neighborIds
        .map((id) => agents.find((a) => a.id === id))
        .filter(Boolean) as Agent[];

    const cx = 110;
    const cy = 110;
    const r = 72;
    const angleStep = neighbors.length > 0 ? (2 * Math.PI) / neighbors.length : 0;

    const selfDecision = agentStates[agent.id]?.decision;
    const selfColor = selfDecision
        ? decisionColor(selfDecision)
        : agent.color;

    return (
        <svg
            width={220}
            height={220}
            style={{ background: "#0c1018", borderRadius: 4, display: "block" }}
        >
            {/* Edges */}
            {neighbors.map((nb, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const nx = cx + r * Math.cos(angle);
                const ny = cy + r * Math.sin(angle);
                return (
                    <line
                        key={`e-${nb.id}`}
                        x1={cx}
                        y1={cy}
                        x2={nx}
                        y2={ny}
                        stroke="#1a2332"
                        strokeWidth={1.5}
                    />
                );
            })}

            {/* Neighbor nodes */}
            {neighbors.map((nb, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const nx = cx + r * Math.cos(angle);
                const ny = cy + r * Math.sin(angle);
                const d = agentStates[nb.id]?.decision;
                const nc = decisionColor(d);
                const isDecided = !!d;

                return (
                    <g
                        key={`n-${nb.id}`}
                        style={{ cursor: "pointer" }}
                        onClick={() => onSelectAgent(nb.id)}
                    >
                        <circle
                            cx={nx}
                            cy={ny}
                            r={14}
                            fill={isDecided ? nc : nb.color}
                            fillOpacity={isDecided ? 0.25 : 0.12}
                            stroke={isDecided ? nc : nb.color}
                            strokeWidth={1.5}
                        />
                        <text
                            x={nx}
                            y={ny + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={7}
                            fill={isDecided ? nc : nb.color}
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="600"
                        >
                            {nb.name.split(" ")[0].slice(0, 6)}
                        </text>
                    </g>
                );
            })}

            {/* Center node (selected agent) */}
            <circle
                cx={cx}
                cy={cy}
                r={20}
                fill={selfColor}
                fillOpacity={0.22}
                stroke={selfColor}
                strokeWidth={2.5}
            />
            <text
                x={cx}
                y={cy - 4}
                textAnchor="middle"
                fontSize={8}
                fill={selfColor}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
            >
                {agent.name.split(" ")[0]}
            </text>
            <text
                x={cx}
                y={cy + 8}
                textAnchor="middle"
                fontSize={7}
                fill={selfColor}
                fontFamily="'JetBrains Mono', monospace"
                opacity={0.85}
            >
                {agentStates[agent.id]?.decision?.toUpperCase() ?? "—"}
            </text>

            {/* No neighbors message */}
            {neighbors.length === 0 && (
                <text
                    x={cx}
                    y={cy + 40}
                    textAnchor="middle"
                    fontSize={8}
                    fill="#2a3a4a"
                    fontFamily="'JetBrains Mono', monospace"
                >
                    NO CONNECTIONS
                </text>
            )}
        </svg>
    );
}
