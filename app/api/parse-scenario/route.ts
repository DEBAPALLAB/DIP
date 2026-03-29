import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // fast, cheap, smart JSON output model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

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
