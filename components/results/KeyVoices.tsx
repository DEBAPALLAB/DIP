"use client";

import type { Agent, SimulationStates } from "@/lib/types";
import { PERSONA_COLORS } from "@/lib/agentGeneration";

interface KeyVoicesProps {
    agents: Agent[];
    states: SimulationStates;
}

export default function KeyVoices({ agents, states }: KeyVoicesProps) {
    const agentsWithDecisions = agents
        .filter((a) => {
            const s = states[a.id];
            return s && (s.decision === "support" || s.decision === "oppose") && s.reasoning;
        })
        .sort((a, b) => b.influence_score - a.influence_score)
        .slice(0, 3);

    if (agentsWithDecisions.length === 0) return null;

    return (
        <div className="results-voices-section results-card">
            <h3 className="results-section-title">KEY MOMENTS</h3>
            <div className="results-voices-list">
                {agentsWithDecisions.map((a) => {
                    const s = states[a.id];
                    const isSupport = s.decision === "support";
                    return (
                        <div key={a.id} className="results-voice-card">
                            <div className="results-voice-header">
                                <span className="results-voice-step">STEP {s.step ?? "—"}</span>
                                <span
                                    className="results-voice-persona"
                                    style={{ color: PERSONA_COLORS[a.persona] }}
                                >
                                    {a.persona}
                                </span>
                                <span
                                    className={`badge ${isSupport ? "badge-support" : "badge-oppose"}`}
                                    style={{ marginLeft: "auto" }}
                                >
                                    {s.decision?.toUpperCase()}
                                </span>
                            </div>
                            <div className="results-voice-name">{a.name}</div>
                            <p className="results-voice-quote">&ldquo;{s.reasoning}&rdquo;</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
