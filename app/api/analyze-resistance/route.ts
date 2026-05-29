import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const { logs, currentStep, scenarioLabel } = await req.json();
        if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "AI API Key not configured." }, { status: 500 });
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

        let completionResult;
        try {
            completionResult = await generateChatCompletion({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 150,
                temperature: 0.5,
                openRouterModel: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free"
            });
        } catch (err: any) {
            throw new Error(`AI error: ${err.message}`);
        }

        const insight = completionResult.text || "Unable to synthesize insights at this time.";

        return NextResponse.json({ insight });
    } catch (err) {
        console.error("Analysis error:", err);
        return NextResponse.json({ error: "Failed to generate AI insight" }, { status: 500 });
    }
}
