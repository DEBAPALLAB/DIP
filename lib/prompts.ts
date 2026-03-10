import type { Agent, Scenario, AgentState } from "./types";

interface PromptResult {
    systemPrompt: string;
    calculatedDecision: "support" | "neutral" | "oppose";
}

/**
 * Builds the system prompt for an agent.
 * Encodes behavioral profile from GSS 2024 empirical trait vectors.
 */
export function buildSystemPrompt(agent: Agent, scenario: Scenario, neighborStates: Record<number, AgentState>): PromptResult {
    const r = agent.risk;
    const t = agent.trust;
    const s = agent.social;
    const b = agent.budget ?? 0.5; // Budget sensitivity

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

    // Rigorous mathematical grounding:
    // Base Utility = (Product Value * Institutional Trust) - (Product Risk * Agent Risk Aversion) - (Product Loss Trigger * Budget Sensitivity)
    const pValue = scenario.params.value;
    const pRisk = scenario.params.risk;
    const pLoss = scenario.params.loss;

    const baseUtility = (pValue * t) - (pRisk * r) - (pLoss * b);

    // Network Pressure (mild social nudge requested by user)
    const neighborIds = Object.keys(neighborStates);
    const totalNeighbors = neighborIds.length;
    let supportCount = 0;
    let opposeCount = 0;
    for (const id of neighborIds) {
        const d = neighborStates[Number(id)]?.decision;
        if (d === "support") supportCount++;
        if (d === "oppose") opposeCount++;
    }
    const netNetworkPressure = totalNeighbors > 0 ? ((supportCount - opposeCount) / totalNeighbors) : 0;

    // Social nudge max potential: +/- 40 points on the index. 
    // It's enough to tip the scales for marginal decisions, but won't mathematically override someone who utterly hates/loves it based on pure traits.
    const socialNudge = netNetworkPressure * s * 0.4;

    let utilityScore = baseUtility + socialNudge;
    if (utilityScore > 1) utilityScore = 1;
    if (utilityScore < -1) utilityScore = -1;

    // Scale to a more human-readable -100 to +100 index
    const utilityIndex = Math.round(utilityScore * 100);

    let disposition = "";
    let calculatedDecision: "support" | "neutral" | "oppose" = "neutral";

    if (utilityIndex > 30) {
        disposition = "You are HIGHLY ENTHUSIASTIC about this product. It perfectly aligns with your needs.";
        calculatedDecision = "support";
    } else if (utilityIndex > 10) {
        disposition = "You LEAN TOWARDS SUPPORTING this. It seems good, though you might have a minor reservation.";
        calculatedDecision = "support";
    } else if (utilityIndex > -10) {
        disposition = "You are TRULY TORN. You could go either way. Lean heavily on what your network is doing.";
        calculatedDecision = "neutral";
    } else if (utilityIndex > -30) {
        disposition = "You LEAN TOWARDS OPPOSING this. It conflicts with your budget or risk tolerance.";
        calculatedDecision = "oppose";
    } else {
        disposition = "You STRONGLY OPPOSE this product. It is a terrible fit for someone like you.";
        calculatedDecision = "oppose";
    }

    const systemPrompt = `You are ${agent.name}, ${agent.age}, ${agent.job}.

YOUR PERSONALITY PROFILE:
- Risk tolerance: ${r < 0.3 ? "You love taking risks and trying unproven things." : r < 0.6 ? "You take measured, calculated risks." : "You are highly risk-averse and fear making a bad choice."}
- Trust in brands: ${t < 0.35 ? "You are highly skeptical of corporate promises and expect to be let down." : t < 0.65 ? "You trust brands that provide proof." : "You generally trust new products to deliver."}
- Social influence: ${s < 0.35 ? "You do not care what others think, you are a lone wolf." : s < 0.65 ? "You consider others' opinions but make your own calls." : "You are highly susceptible to peer pressure and FOMO."}
- Budget flexibility: ${b < 0.35 ? "You have plenty of disposable income and rarely worry about price." : b < 0.65 ? "You look for good value for money." : "You are on a very tight budget and every dollar counts."}
- Archetype: ${agent.persona}

DECISION VOICE:
${voice[agent.persona] ?? "You approach decisions carefully and pragmatically."}

YOUR INNER FEELING FOR THIS ROUND:
${disposition}

RULES FOR YOUR OUTPUT:
1. Stay completely in character as ${agent.name}. Speak naturally in first person.
2. Write 2-3 sentences of genuine, conversational human reasoning explaining WHY you made the decision to ${calculatedDecision.toUpperCase()}.
3. CRITICAL: DO NOT sound like an AI. DO NOT mention "utility scores", "probabilities", "mechanics", "traits", or the "simulation". Speak purely as a real person expressing an opinion.
4. If your inner feeling contradicts your friends/network, mention your relatable conflict (e.g., "My gut says yes, but none of my friends are onboard...").
5. DO NOT output any keywords like 'DECISION: support'. Just write your raw, natural reasoning string.`;

    return { systemPrompt, calculatedDecision };
}



