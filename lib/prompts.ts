import type { Agent, Scenario, AgentState, DecisionType, ScenarioParams } from "./types";

interface PromptResult {
    systemPrompt: string;
}

/**
 * DETERMINISTIC DECISION ENGINE (Source of Truth)
 * Decoupled from LLM to ensure simulation integrity.
 */
export function calculateDecision(
    agent: Agent, 
    scenario: Scenario, 
    neighborStates: Record<number, AgentState>, 
    neighborAgents: Agent[],
    previousParams?: ScenarioParams
): { decision: DecisionType, utility: number, socialPressure: number, threshold: number, effRisk: number, effBudget: number, shockBonus: number } {
    
    // 1. Derive Effective Traits (simulation_v3.py logic)
    const ageFactor = Math.max(0, (agent.age - 40) * 0.003);
    const anxietyFactor = agent.emotional * 0.4;
    const effRisk = Math.min(0.99, agent.risk * (1 + ageFactor + anxietyFactor));
    const incomeFactor = (1.0 - agent.income) * 0.5;
    const effBudget = Math.min(0.99, agent.budget * (1 + incomeFactor));

    // Decision threshold: status quo bias + prior adoption experience
    const adoptionDiscount = 1.0 - ((agent.priorAdoptions || 0) / 20.0);
    const effThreshold = Math.max(0.05, (agent.statusQuoBias || 0.5) * adoptionDiscount);

    // 2. Compute Utility (Prospect Theory)
    const pValue = scenario.params.value;
    const pRisk = scenario.params.risk;
    const pLoss = scenario.params.loss;

    const trustAdjustedValue = pValue * (0.4 + 0.6 * agent.trust);
    const lossTerm = (agent.lossAversion || 2.25) * pLoss * effRisk;
    
    // 3. Social Signal (Influence Weighted)
    let weightedSupport = 0;
    let weightedOppose = 0;
    let totalInfluence = 0;

    (neighborAgents ?? []).forEach((nb: Agent) => {
        const state = neighborStates[nb.id];
        const inf = (nb.influence_score || 0) + 0.2;
        totalInfluence += inf;

        if (state?.decision === "support") weightedSupport += inf;
        if (state?.decision === "oppose") weightedOppose += inf;
    });
    
    const socialSignal = totalInfluence > 0 ? ((weightedSupport - weightedOppose) / totalInfluence) : 0;
    const socialWeight = Math.min(0.99, agent.social * (1 + agent.collectivism * 0.3));

    // 3.5 Parameter Deltas (Psychological Shock)
    let shockBonus = 0;
    if (previousParams) {
        const valDelta = scenario.params.value - previousParams.value;
        const lossDelta = scenario.params.loss - previousParams.loss;
        
        // Positive shock for improvements (price drop, value boost)
        if (valDelta > 0.02) shockBonus += valDelta * 0.4;
        if (lossDelta < -0.02) shockBonus += Math.abs(lossDelta) * 0.25;
        
        // Negative shock for worse params
        if (valDelta < -0.02) shockBonus += valDelta * 0.7; // People hate when value drops
        
        // Scale shock by agent's risk and status quo bias (more conservative = less shock)
        shockBonus *= (1.5 - (agent.statusQuoBias || 0.5));
    }

    // Final Utility (Core Math)
    const rawUtility = (effBudget * trustAdjustedValue) 
                  - (effRisk * pRisk) 
                  - lossTerm 
                  + (socialWeight * socialSignal)
                  + shockBonus;

    // 4. Stochastic "Vibrancy" Jitter (simulation_v3.py concept)
    // We add a small random offset (-0.05 to +0.05) to simulate life randomness
    // and prevent identical agents from staying in a deterministic neutral lock.
    const jitter = (Math.random() - 0.5) * 0.10;
    const utility = rawUtility + jitter;

    // Stance Projection (Inspired by np.tanh in simulation_v3.py)
    // We map utility directly to -1...1 and compare vs threshold
    const stance = Math.tanh(utility); 
    const decisionThreshold = effThreshold * 0.40; // Slightly wider neutral zone

    let decision: DecisionType = "neutral";
    if (stance > decisionThreshold) decision = "support";
    else if (stance < -decisionThreshold) decision = "oppose";

    return { 
        decision, 
        utility: Math.round(utility * 100), 
        socialPressure: Math.round(socialSignal * 100),
        threshold: Math.round(decisionThreshold * 100),
        effRisk,
        effBudget,
        shockBonus: Math.round(shockBonus * 100)
    };
}

/**
 * NARRATIVE JUSTIFICATION ENGINE
 * Explains the deterministic decision in character.
 */
export function buildSystemPrompt(
    agent: Agent, 
    scenario: Scenario, 
    neighborStates: Record<number, AgentState>, 
    neighborAgents: Agent[],
    previousParams?: ScenarioParams
): PromptResult {
    
    const stats = calculateDecision(agent, scenario, neighborStates, neighborAgents, previousParams);

    const systemPrompt = `You are ${agent.name}, ${agent.age}, ${agent.job}.
Archetype: ${agent.persona}

YOUR PSYCHOLOGICAL PROFILE:
- Risk-Reward Tilt: ${stats.effRisk < 0.35 ? "Adventurous" : stats.effRisk < 0.70 ? "Prudent" : "Highly Conservative"}
- Loss Aversion: ${(agent.lossAversion || 2.25).toFixed(2)}x
- Institutional Trust: ${agent.trust < 0.35 ? "Skeptical" : agent.trust < 0.65 ? "Practical" : "High Trust"}
- Budget Sensitivity: ${stats.effBudget < 0.45 ? "Comfortable" : stats.effBudget < 0.75 ? "Value-conscious" : "Strained"}

INTERNAL SIMULATION RESULT:
- You have DECIDED to: ${(stats.decision || "neutral").toUpperCase()}
- Calculated Utility: ${stats.utility} (Threshold: ${stats.threshold})
- Social Signal: ${stats.socialPressure}
${stats.shockBonus !== 0 ? `- Reaction to Change: ${stats.shockBonus > 0 ? "Positive" : "Negative"} Shock Detected` : ""}

YOUR MISSION:
Explain WHY you made this decision in character as ${agent.name}. 
Focus on your specific life situation, your job, and your traits above.
The simulation engine has already confirmed your choice is ${stats.decision || "neutral"}. 
Your response must stay consistent with this mathematical outcome.

Keep reasoning to 2-3 natural, visceral, human-like sentences. 
Always complete your thoughts. Do not use wrapping quotes around your response.
Your response must be plain text only.

End with: DECISION: ${stats.decision} (exactly in this format)
`;

    return { systemPrompt };
}
