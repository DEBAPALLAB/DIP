import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "./supabaseServer";
import { rateLimit } from "./rateLimit";

/**
 * Single enforcement boundary for paid API routes (see SECURITY_AUDIT.md).
 *
 * Order of checks (cheapest / most-abusive-first):
 *   1. Same-origin   — reject cross-site callers.
 *   2. IP rate limit — stops a flood before we touch auth/Supabase.
 *   3. Session       — must present a valid Supabase bearer token.
 *   4. Beta approval — must be an approved beta user.
 *   5. Per-user rate limit — fair-use cap per approved account.
 *
 * Only after all five pass does the route make a paid AI call.
 */

export interface GuardContext {
    userId: string;
    email: string | undefined;
    tier: string;
}

type GuardResult =
    | { ok: true; ctx: GuardContext }
    | { ok: false; response: NextResponse };

// Per-window limits. Tune as needed.
const IP_LIMIT = 40; // requests
const IP_WINDOW_MS = 60_000; // per minute (pre-auth, blocks floods)
const USER_LIMIT = 30; // requests
const USER_WINDOW_MS = 60_000; // per minute per approved user

function allowedOrigins(): string[] {
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://notaprompt.in";
    const list = [site, "https://notaprompt.in", "https://www.notaprompt.in"];
    if (process.env.NODE_ENV !== "production") {
        list.push("http://localhost:3000", "http://127.0.0.1:3000");
    }
    return list;
}

function clientIp(req: NextRequest): string {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

function deny(status: number, message: string, extraHeaders?: Record<string, string>) {
    return NextResponse.json({ error: message }, { status, headers: extraHeaders });
}

export async function guard(req: NextRequest): Promise<GuardResult> {
    // 1. Same-origin enforcement (CSRF / cross-site abuse).
    const origin = req.headers.get("origin");
    if (origin && !allowedOrigins().includes(origin)) {
        return { ok: false, response: deny(403, "Cross-origin requests are not allowed.") };
    }

    // 2. IP rate limit (pre-auth flood protection).
    const ip = clientIp(req);
    const ipRl = rateLimit(`ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipRl.allowed) {
        return {
            ok: false,
            response: deny(429, "Too many requests. Please slow down.", {
                "Retry-After": String(ipRl.retryAfterSec),
            }),
        };
    }

    // 3. Session verification.
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
        return { ok: false, response: deny(401, "Authentication required.") };
    }
    const user = await getUserFromToken(token);
    if (!user) {
        return { ok: false, response: deny(401, "Invalid or expired session.") };
    }

    // 4. Beta approval. We trust the user_metadata flags set at approval time.
    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const approved = meta.beta_approved === true || meta.beta_status === "approved";
    if (!approved) {
        return {
            ok: false,
            response: deny(403, "Your account is on the beta waitlist and not yet approved."),
        };
    }

    // 5. Per-user rate limit.
    const userRl = rateLimit(`user:${user.id}`, USER_LIMIT, USER_WINDOW_MS);
    if (!userRl.allowed) {
        return {
            ok: false,
            response: deny(429, "Rate limit reached. Please wait a moment.", {
                "Retry-After": String(userRl.retryAfterSec),
            }),
        };
    }

    return {
        ok: true,
        ctx: {
            userId: user.id,
            email: user.email,
            tier: (meta.tier as string) || "explorer",
        },
    };
}

/**
 * Validates a free-text field: present, a string, and within a length cap.
 * Returns the trimmed value or null (caller rejects on null).
 */
export function safeText(value: unknown, maxLen: number): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (trimmed.length === 0 || trimmed.length > maxLen) return null;
    return trimmed;
}

/** Validates an array of strings within count + per-item length caps. */
export function safeStringArray(value: unknown, maxItems: number, maxItemLen: number): string[] | null {
    if (!Array.isArray(value)) return null;
    if (value.length > maxItems) return null;
    const out: string[] = [];
    for (const v of value) {
        if (typeof v !== "string" || v.length > maxItemLen) return null;
        out.push(v);
    }
    return out;
}
