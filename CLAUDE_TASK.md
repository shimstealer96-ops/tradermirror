# Task: Add Trading Journal System

Build a complete trading journal with Google OAuth login using Supabase.

## Credentials
- SUPABASE_URL: `https://focmxiibgnahjrzefwfw.supabase.co`
- SUPABASE_ANON_KEY: `sb_publishable_87v_I8kDPrWmfn6rR-dhGg_wSNlSVtl`

## Steps

### 1. Install deps
```
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Append to .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://focmxiibgnahjrzefwfw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_87v_I8kDPrWmfn6rR-dhGg_wSNlSVtl
```

### 3. Create src/lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 4. Create src/lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
```

### 5. Create middleware.ts at project root
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.getUser()
  return supabaseResponse
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

### 6. Create src/app/auth/callback/route.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
```

### 7. Create src/app/login/page.tsx
Dark themed page with Google OAuth button. Match existing dark theme (bg-[#090d16], slate colors).
Show TraderMirror logo (TrendingUp icon + text).
Google button calls: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/auth/callback' } })

### 8. Create src/app/api/auth/logout/route.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url))
}
```

### 9. Create supabase/migrations/001_create_trades.sql
```sql
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
create index trades_user_date_idx on public.trades(user_id, trade_date desc);
```

### 10. Create src/app/dashboard/page.tsx
Server component. Redirects to /login if no session.
Show:
- Header with TrendingUp logo, user email, logout button (POST to /api/auth/logout)
- Page title "대시보드" + "새 매매 기록" button → /journal/new
- 3 stat cards: 오늘 매매 (count + P&L), 이번달 매매 (count + P&L), 전체 누적 (count + P&L)
- Recent 10 trades table: date, ticker/name, direction badge (롱=emerald, 숏=red), entry_price, exit_price, profit_loss, status badge
- "전체 일지 보기" link → /journal

P&L display: +N원 in emerald if positive, red if negative.
Match dark theme throughout.

### 11. Create src/app/journal/page.tsx
Server component with server action for delete.
- searchParams is a Promise in Next.js 15: `const params = await searchParams`
- Filter tabs: 전체/주식/코인/오늘/이번달 (use Link with ?filter= query param)
- Full trades table with all columns + edit/delete actions
- Delete: server action with 'use server' + revalidatePath

### 12. Create src/app/journal/new/page.tsx
Client component form.
Fields: trade_date (date, default today), asset_type (select), ticker (text), ticker_name (text), direction (radio long/short), entry_price (number), exit_price (number optional), quantity (number), fee (number default 0), memo (textarea).
Auto-calculate P&L preview when exit_price is filled:
- long: (exit - entry) * qty - fee
- short: (entry - exit) * qty - fee
- rate: pl / (entry * qty) * 100
On submit: insert to supabase, redirect to /journal.

### 13. Create src/app/journal/[id]/edit/page.tsx
Same form as new, but loads existing trade data with useEffect and updates on submit.

### 14. Build and fix errors
```
npm run build
```
Fix all TypeScript errors. Key things:
- searchParams in server components is Promise<{filter?: string}> in Next.js 15
- Use 'use server' for server actions
- revalidatePath after mutations

### 15. Git commit and push
```
git add .
git commit -m "feat: add trading journal with Google auth and Supabase"
git push origin master
```

## Important Notes
- Use @supabase/ssr (NOT deprecated auth-helpers)
- Dark theme: bg-[#090d16], slate-800/900, blue-600 for primary actions
- Use existing Button/Card components where appropriate
- profit_loss formula: long=(exit-entry)*qty-fee, short=(entry-exit)*qty-fee
- profit_loss_rate = profit_loss / (entry_price * quantity) * 100

When completely finished, run:
openclaw system event --text "Done: 매매일지 시스템 구현 완료 - 빌드 성공 및 GitHub push 완료" --mode now
