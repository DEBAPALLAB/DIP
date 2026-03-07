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

function DecisionBadge({ decision }: { decision: DecisionType }) {
    if (!decision) return <span className="badge badge-pending">PENDING</span>;
    return <span className={`badge badge-${decision}`}>{decision.toUpperCase()}</span>;
}

export default function AgentCard({ agent, state, selected, onClick }: AgentCardProps) {
    return (
        <div
            className={`agent-card${selected ? " selected" : ""}`}
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
                        }}
                    />
                    <div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--bright)", fontWeight: 600 }}>
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
                            {agent.job}
                        </div>
                    </div>
                </div>
                <DecisionBadge decision={state.decision} />
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
