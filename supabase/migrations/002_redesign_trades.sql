-- ============================================
-- TraderMirror v2: 전면 재설계 스키마
-- ============================================

-- 기존 trades 테이블 제거 (있으면)
drop table if exists public.trade_images cascade;
drop table if exists public.trade_tags cascade;
drop table if exists public.ai_reports cascade;
drop table if exists public.trades cascade;
drop table if exists public.accounts cascade;

-- ============================================
-- ENUM 타입 정의
-- ============================================

drop type if exists asset_type_enum cascade;
create type asset_type_enum as enum (
  'stock_spot', 'stock_futures', 'crypto_spot', 'crypto_futures'
);

drop type if exists trade_type_enum cascade;
create type trade_type_enum as enum (
  'scalping', 'swing', 'long_term', 'split_buy', 'take_profit', 'stop_loss'
);

drop type if exists entry_reason_enum cascade;
create type entry_reason_enum as enum (
  'order_block', 'fvg', 'sr_flip', 'moving_average', 'rsi',
  'volume', 'supply_demand', 'earnings', 'news', 'macro',
  'community', 'gut_feeling'
);

drop type if exists emotion_enum cascade;
create type emotion_enum as enum (
  'calm', 'anxious', 'confident', 'impatient', 'fomo',
  'revenge', 'bored', 'impulsive'
);

drop type if exists exit_reason_enum cascade;
create type exit_reason_enum as enum (
  'target_reached', 'stop_loss_hit', 'indicator_change', 'volume_drop',
  'panic_sell', 'profit_fear', 'impulsive_sell', 'no_plan'
);

drop type if exists principle_enum cascade;
create type principle_enum as enum (
  'fully_followed', 'partially_followed', 'not_followed'
);

drop type if exists direction_enum cascade;
create type direction_enum as enum ('long', 'short');

drop type if exists currency_enum cascade;
create type currency_enum as enum ('KRW', 'USD', 'USDT');

drop type if exists overtrading_enum cascade;
create type overtrading_enum as enum ('1_2', '3_5', '6_plus', 'dont_remember');

-- ============================================
-- accounts 테이블
-- ============================================
create table if not exists public.accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default '기본 계좌',
  description text,
  created_at timestamptz default now()
);
alter table public.accounts enable row level security;
create policy "accounts_user_policy" on public.accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- trades 테이블 (통합)
-- ============================================
create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  account_id uuid references public.accounts(id) on delete set null,

  -- 공통 기본 정보
  asset_type asset_type_enum not null,
  trade_date date not null,
  asset_name text not null,
  ticker text not null,
  trade_type trade_type_enum,
  entry_reason entry_reason_enum[],
  stop_loss_basis text,
  target_price numeric,
  emotion_before emotion_enum,
  exit_reason exit_reason_enum,
  principle_followed principle_enum,
  good_points text,
  mistakes text,
  improvements text,
  score integer check (score >= 1 and score <= 10),
  review_summary text,
  currency currency_enum default 'KRW',
  exchange_rate numeric default 1,
  status text default 'open' check (status in ('open', 'closed')),

  -- 손익 (공통)
  entry_price numeric,
  exit_price numeric,
  profit_loss numeric,
  profit_loss_krw numeric,
  profit_loss_rate numeric,
  fee numeric default 0,
  tax numeric default 0,

  -- 주식 현물 전용
  market_type text, -- domestic, us, etf, dividend, theme
  exchange text,    -- kospi, kosdaq, nasdaq, nyse, amex
  sector text,
  entry_datetime timestamptz,
  exit_datetime timestamptz,
  quantity numeric,
  total_buy_amount numeric,
  total_sell_amount numeric,
  trade_session text, -- market_open, intraday, pre_close, pre_market, after_market
  check_foreign_flow boolean,
  check_institutional_flow boolean,
  check_retail_flow boolean,
  has_earnings boolean,
  has_disclosure boolean,
  macro_issue text,
  investment_period text, -- day, 1_3days, 1_2weeks, 1month_plus, long_term
  has_dividend boolean,

  -- 주식 선물 전용
  futures_type text,
  underlying_asset text,
  contract_name text,
  direction direction_enum,
  contract_count numeric,
  contract_multiplier numeric,
  margin numeric,
  leverage numeric,
  expiry_date date,
  is_rollover boolean,
  liquidation_risk_memo text,
  roe numeric,
  market_direction text,
  volatility text,
  major_event text,

  -- 코인 현물 전용
  exchange_name text,
  coin_symbol text,
  market_pair text,
  input_method text, -- by_amount, by_quantity
  invest_amount numeric,
  coin_quantity numeric,
  avg_buy_price numeric,
  avg_sell_price numeric,
  total_sell_amount_coin numeric,
  btc_direction text,
  btc_dominance numeric,
  coin_category text, -- major, mid_alt, meme, new_listing, theme
  news_event text,
  overtrading overtrading_enum,

  -- 코인 선물 전용
  position_direction direction_enum,
  margin_mode text, -- isolated, cross
  position_size numeric,
  position_quantity numeric,
  liquidation_price numeric,
  funding_fee numeric,
  entry_session text, -- asia, europe, us, midnight

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.trades enable row level security;
create policy "trades_user_policy" on public.trades for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index trades_user_date_idx on public.trades(user_id, trade_date desc);
create index trades_asset_type_idx on public.trades(user_id, asset_type);

-- ============================================
-- trade_images 테이블
-- ============================================
create table if not exists public.trade_images (
  id uuid default gen_random_uuid() primary key,
  trade_id uuid references public.trades(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  created_at timestamptz default now()
);
alter table public.trade_images enable row level security;
create policy "trade_images_user_policy" on public.trade_images for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================
-- ai_reports 테이블
-- ============================================
create table if not exists public.ai_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  report_date date not null default current_date,
  asset_type asset_type_enum,
  report_content jsonb,
  raw_text text,
  created_at timestamptz default now()
);
alter table public.ai_reports enable row level security;
create policy "ai_reports_user_policy" on public.ai_reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
