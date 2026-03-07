import type { Agent, Scenario } from "./types";

/**
 * Builds the system prompt for an agent.
 * Encodes behavioral profile from GSS 2024 empirical trait vectors.
 */
export function buildSystemPrompt(agent: Agent, scenario: Scenario): string {
    const r = agent.risk;
    const t = agent.trust;
    const s = agent.social;

    const riskLabel =
        r < 0.3
            ? "LOW — you embrace new things readily"
            : r < 0.6
                ? "MODERATE — you weigh risks carefully"
                : "HIGH — you strongly avoid uncertainty";

    const trustLabel =
        t < 0.35
            ? "LOW — you distrust corporate claims"
            : t < 0.65
                ? "MODERATE — skeptical but open"
                : "HIGH — you generally trust institutions";

    const socialLabel =
        s < 0.35
            ? "LOW — independent thinker"
            : s < 0.65
                ? "MODERATE — consider peers"
                : "HIGH — strongly peer-influenced";

    const voice: Record<string, string> = {
        Influencer: "You form strong opinions fast and love sharing them. You're an early signal for others.",
        "Early Adopter": "You research deeply. If it checks out technically, you jump. You love being first.",
        "Price Hawk": "Total cost of ownership is your lens. You calculate ROI before anything else.",
        Pragmatist: "You need proof of reliability. You want case studies and references, not promises.",
        "Social Follower": "You look to trusted people in your network before deciding. Social proof is everything.",
        "Herd Member": "Uncertainty makes you anxious. You wait until most people have moved before you do.",
        Skeptic: "You find reasons why it won't work until overwhelmingly proven otherwise.",
        Laggard: "You've seen trends come and go. You stick to what you know until you have no choice.",
    };

    return `You are ${agent.name}, ${agent.age}, ${agent.job}.

BEHAVIORAL PROFILE (GSS 2024 empirical data):
- Risk aversion: ${riskLabel} (${(r * 100).toFixed(0)}/100)
- Institutional trust: ${trustLabel} (${(t * 100).toFixed(0)}/100)
- Social sensitivity: ${socialLabel} (${(s * 100).toFixed(0)}/100)
- Income percentile: ${(agent.income * 100).toFixed(0)}th | Education: ${agent.educ} years
- Archetype: ${agent.persona}

DECISION VOICE:
${voice[agent.persona] ?? "You approach decisions carefully and pragmatically."}

RULES: Stay in character as ${agent.name}. Speak naturally in first person. 2-3 sentences of genuine reasoning.
End with exactly: DECISION: support OR DECISION: neutral OR DECISION: oppose`;
}


/**
 * Parses an LLM response to extract decision + reasoning.
 */
export function parseDecision(text: string): {
    decision: "support" | "neutral" | "oppose" | null;
    reasoning: string;
} {
    const lower = text.toLowerCase();
    let decision: "support" | "neutral" | "oppose" | null = null;

    const match = lower.match(/decision:\s*(support|neutral|oppose)/);
    if (match) {
        decision = match[1] as "support" | "neutral" | "oppose";
    }

    // Strip the decision line from reasoning
    const reasoning = text
        .replace(/DECISION:\s*(support|neutral|oppose)/gi, "")
        .trim();

    return { decision, reasoning };
}
