-- ════════════════════════════════════════════════════════════════
-- Beta Waitlist + Invite Codes — run this WHOLE file in the
-- Supabase SQL editor (Dashboard → SQL Editor → New query → paste → Run).
-- This file is pure SQL. Do NOT paste the .md docs into the SQL editor.
-- ════════════════════════════════════════════════════════════════

-- ─── 1. Waitlist table ───────────────────────────────────────────
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
drop policy if exists "anyone can join waitlist" on public.beta_waitlist;
create policy "anyone can join waitlist"
  on public.beta_waitlist
  for insert
  to anon, authenticated
  with check (true);
-- No SELECT policy → the list is private (read it from the dashboard).

-- ─── 2. Invite codes table ───────────────────────────────────────
create table if not exists public.invite_codes (
  code        text primary key,                 -- e.g. 'FOUNDER-7QK2'
  tier        text not null default 'research',
  max_uses    int  not null default 1,
  used_count  int  not null default 0,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.invite_codes enable row level security;
-- No anon/authenticated policies → table is fully private.

-- ─── 3. Redeem RPC (validates + consumes a code atomically) ──────
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

  update beta_waitlist set status = 'approved' where email = lower(p_email);

  return jsonb_build_object('valid', true, 'tier', v_row.tier);
end;
$$;

grant execute on function public.redeem_invite_code(text, text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- DONE. To create an invite code later, run (separately):
--   insert into public.invite_codes (code, tier, max_uses, note)
--   values ('FOUNDER-7QK2', 'research', 1, 'Jane @ Acme');
-- ════════════════════════════════════════════════════════════════
