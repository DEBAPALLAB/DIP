/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: state lives in the process and is per-instance. On serverless
 * (Vercel) it resets on cold starts and is not shared across instances.
 * This is adequate for beta scale to stop casual abuse / quota draining.
 * For production scale, migrate to Upstash Redis or a Supabase table.
 * (Tracked in SECURITY_AUDIT.md follow-ups.)
 */

interface Window {
    hits: number[];
}

const store = new Map<string, Window>();

// Periodic cleanup so the map doesn't grow unbounded.
let lastSweep = Date.now();
function sweep(now: number, windowMs: number) {
    if (now - lastSweep < 60_000) return;
    lastSweep = now;
    for (const [key, win] of store.entries()) {
        win.hits = win.hits.filter((t) => now - t < windowMs);
        if (win.hits.length === 0) store.delete(key);
    }
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSec: number;
}

/**
 * Records a hit for `key` and returns whether it's within `limit`
 * requests per `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    sweep(now, windowMs);

    let win = store.get(key);
    if (!win) {
        win = { hits: [] };
        store.set(key, win);
    }

    // Drop hits outside the window.
    win.hits = win.hits.filter((t) => now - t < windowMs);

    if (win.hits.length >= limit) {
        const oldest = win.hits[0];
        const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
        return { allowed: false, remaining: 0, retryAfterSec };
    }

    win.hits.push(now);
    return { allowed: true, remaining: limit - win.hits.length, retryAfterSec: 0 };
}
