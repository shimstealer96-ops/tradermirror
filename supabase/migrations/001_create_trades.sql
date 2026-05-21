-- TraderMirror: 매매일지 테이블
create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  trade_date date not null,
  asset_type text not null check (asset_type in ('stock', 'crypto', 'futures', 'etf', 'other')),
  ticker text not null,
  ticker_name text,
  direction text not null check (direction in ('long', 'short')),
  entry_price numeric not null,
  exit_price numeric,
  quantity numeric not null,
  fee numeric default 0,
  profit_loss numeric,
  profit_loss_rate numeric,
  status text not null default 'open' check (status in ('open', 'closed')),
  memo text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.trades enable row level security;

create policy "Users can only access their own trades"
  on public.trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists trades_user_date_idx on public.trades(user_id, trade_date desc);
