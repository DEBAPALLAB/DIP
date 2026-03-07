"use client";

import type { SimulationStates, StepSnapshot } from "@/lib/types";

import { pct, consensusLabel } from "@/lib/simulation";

interface TopBarProps {
    step: number;
    running: boolean;
    states: SimulationStates;
    history: StepSnapshot[];
    scenarioLabel: string;
    agentCount: number;
}

export default function TopBar({ step, running, states, history, scenarioLabel, agentCount }: TopBarProps) {
    const total = agentCount;
    const support = Object.values(states).filter((s) => s.decision === "support").length;
    const neutral = Object.values(states).filter((s) => s.decision === "neutral").length;
    const oppose = Object.values(states).filter((s) => s.decision === "oppose").length;
    const pending = Object.values(states).filter((s) => s.decision === null).length;

    const lastSnapshot = history[history.length - 1];
    const prevSnapshot = history[history.length - 2];

    const delta = lastSnapshot && prevSnapshot
        ? lastSnapshot.support - prevSnapshot.support
        : 0;

    return (
        <div className="ticker-bar" style={{ height: 40 }}>
            {/* Live indicator */}
            <div className="ticker-item" style={{ padding: "0 12px", gap: 6 }}>
                {running && <span className="live-dot" />}
                <span className="ticker-label" style={{ color: running ? "var(--orange)" : "var(--muted)" }}>
                    {running ? "LIVE" : step === 0 ? "READY" : "PAUSED"}
                </span>
            </div>

            {/* Scenario */}
            <div className="ticker-item">
                <span className="ticker-label">SIM</span>
                <span className="ticker-val" style={{ color: "var(--text)", fontWeight: 400 }}>
                    {scenarioLabel}
                </span>
            </div>

            {/* Step */}
            <div className="ticker-item">
                <span className="ticker-label">STEP</span>
                <span className="ticker-val">{step}</span>
            </div>

            {/* Support */}
            <div className="ticker-item">
                <span className="ticker-label">SUPPORT</span>
                <span className="ticker-val" style={{ color: "var(--support)" }}>
                    {pct(support, total)}
                </span>
                {delta !== 0 && (
                    <span style={{ fontSize: 9, color: delta > 0 ? "var(--support)" : "var(--oppose)", fontFamily: "var(--mono)" }}>
                        {delta > 0 ? "▲" : "▼"}{Math.abs(delta)}
                    </span>
                )}
            </div>

            {/* Neutral */}
            <div className="ticker-item">
                <span className="ticker-label">NEUTRAL</span>
                <span className="ticker-val" style={{ color: "var(--neutral)" }}>
                    {pct(neutral, total)}
                </span>
            </div>

            {/* Oppose */}
            <div className="ticker-item">
                <span className="ticker-label">OPPOSE</span>
                <span className="ticker-val" style={{ color: "var(--oppose)" }}>
                    {pct(oppose, total)}
                </span>
            </div>

            {/* Pending */}
            <div className="ticker-item">
                <span className="ticker-label">PENDING</span>
                <span className="ticker-val" style={{ color: "var(--pending)" }}>
                    {pending}
                </span>
            </div>

            {/* Consensus */}
            <div className="ticker-item" style={{ marginLeft: "auto", borderRight: "none", borderLeft: "1px solid var(--border)" }}>
                <span className="ticker-label">CONSENSUS</span>
                <span className="ticker-val" style={{ color: "var(--orange)" }}>
                    {consensusLabel(states)}
                </span>
            </div>
        </div>
    );
}
