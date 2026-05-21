-- ============================================
-- TraderMirror: 신청자 DB (lead_submissions)
-- ============================================

create table if not exists public.lead_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null, -- 가입한 경우만

  -- 유입 경로
  source text not null check (source in ('landing_form', 'cta_popup', 'onboarding')),

  -- 기본 정보
  name text not null,
  phone text not null,
  email text not null,

  -- 투자 상태
  investment_experience text,
  investment_interest text,
  pain_point text,
  desired_benefits text[], -- 배열 (여러 개 선택 가능)
  investment_amount text,
  preferred_contact text,

  -- 자동 태그
  auto_tags text[],

  -- 관리자 상태
  status text default '신규',
  benefit_sent boolean default false,
  coupon_sent boolean default false,
  diagnosis_done boolean default false,
  admin_memo text,
  admin_tags text[],

  -- 수신 거부
  opt_out boolean default false,

  -- 자료 발송 이력
  sent_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS: 일반 사용자는 자신의 신청 내역만 insert 가능
alter table public.lead_submissions enable row level security;

create policy "leads_insert_policy" on public.lead_submissions
  for insert with check (true); -- 비로그인도 신청 가능

create policy "leads_select_own" on public.lead_submissions
  for select using (auth.uid() = user_id);

-- 관리자 UI 체크를 위해 인증된 사용자는 전체 조회 허용
create policy "leads_select_authenticated" on public.lead_submissions
  for select using (auth.role() = 'authenticated');

-- 관리자 전용 권한은 service_role key로 처리

-- 다운로드 이력
create table if not exists public.admin_export_logs (
  id uuid default gen_random_uuid() primary key,
  admin_user_id uuid references auth.users(id),
  export_type text, -- csv, excel
  filter_params jsonb,
  row_count integer,
  created_at timestamptz default now()
);

alter table public.admin_export_logs enable row level security;
create policy "export_logs_admin" on public.admin_export_logs
  for all using (auth.uid() = admin_user_id);

-- grant
grant usage on schema public to anon, authenticated;
grant all on public.lead_submissions to anon, authenticated;
grant all on public.admin_export_logs to anon, authenticated;
