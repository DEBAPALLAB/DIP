import type { Agent, Scenario, AgentState, DecisionType, ScenarioParams } from "./types";

interface PromptResult {
    systemPrompt: string;
}

/**
 * Signed contribution of each utility term to an agent's decision, in raw utility
 * units. Positive pushes toward SUPPORT, negative toward OPPOSE/non-adoption.
 * Consumed by objection extraction (Tier 2E) to attribute *why* an agent resisted.
 */
export interface UtilityComponents {
    value: number;        // + trust-adjusted, signal-faded perceived value
    risk: number;         // − product risk × effective risk aversion
    loss: number;         // − loss aversion × loss trigger
    social: number;       // ± net social pressure from neighbors
    shock: number;        // ± reaction to a parameter change vs last step
    switching: number;    // − competitive switching cost (Tier 1C)
}

export interface DecisionResult {
    decision: DecisionType;
    utility: number;
    socialPressure: number;
    threshold: number;
    effRisk: number;
    effBudget: number;
    shockBonus: number;
    switchingPenalty: number;
    conviction: number;
    components: UtilityComponents;
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
    previousParams?: ScenarioParams,
    isAware: boolean = true,
    signalQuality: number = 1
): DecisionResult {

    // 0. Awareness Gate (Tier 1B) — an agent with no exposure to the scenario yet
    // cannot form an opinion. They stay unexposed rather than defaulting to a
    // decision, which is what produces a real S-curve from network diffusion
    // instead of everyone deciding simultaneously on step 1.
    if (!isAware) {
        return {
            decision: null,
            utility: 0,
            socialPressure: 0,
            threshold: 0,
            effRisk: agent.risk,
            effBudget: agent.budget,
            shockBonus: 0,
            switchingPenalty: 0,
            conviction: 0,
            components: { value: 0, risk: 0, loss: 0, social: 0, shock: 0, switching: 0 },
        };
    }

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
    // Tier 2F: perceived value is scaled by signal quality — an agent reached by a
    // faded, distorted word-of-mouth signal perceives LESS value than one who saw the
    // pristine launch pitch. Risk/loss are NOT discounted: bad news and fear of loss
    // travel intact (arguably amplified) through word-of-mouth, unlike upside.
    const clampedSignal = Math.max(0, Math.min(1, signalQuality));
    const pValue = scenario.params.value * clampedSignal;
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

    // 3.6 Competitive Baseline (Tier 1C — switching, not buying)
    // If the scenario names an incumbent, adopting means *switching* away from it.
    // Two costs apply:
    //   (a) Opportunity cost — the value the agent gives up by abandoning what they
    //       already have, trust-adjusted the same way the new product's value is.
    //   (b) Switching friction — migration effort (data export, relearning, contracts),
    //       felt more acutely by high-status-quo-bias agents who resist any change.
    // With no competitor this term is exactly 0, so greenfield behavior is unchanged.
    let switchingPenalty = 0;
    const competitor = scenario.params.competitor;
    if (competitor) {
        const incumbentValue = competitor.value * (0.4 + 0.6 * agent.trust);
        const opportunityCost = effBudget * incumbentValue;
        const switchingFriction = competitor.switchingCost * (0.5 + (agent.statusQuoBias || 0.5));
        switchingPenalty = opportunityCost + switchingFriction;
    }

    // Component decomposition (Tier 2E) — signed contribution of each term, so we can
    // later attribute *why* an agent resisted. These sum (with switching) to rawUtility.
    const valueTerm = effBudget * trustAdjustedValue;   // +
    const riskTerm = -(effRisk * pRisk);                // −
    const lossTermSigned = -lossTerm;                   // −
    const socialTerm = socialWeight * socialSignal;     // ±
    // (shockBonus and switchingPenalty are already signed; switching enters below as −)

    // Final Utility (Core Math) — the product's intrinsic appeal, competitor-blind.
    const rawUtility = valueTerm + riskTerm + lossTermSigned + socialTerm + shockBonus;

    // 4. Stochastic "Vibrancy" Jitter (simulation_v3.py concept)
    // We add a small random offset (-0.05 to +0.05) to simulate life randomness
    // and prevent identical agents from staying in a deterministic neutral lock.
    const jitter = (Math.random() - 0.5) * 0.10;
    const utility = rawUtility + jitter;

    // Stance Projection (Inspired by np.tanh in simulation_v3.py)
    // We map utility directly to -1...1 and compare vs threshold
    let stance = Math.tanh(utility);
    const decisionThreshold = effThreshold * 0.40; // Slightly wider neutral zone

    // Tier 1C stance adjustment: switching cost is fundamentally a barrier to
    // ADOPTION, not a source of hostility. Someone content with their incumbent
    // doesn't actively oppose your product — they just don't switch. So the penalty
    // drags stance downward (suppressing support → neutral holdout) but must not
    // manufacture the strong active opposition that genuine risk/loss aversion produces.
    //
    // The guard checks the agent's stance BEFORE the switching drag (preSwitchStance),
    // not raw utility >= 0. An agent can be intrinsically neutral-to-mildly-negative
    // (utility < 0 but stance still inside the neutral band — the common case for an
    // ordinary product) and that is NOT the same as the product's own math having
    // already earned genuine opposition. Only agents who were already past the oppose
    // boundary on the product's own merits (preSwitchStance <= -decisionThreshold) are
    // allowed to land in oppose here — switching cost never manufactures that verdict.
    if (switchingPenalty > 0) {
        const preSwitchStance = stance;
        const drag = Math.tanh(switchingPenalty); // [0,1)
        stance -= drag;
        const wasGenuinelyOpposed = preSwitchStance <= -decisionThreshold;
        if (!wasGenuinelyOpposed && stance < -decisionThreshold) {
            stance = -decisionThreshold * 0.5; // parked in neutral, leaning cool
        }
    }

    let decision: DecisionType = "neutral";
    if (stance > decisionThreshold) decision = "support";
    else if (stance < -decisionThreshold) decision = "oppose";

    // ─── Conviction Scoring ───
    // How decisively the agent landed on their side of the boundary, in [0, 1].
    // It's the margin by which |stance| clears the neutral band, normalized by the
    // maximum possible margin (1 - threshold). Neutral agents (inside the band)
    // score 0. Low conviction (< 0.3) supporters are churn/flip candidates; high
    // conviction supporters are sticky. This is what makes the ratchet a market.
    const headroom = Math.max(1e-6, 1 - decisionThreshold);
    const margin = Math.abs(stance) - decisionThreshold;
    const conviction = Math.min(1, Math.max(0, margin / headroom));

    return {
        decision,
        utility: Math.round(utility * 100),
        socialPressure: Math.round(socialSignal * 100),
        threshold: Math.round(decisionThreshold * 100),
        effRisk,
        effBudget,
        shockBonus: Math.round(shockBonus * 100),
        switchingPenalty: Math.round(switchingPenalty * 100),
        conviction: Math.round(conviction * 100) / 100,
        components: {
            value: valueTerm,
            risk: riskTerm,
            loss: lossTermSigned,
            social: socialTerm,
            shock: shockBonus,
            switching: -switchingPenalty,
        },
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
${scenario.params.competitor ? `- Switching Consideration: you already use ${scenario.params.competitor.label || "an existing alternative"}, and moving carries a ${stats.switchingPenalty > 40 ? "heavy" : stats.switchingPenalty > 15 ? "moderate" : "minor"} switching cost.` : ""}

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
