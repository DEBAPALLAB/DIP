"use client";

import { useState } from "react";
import type { Agent, AgentState } from "@/lib/types";

interface EgoNetworkGraphProps {
    agent: Agent;
    agents: Agent[];
    edges: [number, number][];
    agentStates: Record<number, AgentState>;
    onSelectAgent: (id: number) => void;
}

function decisionColor(decision: string | null | undefined): string {
    if (decision === "support") return "#10b981"; // Emerald-500
    if (decision === "oppose") return "#f43f5e"; // Rose-500
    if (decision === "neutral") return "#f59e0b"; // Amber-500
    return "#64748b"; // Slate-500
}

export default function EgoNetworkGraph({
    agent,
    agents,
    edges,
    agentStates,
    onSelectAgent,
}: EgoNetworkGraphProps) {
    const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);

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
        <div style={{ position: "relative", width: 220, height: 220, margin: "0 auto" }}>
            <svg
                width={220}
                height={220}
                style={{
                    background: "radial-gradient(circle, #151d30 0%, #090e1a 100%)",
                    borderRadius: "14px",
                    display: "block",
                    boxShadow: "0 12px 28px -6px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
            >
                <defs>
                    {/* Glowing Filters */}
                    <filter id="glow-support" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-oppose" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-neutral" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-node-hover" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    
                    {/* Grid Pattern */}
                    <pattern id="ego-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <circle cx="8" cy="8" r="0.8" fill="rgba(255, 255, 255, 0.12)" />
                    </pattern>
                </defs>

                {/* Grid Background */}
                <rect width="100%" height="100%" fill="url(#ego-grid)" rx="14" />

                {/* Technical HUD circular guides */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth={1} />
                <circle cx={cx} cy={cy} r={r + 14} fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth={1} strokeDasharray="3 6" />
                <circle cx={cx} cy={cy} r={32} fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth={1} strokeDasharray="2 4" />

                {/* Edges */}
                {neighbors.map((nb, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const nx = cx + r * Math.cos(angle);
                    const ny = cy + r * Math.sin(angle);
                    const d = agentStates[nb.id]?.decision;
                    const nc = decisionColor(d);
                    const isHovered = hoveredNodeId === nb.id;
                    return (
                        <g key={`edge-g-${nb.id}`}>
                            {/* Ambient glowing edge line */}
                            <line
                                x1={cx}
                                y1={cy}
                                x2={nx}
                                y2={ny}
                                stroke={d ? nc : nb.color}
                                strokeWidth={isHovered ? 2.5 : 1.2}
                                strokeOpacity={isHovered ? 0.75 : 0.2}
                                style={{ transition: "stroke-width 0.2s, stroke-opacity 0.2s" }}
                            />
                            {/* Pulsing overlay line */}
                            <line
                                x1={cx}
                                y1={cy}
                                x2={nx}
                                y2={ny}
                                stroke="rgba(255, 255, 255, 0.8)"
                                strokeWidth={0.8}
                                strokeOpacity={isHovered ? 0.9 : 0.08}
                                strokeDasharray={isHovered ? "4 4" : undefined}
                                style={{ transition: "stroke-opacity 0.2s" }}
                            />
                        </g>
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
                    const isSeeded = agentStates[nb.id]?.isSeeded && !d;
                    const isHovered = hoveredNodeId === nb.id;

                    let glowFilter = undefined;
                    if (isHovered) {
                        glowFilter = "url(#glow-node-hover)";
                    } else if (d === "support") {
                        glowFilter = "url(#glow-support)";
                    } else if (d === "oppose") {
                        glowFilter = "url(#glow-oppose)";
                    } else if (d === "neutral") {
                        glowFilter = "url(#glow-neutral)";
                    }

                    return (
                        <g
                            key={`n-${nb.id}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => onSelectAgent(nb.id)}
                            onMouseEnter={() => setHoveredNodeId(nb.id)}
                            onMouseLeave={() => setHoveredNodeId(null)}
                        >
                            {isSeeded && (
                                <text x={nx + 8} y={ny - 8} fontSize={9} style={{ filter: "drop-shadow(0 0 3px #10b981)" }}>
                                    🌱
                                </text>
                            )}
                            
                            {/* Translucent visual node ring */}
                            <circle
                                cx={nx}
                                cy={ny}
                                r={isHovered ? 16 : 14}
                                fill={isDecided ? nc : nb.color}
                                fillOpacity={isHovered ? 0.38 : 0.22}
                                stroke={isDecided ? nc : nb.color}
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                filter={glowFilter}
                                style={{
                                    transition: "r 0.2s, fill-opacity 0.2s, stroke-width 0.2s, stroke 0.2s",
                                }}
                            />

                            {/* Center visual dot */}
                            <circle
                                cx={nx}
                                cy={ny}
                                r={isHovered ? 4 : 3}
                                fill={isDecided ? nc : nb.color}
                                fillOpacity={0.9}
                                style={{ transition: "r 0.2s" }}
                            />

                            {/* Node name label */}
                            <text
                                x={nx}
                                y={ny + 23}
                                textAnchor="middle"
                                fontSize={8}
                                fill={isHovered ? "#ffffff" : "rgba(241, 245, 249, 0.75)"}
                                fontFamily="var(--mono)"
                                fontWeight={isHovered ? "700" : "500"}
                                style={{
                                    transition: "fill 0.2s, font-weight 0.2s",
                                    pointerEvents: "none",
                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.85)"
                                }}
                            >
                                {nb.name.split(" ")[0].slice(0, 7)}
                            </text>
                        </g>
                    );
                })}

                {/* Center node */}
                <g>
                    {/* Glowing pulse ring */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={24}
                        fill="none"
                        stroke={selfColor}
                        strokeWidth={1}
                        className="pulse-hud-ring"
                    />
                    
                    <circle
                        cx={cx}
                        cy={cy}
                        r={19}
                        fill={selfColor}
                        fillOpacity={0.25}
                        stroke={selfColor}
                        strokeWidth={3}
                        filter={
                            selfDecision === "support"
                                ? "url(#glow-support)"
                                : selfDecision === "oppose"
                                    ? "url(#glow-oppose)"
                                    : selfDecision === "neutral"
                                        ? "url(#glow-neutral)"
                                        : undefined
                        }
                    />
                    
                    <circle cx={cx} cy={cy} r={4.5} fill={selfColor} />

                    {agentStates[agent.id]?.isSeeded && !selfDecision && (
                        <text x={cx + 14} y={cy - 14} fontSize={12} style={{ filter: "drop-shadow(0 0 4px #10b981)" }}>
                            🌱
                        </text>
                    )}
                </g>

                {neighbors.length === 0 && (
                    <text
                        x={cx}
                        y={cy + 45}
                        textAnchor="middle"
                        fontSize={8}
                        fill="#64748b"
                        fontFamily="var(--mono)"
                        letterSpacing="0.05em"
                    >
                        NO CONNECTIONS
                    </text>
                )}
            </svg>
            
            <style jsx>{`
                .pulse-hud-ring {
                    animation: egoPulse 3s infinite ease-in-out;
                }
                @keyframes egoPulse {
                    0% {
                        opacity: 0.2;
                        stroke-dasharray: 2 4;
                        transform: scale(0.98);
                    }
                    50% {
                        opacity: 0.65;
                        stroke-dasharray: 4 2;
                        transform: scale(1.05);
                    }
                    100% {
                        opacity: 0.2;
                        stroke-dasharray: 2 4;
                        transform: scale(0.98);
                    }
                }
            `}</style>
        </div>
    );
}
