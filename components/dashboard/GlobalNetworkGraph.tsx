"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3Force from "d3-force";
import type { Agent, AgentState, SimulationStates } from "@/lib/types";

interface GlobalNetworkGraphProps {
    agents: Agent[];
    edges: [number, number][];
    states: SimulationStates;
    selectedId: number | null;
    onSelect: (id: number) => void;
}

interface SimNode extends d3Force.SimulationNodeDatum {
    id: number;
    agent: Agent;
}

interface SimLink extends d3Force.SimulationLinkDatum<SimNode> {
    source: number; // Initially number, mutated to SimNode
    target: number; // Initially number, mutated to SimNode
}

function decisionColor(state?: AgentState): string {
    if (!state?.decision) return "var(--border-bright)"; // default/pending
    if (state.decision === "support") return "var(--support)";
    if (state.decision === "oppose") return "var(--oppose)";
    if (state.decision === "neutral") return "var(--neutral)";
    return "var(--border-bright)";
}

export default function GlobalNetworkGraph({
    agents,
    edges,
    states,
    selectedId,
    onSelect,
}: GlobalNetworkGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [nodes, setNodes] = useState<SimNode[]>([]);
    const [links, setLinks] = useState<SimLink[]>([]);

    // Auto-resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Run Force Simulation (only when network structure changes)
    useEffect(() => {
        if (!agents.length) return;

        const simNodes: SimNode[] = agents.map((a) => ({
            id: a.id,
            agent: a,
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
        }));

        const simLinks: SimLink[] = edges.map(([source, target]) => ({
            source,
            target,
        }));

        // Dynamic scaling based on container size and population
        const density = (dimensions.width * dimensions.height) / Math.max(agents.length, 1);
        const desiredDistance = Math.min(Math.max(Math.sqrt(density) * 0.6, 20), 120);
        const desiredCharge = -Math.min(Math.max(desiredDistance * 4, 80), 400);

        const simulation = d3Force.forceSimulation<SimNode>(simNodes)
            .force("link", d3Force.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(desiredDistance).strength(0.8))
            .force("charge", d3Force.forceManyBody().strength(desiredCharge))
            .force("center", d3Force.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("collide", d3Force.forceCollide().radius(16))
            .alphaDecay(0.04)
            .on("tick", () => {
                // Constrain nodes strictly within SVG viewport bounds
                const margin = 20;
                simNodes.forEach((node) => {
                    node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x || 0));
                    node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y || 0));
                });

                // Force re-render to animate
                setNodes([...simNodes]);
                setLinks([...simLinks]);
            });

        return () => {
            simulation.stop();
        };
    }, [agents, edges, dimensions.width, dimensions.height]);

    // Fast static render if no nodes
    if (agents.length === 0) {
        return (
            <div ref={containerRef} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12 }}>Waiting for population...</span>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden", background: "var(--bg-darker)" }}>
            <style>
                {`
                    @keyframes pulse-seed {
                        0% { filter: drop-shadow(0 0 4px var(--support)); stroke-width: 2; transform: scale(1); }
                        50% { filter: drop-shadow(0 0 16px var(--support)); stroke-width: 4; transform: scale(1.1); }
                        100% { filter: drop-shadow(0 0 4px var(--support)); stroke-width: 2; transform: scale(1); }
                    }
                    .node-seeded circle {
                        animation: pulse-seed 2s infinite ease-in-out;
                        transform-origin: center;
                    }
                    @keyframes pulse-support {
                        0% { filter: drop-shadow(0 0 2px var(--support)); }
                        50% { filter: drop-shadow(0 0 10px var(--support)); }
                        100% { filter: drop-shadow(0 0 2px var(--support)); }
                    }
                    .node-support circle {
                        animation: pulse-support 4s infinite ease-in-out;
                    }
                `}
            </style>

            {dimensions.width > 0 && dimensions.height > 0 && (
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{ position: "absolute", top: 0, left: 0 }}
                >
                    <g>
                    {/* Render Curved Links */}
                    {links.map((link, i) => {
                        const source = link.source as unknown as SimNode;
                        const target = link.target as unknown as SimNode;
                        if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;

                        const sState = states[source.id];
                        const tState = states[target.id];
                        const isActive = sState?.decision === "support" || tState?.decision === "support";

                        // Bezier curve control point offset
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dr = Math.sqrt(dx * dx + dy * dy);

                        return (
                            <path
                                key={`link-${i}`}
                                d={`M${source.x},${source.y} Q${source.x + dx / 2 + dy / 4},${source.y + dy / 2 - dx / 4} ${target.x},${target.y}`}
                                fill="none"
                                stroke={isActive ? "var(--support)" : "var(--border)"}
                                strokeWidth={isActive ? 1.5 : 1}
                                opacity={isActive ? 0.6 : 0.3}
                                style={{ transition: "stroke 0.5s, stroke-width 0.5s, opacity 0.5s" }}
                            />
                        );
                    })}

                    {/* Render Nodes */}
                    {nodes.map((node) => {
                        const state = states[node.id];
                        const color = decisionColor(state);
                        const isSelected = selectedId === node.id;
                        const isSeeded = state?.isSeeded && !state.decision;

                        // Scale radius slightly by influence score (base 6, up to 14)
                        const radius = 5 + (node.agent.influence_score * 4);

                        let className = "";
                        if (isSeeded) className = "node-seeded";
                        else if (state?.decision === "support") className = "node-support";

                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x || 0},${node.y || 0})`}
                                onClick={() => onSelect(node.id)}
                                className={className}
                                style={{ cursor: "pointer", transition: "transform 0.1s linear" }}
                            >
                                {/* Selection Highlight Ping */}
                                {isSelected && (
                                    <circle
                                        r={radius + 6}
                                        fill="none"
                                        stroke="var(--orange)"
                                        strokeWidth={1}
                                        strokeDasharray="4 2"
                                    />
                                )}

                                {/* Main Node Circle */}
                                <circle
                                    r={radius}
                                    fill={state?.decision ? color : "var(--border-bright)"}
                                    fillOpacity={state?.decision ? 0.8 : 0.4}
                                    stroke={state?.decision ? color : "var(--border-bright)"}
                                    strokeWidth={isSelected ? 1.5 : 0.5}
                                />

                                {/* Seeded Indicator */}
                                {isSeeded && (
                                    <text
                                        y={-radius - 4}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fill="var(--support)"
                                    >
                                        🌱
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
            )}

            {/* View Legend Overlay */}
            <div style={{
                position: "absolute",
                bottom: 12,
                right: 12,
                background: "var(--bg-darker)",
                border: "1px solid var(--border)",
                borderRadius: 2,
                padding: "6px 10px",
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: 4
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--support)" }} /> SUPPORT
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neutral)" }} /> NEUTRAL
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--oppose)" }} /> OPPOSE
                </div>
            </div>
        </div>
    );
}
