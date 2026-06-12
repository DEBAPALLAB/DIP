"use client";

import type { Agent, AgentState, AgentHistoryEntry } from "@/lib/types";
import EgoNetworkGraph from "./EgoNetworkGraph";
import AgentHistoryChart from "./AgentHistoryChart";

interface AgentDetailProps {
    agent: Agent;
    state: AgentState;
    allStates: Record<number, AgentState>;
    agents: Agent[];
    edges: [number, number][];
    agentHistory: AgentHistoryEntry[];
    onSelectAgent: (id: number) => void;
    isConfigPhase?: boolean;
    onToggleSeed?: (id: number) => void;
}

function TraitRow({
    label,
    value,
    color,
    displayValue,
}: {
    label: string;
    value: number;
    color: string;
    displayValue?: string;
}) {
    const gradient = `linear-gradient(90deg, ${color}33 0%, ${color} 100%)`;
    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}
                >
                    {label}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--bright)" }}>
                    {displayValue ?? `${(value * 100).toFixed(0)}/100`}
                </span>
            </div>
            <div className="trait-bar" style={{ height: 6, background: "rgba(0, 0, 0, 0.04)", borderRadius: 999, overflow: "hidden", border: "1px solid rgba(0, 0, 0, 0.01)" }}>
                <div
                    className="trait-bar-fill"
                    style={{
                        width: `${value * 100}%`,
                        background: gradient,
                        height: "100%",
                        borderRadius: 999,
                        boxShadow: `0 0 6px ${color}33`,
                        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                />
            </div>
        </div>
    );
}

