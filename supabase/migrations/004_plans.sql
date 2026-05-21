-- Plan config (admin-editable limits)
create table if not exists public.plan_config (
  key text primary key,
  value text not null,
  description text,
  updated_at timestamptz default now()
);

insert into public.plan_config (key, value, description) values
  ('free_daily_journal_limit', '5', 'Free plan: max journal entries per day'),
  ('free_daily_analysis_limit', '1', 'Free plan: max analysis runs per day'),
  ('free_analysis_days', '7', 'Free plan: days of history for analysis'),
  ('pro_price_krw', '9900', 'Pro plan monthly price in KRW'),
  ('trial_days', '7', 'Free trial duration in days')
on conflict (key) do nothing;

alter table public.plan_config enable row level security;
create policy "plan_config_read" on public.plan_config for select using (true);
create policy "plan_config_write" on public.plan_config for all using (true);
grant all on public.plan_config to anon, authenticated;

-- Analysis run tracking
create table if not exists public.analysis_runs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  run_at timestamptz default now(),
  asset_type text,
  period text
);

alter table public.analysis_runs enable row level security;
create policy "analysis_runs_own" on public.analysis_runs
  for all using (auth.uid() = user_id);
grant all on public.analysis_runs to anon, authenticated;

-- User plan/trial info
create table if not exists public.user_plans (
  user_id uuid references auth.users(id) on delete cascade primary key,
  plan text not null default 'trial' check (plan in ('free', 'pro', 'trial')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  pro_started_at timestamptz,
  pro_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_plans enable row level security;
create policy "user_plans_own" on public.user_plans
  for all using (auth.uid() = user_id);
grant all on public.user_plans to anon, authenticated;
