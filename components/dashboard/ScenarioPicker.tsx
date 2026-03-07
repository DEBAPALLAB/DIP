"use client";

import type { Scenario } from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";

interface ScenarioPickerProps {
    value: string;
    onChange: (id: string) => void;
    disabled?: boolean;
}

export default function ScenarioPicker({ value, onChange, disabled }: ScenarioPickerProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Product
            </span>
            <select
                id="scenario-select"
                className="terminal-select"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                aria-label="Select product scenario"
            >
                {SCENARIOS.map((s: Scenario) => (
                    <option key={s.id} value={s.id}>
                        {s.label} — {s.tag}
                    </option>
                ))}
            </select>
        </div>
    );
}
