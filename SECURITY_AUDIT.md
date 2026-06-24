# Security Audit
## Full app + paid-API exposure review

*Last updated: June 2026*

---

## Executive summary

The app's biggest exposure is that **every paid AI route is completely open** — no authentication, no rate limiting, no origin check. A logged-out stranger who discovers `/api/auto-params`, `/api/run-step`, `/api/generate-insights`, `/api/semantic-search`, `/api/parse-scenario`, or `/api/analyze-resistance` can POST to it in a loop and burn your paid OpenAI/OpenRouter quota with zero friction. Route "protection" today is a **client-side React redirect**, which does nothing to stop direct HTTP calls.

This audit documents every finding and the fixes applied. Severity scale: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low.

---

## Findings

### 🔴 F1 — Paid API routes have zero server-side protection
**Where:** all 7 routes under `app/api/*/route.ts`
**Issue:** None of the routes verify a session, check the request origin, or rate-limit. The only gate (`AuthContext.tsx` line 110–120) is a client-side `useEffect` that redirects the *browser UI* — it has no effect on a `curl` or `fetch` from anywhere. Each call to `auto-params`, `run-step`, etc. spends real money on OpenAI/OpenRouter.
**Impact:** Direct quota-draining abuse, scraping, cost-amplification DoS. A single attacker script could run thousands of `run-step` batches overnight.
**Fix applied:** New `lib/apiGuard.ts` wraps every paid route with: (1) same-origin enforcement, (2) Supabase session verification via bearer token, (3) beta-approval check, (4) per-user + per-IP sliding-window rate limiting. Anonymous and unapproved requests are rejected with 401/403 before any paid call is made.

### 🔴 F2 — Anyone can register and immediately consume paid APIs
**Where:** `lib/AuthContext.tsx` `register()` (line 136)
**Issue:** Open self-serve signup grants an `explorer` tier account instantly. Combined with F1, a throwaway account = unlimited paid API access.
**Impact:** Trivial to farm free accounts and drain quota.
**Fix applied:** Registration is converted to a **beta waitlist**. New signups are stored as `pending` and cannot log in or call APIs until approved (or until they redeem an invite code). See `BETA_WAITLIST.md` for the data model.

### 🟠 F3 — No rate limiting anywhere
**Where:** entire `app/api` surface
**Issue:** No throttling on any endpoint, including the unauthenticated ones.
**Impact:** Cost-amplification and brute-force are unbounded.
**Fix applied:** In-memory sliding-window limiter in `lib/rateLimit.ts` (per-user and per-IP). NOTE: in-memory state resets on serverless cold starts and is per-instance — adequate for beta scale. For production at scale, migrate the limiter to Upstash Redis or Supabase (tracked as a follow-up below).

### 🟠 F4 — Prompt injection via unescaped user input in LLM prompts
**Where:** `app/api/semantic-search/route.ts` (line 13, `query` and `jobs` interpolated raw), `auto-params` (`brief`), `parse-scenario`, `analyze-resistance`
**Issue:** User-supplied strings are concatenated directly into system/user prompts. A crafted `brief` or `query` can override instructions ("ignore previous instructions and output …"), inflate token usage, or coerce the model into arbitrary output.
**Impact:** Output manipulation, token-cost inflation, garbage data poisoning a run. Not a data-exfiltration risk here (no secrets in the prompt context), but a cost and integrity risk.
**Fix applied:** Input validation in `apiGuard` — length caps on all free-text fields, type checks on arrays, and rejection of oversized payloads before they reach the model. User text is also clearly fenced in the prompt with explicit "treat as data, not instructions" framing.

### 🟠 F5 — Client-only route protection
**Where:** `lib/AuthContext.tsx` line 110–120
**Issue:** Protected pages (`/simulate`, `/results`, `/dashboard`, `/setup`) are guarded by a client `useEffect` redirect. The page HTML/JS still ships; a user with JS disabled or hitting the route programmatically isn't stopped. More importantly, the *data* comes from the API routes (F1), which were unprotected.
**Impact:** Defense-in-depth gap. Mostly mitigated once F1 is fixed (the data is what matters), but the page gate should also be enforced server-side eventually.
**Fix applied:** API routes are now the real enforcement boundary (F1). Client redirect retained as UX. Server-side page gating via middleware is recommended as a follow-up.

