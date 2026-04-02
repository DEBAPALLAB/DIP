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

        const systemPrompt = `You are an expert product analyst. Evaluate the following product brief and assign three adoption parameters from 0.00 to 1.00.

Preserve as much numeric precision as possible. Use high-resolution decimal values rather than rounding to coarse buckets.

1. value (Perceived Value): How compelling, useful, and beneficial is this product to the average consumer? (0.0 = useless, 1.0 = life-changing necessity)
2. risk (Risk Level): How financially, practically, or socially risky does adopting this feel? (0.0 = no risk/free, 1.0 = career/life-ending risk or immense cost)
3. loss (Loss Trigger): How much FOMO, penalty, or competitive disadvantage is there for NOT adopting? (0.0 = doesn't matter, 1.0 = massive penalty for missing out)

Additionally, suggest the ideal TARGET MARKET demographics:
- ageMin, ageMax (18-89)
- incomeMin, incomeMax (0-100 percentile)
- education (one of: "any", "high_school", "bachelors", "graduate")
- wrkstat (one of: "any", "full_time", "part_time", "retired", "student")

Respond ONLY with a valid JSON object in exactly this format, nothing else:
{
  "value": 0.65,
  "risk": 0.30,
  "loss": 0.15,
  "market": {
    "ageMin": 18,
    "ageMax": 55,
    "incomeMin": 30,
    "incomeMax": 100,
    "education": "any",
    "wrkstat": "any"
  }
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
                max_tokens: 100,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`OpenRouter error [${response.status}]:`, errText);
            return NextResponse.json({ error: "API error" }, { status: 502 });
        }

        const data = await response.json();
        let text: string = data.choices?.[0]?.message?.content ?? "{}";

        // Sometimes models wrap in markdown blocks
        text = text.replace(/```json\n?/, "").replace(/```\n?/, "").trim();

        const parsed = JSON.parse(text);

        return NextResponse.json({
            value: Number(parsed.value || 0.5),
            risk: Number(parsed.risk || 0.5),
            loss: Number(parsed.loss || 0.2),
            market: parsed.market || null,
        });
    } catch (err) {
        console.error("auto-params error:", err);
        return NextResponse.json({ error: "Failed to parse parameters" }, { status: 500 });
    }
}
