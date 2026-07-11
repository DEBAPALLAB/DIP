"use client";

import { useMemo } from "react";
import type { Agent, SimulationStates, StepSnapshot, LogEntry, PersonaType } from "@/lib/types";
import AdoptionChart from "./AdoptionChart";
import StepLog from "./StepLog";

interface OverallStatsProps {
    agents: Agent[];
    states: SimulationStates;
    history: StepSnapshot[];
    log: LogEntry[];
    step: number;
    onSelectAgent: (id: number) => void;
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

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="ov-section">
            <div className="ov-section-head">
                <h4>{title}</h4>
                {action}
            </div>
            {children}
            <style jsx>{`
                .ov-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .ov-section-head {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                h4 {
                    margin: 0;
                    font-family: var(--sans);
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    color: var(--bright);
                }
            `}</style>
        </section>
    );
}

export default function OverallStats({ agents, states, history, log, step, onSelectAgent }: OverallStatsProps) {
    const summary = useMemo(() => {
        const total = agents.length || 1;
        const support = agents.filter((a) => states[a.id]?.decision === "support").length;
        const oppose = agents.filter((a) => states[a.id]?.decision === "oppose").length;
        const neutral = agents.filter((a) => states[a.id]?.decision === "neutral").length;
        const undecided = agents.filter((a) => !states[a.id]?.decision).length;

        // Momentum: support gained since the previous recorded step.
        let momentum = 0;
        if (history.length >= 2) {
            momentum = history[history.length - 1].support - history[history.length - 2].support;
        } else if (history.length === 1) {
            momentum = history[0].support;
        }

        // Peak adoption reached across the run.
        const peak = history.reduce((m, h) => Math.max(m, h.support), support);

        return {
            support,
            oppose,
            neutral,
            undecided,
            pct: Math.round((support / total) * 100),
            momentum,
            peakPct: Math.round((peak / total) * 100),
        };
    }, [agents, states, history]);

    // Persona segments, ranked by opposition (the blockers a PM cares about first).
    const personaRows = useMemo(() => {
        const seen = new Map<PersonaType, { count: number; support: number; oppose: number; neutral: number }>();
        for (const a of agents) {
            const d = states[a.id]?.decision;
            const cur = seen.get(a.persona) ?? { count: 0, support: 0, oppose: 0, neutral: 0 };
            cur.count++;
            if (d === "support") cur.support++;
            else if (d === "oppose") cur.oppose++;
            else if (d === "neutral") cur.neutral++;
            seen.set(a.persona, cur);
        }
        return Array.from(seen.entries())
            .map(([persona, v]) => ({ persona, ...v }))
            .sort((a, b) => b.count - a.count);
    }, [agents, states]);

    // Key voices: highest-influence agents on each side — the people moving the market.
    const keyVoices = useMemo(() => {
        const byInfluence = [...agents].sort((a, b) => (b.influence_score ?? 0) - (a.influence_score ?? 0));
        const champions = byInfluence.filter((a) => states[a.id]?.decision === "support").slice(0, 3);
        const blockers = byInfluence.filter((a) => states[a.id]?.decision === "oppose").slice(0, 3);
        return { champions, blockers };
    }, [agents, states]);

    const momentumTone = summary.momentum > 0 ? "up" : summary.momentum < 0 ? "down" : "flat";

    return (
        <div className="ov-root no-scrollbar">
            {/* Headline tiles — the run at a glance */}
            <div className="ov-tiles">
                <div className="ov-tile">
                    <span className="ov-tile-v" style={{ color: "var(--support)" }}>{summary.pct}%</span>
                    <span className="ov-tile-k">adoption</span>
                </div>
                <div className="ov-tile">
                    <span className="ov-tile-v" data-tone={momentumTone}>
                        {summary.momentum > 0 ? "+" : ""}{summary.momentum}
                    </span>
                    <span className="ov-tile-k">this step</span>
                </div>
                <div className="ov-tile">
                    <span className="ov-tile-v">{summary.peakPct}%</span>
                    <span className="ov-tile-k">peak</span>
                </div>
                <div className="ov-tile">
                    <span className="ov-tile-v">{step}</span>
                    <span className="ov-tile-k">steps run</span>
                </div>
            </div>

            {/* Where the room stands */}
            <div className="ov-standing">
                <div className="ov-stand-bar">
                    {summary.support > 0 && <span style={{ flex: summary.support, background: "var(--support)" }} />}
                    {summary.neutral > 0 && <span style={{ flex: summary.neutral, background: "#eab308" }} />}
                    {summary.oppose > 0 && <span style={{ flex: summary.oppose, background: "var(--oppose)" }} />}
                    {summary.undecided > 0 && <span style={{ flex: summary.undecided, background: "var(--border-bright)" }} />}
                </div>
                <div className="ov-stand-keys">
                    <span><i style={{ background: "var(--support)" }} />{summary.support} for</span>
                    <span><i style={{ background: "#eab308" }} />{summary.neutral} neutral</span>
                    <span><i style={{ background: "var(--oppose)" }} />{summary.oppose} against</span>
                    {summary.undecided > 0 && <span><i style={{ background: "var(--border-bright)" }} />{summary.undecided} unaware</span>}
                </div>
            </div>

            {/* Persona breakdown — the "why" behind the number */}
            <Section title="By segment">
                <div className="ov-personas">
                    {personaRows.map((p) => {
                        const color = PERSONA_COLORS[p.persona];
                        return (
                            <div key={p.persona} className="ov-persona">
                                <div className="ov-persona-top">
                                    <span className="ov-persona-name" style={{ color }}>{p.persona}</span>
                                    <span className="ov-persona-count">{p.count}</span>
                                </div>
                                <div className="ov-persona-bar">
                                    {p.support > 0 && <span style={{ flex: p.support, background: "var(--support)" }} title={`${p.support} supporting`} />}
                                    {p.neutral > 0 && <span style={{ flex: p.neutral, background: "#eab308" }} title={`${p.neutral} neutral`} />}
                                    {p.oppose > 0 && <span style={{ flex: p.oppose, background: "var(--oppose)" }} title={`${p.oppose} opposed`} />}
                                    {p.count - p.support - p.neutral - p.oppose > 0 && (
                                        <span style={{ flex: p.count - p.support - p.neutral - p.oppose, background: "var(--border-bright)" }} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* Key voices — who's actually moving the market */}
            {(keyVoices.champions.length > 0 || keyVoices.blockers.length > 0) && (
                <Section title="Key voices">
                    <div className="ov-voices">
                        {keyVoices.champions.length > 0 && (
                            <div className="ov-voice-group">
                                <span className="ov-voice-label support">Top champions</span>
                                {keyVoices.champions.map((a) => (
                                    <button key={a.id} type="button" className="ov-voice" onClick={() => onSelectAgent(a.id)}>
                                        <span className="ov-voice-dot support" />
                                        <span className="ov-voice-name">{a.name}</span>
                                        <span className="ov-voice-persona">{a.persona}</span>
                                        <span className="ov-voice-inf">{Math.round((a.influence_score ?? 0) * 100)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {keyVoices.blockers.length > 0 && (
                            <div className="ov-voice-group">
                                <span className="ov-voice-label oppose">Top blockers</span>
                                {keyVoices.blockers.map((a) => (
                                    <button key={a.id} type="button" className="ov-voice" onClick={() => onSelectAgent(a.id)}>
                                        <span className="ov-voice-dot oppose" />
                                        <span className="ov-voice-name">{a.name}</span>
                                        <span className="ov-voice-persona">{a.persona}</span>
                                        <span className="ov-voice-inf">{Math.round((a.influence_score ?? 0) * 100)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {/* Trajectory */}
            <Section title="Trajectory">
                <div className="ov-chart">
                    <AdoptionChart history={history} total={agents.length} />
                </div>
            </Section>

            {/* Recent decisions */}
            <Section title="Recent decisions">
                <div className="ov-log">
                    <StepLog entries={log} />
                </div>
            </Section>

            <style jsx>{`
                .ov-root {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding: 18px;
                    overflow-y: auto;
                    height: 100%;
                }
                /* Tiles */
                .ov-tiles {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .ov-tile {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    padding: 12px 10px;
                    background: var(--bg-darker);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                }
                .ov-tile-v {
                    font-family: var(--sans);
                    font-size: 20px;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    color: var(--bright);
                    font-variant-numeric: tabular-nums;
                    line-height: 1;
                }
                .ov-tile-v[data-tone="up"] { color: var(--support); }
                .ov-tile-v[data-tone="down"] { color: var(--oppose); }
                .ov-tile-k {
                    font-family: var(--sans);
                    font-size: 10.5px;
                    color: var(--muted);
                    white-space: nowrap;
                }
                /* Standing bar */
                .ov-standing {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .ov-stand-bar {
                    display: flex;
                    height: 10px;
                    border-radius: 999px;
                    overflow: hidden;
                    background: var(--bg-darker);
                }
                .ov-stand-bar span {
                    display: block;
                    transition: flex 0.4s ease;
                }
                .ov-stand-keys {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .ov-stand-keys span {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    font-family: var(--sans);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text);
                    font-variant-numeric: tabular-nums;
                }
                .ov-stand-keys i {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                /* Personas */
                .ov-personas {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .ov-persona {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .ov-persona-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .ov-persona-name {
                    font-family: var(--sans);
                    font-size: 12px;
                    font-weight: 600;
                }
                .ov-persona-count {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--muted);
                    font-variant-numeric: tabular-nums;
                }
                .ov-persona-bar {
                    display: flex;
                    height: 7px;
                    border-radius: 999px;
                    overflow: hidden;
                    background: var(--bg-darker);
                }
                .ov-persona-bar span {
                    display: block;
                    transition: flex 0.4s ease;
                }
                /* Voices */
                .ov-voices {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .ov-voice-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .ov-voice-label {
                    font-family: var(--sans);
                    font-size: 10.5px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                .ov-voice-label.support { color: var(--support); }
                .ov-voice-label.oppose { color: var(--oppose); }
                .ov-voice {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    width: 100%;
                    padding: 8px 10px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: #fff;
                    cursor: pointer;
                    text-align: left;
                    transition: border-color 0.15s ease, background 0.15s ease;
                }
                .ov-voice:hover {
                    border-color: rgba(0, 82, 255, 0.2);
                    background: rgba(0, 82, 255, 0.02);
                }
                .ov-voice-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .ov-voice-dot.support { background: var(--support); }
                .ov-voice-dot.oppose { background: var(--oppose); }
                .ov-voice-name {
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--bright);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ov-voice-persona {
                    font-family: var(--sans);
                    font-size: 11px;
                    color: var(--muted);
                    margin-left: auto;
                    white-space: nowrap;
                }
                .ov-voice-inf {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--muted);
                    font-variant-numeric: tabular-nums;
                    background: var(--bg-darker);
                    padding: 2px 7px;
                    border-radius: 999px;
                    flex-shrink: 0;
                }
                .ov-chart {
                    height: 200px;
                    width: 100%;
                    position: relative;
                }
                .ov-log {
                    min-height: 220px;
                }
            `}</style>
        </div>
    );
}
