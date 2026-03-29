"use client";

interface ResultsHeaderProps {
    adoptionPct: number;
    consensusScore: number;
    oppositionPct: number;
    stepCount: number;
    agentCount: number;
    productName: string;
}

export default function ResultsHeader({
    adoptionPct,
    consensusScore,
    oppositionPct,
    stepCount,
    agentCount,
    productName,
}: ResultsHeaderProps) {
    return (
        <div className="results-header">
            <div className="results-header-top">
                <span
                    style={{
                        fontFamily: "var(--mono)",
                        fontSize: 12,
                        color: "var(--muted)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                    }}
                >
                    SIMULATION COMPLETE · {stepCount} steps · {agentCount} agents
                </span>
            </div>
            <div className="results-kpi-grid">
                <div className="results-kpi">
                    <span className="results-kpi-val" style={{ color: "var(--support)" }}>
                        {adoptionPct}%
                    </span>
                    <span className="results-kpi-label">ADOPTION RATE</span>
                </div>
                <div className="results-kpi">
                    <span className="results-kpi-val" style={{ color: "var(--bright)" }}>
                        {consensusScore > 0 ? "+" : ""}
                        {consensusScore.toFixed(2)}
                    </span>
                    <span className="results-kpi-label">CONSENSUS SCORE</span>
                </div>
                <div className="results-kpi">
                    <span className="results-kpi-val" style={{ color: "var(--oppose)" }}>
                        {oppositionPct}%
                    </span>
                    <span className="results-kpi-label">OPPOSITION RATE</span>
                </div>
            </div>
        </div>
    );
}
