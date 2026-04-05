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
    if (!text) return [];
    
    const sections: { label: string; text: string }[] = [];
    const labels = ["PRIMARY BARRIER", "PRIMARY DRIVER", "RECOMMENDATION"];

    // Find indices of all defined labels to split cleanly
    const positions = labels
        .map(label => ({ label, index: text.indexOf(label) }))
        .filter(p => p.index !== -1)
        .sort((a, b) => a.index - b.index);

    if (positions.length === 0) return [];

    for (let i = 0; i < positions.length; i++) {
        const current = positions[i];
        const next = positions[i + 1];
        
        let sectionText = text.substring(
            current.index + current.label.length, 
            next ? next.index : text.length
        ).trim();

        // Clean up common AI prefixes (colons, asterisks, dashes, spaces)
        sectionText = sectionText.replace(/^[:\s\*-]+/, "").trim();
        
        if (sectionText) {
            sections.push({ label: current.label, text: sectionText });
        }
    }

    return sections;
}
