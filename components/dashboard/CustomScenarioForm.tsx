"use client";

import { useState, useEffect } from "react";
import type { Scenario } from "@/lib/types";

interface CustomScenarioFormProps {
    existing: Scenario | null;
    onApply: (scenario: Scenario) => void;
    onClose: () => void;
}

const LS_KEY = "sim_custom_scenario";

const DEFAULTS = {
    label: "",
    tag: "",
    brief: "",
    value: 0.60,
    risk: 0.30,
    loss: 0.20,
};

function SliderRow({
    label,
    hint,
    value,
    onChange,
    color,
}: {
    label: string;
    hint: string;
    value: number;
    onChange: (v: number) => void;
    color: string;
}) {
    return (
        <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {label}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#2a3a4a", marginLeft: 6 }}>
                        {hint}
                    </span>
                </div>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color, fontWeight: 700 }}>
                    {(value * 100).toFixed(0)}%
                </span>
            </div>
            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                style={{
                    width: "100%",
                    accentColor: color,
                    cursor: "pointer",
                    height: 3,
                }}
            />
        </div>
    );
}

export default function CustomScenarioForm({ existing, onApply, onClose }: CustomScenarioFormProps) {
    const [label, setLabel] = useState(existing?.label ?? DEFAULTS.label);
    const [tag, setTag] = useState(existing?.tag ?? DEFAULTS.tag);
    const [brief, setBrief] = useState(existing?.brief ?? DEFAULTS.brief);
    const [value, setValue] = useState(existing?.params.value ?? DEFAULTS.value);
    const [risk, setRisk] = useState(existing?.params.risk ?? DEFAULTS.risk);
    const [loss, setLoss] = useState(existing?.params.loss ?? DEFAULTS.loss);
    const [isDetecting, setIsDetecting] = useState(false);

    // Persist to localStorage on any change
    useEffect(() => {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({ label, tag, brief, value, risk, loss }));
        } catch (_) { }
    }, [label, tag, brief, value, risk, loss]);

    const isValid = label.trim().length > 0 && brief.trim().length > 0;

    function handleApply() {
        if (!isValid) return;
        const scenario: Scenario = {
            id: "custom",
            label: label.trim(),
            tag: tag.trim() || "Custom Scenario",
            brief: brief.trim(),
            params: { value, risk, loss },
        };
        onApply(scenario);
        onClose();
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Escape") onClose();
    }

    async function handleAutoDetect() {
        if (!brief.trim()) return;
        setIsDetecting(true);
        try {
            const res = await fetch("/api/auto-params", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brief }),
            });
            if (res.ok) {
                const data = await res.json();
                if (typeof data.value === "number") setValue(data.value);
                if (typeof data.risk === "number") setRisk(data.risk);
                if (typeof data.loss === "number") setLoss(data.loss);
            } else {
                alert("Failed to auto-detect parameters.");
            }
        } catch (err) {
            console.error("Auto-detect failed:", err);
            alert("Error auto-detecting parameters.");
        } finally {
            setIsDetecting(false);
        }
    }

    return (
        // Backdrop
        <div
            onKeyDown={handleKeyDown}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.72)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                backdropFilter: "blur(2px)",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{
                    width: 520,
                    background: "#0d1520",
                    border: "1px solid #1e2e40",
                    borderRadius: 6,
                    overflow: "hidden",
                    fontFamily: "var(--mono)",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 16px",
                    borderBottom: "1px solid #1e2e40",
                }}>
                    <span style={{ fontSize: 9, color: "var(--orange)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                        CUSTOM SCENARIO
                    </span>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 14, lineHeight: 1 }}
                    >
                        ✕
                    </button>
                </div>

                <div style={{ padding: "18px 20px 20px" }}>
                    {/* Product name */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                            Product Name <span style={{ color: "var(--orange)" }}>*</span>
                        </label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. NovaDrive EV"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            maxLength={60}
                            style={{
                                width: "100%",
                                background: "#080c10",
                                border: `1px solid ${label.trim() ? "#1e2e40" : "#1e2e40"}`,
                                borderRadius: 3,
                                padding: "7px 10px",
                                fontFamily: "var(--mono)",
                                fontSize: 12,
                                color: "var(--bright)",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Category / tag */}
                    <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                            Category Tag
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Clean Energy · Subscription"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                            maxLength={60}
                            style={{
                                width: "100%",
                                background: "#080c10",
                                border: "1px solid #1e2e40",
                                borderRadius: 3,
                                padding: "7px 10px",
                                fontFamily: "var(--mono)",
                                fontSize: 12,
                                color: "var(--bright)",
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* Brief */}
                    <div style={{ marginBottom: 18 }}>
                        <label style={{ display: "block", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
                            Product Brief <span style={{ color: "var(--orange)" }}>*</span>
                            <span style={{ color: "#2a3a4a", marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>
                                — shown to agents in the LLM prompt
                            </span>
                        </label>
                        <textarea
                            placeholder={"Describe the product, price, key features, and any risks.\nBullet points work well.\n\ne.g.\n• $399/month subscription\n• Includes maintenance & insurance\n• Cancel anytime"}
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            rows={5}
                            style={{
                                width: "100%",
                                background: "#080c10",
                                border: "1px solid #1e2e40",
                                borderRadius: 3,
                                padding: "7px 10px",
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                color: "var(--bright)",
                                outline: "none",
                                resize: "vertical",
                                boxSizing: "border-box",
                                lineHeight: 1.6,
                            }}
                        />
                    </div>

                    {/* Divider & Auto-Detect */}
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        marginBottom: 14,
                        borderTop: "1px solid #1e2e40",
                        paddingTop: 14,
                    }}>
                        <div style={{
                            fontSize: 9,
                            color: "var(--orange)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                        }}>
                            Model Parameters
                        </div>
                        <button
                            onClick={handleAutoDetect}
                            disabled={isDetecting || !brief.trim()}
                            style={{
                                background: "none",
                                border: "1px solid var(--orange)",
                                color: "var(--orange)",
                                borderRadius: 3,
                                padding: "4px 8px",
                                fontSize: 9,
                                fontFamily: "var(--mono)",
                                cursor: isDetecting || !brief.trim() ? "not-allowed" : "pointer",
                                opacity: isDetecting || !brief.trim() ? 0.5 : 1,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                transition: "all 0.15s",
                            }}
                        >
                            {isDetecting ? "DETECTING..." : "✨ AUTO-DETECT"}
                        </button>
                    </div>

                    {/* Sliders */}
                    <SliderRow
                        label="Perceived Value"
                        hint="how compelling is this product"
                        value={value}
                        onChange={setValue}
                        color="#00d084"
                    />
                    <SliderRow
                        label="Risk Level"
                        hint="how risky does adoption feel"
                        value={risk}
                        onChange={setRisk}
                        color="#ff4444"
                    />
                    <SliderRow
                        label="Loss Trigger"
                        hint="how much does opting-out hurt"
                        value={loss}
                        onChange={setLoss}
                        color="#f0b429"
                    />

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: "9px 0",
                                background: "transparent",
                                border: "1px solid #1e2e40",
                                borderRadius: 3,
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                color: "var(--muted)",
                                cursor: "pointer",
                                letterSpacing: "0.06em",
                            }}
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={!isValid}
                            style={{
                                flex: 2,
                                padding: "9px 0",
                                background: isValid ? "var(--orange)" : "#1e2e40",
                                border: "none",
                                borderRadius: 3,
                                fontFamily: "var(--mono)",
                                fontSize: 11,
                                fontWeight: 700,
                                color: isValid ? "#000" : "#2a3a4a",
                                cursor: isValid ? "pointer" : "not-allowed",
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                transition: "background 0.12s",
                            }}
                        >
                            {isValid ? "▶ LOAD SCENARIO" : "ENTER NAME + BRIEF"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Load a previously saved custom scenario from localStorage */
export function loadSavedCustomScenario(): Scenario | null {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!d.label || !d.brief) return null;
        return {
            id: "custom",
            label: d.label,
            tag: d.tag || "Custom Scenario",
            brief: d.brief,
            params: {
                value: d.value ?? 0.6,
                risk: d.risk ?? 0.3,
                loss: d.loss ?? 0.2,
            },
        };
    } catch (_) {
        return null;
    }
}
