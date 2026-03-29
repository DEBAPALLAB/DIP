"use client";

import type { Agent, SimulationStates, PersonaType } from "@/lib/types";

interface PersonaBreakdownProps {
    agents: Agent[];
    states: SimulationStates;
}

const PERSONA_COLORS: Record<PersonaType, string> = {
    Influencer: "#E91E63",
    "Early Adopter": "#00BCD4",
    "Price Hawk": "#F9A825",
    Pragmatist: "#4CAF50",
    "Social Follower": "#FF9800",
    "Herd Member": "#9C27B0",
    Skeptic: "#F44336",
    Laggard: "#607D8B",
};

const ALL_PERSONAS: PersonaType[] = [
    "Influencer", "Early Adopter", "Price Hawk", "Pragmatist",
    "Social Follower", "Herd Member", "Skeptic", "Laggard",
];

export default function PersonaBreakdown({ agents, states }: PersonaBreakdownProps) {
    const personaStats = ALL_PERSONAS.map((persona) => {
        const group = agents.filter((a) => a.persona === persona);
        const support = group.filter((a) => states[a.id]?.decision === "support").length;
        const neutral = group.filter((a) => states[a.id]?.decision === "neutral").length;
        const oppose = group.filter((a) => states[a.id]?.decision === "oppose").length;
        return { persona, count: group.length, support, neutral, oppose };
    }).filter((p) => p.count > 0);

    return (
        <div className="breakdown-list">
            {personaStats.map(({ persona, count, support, neutral, oppose }) => {
                const color = PERSONA_COLORS[persona];
                const decided = support + neutral + oppose;
                return (
                    <div key={persona} className="breakdown-row">
                        {/* Persona chip */}
                        <div
                            className="breakdown-chip"
                            style={{
                                color,
                                background: `${color}18`,
                                border: `1px solid ${color}40`,
                            }}
                        >
                            {persona}
                        </div>

                        {/* Count */}
                        <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted)", width: 12, textAlign: "right", flexShrink: 0 }}>
                            {count}
                        </span>

                        {/* Stacked bar */}
                        <div style={{ flex: 1, height: 6, display: "flex", borderRadius: 1, overflow: "hidden", background: "var(--dim)" }}>
                            {support > 0 && (
                                <div style={{ width: `${(support / count) * 100}%`, background: "var(--support)", transition: "width 0.4s" }} />
                            )}
                            {neutral > 0 && (
                                <div style={{ width: `${(neutral / count) * 100}%`, background: "var(--neutral)", transition: "width 0.4s" }} />
                            )}
                            {oppose > 0 && (
                                <div style={{ width: `${(oppose / count) * 100}%`, background: "var(--oppose)", transition: "width 0.4s" }} />
                            )}
                        </div>

                        {/* Decisions */}
                        <div style={{ display: "flex", gap: 3, flexShrink: 0, minWidth: 28, justifyContent: "flex-end" }}>
                            {support > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--support)" }}>+{support}</span>}
                            {decided === 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted)" }}>—</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
