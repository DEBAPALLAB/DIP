"use client";

import type { Agent, AgentState, DecisionType } from "@/lib/types";

interface AgentCardProps {
    agent: Agent;
    state: AgentState;
    selected: boolean;
    onClick: () => void;
}

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, paddingRight: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>
                    {label}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: color, fontWeight: 700, opacity: 0.8 }}>
                    {(value * 100).toFixed(0)}%
                </span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", position: "relative", border: "1px solid rgba(255,255,255,0.05)" }}>
                {/* Ruler Ticks */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "10% 100%", pointerEvents: "none" }} />
                <div style={{ height: "100%", width: `${value * 100}%`, background: color, boxShadow: `0 0 10px ${color}55`, transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
            </div>
        </div>
    );
}

function TacticalBrackets() {
    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5, opacity: 0.5 }}>
            <div style={{ position: "absolute", top: 10, left: 10, width: 8, height: 8, borderTop: "1.5px solid rgba(255,255,255,0.4)", borderLeft: "1.5px solid rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderTop: "1.5px solid rgba(255,255,255,0.4)", borderRight: "1.5px solid rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", bottom: 10, left: 10, width: 8, height: 8, borderBottom: "1.5px solid rgba(255,255,255,0.4)", borderLeft: "1.5px solid rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", bottom: 10, right: 10, width: 8, height: 8, borderBottom: "1.5px solid rgba(255,255,255,0.4)", borderRight: "1.5px solid rgba(255,255,255,0.4)" }} />
        </div>
    );
}

function CardBackground() {
    return (
        <div style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none" }}>
            <svg width="100%" height="100%" opacity="0.08">
                <pattern id="cardPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.8" fill="white" />
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.2" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#cardPattern)" />
            </svg>
        </div>
    );
}

function ModelBadge({ model }: { model?: string }) {
    if (!model) return null;
    let label = model;
    if (model.includes("step")) label = "StepFun";
    else if (model.includes("glm")) label = "GLM-4";
    else if (model.includes("liquid")) label = "Liquid";
    else if (model.includes("riverflow")) label = "RiverFlow";
    
    return (
        <span style={{ 
            fontSize: 6, 
            fontFamily: "var(--mono)", 
            color: "var(--muted)", 
            background: "rgba(255,255,255,0.03)", 
            padding: "2px 6px", 
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.06)",
            verticalAlign: "middle",
            letterSpacing: "0.1em",
            fontWeight: 800,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)"
        }}>
            CHIP::{label.toUpperCase()}
        </span>
    );
}

function DecisionBadge({ decision, model }: { decision: DecisionType, model?: string }) {
    const color = decision === "support" ? "var(--support)" : decision === "oppose" ? "var(--oppose)" : decision === "neutral" ? "var(--neutral)" : "var(--muted)";
    
    if (!decision) return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
             <span style={{ fontSize: 6, fontFamily: "var(--mono)", color: "var(--orange)", background: "rgba(255,107,53,0.1)", padding: "2px 8px", borderRadius: "100px", border: "1px solid rgba(255,107,53,0.3)", fontWeight: 800, boxSizing: "border-box" }}>STBY::PENDING</span>
        </div>
    );
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ModelBadge model={model} />
            <span style={{ 
                fontSize: 6, 
                fontFamily: "var(--mono)", 
                color: color, 
                background: `${color}15`, 
                padding: "2px 8px", 
                borderRadius: "100px", 
                border: `1px solid ${color}40`,
                fontWeight: 800,
                letterSpacing: "0.05em"
            }}>
                {decision.toUpperCase()}
            </span>
        </div>
    );
}

export default function AgentCard({ agent, state, selected, onClick }: AgentCardProps) {
    return (
        <div
            className={`results-card${selected ? " selected" : ""}`}
            onClick={onClick}
            id={`agent-card-${agent.id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
            style={{
                position: "relative",
                padding: "24px 20px",
                minHeight: "160px",
                background: selected ? "rgba(30,35,45,0.95)" : "rgba(22,25,30,0.85)",
                backdropFilter: "blur(40px)",
                borderRadius: "24px",
                border: selected ? "1.5px solid var(--orange)" : "1.5px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: selected ? "0 25px 50px rgba(0,0,0,0.7), inset 0 0 20px rgba(255,107,53,0.15)" : "0 10px 30px rgba(0,0,0,0.4)",
                transform: selected ? "scale(1.025)" : "scale(1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <style jsx>{`
                .results-card::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    padding: 1.5px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.25), transparent 40%);
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }
            `}</style>
            <style jsx>{`
                .results-card::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent);
                    height: 20%;
                    width: 100%;
                    transform: translateY(-100%);
                    transition: transform 0s;
                    pointer-events: none;
                    z-index: 20;
                }
                .results-card:hover::after {
                    transform: translateY(500%);
                    transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
            <TacticalBrackets />
            <CardBackground />

            {/* Inner Highlight Stroke */}
            <div style={{ position: "absolute", inset: 0, borderRadius: "20px", border: "1.5px solid rgba(255,255,255,0.03)", pointerEvents: "none", mixBlendMode: "overlay" }} />

            {/* Corner Telemetry Strings - Moved Inward significantly to avoid Curve Clipping */}
            <div style={{ position: "absolute", top: 6, left: 24, fontFamily: "var(--mono)", fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", zIndex: 10 }}>AGT_ID::{agent.id.toString().padStart(4, "0")}</div>
            <div style={{ position: "absolute", bottom: 6, right: 24, fontFamily: "var(--mono)", fontSize: 5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", zIndex: 10 }}>LINK_STATE::OPTIMIZED</div>
            {/* Ambient Sentiment Glow */}
            {state.decision && (
                <div style={{ 
                    position: "absolute", 
                    top: -40, right: -40, width: 100, height: 100, 
                    borderRadius: "50%",
                    background: state.decision === "support" ? "var(--support)" : state.decision === "oppose" ? "var(--oppose)" : "var(--neutral)",
                    filter: "blur(40px)",
                    opacity: 0.1,
                    pointerEvents: "none"
                }} />
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Compact Profile Circle */}
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "12px",
                            background: agent.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 900,
                            color: "rgba(0,0,0,0.7)",
                            boxShadow: `0 6px 16px ${agent.color}55`,
                            flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.2)"
                        }}
                    >
                        {agent.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--bright)", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.06em" }}>
                            {agent.name.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4, fontWeight: 500, letterSpacing: "0.03em" }}>
                            {agent.job.toUpperCase()}
                        </div>
                    </div>
                </div>
                <DecisionBadge decision={state.decision} model={state.model} />
            </div>

            {/* Meta Tags */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center" }}>
                <span
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 8,
                        color: "var(--bright)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "rgba(255,255,255,0.05)",
                        padding: "2px 8px",
                        borderRadius: "100px",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                >
                    {agent.persona}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted)" }}>
                    AGE_{agent.age}
                </span>
            </div>

            {/* Trait bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TraitBar label="Risk" value={agent.risk} color="var(--oppose)" />
                <TraitBar label="Trust" value={agent.trust} color="var(--support)" />
            </div>

            {/* Pending indicator */}
            {state.pending && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}>
                    <div className="live-dot" style={{ width: 4, height: 4, background: "var(--orange)" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--orange)", letterSpacing: "0.1em" }}>
                        ANALYZING_BEHAVIOR...
                    </span>
                </div>
            )}

            {/* Reasoning snippet */}
            {state.reasoning && (
                <div
                    style={{
                        marginTop: 6,
                        fontSize: 10,
                        color: "var(--muted)",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {state.reasoning}
                </div>
            )}
        </div>
    );
}
