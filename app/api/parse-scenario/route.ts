import { NextRequest, NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/ai";
import { guard, safeText } from "@/lib/apiGuard";

export async function POST(req: NextRequest) {
  const gate = await guard(req);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const prompt = safeText(body?.prompt, 4000);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY && !process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }

    // ─── LOCAL HEURISTIC FALLBACK PARSER (Guarantees 100% success when OpenRouter is rate-limited or offline) ───
    const runLocalHeuristics = (inputPrompt: string) => {
        const text = inputPrompt.toLowerCase();
        
        // Deduce Project Name
        let name = "Custom Project";
        const nameMatch = inputPrompt.match(/called\s+([A-Za-z0-9_#]+)/i) || 
                          inputPrompt.match(/named\s+([A-Za-z0-9_#]+)/i) ||
                          inputPrompt.match(/project\s+([A-Za-z0-9_#]+)/i) ||
                          inputPrompt.match(/making\s+([A-Za-z0-9_#]+)/i) ||
                          inputPrompt.match(/^([A-Za-z0-9_#]+)/);
        if (nameMatch && nameMatch[1]) {
            name = nameMatch[1];
        }

        // Deduce Price
        let price = "$19/mo";
        const priceMatch = inputPrompt.match(/(\$[0-9]+(?:\/[a-zA-Z]+)?)/);
        if (priceMatch) {
            price = priceMatch[1];
        } else if (text.includes("free")) {
            price = "Free";
        } else if (text.includes("enterprise") || text.includes("b2b")) {
            price = "$999/mo";
        }

        // Deduce Category
        let category = "Consumer App";
        if (text.includes("b2b") || text.includes("saas") || text.includes("enterprise") || text.includes("compliance") || text.includes("form")) {
            category = "B2B SaaS";
        } else if (text.includes("health") || text.includes("clinic") || text.includes("medical")) {
            category = "Healthcare";
        } else if (text.includes("game") || text.includes("play")) {
            category = "Gaming";
        } else if (text.includes("education") || text.includes("school") || text.includes("learn")) {
            category = "EdTech";
        }

        // Deduce Benefits
        const benefits = ["AI-powered modeling", "Streamlined GTM integration"];
        if (text.includes("security") || text.includes("soc2") || text.includes("compliance")) {
            benefits.push("SOC2 Compliant", "Automated Security Audit");
        }
        if (text.includes("beautiful") || text.includes("form") || text.includes("design")) {
            benefits.push("Futuristic visual templates", "High-performance layouts");
        }

        // Audience Filters
        let ageMin = 18;
        let ageMax = 89;
        let wrkstat = "any";
        let education = "any";
        let incomeMin = 0;
        let incomeMax = 100;

        if (text.includes("elderly") || text.includes("retired") || text.includes("senior")) {
            ageMin = 60;
            ageMax = 89;
            wrkstat = "retired";
        } else if (text.includes("young") || text.includes("teenager") || text.includes("student")) {
            ageMin = 18;
            ageMax = 25;
            wrkstat = "in school";
        } else if (text.includes("professional") || text.includes("b2b") || text.includes("corporate")) {
            ageMin = 25;
            ageMax = 65;
            wrkstat = "full-time";
            education = "bachelors";
            incomeMin = 40;
        }

        return {
            product: {
                name,
                price,
                benefits,
                riskLevel: text.includes("high") || text.includes("security") ? "high" : "medium",
                valueProp: text.includes("insane") || text.includes("strong") ? "strong" : "moderate",
                category,
                competitorDensity: "medium",
                switchingCost: text.includes("enterprise") ? "high" : "low",
                marketingBudget: "medium",
                primaryChannel: text.includes("b2b") ? "enterprise_sales" : "social",
                painPoints: ["Complex manual operations", "Inefficient standard tools"],
                regulatoryRisk: text.includes("compliance") || text.includes("health") ? "high" : "low"
            },
            marketFilters: {
                ageMin,
                ageMax,
                incomeMin,
                incomeMax,
                education,
                wrkstat
            }
        };
    };

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

    const FREE_MODELS = [
      "meta-llama/llama-3.1-8b-instruct:free",
      "google/gemini-2.5-flash:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "nousresearch/hermes-3-llama-3.1-8b:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "openai/gpt-oss-120b:free",
      "nvidia/nemotron-3-super-120b-a12b:free",
      "google/gemma-4-31b-it:free"
    ];

    let completionResult;
    try {
      completionResult = await generateChatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        timeoutMs: 8000,
        openRouterModels: FREE_MODELS
      });
    } catch (err: any) {
      console.warn("AI API calls failed. Activating heuristic local parsing fallback.", err.message);
      return NextResponse.json(runLocalHeuristics(prompt));
    }

    const rawContent = completionResult.text;

    try {
      if (!rawContent) {
        console.warn("AI API returned empty content. Activating heuristic local parsing fallback.");
        return NextResponse.json(runLocalHeuristics(prompt));
      }

      const jsonStr = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json(parsed);
    } catch (parseErr) {
      console.warn("AI content parsing failed. Activating heuristic local parsing fallback.", parseErr);
      return NextResponse.json(runLocalHeuristics(prompt));
    }
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse scenario" },
      { status: 500 }
    );
  }
}
