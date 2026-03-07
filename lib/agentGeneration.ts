/**
 * Agent Generation from GSS 2024 respondent pool
 * Implements Watts-Strogatz network construction and persona classification
 */

import type { Agent, PersonaType } from "./types";

// ─── Raw GSS respondent type ──────────────────────────────────────────────────

export interface GSSRespondent {
    risk_aversion: number;
    institutional_trust: number;
    social_conformity: number;  // may be NaN
    collectivism: number;
    budget_sensitivity: number;
    emotional_state: number;
    age: number;
    educ: number;
    income_percentile: number;
    sex: "male" | "female";
    race: "white" | "black" | "other";
    wrkstat:
    | "full-time"
    | "part-time"
    | "retired"
    | "unemployed"
    | "in school"
    | "keeping house"
    | "temp not working"
    | "other";
}

// ─── Persona centroids (6-dimensional) ───────────────────────────────────────

const PERSONA_CENTROIDS: Record<PersonaType, number[]> = {
    Influencer: [0.20, 0.55, 0.45, 0.35, 0.40, 0.90],
    "Early Adopter": [0.22, 0.45, 0.35, 0.35, 0.55, 0.30],
    "Price Hawk": [0.35, 0.50, 0.45, 0.88, 0.55, 0.25],
    Pragmatist: [0.48, 0.50, 0.42, 0.58, 0.48, 0.25],
    "Social Follower": [0.45, 0.55, 0.78, 0.45, 0.45, 0.25],
    "Herd Member": [0.78, 0.30, 0.72, 0.55, 0.55, 0.20],
    Skeptic: [0.78, 0.18, 0.30, 0.45, 0.45, 0.35],
    Laggard: [0.88, 0.50, 0.25, 0.75, 0.78, 0.15],
};

// Feature vector order: [risk, trust, social, budget, emotional, influence]
const CENTROID_WEIGHTS = [2.0, 1.5, 1.5, 1.5, 1.0, 1.5];

export interface RawAgent {
    risk_aversion: number;
    institutional_trust: number;
    social_conformity: number;
    budget_sensitivity: number;
    emotional_state: number;
    influence_score: number;
}

export function classifyPersona(agent: RawAgent): PersonaType {
    const vec = [
        agent.risk_aversion,
        agent.institutional_trust,
        agent.social_conformity,
        agent.budget_sensitivity,
        agent.emotional_state,
        agent.influence_score,
    ];

    let best: PersonaType = "Pragmatist";
    let bestDist = Infinity;

    for (const [name, centroid] of Object.entries(PERSONA_CENTROIDS) as [
        PersonaType,
        number[]
    ][]) {
        const dist = centroid.reduce(
            (sum, c, i) => sum + CENTROID_WEIGHTS[i] * (vec[i] - c) ** 2,
            0
        );
        if (dist < bestDist) {
            bestDist = dist;
            best = name;
        }
    }

    return best;
}

// ─── Persona Colors ───────────────────────────────────────────────────────────

export const PERSONA_COLORS: Record<PersonaType, string> = {
    Influencer: "#E91E63",
    "Early Adopter": "#00BCD4",
    "Price Hawk": "#F9A825",
    Pragmatist: "#4CAF50",
    "Social Follower": "#FF9800",
    "Herd Member": "#9C27B0",
    Skeptic: "#F44336",
    Laggard: "#607D8B",
};

// ─── Name + Job pools ─────────────────────────────────────────────────────────

const FIRST_NAMES = {
    male: [
        "James", "Robert", "Michael", "David", "William", "Richard", "Joseph",
        "Thomas", "Marcus", "Daniel", "Kevin", "Brian", "Edward", "Ronald",
        "Timothy", "Jason", "Jeffrey", "Ryan", "Gary", "Larry",
    ],
    female: [
        "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Susan", "Jessica",
        "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra",
        "Ashley", "Kimberly", "Emily", "Donna", "Carol", "Amanda",
    ],
};

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson",
    "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
];

const JOBS: Record<string, Record<string, string[]>> = {
    "full-time": {
        high: [
            "Software Engineer", "Financial Analyst", "Marketing Director",
            "Operations Manager", "Product Manager", "Data Scientist",
            "Architect", "Attorney", "Physician", "Professor",
        ],
        mid: [
            "Nurse", "Teacher", "Accountant", "Sales Manager",
            "HR Coordinator", "Logistics Coordinator", "Real Estate Agent",
            "Insurance Broker", "IT Support Specialist",
        ],
        low: [
            "Retail Associate", "Warehouse Worker", "Driver",
            "Security Guard", "Food Service Worker", "Administrative Assistant",
            "Janitor", "Cashier",
        ],
    },
    retired: {
        any: [
            "Retired Teacher", "Retired Engineer", "Retired Nurse",
            "Retired Manager", "Retired Contractor", "Retired Officer",
            "Retired Accountant",
        ],
    },
    "part-time": {
        any: [
            "Part-time Consultant", "Freelancer", "Part-time Instructor",
            "Gig Worker", "Part-time Retail",
        ],
    },
    unemployed: {
        any: ["Job Seeker", "Former Sales Rep", "Freelancer", "Career Changer"],
    },
    "in school": {
        any: [
            "Graduate Student", "Undergraduate Student", "Community College Student",
        ],
    },
    "keeping house": {
        any: ["Homemaker", "Stay-at-Home Parent", "Caregiver"],
    },
    "temp not working": {
        any: ["Job Seeker", "Career Changer", "Freelancer"],
    },
    other: {
        any: ["Consultant", "Self-employed", "Volunteer"],
    },
};

