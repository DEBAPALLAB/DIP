# Beta Waitlist + Invite Codes — Setup

This is the data layer for the beta gate. Run the SQL below in your **Supabase SQL editor** once. It creates two tables and one secure RPC, all with Row Level Security.

> **Model:** Waitlist + invite codes.
> - Anyone can **join the waitlist** (email captured, status `pending`). They cannot log in or call any paid API.
> - You **approve** a waitlister manually (or hand a **founder/agency an invite code**) to grant access.
> - The app's API routes only run paid AI calls for users whose account is `beta_approved`.

---

## How approval actually grants access

The API guard (`lib/apiGuard.ts`) checks the Supabase user's `user_metadata` for `beta_approved === true`. So "approving" someone means setting that flag on their **auth user**. Two ways:

1. **Invite code (instant, self-serve for the invited person):** you create a code, give it to a founder/agency, they register with it, and `redeem_invite_code` returns the tier — the app creates their account already flagged `beta_approved`.

2. **Manual approval of a waitlister:** when you're ready to let a waitlist email in, send them a Supabase invite / set their metadata. The simplest path during beta is to give approved waitlisters an invite code too (one mechanism to maintain).

---

## SQL — run once in Supabase

```sql
-- ─────────────────────────────────────────────────────────────
-- 1. Waitlist table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.beta_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  first_name  text,
  last_name   text,
  company     text,
  role        text,
  use_case    text,
  source      text default 'waitlist',          -- 'waitlist' | 'founder' | 'agency'
  status      text not null default 'pending',  -- 'pending' | 'approved' | 'rejected'
  created_at  timestamptz not null default now()
);

alter table public.beta_waitlist enable row level security;

-- Anonymous visitors may INSERT a waitlist row (join), but cannot read the list.
create policy "anyone can join waitlist"
  on public.beta_waitlist
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT policy for anon/authenticated → the list is private.
-- You read it from the Supabase dashboard (service role bypasses RLS).

-- ─────────────────────────────────────────────────────────────
-- 2. Invite codes table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.invite_codes (
  code        text primary key,                 -- e.g. 'FOUNDER-7QK2'
  tier        text not null default 'research', -- tier to grant on redeem
  max_uses    int  not null default 1,
  used_count  int  not null default 0,
  note        text,                             -- who it's for
  created_at  timestamptz not null default now()
);

alter table public.invite_codes enable row level security;
-- No anon/authenticated policies → table is fully private.
-- The redeem RPC below runs as SECURITY DEFINER so it can read/update it.

-- ─────────────────────────────────────────────────────────────
-- 3. Redeem RPC (validates + consumes a code atomically)
-- ─────────────────────────────────────────────────────────────
create or replace function public.redeem_invite_code(p_code text, p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row invite_codes%rowtype;
begin
  select * into v_row from invite_codes where code = upper(p_code) for update;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;

  if v_row.used_count >= v_row.max_uses then
    return jsonb_build_object('valid', false, 'reason', 'exhausted');
  end if;

  update invite_codes set used_count = used_count + 1 where code = v_row.code;

  -- optional: mark the matching waitlist row approved
  update beta_waitlist set status = 'approved'
    where email = lower(p_email);

  return jsonb_build_object('valid', true, 'tier', v_row.tier);
end;
$$;

grant execute on function public.redeem_invite_code(text, text) to anon, authenticated;
```

---

## Creating invite codes (founders / agencies)

In the Supabase SQL editor, when you want to give someone direct access:

```sql
insert into public.invite_codes (code, tier, max_uses, note)
values ('FOUNDER-7QK2', 'research', 1, 'Jane @ Acme - inbound from LinkedIn');

-- An agency code that 5 people can redeem at the higher tier:
insert into public.invite_codes (code, tier, max_uses, note)
values ('AGENCY-NEBULA', 'agency', 5, 'Nebula Studio pilot');
```

Hand the `code` to the person. They go to `/register`, enter it with their email + password, and land in the app already approved at the granted tier.

---

## Reading / approving the waitlist

The list is private (no SELECT policy). View and manage it from the **Supabase dashboard → Table editor → beta_waitlist**, where the service role bypasses RLS. To approve someone, either:
- issue them an invite code (above), or
- (later, optional) build an admin route using the service-role key on a protected server endpoint.

---

## Important Supabase auth settings

- **Disable open email confirmation friction as you prefer**, but keep in mind: with the invite-code flow, accounts are created already `beta_approved`. If you leave "Confirm email" ON in Supabase Auth settings, invited users must confirm before they get a session — that's fine and slightly safer.
- **Verify RLS is ON** for `simulations` and any table holding user data (SECURITY_AUDIT.md action item). The anon key is public; RLS is the only thing isolating users' data.

---

*Living document. Update as the approval flow evolves.*
