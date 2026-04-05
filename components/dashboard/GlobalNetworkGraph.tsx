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
                    @keyframes pulse-support {
                        0% { filter: drop-shadow(0 0 2px var(--support)); opacity: 0.8; }
                        50% { filter: drop-shadow(0 0 12px var(--support)); opacity: 1; }
                        100% { filter: drop-shadow(0 0 2px var(--support)); opacity: 0.8; }
                    }
                    @keyframes pulse-oppose {
                        0% { filter: drop-shadow(0 0 2px var(--oppose)); opacity: 0.8; }
                        50% { filter: drop-shadow(0 0 12px var(--oppose)); opacity: 1; }
                        100% { filter: drop-shadow(0 0 2px var(--oppose)); opacity: 0.8; }
                    }
                    .node-support circle {
                        animation: pulse-support 3s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .node-oppose circle {
                        animation: pulse-oppose 3s infinite cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    @keyframes dash-flow {
                        to { stroke-dashoffset: -20; }
                    }
                    .edge-flow {
                        stroke-dasharray: 4, 6;
                        animation: dash-flow 1.5s linear infinite;
                    }
                    @keyframes reticle-rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .reticle-ring {
                        animation: reticle-rotate 8s linear infinite;
                        transform-origin: center;
                    }
                `}
            </style>

            {dimensions.width > 0 && dimensions.height > 0 && (
                <svg
                    width={dimensions.width}
                    height={dimensions.height}
                    style={{ position: "absolute", top: 0, left: 0 }}
                >
                    <defs>
                        <pattern id="dotGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
                        </pattern>
                        <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Background Grid */}
                    <rect width="100%" height="100%" fill="url(#dotGrid)" />

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
                                stroke={isActive ? (sState?.decision === "support" ? "var(--support)" : "var(--border)") : "var(--border)"}
                                strokeWidth={isActive ? 1.5 : 1}
                                className={isActive ? "edge-flow" : ""}
                                opacity={isActive ? 0.7 : 0.2}
                                style={{ transition: "stroke 0.8s ease, stroke-width 0.8s ease, opacity 0.8s ease" }}
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
                                style={{ cursor: "pointer", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
                            >
                                {/* TARGETING RETICLE (APPLE STYLE HIGH FIDELITY) */}
                                {isSelected && (
                                    <g className="reticle-ring">
                                        <circle
                                            r={radius + 8}
                                            fill="none"
                                            stroke="var(--orange)"
                                            strokeWidth={0.5}
                                            strokeDasharray="4 8"
                                            opacity={0.8}
                                        />
                                        <path 
                                            d={`M0,${-radius-12} L0,${-radius-6} M0,${radius+6} L0,${radius+12} M${-radius-12},0 L${-radius-6},0 M${radius+6},0 L${radius+12},0`}
                                            stroke="var(--orange)"
                                            strokeWidth={1}
                                            opacity={0.6}
                                        />
                                    </g>
                                )}

                                {/* Node Ambient Glow */}
                                {state?.decision && (
                                    <circle
                                        r={radius + 4}
                                        fill={color}
                                        opacity={0.15}
                                        filter="url(#bloom)"
                                    />
                                )}

                                {/* Main Node Circle */}
                                <circle
                                    r={radius}
                                    fill={state?.decision ? color : "rgba(255,255,255,0.05)"}
                                    stroke={state?.decision ? color : "rgba(255,255,255,0.15)"}
                                    strokeWidth={isSelected ? 2 : 1}
                                    style={{ transition: "fill 0.6s ease, stroke 0.6s ease" }}
                                />
                                
                                {/* Influence Pulse Ring */}
                                {state?.decision === "support" && (
                                    <circle
                                        r={radius}
                                        fill="none"
                                        stroke="var(--support)"
                                        strokeWidth={1}
                                        opacity={0.5}
                                    >
                                        <animate attributeName="r" from={radius} to={radius + 15} dur="2s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                                    </circle>
                                )}
                            </g>
                        );
;
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
