alter table public.trades alter column ticker drop not null;
alter table public.trades alter column ticker set default '';