export function assignNameAndJob(
    respondent: GSSRespondent,
    index: number
): { name: string; job: string } {
    const namePool = respondent.sex === "female" ? FIRST_NAMES.female : FIRST_NAMES.male;
    const firstName = namePool[index % namePool.length];
    const lastName = LAST_NAMES[index % LAST_NAMES.length];

    let jobPool: string[];
    const stat = respondent.wrkstat;

    if (stat === "retired") {
        jobPool = JOBS.retired.any;
    } else if (stat === "in school") {
        jobPool = JOBS["in school"].any;
    } else if (stat === "keeping house") {
        jobPool = JOBS["keeping house"].any;
    } else if (stat === "unemployed") {
        jobPool = JOBS.unemployed.any;
    } else if (stat === "part-time") {
        jobPool = JOBS["part-time"].any;
    } else if (stat === "temp not working") {
        jobPool = JOBS["temp not working"].any;
    } else if (stat === "full-time") {
        const tier =
            respondent.educ >= 16 ? "high" : respondent.educ >= 13 ? "mid" : "low";
        jobPool = JOBS["full-time"][tier];
    } else {
        jobPool = JOBS.other.any;
    }

    return {
        name: `${firstName} ${lastName[0]}.`,
        job: jobPool[index % jobPool.length],
    };
}

// ─── Watts-Strogatz Network ───────────────────────────────────────────────────

export function buildWattsStrogatz(
    n: number,
    k = 6,
    p = 0.15
): [number, number][] {
    if (n < 2) return [];

    // Ring lattice
    const edgeSet = new Set<string>();
    for (let i = 0; i < n; i++) {
        for (let j = 1; j <= Math.floor(k / 2); j++) {
            const neighbor = (i + j) % n;
            const key = `${Math.min(i, neighbor)}-${Math.max(i, neighbor)}`;
            edgeSet.add(key);
        }
    }

    // Rewire with probability p
    const edgeArr = [...edgeSet];
    const result: [number, number][] = [];

    for (const e of edgeArr) {
        const [a, b] = e.split("-").map(Number);
        if (Math.random() < p) {
            // Try to find a new target
            let attempts = 0;
            let newB = Math.floor(Math.random() * n);
            while (
                attempts < 20 &&
                (newB === a ||
                    edgeSet.has(`${Math.min(a, newB)}-${Math.max(a, newB)}`))
            ) {
                newB = Math.floor(Math.random() * n);
                attempts++;
            }
            if (attempts < 20) {
                const newKey = `${Math.min(a, newB)}-${Math.max(a, newB)}`;
                edgeSet.add(newKey);
                result.push([a, newB]);
            } else {
                result.push([a, b]);
            }
        } else {
            result.push([a, b]);
        }
    }

    return result;
}

// ─── Influence Scores (degree centrality proxy) ───────────────────────────────

export function computeInfluenceScores(
    n: number,
    edges: [number, number][]
): number[] {
    const degree = new Array(n).fill(0);
    for (const [a, b] of edges) {
        degree[a]++;
        degree[b]++;
    }
    const maxDeg = Math.max(...degree, 1);
    return degree.map((d) => d / maxDeg);
}

// ─── Main generateAgents function ─────────────────────────────────────────────

export async function generateAgents(count: number): Promise<Agent[]> {
    // 1. Load GSS pool — fetch as text first to handle NaN values (invalid JSON)
    const raw = await fetch("/gss_agent_pool.json").then((r) => r.text());
    const pool: GSSRespondent[] = JSON.parse(raw.replace(/:\s*NaN/g, ": null"));


    // 2. Sample `count` respondents without replacement (shuffle + slice)
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const sampled = shuffled.slice(0, Math.min(count, pool.length));

    // 3. Build Watts-Strogatz network for this count
    const edges = buildWattsStrogatz(sampled.length, 6, 0.15);

    // 4. Compute influence scores from degree centrality
    const influence = computeInfluenceScores(sampled.length, edges);

    // 5. Build agents
    return sampled.map((resp, i) => {
        const { name, job } = assignNameAndJob(resp, i);
        const social = isNaN(resp.social_conformity) ? 0.5 : resp.social_conformity;

        const rawAgent: RawAgent = {
            risk_aversion: resp.risk_aversion,
            institutional_trust: resp.institutional_trust,
            social_conformity: social,
            budget_sensitivity: resp.budget_sensitivity,
            emotional_state: resp.emotional_state,
            influence_score: influence[i],
        };

        const persona = classifyPersona(rawAgent);

        return {
            id: i,
            name,
            job,
            age: Math.round(resp.age),
            risk: resp.risk_aversion,
            trust: resp.institutional_trust,
            social,
            collectivism: resp.collectivism,
            budget: resp.budget_sensitivity,
            emotional: resp.emotional_state,
            income: resp.income_percentile,
            educ: resp.educ,
            sex: resp.sex,
            wrkstat: resp.wrkstat,
            influence_score: influence[i],
            persona,
            color: PERSONA_COLORS[persona],
        } as Agent;
    });
}