export default function AgentDetail({
    agent,
    state,
    allStates,
    agents,
    edges,
    agentHistory,
    onSelectAgent,
    isConfigPhase,
    onToggleSeed,
}: AgentDetailProps) {
    const isSupport = state.decision === "support";
    const isNeutral = state.decision === "neutral";
    const isOppose = state.decision === "oppose";

    const decisionColor = isSupport
        ? "#10b981"
        : isNeutral
            ? "#f59e0b"
            : isOppose
                ? "#f43f5e"
                : "#64748b";

    const decisionBg = isSupport
        ? "rgba(16, 185, 129, 0.05)"
        : isNeutral
            ? "rgba(245, 158, 11, 0.05)"
            : isOppose
                ? "rgba(244, 63, 94, 0.05)"
                : "rgba(100, 116, 139, 0.05)";

    const decisionBorder = isSupport
        ? "rgba(16, 185, 129, 0.22)"
        : isNeutral
            ? "rgba(245, 158, 11, 0.22)"
            : isOppose
                ? "rgba(244, 63, 94, 0.22)"
                : "rgba(100, 116, 139, 0.22)";

    const neighborIds = edges
        .filter(([a, b]) => a === agent.id || b === agent.id)
        .map(([a, b]) => (a === agent.id ? b : a));

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
            }}
        >
            <div className="no-scrollbar" style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
                {/* Identity Card */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 20,
                        padding: "12px",
                        background: "rgba(255, 255, 255, 0.45)",
                        border: "1px solid rgba(0, 82, 255, 0.06)",
                        borderRadius: "14px",
                        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.02)",
                    }}
                >
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            background: `linear-gradient(135deg, ${agent.color}dd 0%, ${agent.color} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#fff",
                            textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                            fontFamily: "var(--sans)",
                            flexShrink: 0,
                            boxShadow: `0 4px 12px ${agent.color}40`,
                        }}
                    >
                        {agent.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontFamily: "var(--sans)",
                                fontSize: 15,
                                color: "var(--bright)",
                                fontWeight: 700,
                                lineHeight: 1.2,
                                marginBottom: 2,
                            }}
                        >
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                            {agent.job} · {agent.age}y
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span
                                style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: 9,
                                    color: agent.color,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                    background: `${agent.color}12`,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    border: `1px solid ${agent.color}25`,
                                    display: "inline-block",
                                }}
                            >
                                {agent.persona}
                            </span>
                            {isConfigPhase && onToggleSeed && (
                                <button
                                    onClick={() => onToggleSeed(agent.id)}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        height: 18,
                                        background: state.isSeeded ? "#10b981" : "transparent",
                                        border: `1px solid ${state.isSeeded ? "#10b981" : "rgba(0,0,0,0.15)"}`,
                                        color: state.isSeeded ? "#fff" : "var(--muted)",
                                        borderRadius: 4,
                                        padding: "0 6px",
                                        fontSize: 8,
                                        fontFamily: "var(--mono)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        boxShadow: state.isSeeded ? "0 2px 6px rgba(16, 185, 129, 0.25)" : "none",
                                        transition: "all 0.15s ease",
                                    }}
                                >
                                    🌱 {state.isSeeded ? "SEEDED" : "SEED"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Current decision Glass Card */}
                <div
                    style={{
                        border: `1px solid ${decisionBorder}`,
                        borderRadius: "12px",
                        padding: "14px",
                        marginBottom: 20,
                        background: decisionBg,
                        boxShadow: `0 4px 20px -2px ${decisionColor}08`,
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Ambient Glow */}
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 3,
                            height: "100%",
                            background: decisionColor,
                        }}
                    />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}
                        >
                            Current Decision
                        </span>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontFamily: "var(--mono)",
                                fontSize: 10,
                                color: decisionColor,
                                fontWeight: 800,
                                textTransform: "uppercase",
                                background: `${decisionColor}18`,
                                padding: "2px 8px",
                                borderRadius: "999px",
                            }}
                        >
                            <span
                                style={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: "50%",
                                    background: decisionColor,
                                    boxShadow: `0 0 6px ${decisionColor}`,
                                }}
                            />
                            {state.decision ? state.decision : "PENDING"}
                        </span>
                    </div>

                    {state.reasoning && (
                        <div
                            style={{
                                fontSize: 12,
                                color: "var(--text)",
                                lineHeight: 1.6,
                                background: "rgba(255,255,255,0.4)",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid rgba(0,0,0,0.03)",
                                fontFamily: "var(--sans)",
                            }}
                        >
                            {state.reasoning}
                        </div>
                    )}
                    {!state.reasoning && !state.pending && (
                        <div
                            style={{
                                fontSize: 11,
                                color: "var(--muted)",
                                fontStyle: "italic",
                                textAlign: "center",
                                padding: "8px 0",
                            }}
                        >
                            Awaiting simulation step...
                        </div>
                    )}
                    {state.pending && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                fontSize: 11,
                                color: "var(--orange)",
                                fontWeight: 600,
                                padding: "8px 0",
                            }}
                        >
                            <span className="live-dot" style={{ width: 6, height: 6 }} />
                            <span>Synthesizing agent persona & network signals...</span>
                        </div>
                    )}
                </div>

                {/* Trait vector Section */}
                <div
                    style={{
                        marginBottom: 20,
                        padding: "14px",
                        background: "rgba(255, 255, 255, 0.45)",
                        border: "1px solid rgba(0, 82, 255, 0.05)",
                        borderRadius: "14px",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 14,
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                            paddingBottom: 6,
                        }}
                    >
                        Trait Vector · GSS 2024
                    </div>
                    <TraitRow label="Risk Sensitivity" value={agent.risk} color="#f43f5e" />
                    <TraitRow label="Trust Bias" value={agent.trust} color="#10b981" />
                    <TraitRow label="Social Influence" value={agent.social} color="#3b82f6" />
                    <TraitRow label="Budget Sensitivity" value={agent.budget} color="#f59e0b" />
                    <TraitRow
                        label="Income Level"
                        value={agent.income}
                        color="#8b5cf6"
                        displayValue={`${(agent.income * 100).toFixed(0)}th pct`}
                    />
                    <TraitRow
                        label="Education"
                        value={agent.educ / 20}
                        color="#06b6d4"
                        displayValue={`${agent.educ} yr`}
                    />
                </div>

                {/* Ego network Section */}
                <div
                    style={{
                        marginBottom: 20,
                        padding: "14px",
                        background: "rgba(255, 255, 255, 0.45)",
                        border: "1px solid rgba(0, 82, 255, 0.05)",
                        borderRadius: "14px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 12,
                            width: "100%",
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                            paddingBottom: 6,
                        }}
                    >
                        Ego Network Visualizer
                    </div>
                    <EgoNetworkGraph
                        agent={agent}
                        agents={agents}
                        edges={edges}
                        agentStates={allStates}
                        onSelectAgent={onSelectAgent}
                    />
                </div>

                {/* Decision history Section */}
                {agentHistory.length > 0 && (
                    <div
                        style={{
                            marginBottom: 20,
                            padding: "14px",
                            background: "rgba(255, 255, 255, 0.45)",
                            border: "1px solid rgba(0, 82, 255, 0.05)",
                            borderRadius: "14px",
                        }}
                    >
                        <AgentHistoryChart
                            history={agentHistory}
                            agentColor={agent.color}
                        />
                    </div>
                )}

                {/* Reasoning / Message History Timeline */}
                {agentHistory.length > 0 && (
                    <div
                        style={{
                            marginBottom: 20,
                            padding: "14px",
                            background: "rgba(255, 255, 255, 0.45)",
                            border: "1px solid rgba(0, 82, 255, 0.05)",
                            borderRadius: "14px",
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--orange)",
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                marginBottom: 12,
                                borderBottom: "1px solid rgba(0,0,0,0.04)",
                                paddingBottom: 6,
                            }}
                        >
                            Agent Reasoning History
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {agentHistory.map((h, idx) => {
                                const stepNum = h.step !== undefined ? h.step + 1 : idx + 1;
                                const isSupport = h.decision === "support";
                                const isNeutral = h.decision === "neutral";
                                const isOppose = h.decision === "oppose";
                                const dColor = isSupport
                                    ? "#10b981"
                                    : isNeutral
                                        ? "#f59e0b"
                                        : isOppose
                                            ? "#f43f5e"
                                            : "var(--muted)";
                                return (
                                    <div key={idx} style={{ display: "flex", gap: 10, position: "relative" }}>
                                        {idx < agentHistory.length - 1 && (
                                            <div style={{ position: "absolute", left: 16, top: 20, bottom: -20, width: 1, background: "rgba(0, 82, 255, 0.08)" }} />
                                        )}
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "8px",
                                                background: `${dColor}12`,
                                                border: `1px solid ${dColor}30`,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <span style={{ fontSize: 7, fontFamily: "var(--mono)", color: "var(--muted)", textTransform: "uppercase", lineHeight: 1 }}>Step</span>
                                            <span style={{ fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700, color: dColor, lineHeight: 1 }}>{stepNum}</span>
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                                <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, color: dColor, textTransform: "uppercase", background: `${dColor}12`, padding: "1px 5px", borderRadius: 3 }}>
                                                    {h.decision ? h.decision : "PENDING"}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--text)",
                                                    lineHeight: 1.5,
                                                    background: "rgba(255, 255, 255, 0.6)",
                                                    padding: "8px 10px",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(0,0,0,0.02)",
                                                }}
                                            >
                                                {h.reasoning || "No reasoning recorded for this step."}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Network Connections List */}
                <div
                    style={{
                        padding: "14px",
                        background: "rgba(255, 255, 255, 0.45)",
                        border: "1px solid rgba(0, 82, 255, 0.05)",
                        borderRadius: "14px",
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            fontWeight: 700,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 10,
                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                            paddingBottom: 6,
                        }}
                    >
                        Network Connections ({neighborIds.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {neighborIds.map((nid) => {
                            const nb = agents.find((a) => a.id === nid);
                            if (!nb) return null;
                            const ns = allStates[nid];
                            
                            const nc = ns?.decision === "support"
                                ? "#10b981"
                                : ns?.decision === "neutral"
                                    ? "#f59e0b"
                                    : ns?.decision === "oppose"
                                        ? "#f43f5e"
                                        : "var(--muted)";

                            return (
                                <div
                                    key={nid}
                                    onClick={() => onSelectAgent(nid)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "8px 10px",
                                        borderRadius: "8px",
                                        background: "rgba(255, 255, 255, 0.5)",
                                        border: "1px solid rgba(0, 0, 0, 0.02)",
                                        gap: 8,
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                    }}
                                    className="connection-list-item"
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: "4px",
                                                background: nb.color,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 8,
                                                fontWeight: 800,
                                                color: "#fff",
                                            }}
                                        >
                                            {nb.name.charAt(0)}
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--bright)" }}>
                                            {nb.name}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 9,
                                            color: nb.color,
                                            fontFamily: "var(--mono)",
                                            textTransform: "uppercase",
                                            marginRight: "auto",
                                            paddingLeft: 4,
                                            fontWeight: 600,
                                            opacity: 0.8,
                                        }}
                                    >
                                        {nb.persona}
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "var(--mono)",
                                            fontSize: 9,
                                            fontWeight: 700,
                                            color: nc,
                                            textTransform: "uppercase",
                                            background: ns?.decision ? `${nc}12` : "transparent",
                                            padding: ns?.decision ? "1px 6px" : 0,
                                            borderRadius: "4px",
                                        }}
                                    >
                                        {ns?.decision ?? "PENDING"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .connection-list-item:hover {
                    background: rgba(255, 255, 255, 0.9) !important;
                    border-color: rgba(0, 82, 255, 0.12) !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                    transform: translateY(-0.5px);
                }
            `}</style>
        </div>
    );
}
