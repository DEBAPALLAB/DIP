import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, jobs } = body;

        if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ error: "AI API Key not configured." }, { status: 500 });
        }

        const prompt = `You are a semantic categorization engine.
The user is searching for agents in a simulation.
User query: "${query}"

Here is a list of unique job titles in the simulation:
${jobs.join(", ")}

Identify which of these job titles are semantically related to the user's query.
Return the results as a JSON array of strings containing ONLY the matching job titles from the list provided.
If no jobs match, return an empty array [].
Do not include any prose or explanation. Just the JSON array.`;

        let completionResult;
        try {
            completionResult = await generateChatCompletion({
                messages: [
                    { role: "system", content: "You are a precise semantic filter. You only output JSON arrays of strings." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.1,
                max_tokens: 1000,
                response_format: { type: "json_object" },
                timeoutMs: 30000,
                openRouterModel: process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free"
            });
        } catch (err: any) {
            console.error(`AI semantic-search failed:`, err.message);
            return NextResponse.json({ error: `AI Search Error: ${err.message}` }, { status: 502 });
        }

        const content = completionResult.text;
        
        let matches = [];
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) matches = parsed;
            else if (parsed.matches && Array.isArray(parsed.matches)) matches = parsed.matches;
            else if (typeof parsed === 'object') {
                const firstKey = Object.keys(parsed)[0];
                if (Array.isArray(parsed[firstKey])) matches = parsed[firstKey];
            }
        } catch (e) {
            const match = content.match(/\[[\s\S]*\]/);
            if (match) matches = JSON.parse(match[0]);
        }

        return NextResponse.json({ matches });
    } catch (err) {
        console.error("semantic-search error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
