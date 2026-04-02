"use client";

interface StrategicInsightsProps {
    insights: string | null;
    loading: boolean;
}

export default function StrategicInsights({ insights, loading }: StrategicInsightsProps) {
    if (loading) {
        return (
            <div className="results-insights-section results-card">
                <h3 className="results-section-title">MARKET SIGNAL</h3>
                <div className="results-insights-card">
                    <div className="generating-spinner" style={{ margin: "20px auto" }} />
                    <p
                        style={{
                            textAlign: "center",
                            color: "var(--muted)",
                            fontFamily: "var(--mono)",
                            fontSize: 11,
                        }}
                    >
                        Generating strategic analysis...
                    </p>
                </div>
            </div>
        );
    }

    if (!insights) return null;

    // Parse the insights into sections
    const sections = parseInsights(insights);

    return (
        <div className="results-insights-section results-card">
            <h3 className="results-section-title">MARKET SIGNAL</h3>
            <div className="results-insights-card">
                {sections.map((section, i) => (
                    <div key={i} className="results-insight-block">
                        <h4 className="results-insight-label">{section.label}</h4>
                        <p className="results-insight-text">{section.text}</p>
                    </div>
                ))}
                {sections.length === 0 && (
                    <p className="results-insight-text">{insights}</p>
                )}
            </div>
        </div>
    );
}

function parseInsights(text: string): { label: string; text: string }[] {
    const sections: { label: string; text: string }[] = [];
    const labels = ["PRIMARY BARRIER", "PRIMARY DRIVER", "RECOMMENDATION"];

    for (const label of labels) {
        const regex = new RegExp(`${label}[:\\s]*(.+?)(?=(?:PRIMARY BARRIER|PRIMARY DRIVER|RECOMMENDATION|$))`, "si");
        const match = text.match(regex);
        if (match) {
            sections.push({ label, text: match[1].trim() });
        }
    }

    return sections;
}
