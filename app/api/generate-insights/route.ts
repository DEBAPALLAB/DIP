import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productName, productBrief, adoptionPct, consensusScore, personaBreakdown, topSupportQuotes, topOpposeQuotes } = body;

        if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "AI API Key not configured." }, { status: 500 });
        }

        const insightPrompt = `You are a high-level strategic advisor.
A product simulation has completed with the following data:

Product: ${productName}
Context: ${productBrief}

MARKET PERFORMANCE:
- Final Adoption: ${adoptionPct}%
- Consensus Score: ${consensusScore}
- Persona Balance: ${JSON.stringify(personaBreakdown)}

USER FEEDBACK (POSITIVE):
${(topSupportQuotes || []).slice(0,3).map((q: any) => `- "${q.reasoning}"`).join("\n")}

USER FEEDBACK (NEGATIVE):
${(topOpposeQuotes || []).slice(0,3).map((q: any) => `- "${q.reasoning}"`).join("\n")}

Provide a definitive market signal in exactly 3 sections.
IMPORTANT: Each section must be a SINGLE, COMPLETE, HIGH-DENSITY sentence.
Do NOT repeat the section labels ("PRIMARY BARRIER", etc.) inside your explanation text.

PRIMARY BARRIER: [Identify the single biggest point of friction]
PRIMARY DRIVER: [Identify the most compelling value proposition]
RECOMMENDATION: [One concrete, high-impact tactical shift]`;

        let completionResult;
        try {
            completionResult = await generateChatCompletion({
                messages: [
                    { role: "system", content: "You are a senior market research analyst. Write concisely and specifically. Always use the exact format requested." },
                    { role: "user", content: insightPrompt },
                ],
                temperature: 0.5,
                max_tokens: 600,
                timeoutMs: 90000,
                openRouterModel: "openrouter/free" // Intelligent auto-router
            });
        } catch (err: any) {
            console.error(`AI insights failed:`, err.message);
            return NextResponse.json(
                { error: `AI error: ${err.message}` },
                { status: 502 }
            );
        }

        const text: string = completionResult.text;

        return NextResponse.json({ insights: text.trim() });
    } catch (err) {
        console.error("generate-insights error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
