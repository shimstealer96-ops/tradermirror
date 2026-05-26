-- 006_fix_ticker_nullable.sql
-- ticker 컬럼 not null 제약 제거 (asset_name으로 대체)
alter table public.trades alter column ticker drop not null;
alter table public.trades alter column ticker set default '';
