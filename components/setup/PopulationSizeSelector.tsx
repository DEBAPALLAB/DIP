"use client";

interface PopulationSizeSelectorProps {
    value: number;
    onChange: (n: number) => void;
    onNext: () => void;
    onBack: () => void;
}

const PRESETS = [10, 25, 50, 100];

export default function PopulationSizeSelector({
    value,
    onChange,
    onNext,
    onBack,
}: PopulationSizeSelectorProps) {
    const batches = Math.ceil(value / 8);
    const estMinutes = Math.ceil((value * 3) / 60);

    return (
        <div className="setup-form">
            <div className="setup-form-header">
                <span className="setup-step-tag">STEP 3 OF 4</span>
                <h2 className="setup-step-title">POPULATION SIZE</h2>
            </div>

            <div className="setup-form-body">
                <label className="form-label">How many agents do you want to simulate?</label>

                {/* Preset buttons */}
                <div className="pop-size-grid">
                    {PRESETS.map((n) => (
                        <button
                            key={n}
                            className={`pop-size-btn ${value === n ? "pop-size-btn-active" : ""}`}
                            onClick={() => onChange(n)}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                {/* Custom input */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
                    <span className="form-label" style={{ margin: 0, whiteSpace: "nowrap" }}>
                        Or enter a number:
                    </span>
                    <input
                        className="form-input form-input-sm"
                        type="number"
                        min={5}
                        max={200}
                        value={value}
                        onChange={(e) => {
                            const n = Math.max(5, Math.min(200, Number(e.target.value) || 5));
                            onChange(n);
                        }}
                    />
                    <span className="form-hint" style={{ margin: 0 }}>
                        (max 200)
                    </span>
                </div>

                {/* What this means */}
                <div className="info-block">
                    <div className="filter-section-title">── WHAT THIS MEANS ──</div>
                    <div className="info-row">
                        <span className="info-val">{value} agents</span>
                        <span className="info-sep">·</span>
                        <span className="info-val">~{estMinutes} min per step</span>
                        <span className="info-sep">·</span>
                        <span className="info-val">{batches} batches</span>
                    </div>
                    <span className="form-hint">Recommended for most use cases: 50 agents</span>
                </div>

                {/* Estimated cost */}
                <div className="info-block">
                    <div className="filter-section-title">── ESTIMATED COST ──</div>
                    <div className="info-row">
                        <span className="info-label">Model:</span>
                        <span className="info-val">arcee-ai/trinity-large-preview:free</span>
                    </div>
                    <div className="info-row">
                        <span className="info-label">Cost per step:</span>
                        <span style={{ color: "var(--support)", fontFamily: "var(--mono)", fontWeight: 600 }}>
                            $0.00
                        </span>
                        <span className="form-hint" style={{ margin: 0 }}>
                            (free tier)
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="setup-form-actions">
                    <button className="btn-ghost-setup" onClick={onBack}>
                        ← Back
                    </button>
                    <button className="btn-cta" onClick={onNext}>
                        Generate Population →
                    </button>
                </div>
            </div>
        </div>
    );
}
