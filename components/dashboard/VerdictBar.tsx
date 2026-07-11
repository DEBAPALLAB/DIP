"use client";

import { useMemo } from "react";
import type { Agent, SimulationStates, StepSnapshot } from "@/lib/types";

interface VerdictBarProps {
    agents: Agent[];
    states: SimulationStates;
    step: number;
    history: StepSnapshot[];
    running: boolean;
    influenceWeightedAdoption: string;
    consensusIndex: string;
    activeLeaders: string;
    controlsOpen: boolean;
    onToggleControls: () => void;
}

// A small trend glyph of the support trajectory.
function Sparkline({ points, color }: { points: number[]; color: string }) {
    if (points.length < 2) return null;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min || 1;
    const w = 88;
    const h = 26;
    const step = w / (points.length - 1);
    const d = points
        .map((p, i) => {
            const x = i * step;
            const y = h - ((p - min) / range) * (h - 4) - 2;
            return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    const lastX = (points.length - 1) * step;
    const lastY = h - ((points[points.length - 1] - min) / range) * (h - 4) - 2;
    return (
        <svg width={w} height={h} className="verdict-spark" aria-hidden>
            <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lastX} cy={lastY} r={2.6} fill={color} />
        </svg>
    );
}

export default function VerdictBar({
    agents,
    states,
    step,
    history,
    running,
    influenceWeightedAdoption,
    consensusIndex,
    activeLeaders,
    controlsOpen,
    onToggleControls,
}: VerdictBarProps) {
    const verdict = useMemo(() => {
        const total = agents.length;
        if (!total) return { pct: 0, support: 0, oppose: 0, neutral: 0, delta: 0 };
        const support = agents.filter((a) => states[a.id]?.decision === "support").length;
        const oppose = agents.filter((a) => states[a.id]?.decision === "oppose").length;
        const neutral = agents.filter((a) => states[a.id]?.decision === "neutral").length;
        const pct = Math.round((support / total) * 100);

        let delta = 0;
        if (history.length >= 2) {
            const last = history[history.length - 1];
            const prev = history[history.length - 2];
            const lt = last.support + last.neutral + last.oppose + last.pending + last.unaware;
            const pt = prev.support + prev.neutral + prev.oppose + prev.pending + prev.unaware;
            if (lt && pt) delta = Math.round((last.support / lt) * 100) - Math.round((prev.support / pt) * 100);
        }
        return { pct, support, oppose, neutral, delta };
    }, [agents, states, history]);

    const sparkPoints = useMemo(
        () =>
            history.map((h) => {
                const t = h.support + h.neutral + h.oppose + h.pending + h.unaware;
                return t ? (h.support / t) * 100 : 0;
            }),
        [history]
    );

    const { headline, tone, arrow } = useMemo(() => {
        if (step === 0) return { headline: "Ready to run", tone: "idle" as const, arrow: "" };
        if (verdict.delta > 1) return { headline: "Gaining ground", tone: "up" as const, arrow: "↑" };
        if (verdict.delta < -1) return { headline: "Losing ground", tone: "down" as const, arrow: "↓" };
        if (verdict.pct >= 50) return { headline: "Holding a lead", tone: "up" as const, arrow: "" };
        if (verdict.pct >= 25) return { headline: "Stalling", tone: "flat" as const, arrow: "" };
        return { headline: "Facing resistance", tone: "down" as const, arrow: "" };
    }, [verdict, step]);

    const toneColor =
        tone === "up" ? "var(--support)" : tone === "down" ? "var(--oppose)" : tone === "flat" ? "#b0790c" : "var(--muted)";

    return (
        <div className="verdict">
            {/* The answer — pct + trend + one-line headline */}
            <div className="v-answer">
                <span className="v-pct" style={{ color: toneColor }}>
                    {verdict.pct}<span className="v-unit">%</span>
                </span>
                {step > 0 && arrow && <span className="v-arrow" style={{ color: toneColor }}>{arrow}</span>}
                <div className="v-caption">
                    <span className="v-headline" style={{ color: toneColor }}>
                        {running ? "Simulating…" : headline}
                    </span>
                    <span className="v-sub">adoption · step {step}</span>
                </div>
                <Sparkline points={sparkPoints} color={toneColor} />
            </div>

            {/* The make-up — inline chips */}
            <div className="v-split">
                <span className="v-chip"><i className="support" />{verdict.support} for</span>
                <span className="v-chip"><i className="neutral" />{verdict.neutral} neutral</span>
                <span className="v-chip"><i className="oppose" />{verdict.oppose} against</span>
            </div>

            {/* Deeper signal — quiet, inline */}
            <div className="v-signals">
                <span className="v-sig"><b>{influenceWeightedAdoption}</b> infl.</span>
                <span className="v-sig"><b>{consensusIndex}</b> consensus</span>
                <span className="v-sig"><b>{activeLeaders}</b> leaders</span>
            </div>

            {/* Controls toggle — opens the levers popover */}
            <button
                type="button"
                className={`v-controls ${controlsOpen ? "on" : ""}`}
                onClick={onToggleControls}
                aria-expanded={controlsOpen}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                Controls
            </button>

            <style jsx>{`
                .verdict {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 12px 18px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 14px;
                    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 14px -10px rgba(16, 24, 40, 0.16);
                    min-width: 0;
                    overflow: hidden;
                }
                .v-answer {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                    padding-right: 24px;
                    border-right: 1px solid var(--border);
                }
                .v-pct {
                    font-family: var(--sans);
                    font-size: 30px;
                    font-weight: 800;
                    letter-spacing: -0.035em;
                    line-height: 1;
                    font-variant-numeric: tabular-nums;
                }
                .v-unit {
                    font-size: 15px;
                    font-weight: 700;
                    opacity: 0.5;
                }
                .v-arrow {
                    font-size: 18px;
                    font-weight: 800;
                    line-height: 1;
                    margin-left: -6px;
                }
                .v-caption {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .v-headline {
                    font-family: var(--sans);
                    font-size: 13.5px;
                    font-weight: 700;
                    letter-spacing: -0.01em;
                    line-height: 1.1;
                }
                .v-sub {
                    font-family: var(--sans);
                    font-size: 11px;
                    color: var(--muted);
                    font-variant-numeric: tabular-nums;
                }
                .v-split {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-shrink: 0;
                }
                .v-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    font-family: var(--sans);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                    font-variant-numeric: tabular-nums;
                    white-space: nowrap;
                }
                .v-chip i {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .v-chip i.support { background: var(--support); }
                .v-chip i.neutral { background: #eab308; }
                .v-chip i.oppose { background: var(--oppose); }
                .v-signals {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    margin-left: auto;
                    padding-left: 22px;
                    border-left: 1px solid var(--border);
                    flex-shrink: 0;
                }
                .v-sig {
                    font-family: var(--sans);
                    font-size: 11.5px;
                    color: var(--muted);
                    white-space: nowrap;
                }
                .v-sig b {
                    color: var(--bright);
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                }
                .v-controls {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    flex-shrink: 0;
                    height: 36px;
                    padding: 0 14px;
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    background: #fff;
                    color: var(--text);
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
                }
                .v-controls:hover { border-color: rgba(0,82,255,0.3); color: var(--accent); }
                .v-controls.on { background: var(--accent); border-color: var(--accent); color: #fff; }
                .v-controls svg { flex-shrink: 0; }

                @media (max-width: 1500px) {
                    .v-signals { display: none; }
                }
                @media (max-width: 1200px) {
                    .v-split .v-chip span { display: none; }
                }
            `}</style>
        </div>
    );
}
