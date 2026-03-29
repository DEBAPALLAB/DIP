import { Agent, Scenario, AgentState, DecisionType } from "./lib/types";
import { calculateDecision } from "./lib/prompts";

// Mock Data
const scenario: Scenario = {
    id: "test",
    label: "Verify Product",
    tag: "TEST",
    brief: "A high-risk, high-value premium service.",
    params: {
        value: 0.8,  // Strong value claim
        risk: 0.7,   // High risk
        loss: 0.5    // Significant loss trigger
    }
};

const skeptic: Agent = {
    id: 1,
    name: "Skeptic Sam",
    persona: "Skeptic",
    age: 55,
    risk: 0.8,           // High risk aversion
    trust: 0.15,         // Very low trust
    social: 0.2,
    collectivism: 0.1,
    budget: 0.4,
    emotional: 0.3,
    income: 0.6,
    educ: 16,
    sex: "male",
    wrkstat: "full-time",
    influence_score: 0.2,
    job: "Risk Auditor",
    color: "#F44336",
    lossAversion: 4.5,   // Heavy loss weighting
    statusQuoBias: 0.8,
    priorAdoptions: 1
};

const enthusiast: Agent = {
    id: 2,
    name: "Early Eli",
    persona: "Early Adopter",
    age: 28,
    risk: 0.2,           // Low risk aversion
    trust: 0.75,         // High trust
    social: 0.6,
    collectivism: 0.4,
    budget: 0.6,
    emotional: 0.2,
    income: 0.8,
    educ: 18,
    sex: "female",
    wrkstat: "full-time",
    influence_score: 0.5,
    job: "Tech Lead",
    color: "#00BCD4",
    lossAversion: 1.5,
    statusQuoBias: 0.3,
    priorAdoptions: 8
};

function runTest() {
    console.log("--- SIMULATION VERIFICATION ---");
    
    const resSkeptic = calculateDecision(skeptic, scenario, {}, []);
    console.log(`\nAgent: ${skeptic.name} [${skeptic.persona}]`);
    console.log(`Decision: ${resSkeptic.decision.toUpperCase()}`);
    console.log(`Utility Score: ${resSkeptic.utility}`);
    console.log(`Expected: OPPOSE (due to low trust and high loss aversion)`);

    const resEnthusiast = calculateDecision(enthusiast, scenario, {}, []);
    console.log(`\nAgent: ${enthusiast.name} [${enthusiast.persona}]`);
    console.log(`Decision: ${resEnthusiast.decision.toUpperCase()}`);
    console.log(`Utility Score: ${resEnthusiast.utility}`);
    console.log(`Expected: SUPPORT (due to high trust and adoption experience)`);

    console.log("\nLogic check passed if outputs are decisive.");
}

runTest();