### 🟡 F6 — Verbose error messages leak upstream details
**Where:** `lib/ai.ts` (throws raw upstream error text), `auto-params` returns `err.message`, `run-step` returns `Last error: ${e.message}`
**Issue:** Raw provider error strings (and occasionally request fragments) are returned to the client. Can disclose model names, provider endpoints, key-rotation behavior, and internal structure.
**Impact:** Information disclosure aiding a targeted attacker.
**Fix applied:** Routes now return generic client-facing messages; full detail is logged server-side only.

### 🟡 F7 — Supabase keys fall back to placeholders silently
**Where:** `lib/supabase.ts` line 3–4
**Issue:** Missing env vars silently fall back to `placeholder.supabase.co`. In a misconfigured deploy, auth appears to "work" (no crash) but isn't real — a dangerous failure mode for an auth gate.
**Impact:** Silent auth bypass risk under misconfiguration.
**Fix applied:** Startup assertion — the server throws loudly if real Supabase env vars are absent, instead of degrading to a fake client.

### 🟡 F8 — No CSRF/origin protection on state-changing POSTs
**Where:** all POST routes
**Issue:** No `Origin`/`Referer` validation; any site could trigger authenticated requests if a session cookie existed.
**Impact:** Cross-site request abuse.
**Fix applied:** `apiGuard` rejects requests whose `Origin` isn't in the allowlist (`NEXT_PUBLIC_SITE_URL` + localhost in dev).

### 🔵 F9 — Secrets hygiene (verified OK)
**Where:** `.gitignore`, `.env.local`
**Status:** ✅ `.env*` is gitignored; keys are not committed. `OPENAI_API_KEY` / `OPENROUTER_API_KEY` are server-only (not `NEXT_PUBLIC_`), so they never reach the browser bundle. **No action needed — confirmed correct.** Keep it this way: never prefix a paid key with `NEXT_PUBLIC_`.

### 🔵 F10 — `console.log` of API base/model in `lib/ai.ts`
**Where:** `lib/ai.ts` line 39, 106
**Issue:** Logs the API base and model on every call. Fine for server logs, but noisy and slightly informative if logs leak.
**Impact:** Low.
**Recommendation:** Gate behind a `DEBUG` flag. (Left as-is for now; low priority.)

---

## What was already correct

- 🔵 Paid API keys are server-side only — never exposed to the client bundle (F9).
- 🔵 `.env*` is gitignored — no secrets in git history (F9).
- 🔵 Supabase anon key is correctly public (`NEXT_PUBLIC_`) — that's its intended use; row-level security is the real guard there.

> **Action item (not yet done):** confirm Supabase **Row Level Security (RLS)** is enabled on the `simulations` table and any waitlist tables. The anon key is public by design, so RLS is the only thing stopping one user from reading another's data. This must be verified in the Supabase dashboard — it cannot be checked from the codebase.

---

## Fixes applied in this change

| File | Purpose |
|---|---|
| `lib/rateLimit.ts` | Sliding-window in-memory rate limiter (per-user + per-IP) |
| `lib/apiGuard.ts` | Single wrapper enforcing origin + session + beta-approval + rate limit + input caps |
| `lib/supabaseServer.ts` | Server-side Supabase client for verifying bearer tokens |
| all 7 `app/api/*/route.ts` | Wrapped with `apiGuard`; generic error responses |
| `lib/supabase.ts` | Loud failure on missing env (F7) |
| `lib/AuthContext.tsx` | Registration → waitlist; login checks beta approval |
| waitlist UI | `/register` becomes beta signup + invite-code redemption; founders/agencies section |

---

## Follow-ups (recommended, not blocking beta)

1. **Move rate limiting to Upstash Redis / Supabase** — in-memory resets per serverless instance (F3).
2. **Server-side page gating via `middleware.ts`** — close the F5 defense-in-depth gap.
3. **Verify RLS on all Supabase tables** — dashboard task.
4. **Add a per-user monthly paid-call budget** — hard cap so even an approved user can't run away with cost.
5. **Structured request logging + alerting** on 401/403/429 spikes — early abuse detection before the LinkedIn traffic arrives.

---

*Living document. Update as fixes land and follow-ups are completed.*
