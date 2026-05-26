-- 005_fix_lead_rls.sql
-- lead_submissions 조회 권한을 admin 이메일 계정만 허용하도록 수정

-- 기존 취약한 정책 삭제 (로그인한 모든 유저에게 전체 조회 허용했던 것)
drop policy if exists "leads_select_authenticated" on public.lead_submissions;
drop policy if exists "leads_select_own" on public.lead_submissions;

-- 본인 신청 내역만 조회 (로그인한 경우 자신이 제출한 것만)
create policy "leads_select_own" on public.lead_submissions
  for select using (auth.uid() = user_id);

-- 관리자(admin 이메일)만 전체 조회 가능
create policy "leads_select_admin_only" on public.lead_submissions
  for select using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );

-- update/delete도 admin만 가능하도록 추가
drop policy if exists "leads_update_admin" on public.lead_submissions;
drop policy if exists "leads_delete_admin" on public.lead_submissions;

create policy "leads_update_admin" on public.lead_submissions
  for update using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );

create policy "leads_delete_admin" on public.lead_submissions
  for delete using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );
