import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { brief } = await req.json();

        if (!brief) {
            return NextResponse.json({ error: "Missing brief" }, { status: 400 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
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

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://decision-intelligence.app",
                "X-Title": "Decision Intelligence Platform",
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-preview:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: brief },
                ],
                temperature: 0.2,
                max_tokens: 400,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter error [${response.status}]:`, errText);
            return NextResponse.json({ error: "API error" }, { status: 502 });
        }

        const data = await response.json();
        let text: string = data.choices?.[0]?.message?.content ?? "{}";

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
