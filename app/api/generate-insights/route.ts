import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productName, productBrief, adoptionPct, consensusScore, personaBreakdown, topSupportQuotes, topOpposeQuotes } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
        }

        const insightPrompt = `You are a market research analyst.
A product simulation has completed. Here are the results:

Product: ${productName}
${productBrief}

Results:
- Adoption rate: ${adoptionPct}%
- Consensus score: ${consensusScore}
- Persona breakdown: ${JSON.stringify(personaBreakdown)}

Top agent reasoning (supporting):
${(topSupportQuotes || []).map((q: { agent: string; persona: string; reasoning: string }) => `- ${q.agent} (${q.persona}): "${q.reasoning}"`).join("\n")}

Top agent reasoning (opposing):
${(topOpposeQuotes || []).map((q: { agent: string; persona: string; reasoning: string }) => `- ${q.agent} (${q.persona}): "${q.reasoning}"`).join("\n")}

Write a concise strategic analysis with exactly 3 sections:
PRIMARY BARRIER: [one sentence identifying the main objection]
PRIMARY DRIVER: [one sentence identifying what's driving support]
RECOMMENDATION: [one actionable sentence for the product team]

Be specific. Reference actual personas and reasoning from the data. No fluff.`;

        // ─── Retry Logic ───
        let response: Response | null = null;
        let lastError: any = null;
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for insights (longer prompt)

                response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://decision-intelligence.app",
                        "X-Title": "Decision Intelligence Platform",
                    },
                    body: JSON.stringify({
                        model: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
                        messages: [
                            { role: "system", content: "You are a senior market research analyst. Write concisely and specifically. Always use the exact format requested." },
                            { role: "user", content: insightPrompt },
                        ],
                        max_tokens: 400,
                        temperature: 0.5,
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) break;
                
                const errText = await response.text();
                lastError = new Error(`HTTP ${response.status}: ${errText}`);
                if (response.status >= 400 && response.status < 500) break;

            } catch (err: any) {
                lastError = err;
            }

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt)));
            }
        }

        if (!response || !response.ok) {
            console.error(`OpenRouter insights failed:`, lastError?.message);
            return NextResponse.json(
                { error: `OpenRouter error: ${lastError?.message}` },
                { status: 502 }
            );
        }

        const data = await response.json();
        const text: string = data.choices?.[0]?.message?.content ?? "";

        return NextResponse.json({ insights: text.trim() });
    } catch (err) {
        console.error("generate-insights error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
