drop policy if exists "leads_select_admin_only" on public.lead_submissions;

create policy "leads_select_admin_only" on public.lead_submissions
  for select using (
    auth.jwt() ->> 'email' = 'shim.stealer96@gmail.com'
  );
