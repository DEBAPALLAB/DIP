import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";
import { guard, safeText } from "@/lib/apiGuard";

export async function POST(req: NextRequest) {
    const gate = await guard(req);
    if (!gate.ok) return gate.response;

    try {
        const body = await req.json();
        const brief = safeText(body?.brief, 4000);

        if (!brief) {
            return NextResponse.json({ error: "Missing or invalid brief." }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "Service temporarily unavailable." }, { status: 503 });
        }

        const systemPrompt = `You are a Global Strategic Audit Engine. Evaluate the product brief against 2024-2025 real-world market contexts. 
Do NOT use fixed benchmarks. Use your internal knowledge of category pricing (e.g., "$399/mo for an EV is extremely efficient," while "$399/mo for an email app is an extreme luxury risk").

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

        return NextResponse.json({
            value: Number(parsed.value || 0.5),
            risk: Number(parsed.risk || 0.5),
            loss: Number(parsed.loss || 0.2),
            justification: parsed.justification || "Calculated using high-fidelity market audit.",
            market: parsed.market || null,
        });
    } catch (err) {
        console.error("auto-params error:", err);
        return NextResponse.json({ error: "Failed to parse parameters" }, { status: 500 });
    }
}
