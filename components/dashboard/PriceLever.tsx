"use client";

import { useMemo, useState, useEffect } from "react";
import type { Agent, SimulationStates, Scenario } from "@/lib/types";
import { calculateDecision } from "@/lib/prompts";

interface PriceLeverProps {
    agents: Agent[];
    states: SimulationStates;
    edges: [number, number][];
    scenario: Scenario;
    priceText: string;               // current committed price string (e.g. "$12", "Free")
    committedValueDelta: number;     // currently applied value delta (persisted on the run)
    step: number;
    onApply: (priceText: string, valueDelta: number) => void;
}

// Parse a price string to a number. "Free" / non-numeric → 0.
function parsePrice(text: string): number {
    if (!text) return 0;
    if (/free/i.test(text)) return 0;
    const n = parseFloat(text.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
}

function formatPrice(n: number): string {
    if (n <= 0) return "Free";
    return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
}

// Map a price relative to baseline to a perceived-value delta.
// Cheaper than baseline → higher value; pricier → lower value.
// Capped so a single move can't dominate the whole model.
function priceToValueDelta(price: number, baseline: number): number {
    if (baseline <= 0) {
        // Baseline is free: any positive price is a pure value penalty.
        return price <= 0 ? 0 : -Math.min(0.25, price / 100);
    }
    const ratio = price / baseline; // 1 = unchanged
    // −40% price ≈ +0.12 value; +40% price ≈ −0.12 value. Clamp to ±0.2.
    const delta = (1 - ratio) * 0.3;
    return Math.max(-0.2, Math.min(0.2, delta));
}

export default function PriceLever({
    agents,
    states,
    edges,
    scenario,
    priceText,
    committedValueDelta,
    step,
    onApply,
}: PriceLeverProps) {
    const baselinePrice = useMemo(() => parsePrice(priceText), [priceText]);

    // Slider range: 0 … 2× baseline (min $1 ceiling so a free product still gets a range).
    const maxPrice = Math.max(baselinePrice * 2, baselinePrice + 20, 20);
    const [draftPrice, setDraftPrice] = useState<number>(baselinePrice);

    useEffect(() => {
        setDraftPrice(baselinePrice);
    }, [baselinePrice]);

    const draftValueDelta = useMemo(() => priceToValueDelta(draftPrice, baselinePrice), [draftPrice, baselinePrice]);
    const isDirty = Math.abs(draftPrice - baselinePrice) > 0.001;

    // ─── Live projection: run the REAL decision engine at the proposed value ───
    // Compare projected support vs. current support so the swing is honest.
    const projection = useMemo(() => {
        if (!isDirty || agents.length === 0) return null;

        // The proposed scenario carries the adjusted perceived value.
        const nextValue = Math.min(0.99, Math.max(0.01, scenario.params.value + (draftValueDelta - committedValueDelta)));
        const proposedScenario: Scenario = {
            ...scenario,
            params: { ...scenario.params, value: nextValue },
        };

        const currentSupport = agents.filter((a) => states[a.id]?.decision === "support").length;

        let projectedSupport = 0;
        const flippedGained: string[] = [];
        const flippedLost: string[] = [];

        for (const agent of agents) {
            const st = states[agent.id];
            // Only agents already aware can react; unaware stay unaware.
            const isAware = st?.decision !== null && st?.decision !== undefined;
            if (!isAware) continue;

            const neighborIds = edges
                .filter(([a, b]) => a === agent.id || b === agent.id)
                .map(([a, b]) => (a === agent.id ? b : a));
            const neighborStateMap = Object.fromEntries(
                neighborIds.map((nid) => [nid, states[nid] ?? { decision: "neutral", reasoning: "", step: null, pending: false }])
            );
            const neighborAgents = neighborIds.map((id) => agents.find((a) => a.id === id)).filter(Boolean) as Agent[];

            const { decision } = calculateDecision(agent, proposedScenario, neighborStateMap, neighborAgents, undefined, true);
            if (decision === "support") {
                projectedSupport++;
                if (st?.decision !== "support") flippedGained.push(agent.persona);
            } else if (st?.decision === "support") {
                flippedLost.push(agent.persona);
            }
        }

        const net = projectedSupport - currentSupport;

        // Summarize which persona segments move, for the human-readable reason.
        const topOf = (arr: string[]) => {
            const counts = new Map<string, number>();
            arr.forEach((p) => counts.set(p, (counts.get(p) ?? 0) + 1));
            return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
        };

        return { net, gained: flippedGained.length, lost: flippedLost.length, gainSeg: topOf(flippedGained), lossSeg: topOf(flippedLost) };
    }, [isDirty, agents, states, edges, scenario, draftValueDelta, committedValueDelta]);

    const netTone = projection ? (projection.net > 0 ? "up" : projection.net < 0 ? "down" : "flat") : "flat";

    return (
        <div className="price-lever">
            <div className="pl-head">
                <span className="pl-k">price</span>
                <span className="pl-value">{formatPrice(draftPrice)}</span>
            </div>

            <input
                type="range"
                className="pl-slider"
                min={0}
                max={maxPrice}
                step={maxPrice > 40 ? 1 : 0.5}
                value={draftPrice}
                onChange={(e) => setDraftPrice(parseFloat(e.target.value))}
                aria-label="Price"
                style={{ ["--fill" as string]: `${Math.round((draftPrice / maxPrice) * 100)}%` }}
            />
            <div className="pl-scale">
                <span>Free</span>
                <span>{formatPrice(baselinePrice)} now</span>
                <span>{formatPrice(maxPrice)}</span>
            </div>

            {/* Projected swing — computed with the real decision engine */}
            {isDirty && projection && (
                <div className="pl-projection" data-tone={netTone}>
                    <div className="pl-proj-net">
                        <span className="pl-proj-num">
                            {projection.net > 0 ? "+" : ""}{projection.net}
                        </span>
                        <span className="pl-proj-label">projected support next step</span>
                    </div>
                    {(projection.gainSeg || projection.lossSeg) && (
                        <div className="pl-proj-reason">
                            {projection.gainSeg && <span className="up">↑ wins {projection.gainSeg}s</span>}
                            {projection.lossSeg && <span className="down">↓ loses {projection.lossSeg}s</span>}
                        </div>
                    )}
                </div>
            )}

            <div className="pl-actions">
                <button
                    type="button"
                    className="pl-apply"
                    disabled={!isDirty}
                    onClick={() => onApply(formatPrice(draftPrice), draftValueDelta)}
                >
                    {step > 0 ? "Apply on next step" : "Apply"}
                </button>
                {isDirty && (
                    <button type="button" className="pl-cancel" onClick={() => setDraftPrice(baselinePrice)}>
                        Reset
                    </button>
                )}
            </div>

            <style jsx>{`
                .price-lever {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .pl-head {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                }
                .pl-k {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .pl-value {
                    font-family: var(--sans);
                    font-size: 17px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--bright);
                    font-variant-numeric: tabular-nums;
                }
                .pl-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 5px;
                    border-radius: 999px;
                    background: linear-gradient(90deg, var(--accent) 0%, var(--accent) var(--fill, 50%), var(--border-bright) var(--fill, 50%), var(--border-bright) 100%);
                    outline: none;
                    cursor: pointer;
                }
                .pl-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid var(--accent);
                    box-shadow: 0 1px 4px rgba(0, 82, 255, 0.3);
                    cursor: pointer;
                }
                .pl-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid var(--accent);
                    cursor: pointer;
                }
                .pl-scale {
                    display: flex;
                    justify-content: space-between;
                    font-family: var(--sans);
                    font-size: 10px;
                    color: var(--muted);
                }
                .pl-projection {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    background: var(--bg-darker);
                    border: 1px solid var(--border);
                }
                .pl-proj-net {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                }
                .pl-proj-num {
                    font-family: var(--sans);
                    font-size: 18px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    font-variant-numeric: tabular-nums;
                }
                .pl-projection[data-tone="up"] .pl-proj-num { color: var(--support); }
                .pl-projection[data-tone="down"] .pl-proj-num { color: var(--oppose); }
                .pl-projection[data-tone="flat"] .pl-proj-num { color: var(--muted); }
                .pl-proj-label {
                    font-family: var(--sans);
                    font-size: 11px;
                    color: var(--muted);
                }
                .pl-proj-reason {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    text-align: right;
                }
                .pl-proj-reason span {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .pl-proj-reason .up { color: var(--support); }
                .pl-proj-reason .down { color: var(--oppose); }
                .pl-actions {
                    display: flex;
                    gap: 8px;
                }
                .pl-apply {
                    flex: 1;
                    height: 36px;
                    border: none;
                    border-radius: 9px;
                    background: var(--accent);
                    color: #fff;
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s ease, transform 0.1s ease;
                }
                .pl-apply:hover:not(:disabled) { transform: translateY(-1px); }
                .pl-apply:disabled { opacity: 0.4; cursor: default; }
                .pl-cancel {
                    height: 36px;
                    padding: 0 14px;
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    background: #fff;
                    color: var(--muted);
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .pl-cancel:hover { color: var(--bright); }
            `}</style>
        </div>
    );
}
