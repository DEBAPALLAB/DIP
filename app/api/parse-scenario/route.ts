import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const allKeys = (process.env.OPENROUTER_API_KEY || "")
      .split(",")
      .map((k) => k.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);

    if (allKeys.length === 0) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a strategic AI assistant for a decision intelligence platform.
The user will provide an unstructured description of their product/startup and target demographic.
Extract and deduce the following JSON structure exactly. If details are missing, make highly educated guesses. Only output raw valid JSON, no markdown formatting or backticks.

{
  "product": {
    "name": "string (the product name)",
    "price": "string (e.g. '$10/mo', 'Free', '$500')",
    "benefits": ["string", "string", "string"],
    "riskLevel": "low" | "medium" | "high",
    "valueProp": "weak" | "moderate" | "strong",
    "category": "string (e.g. Consumer Tech, B2B SaaS, Healthcare)",
    "competitorDensity": "low" | "medium" | "high",
    "switchingCost": "low" | "medium" | "high",
    "marketingBudget": "low" | "medium" | "high",
    "primaryChannel": "social" | "enterprise_sales" | "retail" | "word_of_mouth",
    "painPoints": ["string (e.g. expensive manual labor)", "string (e.g. complex onboarding)"],
    "regulatoryRisk": "low" | "medium" | "high"
  },
  "marketFilters": {
    "ageMin": number (minimum 18),
    "ageMax": number (maximum 89),
    "incomeMin": number (0 to 100 percentile),
    "incomeMax": number (0 to 100 percentile),
    "education": "any" | "high school" | "some college" | "bachelors" | "graduate",
    "wrkstat": "any" | "full-time" | "part-time" | "in school" | "retired"
  }
}`;

    const model = process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free";

    let response: Response | null = null;
    let lastError: string | null = null;

    for (const key of allKeys) {
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
          "HTTP-Referer": "https://strawberry-simulation.vercel.app",
          "X-Title": "Strawberry Strategic Sandbox",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.1
        })
      });

      if (response.ok) break;

      lastError = await response.text();
      console.warn(`OpenRouter parse-scenario failed with key ${key.slice(0, 10)}... [${response.status}]`);

      // If this looks like an auth / user issue, try the next key.
      if (response.status === 401 || response.status === 403) {
        continue;
      }

      // For other errors, don't churn through all keys unless it may be a transient server-side issue.
      if (response.status < 500) break;
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        {
          error: "Failed to parse scenario",
          details: lastError?.slice(0, 500) || "OpenRouter request failed",
          status: response?.status || 502,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("OpenRouter parse-scenario returned no content:", data);
      return NextResponse.json(
        { error: "Model returned no content", details: JSON.stringify(data).slice(0, 500) },
        { status: 502 }
      );
    }

    // Clean up potential markdown formatting if the model disobeys
    const jsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse scenario" },
      { status: 500 }
    );
  }
}
