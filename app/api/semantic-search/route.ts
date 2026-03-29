import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, jobs } = body;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });
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

        // ─── Retry Logic ───
        let response: Response | null = null;
        let lastError: any = null;
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for semantic search (fast)

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
                            { role: "system", content: "You are a precise semantic filter. You only output JSON arrays of strings." },
                            { role: "user", content: prompt },
                        ],
                        max_tokens: 1000,
                        temperature: 0.1,
                        response_format: { type: "json_object" }
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
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
            }
        }

        if (!response || !response.ok) {
            console.error(`OpenRouter semantic-search failed:`, lastError?.message);
            return NextResponse.json({ error: `AI Search Error: ${lastError?.message}` }, { status: 502 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content ?? "[]";
        
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
