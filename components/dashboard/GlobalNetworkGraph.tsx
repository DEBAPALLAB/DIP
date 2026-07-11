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
    if (!state?.decision) return "var(--neutral, #444855)"; // pending/neutral background
    if (state.decision === "support") return "var(--support, #C8F135)"; // Neon lime in dark, blue in light
    if (state.decision === "oppose") return "var(--oppose, #ff4444)"; // Crimson red
    if (state.decision === "neutral") return "var(--neutral, #f0b429)"; // Neutral color
    return "var(--neutral, #444855)";
}

export default function GlobalNetworkGraph({
    agents,
    edges,
    states,
    selectedId,
    onSelect,
}: GlobalNetworkGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [nodes, setNodes] = useState<SimNode[]>([]);
    const [links, setLinks] = useState<SimLink[]>([]);

    // Zoom & Pan pure-React state (extremely reliable, zero-dep)
    const [zoom, setZoom] = useState(1.6);
    const [pan, setPan] = useState({
        x: 800 / 2 - 400 * 1.6,
        y: 600 / 2 - 300 * 1.6
    });
    const [isDraggingBackground, setIsDraggingBackground] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Live telemetry computed metrics
    const stats = useMemo(() => {
        if (!agents.length) return { adoptionPct: 0, activeLinks: 0, avgInfluence: 0 };
        const supportCount = agents.filter(a => states[a.id]?.decision === 'support').length;
        const avgInf = agents.reduce((acc, a) => acc + a.influence_score, 0) / agents.length;
        return {
            adoptionPct: ((supportCount / agents.length) * 100).toFixed(1),
            activeLinks: edges.length,
            avgInfluence: avgInf.toFixed(2),
        };
    }, [agents, edges, states]);

    // Auto-resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        let isFirst = true;
        const observer = new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
            if (isFirst && width > 0) {
                setPan({
                    x: width / 2 - 400 * 1.6,
                    y: height / 2 - 300 * 1.6
                });
                isFirst = false;
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Generate a unique key for the network structure (nodes + edges)
    const structureKey = useMemo(() => {
        return `${agents.map(a => a.id).join(",")}|${edges.map(e => `${e[0]}-${e[1]}`).join(",")}`;
    }, [agents, edges]);

    // Run Force Simulation (only when network structure changes)
    useEffect(() => {
        if (!agents.length) return;

        const visibleIds = new Set(agents.map((a) => a.id));
        const simNodes: SimNode[] = agents.map((a) => {
            const existingNode = nodes.find(n => n.id === a.id);
            let x = existingNode?.x;
            let y = existingNode?.y;

            return {
                id: a.id,
                agent: a,
                x: x ?? 400 + (Math.random() - 0.5) * 200,
                y: y ?? 300 + (Math.random() - 0.5) * 200,
            };
        });

        const simLinks: SimLink[] = edges
            .filter(([source, target]) => visibleIds.has(source) && visibleIds.has(target))
            .map(([source, target]) => ({
                source,
                target,
            }));

        const density = (800 * 600) / Math.max(agents.length, 1);
        const desiredDistance = Math.min(Math.max(Math.sqrt(density) * 0.55, 90), 240);
        const desiredCharge = -Math.min(Math.max(desiredDistance * 3.5, 200), 750);

        const simulation = d3Force.forceSimulation<SimNode>(simNodes)
            .force("link", d3Force.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(desiredDistance).strength(0.75))
            .force("charge", d3Force.forceManyBody().strength(desiredCharge))
            .force("center", d3Force.forceCenter(400, 300))
            .force("collide", d3Force.forceCollide<SimNode>().radius((d) => 10 + (d.agent.influence_score * 8)))
            .alphaDecay(0.035)
            .on("tick", () => {
                // Keep simulation organic but within broad boundaries
                const margin = -150;
                simNodes.forEach((node) => {
                    node.x = Math.max(margin, Math.min(800 - margin, node.x || 0));
                    node.y = Math.max(margin, Math.min(600 - margin, node.y || 0));
                });

                setNodes([...simNodes]);
                setLinks([...simLinks]);
            });

        return () => {
            simulation.stop();
        };
    }, [structureKey]);

    // Zoom & Pan Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only trigger background pan if client clicks on background SVG or grid rect
        if (e.target === svgRef.current || (e.target as SVGElement).id === "grid-rect") {
            setIsDraggingBackground(true);
            dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDraggingBackground) {
            setPan({
                x: e.clientX - dragStart.current.x,
                y: e.clientY - dragStart.current.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDraggingBackground(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.08;
        const nextZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
        setZoom(Math.min(Math.max(nextZoom, 0.35), 3.0));
    };

    const resetZoomPan = () => {
        setZoom(1.6);
        setPan({
            x: dimensions.width / 2 - 400 * 1.6,
            y: dimensions.height / 2 - 300 * 1.6,
        });
    };

    // Global key listener for 'r' to recenter
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "r" || e.key === "R") {
                if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
                    return;
                }
                resetZoomPan();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    if (agents.length === 0) {
        return (
            <div ref={containerRef} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-darker)" }}>
                <span style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.15em" }}>WAITING_FOR_SIMULATION_POPULATION...</span>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                background: "var(--graph-bg)",
                border: "1px solid var(--border)",
                borderRadius: "14px"
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Custom High-Fidelity Reticle Animation Styles */}
            <style>
                {`
                    @keyframes pulse-support {
                        0% { filter: drop-shadow(0 0 0px var(--support)); }
                        50% { filter: drop-shadow(0 0 5px var(--support)); }
                        100% { filter: drop-shadow(0 0 0px var(--support)); }
                    }
                    @keyframes pulse-oppose {
                        0% { filter: drop-shadow(0 0 0px var(--oppose)); }
                        50% { filter: drop-shadow(0 0 5px var(--oppose)); }
                        100% { filter: drop-shadow(0 0 0px var(--oppose)); }
                    }
                    .node-support circle.main-circle {
                        animation: pulse-support 3.2s infinite ease-in-out;
                    }
                    .node-oppose circle.main-circle {
                        animation: pulse-oppose 3.2s infinite ease-in-out;
                    }
                    @keyframes spin-clockwise {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    @keyframes spin-counter {
                        from { transform: rotate(360deg); }
                        to { transform: rotate(0deg); }
                    }
                    .spin-ring {
                        animation: spin-clockwise 12s linear infinite;
                        transform-origin: center;
                        transform-box: fill-box;
                    }
                    .spin-ring-rev {
                        animation: spin-counter 16s linear infinite;
                        transform-origin: center;
                        transform-box: fill-box;
                    }
                    .bracket {
                        transition: stroke-dashoffset 0.3s ease;
                    }
                `}
            </style>

            {dimensions.width > 0 && dimensions.height > 0 && (
                <svg
                    ref={svgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    onMouseDown={handleMouseDown}
                    onWheel={handleWheel}
                    style={{ position: "absolute", top: 0, left: 0, cursor: isDraggingBackground ? "grabbing" : "grab" }}
                >
                    <defs>
                        <pattern id="tacticalGrid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                            {/* Grid ticks */}
                            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--border)" strokeWidth="0.5" opacity={0.4} />
                            <line x1="0" y1="0" x2="0" y2="60" stroke="var(--border)" strokeWidth="0.5" opacity={0.4} />
                            <circle cx="0" cy="0" r="1.5" fill="var(--text)" opacity={0.1} />
                        </pattern>
                        <filter id="hudBloom" x="-40%" y="-40%" width="180%" height="180%">
                            <feGaussianBlur stdDeviation="4.5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Infinite Coordinate Grid Background */}
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                        {/* Huge backdrop rect to catch drag interactions */}
                        <rect
                            id="grid-rect"
                            x="-2000"
                            y="-2000"
                            width="6000"
                            height="6000"
                            fill="url(#tacticalGrid)"
                        />

                        {/* Curved Link Segments */}
                        <g>
                            {links.map((link, i) => {
                                const source = link.source as unknown as SimNode;
                                const target = link.target as unknown as SimNode;
                                if (source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) return null;

                                const sState = states[source.id];
                                const tState = states[target.id];

                                const sColor = decisionColor(sState);
                                const tColor = decisionColor(tState);

                                const isActive = sState?.decision === "support" || tState?.decision === "support";

                                // Unique dynamic gradient link ID
                                const gradientId = `grad-${source.id}-${target.id}`;

                                const dx = target.x - source.x;
                                const dy = target.y - source.y;
                                const dr = Math.sqrt(dx * dx + dy * dy);

                                // Quadratic curved path representation
                                const pathD = `M${source.x},${source.y} Q${source.x + dx / 2 + dy / 4},${source.y + dy / 2 - dx / 4} ${target.x},${target.y}`;

                                return (
                                    <g key={`link-group-${i}`}>
                                        <defs>
                                            <linearGradient id={gradientId} x1={source.x} y1={source.y} x2={target.x} y2={target.y} gradientUnits="userSpaceOnUse">
                                                <stop offset="0%" stopColor={sColor} />
                                                <stop offset="100%" stopColor={tColor} />
                                            </linearGradient>
                                        </defs>

                                        <path
                                            d={pathD}
                                            fill="none"
                                            stroke={`url(#${gradientId})`}
                                            strokeWidth={isActive ? 1.5 : 0.8}
                                            opacity={isActive ? 0.65 : 0.15}
                                            style={{ transition: "stroke-width 0.5s ease, opacity 0.5s ease" }}
                                        />

                                        {/* Browser-Native GPU-Accelerated flowing data packets! */}
                                        {isActive && (
                                            <circle r="2.2" fill={tState?.decision === "support" ? "var(--support)" : "var(--orange)"} filter="url(#hudBloom)">
                                                <animateMotion dur="2.4s" repeatCount="indefinite" path={pathD} />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}
                        </g>

                        {/* Interactive Agent Nodes */}
                        <g>
                            {nodes.map((node) => {
                                const state = states[node.id];
                                const color = decisionColor(state);
                                const isSelected = selectedId === node.id;
                                const isSeeded = state?.isSeeded && !state.decision;

                                // Size calculated dynamically based on influence score
                                const radius = 6.5 + (node.agent.influence_score * 6.5);

                                let className = "";
                                if (state?.decision === "support") className = "node-support";
                                else if (state?.decision === "oppose") className = "node-oppose";

                                return (
                                    <g
                                        key={node.id}
                                        transform={`translate(${node.x || 0},${node.y || 0})`}
                                        onClick={() => onSelect(node.id)}
                                        className={className}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {/* HUD Corner targeting bracket for selected nodes */}
                                        {isSelected && (
                                            <g className="spin-ring">
                                                <path
                                                    d={`M ${-radius - 7} ${-radius - 2} L ${-radius - 7} ${-radius - 7} L ${-radius - 2} ${-radius - 7}`}
                                                    fill="none"
                                                    stroke="var(--orange)"
                                                    strokeWidth="1.2"
                                                />
                                                <path
                                                    d={`M ${radius + 2} ${-radius - 7} L ${radius + 7} ${-radius - 7} L ${radius + 7} ${-radius - 2}`}
                                                    fill="none"
                                                    stroke="var(--orange)"
                                                    strokeWidth="1.2"
                                                />
                                                <path
                                                    d={`M ${radius + 7} ${radius + 2} L ${radius + 7} ${radius + 7} L ${radius + 2} ${radius + 7}`}
                                                    fill="none"
                                                    stroke="var(--orange)"
                                                    strokeWidth="1.2"
                                                />
                                                <path
                                                    d={`M ${-radius - 2} ${radius + 7} L ${-radius - 7} ${radius + 7} L ${-radius - 7} ${radius + 2}`}
                                                    fill="none"
                                                    stroke="var(--orange)"
                                                    strokeWidth="1.2"
                                                />
                                            </g>
                                        )}

                                        {/* Quiet ring marking high-influence agents */}
                                        {node.agent.influence_score > 0.5 && (
                                            <circle
                                                r={radius + 4.5}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="1"
                                                opacity={0.28}
                                            />
                                        )}

                                        {/* Soft ambient halo */}
                                        {state?.decision && (
                                            <circle
                                                r={radius + 3}
                                                fill={color}
                                                opacity={0.1}
                                                filter="url(#hudBloom)"
                                            />
                                        )}

                                        {/* Main Reticle Circle */}
                                        <circle
                                            className="main-circle"
                                            r={radius}
                                            fill={state?.decision ? color : "var(--svg-node-fill, rgba(10, 12, 16, 0.85))"}
                                            stroke={state?.decision ? color : "var(--svg-node-stroke, rgba(255,255,255,0.18))"}
                                            strokeWidth={isSelected ? 1.8 : 1}
                                            style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
                                        />

                                        {/* Center Reticle dot */}
                                        <circle
                                            r="1.8"
                                            fill={isSelected ? "var(--orange)" : "var(--text)"}
                                            opacity={0.7}
                                        />

                                        {/* Animated ripple for Support cascades */}
                                        {state?.decision === "support" && (
                                            <circle
                                                r={radius}
                                                fill="none"
                                                stroke="var(--support)"
                                                strokeWidth={0.8}
                                                opacity={0.65}
                                            >
                                                <animate attributeName="r" from={radius} to={radius + 14} dur="2.2s" repeatCount="indefinite" />
                                                <animate attributeName="opacity" from="0.65" to="0" dur="2.2s" repeatCount="indefinite" />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    </g>
                </svg>
            )}

            {/* Viewport info (bottom-left) — quiet, factual */}
            <div style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "9px 13px",
                fontFamily: "var(--sans)",
                fontSize: 11.5,
                color: "var(--muted)",
                display: "flex",
                gap: 18,
                zIndex: 15,
            }}>
                <span><span style={{ color: "var(--bright)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{stats.activeLinks}</span> connections</span>
                <span>avg influence <span style={{ color: "var(--bright)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{stats.avgInfluence}</span></span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{(zoom * 100).toFixed(0)}%</span>
            </div>

            {/* Recenter (top-right) */}
            <div style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 15
            }}>
                <button
                    onClick={resetZoomPan}
                    style={{
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid var(--border)",
                        borderRadius: "9px",
                        color: "var(--text)",
                        fontFamily: "var(--sans)",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "7px 12px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                    }}
                    title="Recenter view (R)"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    Recenter
                </button>
            </div>

            {/* Standard Legends overlay (Bottom-Right) */}
            <div style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "var(--panel)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border-bright)",
                borderRadius: "4px",
                padding: "8px 12px",
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
                zIndex: 15,
                boxShadow: "0 10px 25px rgba(0,0,0,0.12)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--support)", boxShadow: "0 0 8px var(--support)" }} /> SUPPORT
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--orange)", boxShadow: "0 0 8px var(--orange)" }} /> SEED/PARTNER
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--oppose)", boxShadow: "0 0 8px var(--oppose)" }} /> OPPOSE
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--neutral, #444855)" }} /> NEUTRAL
                </div>
            </div>
        </div>
    );
}
