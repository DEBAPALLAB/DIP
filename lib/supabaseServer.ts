import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client used ONLY to verify bearer tokens and read
 * server-trusted data inside API routes. Uses the anon key (RLS still applies);
 * we do not ship the service-role key into the app runtime.
 *
 * Fails loudly if env is missing — an auth gate that silently degrades to a
 * placeholder client is worse than no gate at all (see SECURITY_AUDIT.md F7).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
    if (!url || !anonKey || url.includes("placeholder")) {
        throw new Error(
            "Supabase server client not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
    }
    if (!_client) {
        _client = createClient(url, anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return _client;
}

/**
 * Verifies a Supabase access token and returns the user, or null if invalid.
 */
export async function getUserFromToken(token: string) {
    try {
        const supabase = getServerSupabase();
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) return null;
        return data.user;
    } catch {
        return null;
    }
}
