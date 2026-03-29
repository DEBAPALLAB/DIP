"use client";

import type { Agent, SimulationStates, PersonaType } from "@/lib/types";
import { PERSONA_COLORS } from "@/lib/agentGeneration";

interface PersonaBreakdownSectionProps {
    agents: Agent[];
    states: SimulationStates;
}

export default function PersonaBreakdownSection({ agents, states }: PersonaBreakdownSectionProps) {
    // Group by persona
    const personaGroups: Record<string, { total: number; support: number }> = {};

    for (const a of agents) {
        if (!personaGroups[a.persona]) {
            personaGroups[a.persona] = { total: 0, support: 0 };
        }
        personaGroups[a.persona].total++;
        if (states[a.id]?.decision === "support") {
            personaGroups[a.persona].support++;
        }
    }

    const sorted = Object.entries(personaGroups).sort((a, b) => {
        const pctA = a[1].total > 0 ? a[1].support / a[1].total : 0;
        const pctB = b[1].total > 0 ? b[1].support / b[1].total : 0;
        return pctB - pctA;
    });

    return (
        <div className="results-persona-section">
            <h3 className="results-section-title">PERSONA BREAKDOWN</h3>
            <div className="results-persona-list">
                {sorted.map(([persona, { total, support }]) => {
                    const pct = total > 0 ? Math.round((support / total) * 100) : 0;
                    return (
                        <div key={persona} className="results-persona-row">
                            <div
                                className="results-persona-dot"
                                style={{ background: PERSONA_COLORS[persona as PersonaType] }}
                            />
                            <span className="results-persona-name">{persona}</span>
                            <div className="results-persona-bar-bg">
                                <div
                                    className="results-persona-bar-fill"
                                    style={{
                                        width: `${pct}%`,
                                        background: PERSONA_COLORS[persona as PersonaType],
                                    }}
                                />
                            </div>
                            <span className="results-persona-pct">{pct}% support</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
