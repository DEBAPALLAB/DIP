export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ChatCompletionOptions {
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: "json_object" };
    timeoutMs?: number;
    openRouterModel?: string;      // Specific single model for OpenRouter
    openRouterModels?: string[];    // Array of fallback models for OpenRouter (e.g. for free key rotation)
}

export interface ChatCompletionResult {
    text: string;
    model: string;
    source: "openai" | "openrouter";
}

export async function generateChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResult> {
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKeyStr = process.env.OPENROUTER_API_KEY || "";
    
    // Clean OpenRouter keys
    const allOpenRouterKeys = openrouterKeyStr
        .split(",")
        .map(k => k.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);

    // 1. Direct OpenAI API path (preferred/primary if key is present)
    if (openaiKey) {
        const apiKey = openaiKey.trim().replace(/^["']|["']$/g, "");
        const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
        const apiBase = process.env.OPENAI_API_BASE || "https://api.openai.com/v1";
        const timeout = options.timeoutMs || 15000;
        
        console.log(`[AI_CLIENT] Using OpenAI-compatible API at: ${apiBase} with model: ${model}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const bodyPayload: any = {
                model,
                messages: options.messages,
                temperature: options.temperature ?? 0.3,
            };
            if (options.max_tokens) bodyPayload.max_tokens = options.max_tokens;
            if (options.response_format) bodyPayload.response_format = options.response_format;

            const res = await fetch(`${apiBase}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify(bodyPayload),
                signal: controller.signal,
            });
            
            clearTimeout(timeoutId);

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`OpenAI HTTP error ${res.status}: ${errText}`);
            }

            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (content === undefined || content === null) {
                throw new Error("OpenAI API returned empty completion choices.");
            }
            return {
                text: content,
                model,
                source: "openai",
            };
        } catch (err: any) {
            console.error(`[AI_CLIENT] OpenAI API call failed: ${err.message}`);
            // If OpenAI fails and there are OpenRouter keys, we can fallback to OpenRouter!
            if (allOpenRouterKeys.length === 0) {
                throw err;
            }
            console.log(`[AI_CLIENT] Falling back to OpenRouter...`);
        }
    }

    // 2. OpenRouter fallback path (or primary if no OpenAI key)
    if (allOpenRouterKeys.length === 0) {
        throw new Error("No API keys configured. Set OPENAI_API_KEY or OPENROUTER_API_KEY.");
    }

    const models = options.openRouterModels || 
                   (options.openRouterModel ? [options.openRouterModel] : ["google/gemini-2.5-flash:free"]);

    let lastError: string | null = null;
    
    // We try the models in sequence or fallback
    for (let i = 0; i < models.length; i++) {
        const currentModel = models[i];
        const currentKey = allOpenRouterKeys[i % allOpenRouterKeys.length];
        const timeout = options.timeoutMs || 10000;

        console.log(`[AI_CLIENT] Attempting OpenRouter with model: ${currentModel}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const bodyPayload: any = {
                model: currentModel,
                messages: options.messages,
                temperature: options.temperature ?? 0.3,
            };
            if (options.max_tokens) bodyPayload.max_tokens = options.max_tokens;
            if (options.response_format) bodyPayload.response_format = options.response_format;

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${currentKey}`,
                    "HTTP-Referer": "https://strawberry-platform.vercel.app",
                    "X-Title": "Strawberry Decision Platform",
                },
                body: JSON.stringify(bodyPayload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                const content = data.choices?.[0]?.message?.content;
                if (content !== undefined && content !== null) {
                    return {
                        text: content,
                        model: currentModel,
                        source: "openrouter",
                    };
                }
            }

            lastError = await res.text();
            console.warn(`[AI_CLIENT] OpenRouter ${currentModel} failed: [${res.status}] - ${lastError.slice(0, 150)}`);
        } catch (err: any) {
            lastError = err.message || String(err);
            console.warn(`[AI_CLIENT] OpenRouter ${currentModel} error: ${lastError}`);
        }
    }

    throw new Error(`All attempts failed. Last error: ${lastError}`);
}
