drop policy if exists "leads_select_authenticated" on public.lead_submissions;
drop policy if exists "leads_select_own" on public.lead_submissions;

create policy "leads_select_own" on public.lead_submissions
  for select using (auth.uid() = user_id);

create policy "leads_select_admin_only" on public.lead_submissions
  for select using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );

create policy "leads_update_admin" on public.lead_submissions
  for update using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );

create policy "leads_delete_admin" on public.lead_submissions
  for delete using (
    (select email from auth.users where id = auth.uid()) = 'shim.stealer96@gmail.com'
  );
