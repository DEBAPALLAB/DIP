"use client";

import type { Agent, AgentState, SimulationStates } from "@/lib/types";
import AgentCard from "./AgentCard";

interface AgentGridProps {
    agents: Agent[];
    states: SimulationStates;
    selectedId: number | null;
    onSelect: (id: number) => void;
}

export default function AgentGrid({ agents, states, selectedId, onSelect }: AgentGridProps) {
    return (
        <div
            className="no-scrollbar"
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 6,
                padding: 8,
                overflowY: "auto",
                flex: 1,
            }}
        >

            {agents.map((agent) => {
                const state: AgentState = states[agent.id] ?? {
                    decision: null,
                    reasoning: null,
                    step: null,
                    pending: false,
                };
                return (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        state={state}
                        selected={selectedId === agent.id}
                        onClick={() => onSelect(agent.id)}
                    />
                );
            })}
        </div>
    );
}
