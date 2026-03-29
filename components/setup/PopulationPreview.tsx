"use client";

import type { Agent, PersonaType } from "@/lib/types";
import { PERSONA_COLORS } from "@/lib/agentGeneration";

interface PopulationPreviewProps {
    agents: Agent[];
    onRegenerate: () => void;
    onLaunch: () => void;
    isGenerating: boolean;
}

export default function PopulationPreview({
    agents,
    onRegenerate,
    onLaunch,
    isGenerating,
}: PopulationPreviewProps) {
    if (isGenerating) {
        return (
            <div className="setup-form">
                <div className="setup-form-header">
                    <span className="setup-step-tag">STEP 4 OF 4</span>
                    <h2 className="setup-step-title">GENERATING POPULATION...</h2>
                </div>
                <div className="setup-form-body" style={{ textAlign: "center", padding: "60px 20px" }}>
                    <div className="generating-spinner" />
                    <p style={{ color: "var(--muted)", fontFamily: "var(--mono)", fontSize: 12, marginTop: 16 }}>
                        Sampling respondents from GSS 2024 pool...
                    </p>
                </div>
            </div>
        );
    }

    if (agents.length === 0) {
        return null;
    }

    // Persona distribution
    const personaCounts: Record<string, number> = {};
    for (const a of agents) {
        personaCounts[a.persona] = (personaCounts[a.persona] || 0) + 1;
    }
    const sorted = Object.entries(personaCounts).sort((a, b) => b[1] - a[1]);

    // Stats
    const meanAge = agents.reduce((s, a) => s + a.age, 0) / agents.length;
    const incomes = agents.map((a) => a.income).sort((a, b) => a - b);
    const medianIncome = incomes[Math.floor(incomes.length / 2)];
    const meanRisk = agents.reduce((s, a) => s + a.risk, 0) / agents.length;
    const meanTrust = agents.reduce((s, a) => s + a.trust, 0) / agents.length;

    // Sample agents
    const samples = agents.slice(0, 3);

    return (
        <div className="setup-form">
            <div className="setup-form-header">
                <span className="setup-step-tag">STEP 4 OF 4</span>
                <h2 className="setup-step-title">YOUR POPULATION</h2>
            </div>

            <div className="setup-form-body">
                <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", marginBottom: 20 }}>
                    Generated <span style={{ color: "var(--bright)", fontWeight: 600 }}>{agents.length}</span> agents
                    from GSS 2024 pool
                </p>

                {/* Persona Distribution */}
                <div className="filter-section-title">── PERSONA DISTRIBUTION ──</div>
                <div className="persona-dist-list">
                    {sorted.map(([persona, count]) => {
                        const pct = (count / agents.length) * 100;
                        return (
                            <div key={persona} className="persona-dist-row">
                                <span className="persona-dist-name">{persona}</span>
                                <span className="persona-dist-count">{count}</span>
                                <div className="persona-dist-bar-bg">
                                    <div
                                        className="persona-dist-bar-fill"
                                        style={{
                                            width: `${pct}%`,
                                            background: PERSONA_COLORS[persona as PersonaType] || "var(--muted)",
                                        }}
                                    />
                                </div>
                                <span className="persona-dist-pct">{Math.round(pct)}%</span>
                            </div>
                        );
                    })}
                </div>

                {/* Population Stats */}
                <div className="filter-section-title" style={{ marginTop: 20 }}>── POPULATION STATS ──</div>
                <div className="pop-stats-grid">
                    <div className="pop-stat">
                        <span className="pop-stat-label">Mean age</span>
                        <span className="pop-stat-val">{meanAge.toFixed(1)}</span>
                    </div>
                    <div className="pop-stat">
                        <span className="pop-stat-label">Median income</span>
                        <span className="pop-stat-val">{Math.round(medianIncome * 100)}th pct</span>
                    </div>
                    <div className="pop-stat">
                        <span className="pop-stat-label">Mean risk</span>
                        <span className="pop-stat-val">{meanRisk.toFixed(2)}</span>
                    </div>
                    <div className="pop-stat">
                        <span className="pop-stat-label">Mean trust</span>
                        <span className="pop-stat-val">{meanTrust.toFixed(2)}</span>
                    </div>
                </div>

                {/* Sample Agents */}
                <div className="filter-section-title" style={{ marginTop: 20 }}>── SAMPLE AGENTS ──</div>
                <div className="sample-agents-grid">
                    {samples.map((a) => (
                        <div
                            key={a.id}
                            className="sample-agent-card"
                            style={{ borderLeftColor: PERSONA_COLORS[a.persona] }}
                        >
                            <div className="sample-agent-name">{a.name}</div>
                            <div className="sample-agent-meta">
                                <span style={{ color: PERSONA_COLORS[a.persona] }}>{a.persona}</span>
                                <span>Age {a.age}</span>
                                <span>{a.job}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="setup-form-actions">
                    <button className="btn-ghost-setup" onClick={onRegenerate}>
                        ↻ Regenerate
                    </button>
                    <button className="btn-cta" onClick={onLaunch}>
                        Launch Simulation →
                    </button>
                </div>
            </div>
        </div>
    );
}
