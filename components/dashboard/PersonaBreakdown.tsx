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
        <div style={{ display: "flex", flexDirection: "column", gap: 5, padding: 8 }}>
            {personaStats.map(({ persona, count, support, neutral, oppose }) => {
                const color = PERSONA_COLORS[persona];
                const decided = support + neutral + oppose;
                return (
                    <div key={persona} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Persona chip */}
                        <div
                            style={{
                                fontFamily: "var(--mono)",
                                fontSize: 9,
                                color,
                                background: `${color}18`,
                                border: `1px solid ${color}40`,
                                padding: "2px 6px",
                                borderRadius: 2,
                                whiteSpace: "nowrap",
                                width: 110,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                flexShrink: 0,
                            }}
                        >
                            {persona}
                        </div>

                        {/* Count */}
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", width: 12, textAlign: "right", flexShrink: 0 }}>
                            {count}
                        </span>

                        {/* Stacked bar */}
                        <div style={{ flex: 1, height: 8, display: "flex", borderRadius: 2, overflow: "hidden", background: "var(--dim)" }}>
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
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                            {support > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--support)" }}>+{support}</span>}
                            {neutral > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--neutral)" }}>~{neutral}</span>}
                            {oppose > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--oppose)" }}>-{oppose}</span>}
                            {decided === 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>—</span>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
