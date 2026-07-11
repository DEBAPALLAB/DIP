"use client";

import { useSimulation } from "@/lib/SimulationContext";
import type { Agent, SimulationStates, Scenario } from "@/lib/types";
import PriceLever from "./PriceLever";

interface LeversPanelProps {
    scenarioLabel: string;
    step: number;
    // Live-control wiring for the real price lever + projection.
    agents: Agent[];
    states: SimulationStates;
    edges: [number, number][];
    scenario: Scenario;
    committedValueDelta: number;
    onApplyPrice: (priceText: string, valueDelta: number) => void;
    // Advocate (champion) budget
    seedBudget: number;
    seedsUsed: number;
    onAutoSeed: () => void;
    // Marketing push
    marketingPush: "targeted" | "broad";
    onMarketingPush: (v: "targeted" | "broad") => void;
}

/**
 * The product controls for the run. The scenario is fixed for the project and
 * shown as context only. Price is a real, causal lever: the slider maps to a
 * perceived-value delta the decision engine reacts to, previewed live.
 */
export default function LeversPanel({
    scenarioLabel,
    step,
    agents,
    states,
    edges,
    scenario,
    committedValueDelta,
    onApplyPrice,
    seedBudget,
    seedsUsed,
    onAutoSeed,
    marketingPush,
    onMarketingPush,
}: LeversPanelProps) {
    const simCtx = useSimulation();
    const { product } = simCtx;

    if (!product) return null;

    const seedsLeft = seedBudget - seedsUsed;

    return (
        <section className="levers-panel" aria-label="Product controls">
            <header className="levers-head">
                <div className="levers-head-l">
                    <span className="levers-eyebrow">product under test</span>
                    <h3 className="levers-product">{product.name}</h3>
                </div>
                <span className="levers-scenario" title="Scenario is fixed for this project">
                    {scenarioLabel}
                </span>
            </header>

            {/* Real, causal price lever with a live projected-swing readout */}
            <PriceLever
                agents={agents}
                states={states}
                edges={edges}
                scenario={scenario}
                priceText={product.price}
                committedValueDelta={committedValueDelta}
                step={step}
                onApply={onApplyPrice}
            />

            {/* Advocate budget — a scarce pool of champion conversions */}
            <div className="advocate-block">
                <div className="adv-head">
                    <span className="adv-k">advocates</span>
                    <span className="adv-count">
                        <strong>{seedsUsed}</strong> of {seedBudget} placed
                    </span>
                </div>
                <div className="adv-meter" aria-hidden>
                    {Array.from({ length: seedBudget }).map((_, i) => (
                        <span key={i} className={i < seedsUsed ? "on" : ""} />
                    ))}
                </div>
                <div className="adv-foot">
                    <span className="adv-hint">Click any agent → Convert, or</span>
                    <button
                        type="button"
                        className="adv-auto"
                        onClick={onAutoSeed}
                        disabled={seedsLeft <= 0}
                    >
                        Auto-place top {Math.max(seedsLeft, 0)}
                    </button>
                </div>
            </div>

            {/* Marketing push — breadth vs. depth of awareness */}
            <div className="push-block">
                <div className="push-head">
                    <span className="push-k">marketing push</span>
                </div>
                <div className="push-seg" role="radiogroup" aria-label="Marketing push strategy">
                    <button
                        type="button"
                        role="radio"
                        aria-checked={marketingPush === "targeted"}
                        className={`push-btn ${marketingPush === "targeted" ? "on" : ""}`}
                        onClick={() => onMarketingPush("targeted")}
                    >
                        <span className="push-btn-t">Targeted</span>
                        <span className="push-btn-s">influencers first</span>
                    </button>
                    <button
                        type="button"
                        role="radio"
                        aria-checked={marketingPush === "broad"}
                        className={`push-btn ${marketingPush === "broad" ? "on" : ""}`}
                        onClick={() => onMarketingPush("broad")}
                    >
                        <span className="push-btn-t">Broad</span>
                        <span className="push-btn-s">wide reach, faster</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .push-block {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 18px;
                    margin-top: 18px;
                    border-top: 1px solid var(--border);
                }
                .push-head { display: flex; }
                .push-k {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .push-seg {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }
                .push-btn {
                    display: flex !important;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 3px;
                    width: 100%;
                    min-height: 52px;
                    box-sizing: border-box;
                    padding: 10px 14px;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    background: #fff;
                    cursor: pointer;
                    text-align: left;
                    overflow: visible;
                    transition: border-color 0.15s ease, background 0.15s ease;
                }
                .push-btn-t, .push-btn-s { display: block; width: 100%; }
                .push-btn:hover:not(.on) { border-color: rgba(0,82,255,0.25); }
                .push-btn.on {
                    border-color: var(--accent);
                    background: rgba(0, 82, 255, 0.05);
                }
                .push-btn-t {
                    font-family: var(--sans);
                    font-size: 12.5px;
                    font-weight: 600;
                    color: var(--bright);
                }
                .push-btn.on .push-btn-t { color: var(--accent); }
                .push-btn-s {
                    font-family: var(--sans);
                    font-size: 10.5px;
                    color: var(--muted);
                }
            `}</style>

            <style jsx>{`
                .advocate-block {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    padding-top: 18px;
                    margin-top: 18px;
                    border-top: 1px solid var(--border);
                }
                .adv-head {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                }
                .adv-k {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .adv-count {
                    font-family: var(--sans);
                    font-size: 12px;
                    color: var(--muted);
                    font-variant-numeric: tabular-nums;
                }
                .adv-count strong {
                    color: var(--bright);
                    font-weight: 700;
                }
                .adv-meter {
                    display: flex;
                    gap: 4px;
                }
                .adv-meter span {
                    flex: 1;
                    height: 6px;
                    border-radius: 999px;
                    background: var(--border-bright);
                    transition: background 0.2s ease;
                }
                .adv-meter span.on {
                    background: var(--support);
                }
                .adv-foot {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                .adv-hint {
                    font-family: var(--sans);
                    font-size: 11px;
                    color: var(--muted);
                }
                .adv-auto {
                    flex-shrink: 0;
                    height: 28px;
                    padding: 0 12px;
                    border: 1px solid rgba(0, 82, 255, 0.2);
                    border-radius: 8px;
                    background: rgba(0, 82, 255, 0.06);
                    color: var(--accent);
                    font-family: var(--sans);
                    font-size: 11.5px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s ease;
                }
                .adv-auto:hover:not(:disabled) { background: rgba(0, 82, 255, 0.12); }
                .adv-auto:disabled { opacity: 0.4; cursor: default; }
            `}</style>

            <style jsx>{`
                .levers-panel {
                    display: flex;
                    flex-direction: column;
                    padding: 20px 22px 24px;
                    background: #ffffff;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                }
                .levers-head {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    padding-bottom: 14px;
                    margin-bottom: 14px;
                    border-bottom: 1px solid var(--border);
                }
                .levers-head-l {
                    display: flex;
                    flex-direction: column;
                    gap: 3px;
                    min-width: 0;
                }
                .levers-eyebrow {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .levers-product {
                    margin: 0;
                    font-family: var(--sans);
                    font-size: 16px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--bright);
                    line-height: 1.1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .levers-scenario {
                    flex-shrink: 0;
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--accent);
                    background: rgba(0, 82, 255, 0.07);
                    border: 1px solid rgba(0, 82, 255, 0.14);
                    padding: 4px 10px;
                    border-radius: 999px;
                    white-space: nowrap;
                    max-width: 180px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .levers-controls {
                    display: flex;
                    align-items: flex-end;
                    gap: 20px;
                }
                .lever {
                    display: flex;
                    flex-direction: column;
                    gap: 7px;
                }
                .lever-grow {
                    flex: 1;
                    min-width: 0;
                }
                .lever-k {
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .lever-input-wrap {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                }
                .lever-input {
                    width: 96px;
                    background: rgba(255, 255, 255, 0.95);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-family: var(--mono);
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--bright);
                    outline: none;
                    transition: border-color 0.18s ease, box-shadow 0.18s ease;
                }
                .lever-input:focus {
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px rgba(0, 82, 255, 0.1);
                }
                .lever-dot {
                    position: absolute;
                    right: -5px;
                    top: -5px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--orange);
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.9);
                }
                .seg {
                    display: flex;
                    background: rgba(0, 0, 0, 0.04);
                    border: 1px solid var(--border);
                    border-radius: 9px;
                    padding: 3px;
                    gap: 3px;
                }
                .seg-btn {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 7px 12px;
                    border-radius: 6px;
                    font-family: var(--sans);
                    font-size: 11.5px;
                    font-weight: 600;
                    color: var(--muted);
                    cursor: pointer;
                    text-transform: capitalize;
                    transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
                }
                .seg-btn:hover:not(.on) {
                    color: var(--text);
                    background: rgba(0, 0, 0, 0.03);
                }
                .seg-btn.on {
                    background: var(--accent);
                    color: #fff;
                    box-shadow: 0 2px 6px rgba(0, 82, 255, 0.25);
                }
                .levers-foot {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    margin-top: 18px;
                    padding-top: 12px;
                    border-top: 1px solid var(--border);
                    font-family: var(--sans);
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--muted);
                }
                .levers-foot-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--orange);
                    flex-shrink: 0;
                }
            `}</style>
        </section>
    );
}
