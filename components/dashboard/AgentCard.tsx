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
                padding: "20px 18px",
                minHeight: "140px",
                background: selected ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                backdropFilter: "blur(24px)",
                borderRadius: "16px",
                border: selected ? "1px solid var(--support)" : "1px solid rgba(255, 255, 255, 0.08)",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: selected ? "0 20px 40px rgba(0,0,0,0.5), 0 0 15px rgba(200, 241, 53, 0.1)" : "none",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}
        >
            <style jsx>{`
                .results-card::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05), transparent 60%);
                    pointer-events: none;
                }
            `}</style>
            
            {/* Ambient Sentiment Glow */}
            {state.decision && (
                <div style={{ 
                    position: "absolute", 
                    top: -30, right: -30, width: 80, height: 80, 
                    borderRadius: "50%",
                    background: state.decision === "support" ? "var(--support)" : state.decision === "oppose" ? "var(--oppose)" : "var(--neutral)",
                    filter: "blur(30px)",
                    opacity: 0.15,
                    pointerEvents: "none"
                }} />
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            background: agent.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            color: "rgba(0,0,0,0.8)",
                            boxShadow: `0 4px 12px ${agent.color}44`,
                            flexShrink: 0
                        }}
                    >
                        {agent.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ 
                            fontFamily: "'Plus Jakarta Sans', sans-serif", 
                            fontSize: 14, 
                            color: "var(--bright)", 
                            fontWeight: 700,
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                            letterSpacing: "-0.01em"
                        }}>
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 8, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 1 }}>
                            {agent.job}
                        </div>
                    </div>
                </div>
                <DecisionBadge decision={state.decision} model={state.model} />
            </div>

            {/* Trait Tags */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, alignItems: "center", opacity: 0.8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--muted)", border: "1px solid rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                    {agent.persona.toUpperCase()}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
                    AGE_{agent.age}
                </span>
            </div>

            {/* Reasoning snippet */}
            {state.reasoning ? (
                <div
                    style={{
                        fontSize: 11,
                        color: "var(--text)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        opacity: 0.9,
                        fontStyle: "italic"
                    }}
                >
                    "{state.reasoning}"
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <TraitBar label="Risk" value={agent.risk} color="var(--oppose)" />
                    <TraitBar label="Trust" value={agent.trust} color="var(--support)" />
                </div>
            )}

            {/* Status Indicator */}
            {state.pending && (
                <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <div className="live-dot" style={{ width: 4, height: 4, background: "var(--support)" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 7, color: "var(--support)", letterSpacing: "0.15em", fontWeight: 800 }}>
                        ANALYZING...
                    </span>
                </div>
            )}
        </div>
    );
}
