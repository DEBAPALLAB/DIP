import { supabase } from "./supabase";

/**
 * Drop-in replacement for `fetch` when calling our own /api/* routes.
 * Attaches the current Supabase access token as a Bearer header so the
 * server-side apiGuard can verify the session. Without this, every guarded
 * route returns 401.
 */
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    let token: string | undefined;
    try {
        const { data } = await supabase.auth.getSession();
        token = data.session?.access_token;
    } catch {
        token = undefined;
    }

    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return fetch(input, { ...init, headers });
}
