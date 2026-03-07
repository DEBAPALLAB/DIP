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
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 10,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                    }}
                >
                    {label}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text)" }}>
                    {displayValue ?? `${(value * 100).toFixed(0)}/100`}
                </span>
            </div>
            <div className="trait-bar" style={{ height: 4 }}>
                <div
                    className="trait-bar-fill"
                    style={{ width: `${value * 100}%`, background: color }}
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
}: AgentDetailProps) {
    const decisionColor =
        state.decision === "support"
            ? "var(--support)"
            : state.decision === "neutral"
                ? "var(--neutral)"
                : state.decision === "oppose"
                    ? "var(--oppose)"
                    : "var(--pending)";

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
            {/* Panel header */}
            <div className="panel-header">
                <span className="label">AGENT PROFILE</span>
                <span style={{ color: "var(--muted)" }}>
                    ID:{String(agent.id).padStart(3, "0")}
                </span>
            </div>

            <div style={{ overflowY: "auto", flex: 1, padding: "10px" }}>
                {/* Identity */}
                <div
                    style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: agent.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#000",
                            fontFamily: "var(--mono)",
                            flexShrink: 0,
                        }}
                    >
                        {agent.name.charAt(0)}
                    </div>
                    <div>
                        <div
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: 14,
                                color: "var(--bright)",
                                fontWeight: 700,
                            }}
                        >
                            {agent.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                            {agent.job} · {agent.age}y
                        </div>
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
                    </div>
                </div>

                {/* Current decision */}
                <div
                    style={{
                        border: `1px solid ${decisionColor}40`,
                        borderRadius: 3,
                        padding: "8px 10px",
                        marginBottom: 12,
                        background: `${decisionColor}08`,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            marginBottom: 4,
                        }}
                    >
                        Current Decision
                    </div>
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 12,
                            color: decisionColor,
                            fontWeight: 700,
                            marginBottom: 6,
                        }}
                    >
                        {state.decision ? state.decision.toUpperCase() : "PENDING"}
                    </div>
                    {state.reasoning && (
                        <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5 }}>
                            {state.reasoning}
                        </div>
                    )}
                    {!state.reasoning && !state.pending && (
                        <div
                            style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}
                        >
                            Awaiting simulation step...
                        </div>
                    )}
                    {state.pending && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 11,
                                color: "var(--orange)",
                            }}
                        >
                            <span className="live-dot" style={{ width: 6, height: 6 }} />
                            Processing with LLM...
                        </div>
                    )}
                </div>

                {/* Trait vector */}
                <div style={{ marginBottom: 12 }}>
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 8,
                        }}
                    >
                        Trait Vector · GSS 2024
                    </div>
                    <TraitRow label="Risk" value={agent.risk} color="#ff4444" />
                    <TraitRow label="Trust" value={agent.trust} color="#00d084" />
                    <TraitRow label="Social" value={agent.social} color="#3b82f6" />
                    <TraitRow label="Budget Sens." value={agent.budget} color="#f0b429" />
                    <TraitRow
                        label="Income"
                        value={agent.income}
                        color="#9C27B0"
                        displayValue={`${(agent.income * 100).toFixed(0)}th pct`}
                    />
                    <TraitRow
                        label="Education"
                        value={agent.educ / 20}
                        color="#00BCD4"
                        displayValue={`${agent.educ} yr`}
                    />
                </div>

                {/* Ego network */}
                <div style={{ marginBottom: 12 }}>
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 6,
                        }}
                    >
                        Ego Network
                    </div>
                    <EgoNetworkGraph
                        agent={agent}
                        agents={agents}
                        edges={edges}
                        agentStates={allStates}
                        onSelectAgent={onSelectAgent}
                    />
                </div>

                {/* Decision history sparkline */}
                {agentHistory.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <AgentHistoryChart
                            history={agentHistory}
                            agentColor={agent.color}
                        />
                    </div>
                )}

                {/* Network connections list */}
                <div>
                    <div
                        style={{
                            fontFamily: "var(--mono)",
                            fontSize: 9,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: 6,
                        }}
                    >
                        Network ({neighborIds.length} connections)
                    </div>
                    {neighborIds.map((nid) => {
                        const nb = agents.find((a) => a.id === nid);
                        if (!nb) return null;
                        const ns = allStates[nid];
                        const nc =
                            ns?.decision === "support"
                                ? "var(--support)"
                                : ns?.decision === "neutral"
                                    ? "var(--neutral)"
                                    : ns?.decision === "oppose"
                                        ? "var(--oppose)"
                                        : "var(--muted)";
                        return (
                            <div
                                key={nid}
                                onClick={() => onSelectAgent(nid)}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "3px 0",
                                    borderBottom: "1px solid var(--border)",
                                    gap: 8,
                                    cursor: "pointer",
                                }}
                            >
                                <span style={{ fontSize: 10, color: "var(--text)" }}>
                                    {nb.name}
                                </span>
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: nb.color,
                                        fontFamily: "var(--mono)",
                                        textTransform: "uppercase",
                                        marginRight: "auto",
                                        paddingLeft: 6,
                                        opacity: 0.8,
                                    }}
                                >
                                    {nb.persona}
                                </span>
                                <span
                                    style={{
                                        fontFamily: "var(--mono)",
                                        fontSize: 9,
                                        color: nc,
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {ns?.decision ?? "—"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
