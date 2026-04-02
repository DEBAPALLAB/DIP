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
        <div style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>
                    {label}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text)" }}>
                    {(value * 100).toFixed(0)}
                </span>
            </div>
            <div className="trait-bar">
                <div className="trait-bar-fill" style={{ width: `${value * 100}%`, background: color }} />
            </div>
        </div>
    );
}

function ModelBadge({ model }: { model?: string }) {
    if (!model) return null;
    let label = model;
    if (model.includes("step")) label = "StepFun";
    else if (model.includes("glm")) label = "GLM-4";
    else if (model.includes("liquid")) label = "Liquid";
    
    return (
        <span style={{ 
            fontSize: 7, 
            fontFamily: "var(--mono)", 
            color: "var(--muted)", 
            background: "rgba(255,255,255,0.05)", 
            padding: "1px 3px", 
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.1)",
            verticalAlign: "middle"
        }}>
            {label.toUpperCase()}
        </span>
    );
}

function DecisionBadge({ decision, model }: { decision: DecisionType, model?: string }) {
    if (!decision) return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span className="badge badge-pending">PENDING</span>
        </div>
    );
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ModelBadge model={model} />
            <span className={`badge badge-${decision}`}>{decision.toUpperCase()}</span>
        </div>
    );
}

export default function AgentCard({ agent, state, selected, onClick }: AgentCardProps) {
    return (
        <div
            className={`agent-card${selected ? " selected" : ""}${state.isSeeded ? " seeded" : ""}`}
            onClick={onClick}
            id={`agent-card-${agent.id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onClick()}
        >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {/* Color dot */}
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: agent.color,
                            flexShrink: 0,
                            boxShadow: state.isSeeded ? `0 0 8px 1px ${agent.color}` : "none"
                        }}
                    />
                    <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--bright)", fontWeight: 600 }}>
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>
                            {agent.job}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {state.isSeeded && (
                        <span style={{ fontSize: 10, filter: "drop-shadow(0 0 4px var(--support))" }} title="Manual Seed">🌱</span>
                    )}
                    <DecisionBadge decision={state.decision} model={state.model} />
                </div>
            </div>

            {/* Persona tag */}
            <div style={{ marginBottom: 8 }}>
                <span
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 9,
                        color: agent.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        background: `${agent.color}18`,
                        padding: "1px 5px",
                        borderRadius: 2,
                        border: `1px solid ${agent.color}40`,
                    }}
                >
                    {agent.persona}
                </span>
                <span style={{ fontSize: 9, color: "var(--muted)", marginLeft: 6 }}>
                    Age {agent.age}
                </span>
            </div>

            {/* Trait bars */}
            <TraitBar label="Risk" value={agent.risk} color="#ff4444" />
            <TraitBar label="Trust" value={agent.trust} color="#00d084" />
            <TraitBar label="Social" value={agent.social} color="#3b82f6" />

            {/* Pending indicator */}
            {state.pending && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--orange)" }}>
                        PROCESSING
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
