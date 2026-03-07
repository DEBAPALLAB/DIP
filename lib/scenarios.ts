import type { Scenario } from "./types";

export const SCENARIOS: Scenario[] = [
    {
        id: "ev",
        label: "NovaDrive EV",
        tag: "Clean Energy · Subscription",
        brief: `NovaDrive is a $399/month EV subscription. Includes:
• Mid-range electric vehicle (280mi range)
• Insurance, maintenance & charging credits
• Cancel anytime — no ownership required
• Federal $1,500/yr tax credit applied automatically
• App-based support, no dealership visits`,
        params: { value: 0.62, risk: 0.30, loss: 0.15 },
    },
    {
        id: "saas",
        label: "Meridian AI Suite",
        tag: "B2B SaaS · Enterprise",
        brief: `Meridian is an AI workflow platform at $89/seat/month. Includes:
• Automated document processing & routing
• SOC2-certified, enterprise SSO
• 99.9% uptime SLA
• 60-day free trial, no credit card
• Replaces 3–5 legacy tools on average`,
        params: { value: 0.70, risk: 0.25, loss: 0.10 },
    },
    {
        id: "health",
        label: "ClearHealth Plus",
        tag: "Healthcare · Insurance",
        brief: `ClearHealth Plus is supplemental coverage at $45/month. Includes:
• Zero-deductible urgent care visits
• Telehealth unlimited, 24/7
• Prescription coverage up to $200/mo
• Pre-existing conditions covered after 90 days
• Cancel anytime`,
        params: { value: 0.55, risk: 0.40, loss: 0.25 },
    },
];

export function getScenario(id: string): Scenario {
    return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
