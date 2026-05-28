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
    if (!state?.decision) return "#444855"; // pending/neutral background
    if (state.decision === "support") return "#C8F135"; // Neon lime
    if (state.decision === "oppose") return "#ff4444"; // Crimson red
    if (state.decision === "neutral") return "#ff6b35"; // Early partner orange
    return "#444855";
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
    const [zoom, setZoom] = useState(1.0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
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

        const visibleIds = new Set(agents.map((a) => a.id));
        const simNodes: SimNode[] = agents.map((a) => {
            const existingNode = nodes.find(n => n.id === a.id);
            return {
                id: a.id,
                agent: a,
                x: existingNode?.x ?? Math.random() * dimensions.width,
                y: existingNode?.y ?? dimensions.height * 0.4 + Math.random() * (dimensions.height * 0.2),
            };
        });

        const simLinks: SimLink[] = edges
            .filter(([source, target]) => visibleIds.has(source) && visibleIds.has(target))
            .map(([source, target]) => ({
                source,
                target,
            }));

        const density = (dimensions.width * dimensions.height) / Math.max(agents.length, 1);
        const desiredDistance = Math.min(Math.max(Math.sqrt(density) * 0.55, 25), 90);
        const desiredCharge = -Math.min(Math.max(desiredDistance * 3.5, 70), 320);

        const simulation = d3Force.forceSimulation<SimNode>(simNodes)
            .force("link", d3Force.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(desiredDistance).strength(0.75))
            .force("charge", d3Force.forceManyBody().strength(desiredCharge))
            .force("center", d3Force.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force("collide", d3Force.forceCollide<SimNode>().radius((d) => 10 + (d.agent.influence_score * 8)))
            .alphaDecay(0.035)
            .on("tick", () => {
                // Keep simulation organic but within broad boundaries
                const margin = -150;
                simNodes.forEach((node) => {
                    node.x = Math.max(margin, Math.min(dimensions.width - margin, node.x || 0));
                    node.y = Math.max(margin, Math.min(dimensions.height - margin, node.y || 0));
                });

                setNodes([...simNodes]);
                setLinks([...simLinks]);
            });

        return () => {
            simulation.stop();
        };
    }, [agents, edges, dimensions.width, dimensions.height]);

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
        setZoom(1.0);
        setPan({ x: 0, y: 0 });
    };

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
                background: "radial-gradient(circle at 50% 50%, #0d0f13 0%, #050608 100%)",
                border: "1px solid var(--border)",
                borderRadius: "3px"
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Custom High-Fidelity Reticle Animation Styles */}
            <style>
                {`
                    @keyframes pulse-support {
                        0% { filter: drop-shadow(0 0 2px #C8F135); opacity: 0.85; }
                        50% { filter: drop-shadow(0 0 14px #C8F135); opacity: 1; }
                        100% { filter: drop-shadow(0 0 2px #C8F135); opacity: 0.85; }
                    }
                    @keyframes pulse-oppose {
                        0% { filter: drop-shadow(0 0 2px #ff4444); opacity: 0.85; }
                        50% { filter: drop-shadow(0 0 14px #ff4444); opacity: 1; }
                        100% { filter: drop-shadow(0 0 2px #ff4444); opacity: 0.85; }
                    }
                    .node-support circle.main-circle {
                        animation: pulse-support 2.5s infinite ease-in-out;
                    }
                    .node-oppose circle.main-circle {
                        animation: pulse-oppose 2.5s infinite ease-in-out;
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
                            <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
                            <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.08)" />
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
                                            <circle r="2.2" fill={tState?.decision === "support" ? "#C8F135" : "#ff6b35"} filter="url(#hudBloom)">
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

                                        {/* Segmented HUD Ring for high-influence agents */}
                                        {node.agent.influence_score > 0.5 && (
                                            <circle
                                                r={radius + 5.5}
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="0.8"
                                                strokeDasharray="4 6"
                                                className="spin-ring-rev"
                                                opacity={0.4}
                                            />
                                        )}

                                        {/* Core Emissive Ambient Glow */}
                                        {state?.decision && (
                                            <circle
                                                r={radius + 4}
                                                fill={color}
                                                opacity={0.2}
                                                filter="url(#hudBloom)"
                                            />
                                        )}

                                        {/* Main Reticle Circle */}
                                        <circle
                                            className="main-circle"
                                            r={radius}
                                            fill={state?.decision ? color : "rgba(10, 12, 16, 0.85)"}
                                            stroke={state?.decision ? color : "rgba(255,255,255,0.18)"}
                                            strokeWidth={isSelected ? 1.8 : 1}
                                            style={{ transition: "fill 0.4s ease, stroke 0.4s ease" }}
                                        />

                                        {/* Center Reticle dot */}
                                        <circle
                                            r="1.8"
                                            fill={isSelected ? "var(--orange)" : "#ffffff"}
                                            opacity={0.7}
                                        />

                                        {/* Animated ripple for Support cascades */}
                                        {state?.decision === "support" && (
                                            <circle
                                                r={radius}
                                                fill="none"
                                                stroke="#C8F135"
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

            {/* Absolute Centered Targeting Crosshairs overlay */}
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 140,
                height: 140,
                border: "1px dashed rgba(255,255,255,0.03)",
                borderRadius: "50%",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10
            }}>
                <div style={{ width: 12, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ height: 12, width: 1, background: "rgba(255,255,255,0.08)", position: "absolute" }} />
            </div>

            {/* TACTICAL OVERLAY 1: Telemetry Panel (Bottom-Left) */}
            <div style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                background: "rgba(6, 8, 10, 0.88)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "10px 14px",
                fontFamily: "var(--mono)",
                fontSize: 10,
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
                zIndex: 15,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }}>
                <div style={{ color: "var(--orange)", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 4, marginBottom: 4, letterSpacing: "0.12em" }}>// TELEMETRY_SYSTEM</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>VIEW_SCALE:</span>
                    <span style={{ color: "var(--bright)" }}>{(zoom * 100).toFixed(0)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>DENSITY:</span>
                    <span style={{ color: "var(--bright)" }}>{stats.activeLinks} LINKS</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>ADOPTION_R:</span>
                    <span style={{ color: "#C8F135", fontWeight: 700 }}>{stats.adoptionPct}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                    <span>AVG_INFLUENCE:</span>
                    <span style={{ color: "var(--bright)" }}>{stats.avgInfluence}</span>
                </div>
            </div>

            {/* TACTICAL OVERLAY 2: Navigation & Radar Map Widget (Top-Right) */}
            <div style={{
                position: "absolute",
                top: 16,
                right: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 10,
                zIndex: 15
            }}>
                <button
                    onClick={resetZoomPan}
                    style={{
                        background: "rgba(6, 8, 10, 0.88)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid var(--border)",
                        borderRadius: "4px",
                        color: "var(--bright)",
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        padding: "5px 10px",
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
                    }}
                >
                    Recenter Camera [R]
                </button>

                {/* Holographic Circular Radar */}
                <div style={{
                    width: 72,
                    height: 72,
                    border: "1.5px solid rgba(200, 241, 53, 0.15)",
                    borderRadius: "50%",
                    position: "relative",
                    background: "rgba(6, 8, 10, 0.65)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <div className="spin-ring" style={{ width: "90%", height: "90%", border: "0.5px dashed rgba(255,255,255,0.06)", borderRadius: "50%" }} />
                    <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(200, 241, 53, 0.08)" }} />
                    <div style={{ position: "absolute", height: "100%", width: 1, background: "rgba(200, 241, 53, 0.08)" }} />
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8F135", opacity: 0.8, filter: "drop-shadow(0 0 5px #C8F135)", position: "absolute" }} />
                </div>
            </div>

            {/* Standard Legends overlay (Bottom-Right) */}
            <div style={{
                position: "absolute",
                bottom: 16,
                right: 16,
                background: "rgba(6, 8, 10, 0.88)",
                backdropFilter: "blur(12px)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "8px 12px",
                fontFamily: "var(--mono)",
                fontSize: 9,
                color: "var(--muted)",
                display: "flex",
                flexDirection: "column",
                gap: 5,
                zIndex: 15,
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8F135", boxShadow: "0 0 8px #C8F135" }} /> SUPPORT [LIME]
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff6b35", boxShadow: "0 0 8px #ff6b35" }} /> SEED/PARTNER [ORANGE]
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff4444", boxShadow: "0 0 8px #ff4444" }} /> OPPOSE [RED]
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#444855" }} /> NEUTRAL [GREY]
                </div>
            </div>
        </div>
    );
}
