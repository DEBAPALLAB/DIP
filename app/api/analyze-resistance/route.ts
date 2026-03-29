import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { logs, currentStep, scenarioLabel } = await req.json();
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
        }

        // Filter for opposition in the current step
        const stepLogs = logs.filter((l: any) => l.step === currentStep && l.decision === "oppose");
        const reasoningSamples = stepLogs.slice(0, 15).map((l: any) => `- "${l.reasoning}"`).join("\n");

        if (stepLogs.length === 0) {
            return NextResponse.json({ insight: "No significant resistance detected in this step. Population is either supportive or neutral." });
        }

        const systemPrompt = `You are a Strategic Market Analyst. 
Analyze these 15 verbatim responses from people who chose to OPPOSE "${scenarioLabel}".
Identify the TOP 2 root causes of resistance (e.g., Price, Trust, Switching Cost).
Synthesize them into 1-2 punchy, professional sentences that help a product manager understand the bottleneck.`;

        const userPrompt = `VERBATIMS FROM STEP ${currentStep}:\n${reasoningSamples}`;

        const response = await fetch("https://openrouter.ai/ai/v1/chat/completions", {
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
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 150,
                temperature: 0.5,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`OpenRouter error: ${err}`);
        }

        const data = await response.json();
        const insight = data.choices?.[0]?.message?.content ?? "Unable to synthesize insights at this time.";

        return NextResponse.json({ insight });
    } catch (err) {
        console.error("Analysis error:", err);
        return NextResponse.json({ error: "Failed to generate AI insight" }, { status: 500 });
    }
}
