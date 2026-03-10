"use client";

import type { Scenario } from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";

interface ScenarioPickerProps {
    value: string;
    onChange: (id: string) => void;
    onCustom: () => void;
    disabled?: boolean;
}

export default function ScenarioPicker({ value, onChange, onCustom, disabled }: ScenarioPickerProps) {
    function handleChange(id: string) {
        if (id === "custom") {
            onCustom();
        } else {
            onChange(id);
        }
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Product
            </span>
            <select
                id="scenario-select"
                className="terminal-select"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                aria-label="Select product scenario"
            >
                {SCENARIOS.map((s: Scenario) => (
                    <option key={s.id} value={s.id}>
                        {s.label} — {s.tag}
                    </option>
                ))}
                <option value="custom">
                    {value === "custom" ? "✎ Custom Scenario" : "✎ Custom..."}
                </option>
            </select>
        </div>
    );
}

