import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";
import { guard, safeText } from "@/lib/apiGuard";

// Anchors for the user's own low/medium/high selections on the setup form. The LLM
// audit runs blind to these unless we tell it, and — separately — is not trustworthy
// enough to let its output silently override an explicit user choice by an arbitrary
// amount. A user who picks "low risk" can get nudged by evidence in the brief, but not
// have a "low" flipped into effectively "high" with zero justification for the jump.
const RISK_LEVEL_ANCHOR: Record<string, number> = { low: 0.25, medium: 0.42, high: 0.62 };
const VALUE_PROP_ANCHOR: Record<string, number> = { weak: 0.30, moderate: 0.55, strong: 0.80 };
const MAX_DEVIATION = 0.25; // how far the LLM may move a param from the user's own anchor

function clampToAnchor(llmValue: number, anchor: number | undefined, fallback: number): number {
    const v = Number.isFinite(llmValue) ? llmValue : fallback;
    if (anchor === undefined) return Math.min(0.99, Math.max(0.01, v));
    const lo = Math.max(0.01, anchor - MAX_DEVIATION);
    const hi = Math.min(0.99, anchor + MAX_DEVIATION);
    return Math.min(hi, Math.max(lo, v));
}

export async function POST(req: NextRequest) {
    const gate = await guard(req);
    if (!gate.ok) return gate.response;

    try {
        const body = await req.json();
        const brief = safeText(body?.brief, 4000);
        // User's own selections from the setup form, if provided — used to anchor
        // the audit so it can't silently contradict what the user already told us.
        const riskLevel = typeof body?.riskLevel === "string" ? body.riskLevel : undefined;
        const valueProp = typeof body?.valueProp === "string" ? body.valueProp : undefined;

        if (!brief) {
            return NextResponse.json({ error: "Missing or invalid brief." }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
        }

const anchorNote = (riskLevel || valueProp)
            ? `\n\nThe user has already classified this product themselves: ${riskLevel ? `risk profile = "${riskLevel}"` : ""}${riskLevel && valueProp ? ", " : ""}${valueProp ? `value proposition = "${valueProp}"` : ""}. Your numeric audit should be CONSISTENT with that classification — refine it with evidence from the brief, don't contradict it outright. A "low" risk selection should not become a punishing risk score, and a "strong" value selection should not become a weak one, absent a compelling reason stated in your justification.`
            : "";

        const systemPrompt = `You are a Global Strategic Audit Engine. Evaluate the product brief against 2024-2025 real-world market contexts.
Do NOT use fixed benchmarks. Use your internal knowledge of category pricing (e.g., "$399/mo for an EV is extremely efficient," while "$399/mo for an email app is an extreme luxury risk").${anchorNote}

Perform a 3-step Audit:
1. **Competitive Context**: Identify 2-3 similar products in this category and compare pricing.
2. **Economic Friction**: Determine if the price point creates "Impulse," "Considered," or "High-Stakes" friction for the target demographic.
3. **Inertia Analysis**: Estimate the "Pain vs. Gain" ratio (Switching Costs) for moving from the status quo.

Assign three Adoption Parameters (0.00 to 1.00) with high decimal precision:
1. **value (Perceived Value)**: The "Efficiency" and "Bargain" factor relative to substitutes. (1.0 = massive bargain, 0.0 = total ripoff).
2. **risk (Risk Level)**: Financial/Emotional commitment. (1.0 = immense risk/life-changing cost, 0.0 = zero friction/totally free).
3. **loss (Loss Trigger)**: The penalty or FOMO for NOT adopting. (1.0 = competitive death or major life disadvantage, 0.0 = irrelevant if missed).

Additionally, suggest the ideal TARGET MARKET demographics:
- ageMin, ageMax (18-89)
- incomeMin, incomeMax (0-100 percentile)
- education ("any", "high_school", "some college", "bachelors", "graduate")
- wrkstat ("any", "full_time", "part_time", "retired", "student")

Respond ONLY with a valid JSON object:
{
  "value": 0.00,
  "risk": 0.00,
  "loss": 0.00,
  "justification": "A 1-2 sentence analysis of WHY these numbers were chosen relative to market benchmarks.",
  "market": { "ageMin": 18, "ageMax": 55, "incomeMin": 0, "incomeMax": 100, "education": "any", "wrkstat": "any" }
}`;

        const FREE_MODELS = [
            "meta-llama/llama-3.1-8b-instruct:free",
            "google/gemini-2.5-flash:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "nousresearch/hermes-3-llama-3.1-8b:free",
            "meta-llama/llama-3.2-3b-instruct:free",
            "openai/gpt-oss-120b:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "google/gemma-4-31b-it:free"
        ];

        let completionResult;
        try {
            completionResult = await generateChatCompletion({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: brief },
                ],
                temperature: 0.2,
                max_tokens: 400,
                timeoutMs: 8000,
                openRouterModels: FREE_MODELS
            });
        } catch (err: any) {
            console.error("auto-params upstream error:", err?.message);
            return NextResponse.json({ error: "Analysis service is busy. Please retry." }, { status: 502 });
        }

        let text: string = completionResult.text;

        // Clean up markdown blocks if the model disobeys
        text = text.replace(/```json\n?/, "").replace(/```\n?/, "").trim();

        const parsed = JSON.parse(text);

        // Coherence clamp: the LLM audit may refine the user's own risk/value
        // classification with evidence, but cannot silently flip it into a
        // mathematically-doomed scenario. Bounded to +/- MAX_DEVIATION from the
        // user's stated anchor when one was provided, otherwise a plain [0.01,0.99]
        // clamp. This is what stopped a "low risk" habit app from auditing to
        // risk=0.7/loss=0.55 and producing zero adoption regardless of population.
        const valueOut = clampToAnchor(Number(parsed.value), valueProp ? VALUE_PROP_ANCHOR[valueProp] : undefined, 0.5);
        const riskOut = clampToAnchor(Number(parsed.risk), riskLevel ? RISK_LEVEL_ANCHOR[riskLevel] : undefined, 0.4);
        const lossOut = clampToAnchor(Number(parsed.loss), riskLevel ? RISK_LEVEL_ANCHOR[riskLevel] * 0.8 : undefined, 0.2);

        return NextResponse.json({
            value: valueOut,
            risk: riskOut,
            loss: lossOut,
            justification: parsed.justification || "Calculated using high-fidelity market audit.",
            market: parsed.market || null,
        });
    } catch (err) {
        console.error("auto-params error:", err);
        return NextResponse.json({ error: "Failed to parse parameters" }, { status: 500 });
    }
}
