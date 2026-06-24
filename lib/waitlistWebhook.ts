/**
 * Mirrors beta / waitlist submissions to the Superforms webhook so you get a
 * dashboard of responses in addition to the Supabase beta_waitlist table.
 *
 * Best-effort: never throws. A webhook hiccup must not block the user's signup
 * (Supabase remains the source of truth). Failures are logged to the console.
 */
const WEBHOOK_URL = "https://www.superforms.in/api/submit/ed09f5d6-3d09-4fd9-9c3c-652cf72b4baf";

export interface WaitlistSubmission {
    email: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    role?: string;
    use_case?: string;
    source?: string;
}

export async function sendToWaitlistWebhook(data: WaitlistSubmission): Promise<void> {
    try {
        const params = new URLSearchParams();
        params.append("email", data.email);
        if (data.first_name) params.append("first_name", data.first_name);
        if (data.last_name) params.append("last_name", data.last_name);
        if (data.company) params.append("company", data.company);
        if (data.role) params.append("role", data.role);
        if (data.use_case) params.append("use_case", data.use_case);
        if (data.source) params.append("source", data.source);
        params.append("submitted_at", new Date().toISOString());

        await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Waitlist webhook failed (non-blocking):", err);
    }
}
