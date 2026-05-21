Read this entire file carefully, then implement ALL tasks in order.

Project: C:\Users\home\.gemini\antigravity\scratch\tradermirror

---

## OVERVIEW
Implement a Free/Pro plan system with usage limits and upsell UI.
No payment integration yet — just the plan logic, limit enforcement, and UI.

---

## TASK 1: DB Migration — src/app/../supabase/migrations/004_plans.sql

Create file: supabase/migrations/004_plans.sql

```sql
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
create policy "plan_config_admin_write" on public.plan_config for all using (true);

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

-- User plan/trial info (extend profiles if exists, otherwise standalone)
create table if not exists public.user_plans (
  user_id uuid references auth.users(id) on delete cascade primary key,
  plan text not null default 'free' check (plan in ('free', 'pro', 'trial')),
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
```

---

## TASK 2: Create src/lib/planConfig.ts

```typescript
// Default plan limits (fallback if DB unavailable)
export const DEFAULT_PLAN_CONFIG = {
  free_daily_journal_limit: 5,
  free_daily_analysis_limit: 1,
  free_analysis_days: 7,
  pro_price_krw: 9900,
  trial_days: 7,
}

export type PlanType = 'free' | 'pro' | 'trial'

export function isProOrTrial(plan: PlanType): boolean {
  return plan === 'pro' || plan === 'trial'
}

export function getTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
```

---

## TASK 3: Create src/hooks/useUserPlan.ts

React hook that:
1. Fetches user's plan from `user_plans` table
2. If no record exists, creates one with plan='trial', trial_started_at=now(), trial_ends_at=now()+7days
3. Returns { plan, trialDaysLeft, isPro, isTrial, isFree, loading }

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PlanType = 'free' | 'pro' | 'trial'

interface UserPlan {
  plan: PlanType
  trialDaysLeft: number
  isPro: boolean
  isTrial: boolean
  isFree: boolean
  loading: boolean
}

export function useUserPlan(): UserPlan {
  const [plan, setPlan] = useState<PlanType>('trial')
  const [trialDaysLeft, setTrialDaysLeft] = useState(7)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      let { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!planData) {
        // First login: create trial
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: newPlan } = await supabase
          .from('user_plans')
          .insert({
            user_id: user.id,
            plan: 'trial',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEndsAt,
          })
          .select()
          .single()
        planData = newPlan
      }

      if (planData) {
        // Check if trial expired
        let currentPlan: PlanType = planData.plan
        if (currentPlan === 'trial' && planData.trial_ends_at) {
          if (new Date(planData.trial_ends_at) < new Date()) {
            currentPlan = 'free'
            await supabase.from('user_plans').update({ plan: 'free' }).eq('user_id', user.id)
          }
        }
        setPlan(currentPlan)
        if (planData.trial_ends_at && currentPlan === 'trial') {
          const diff = new Date(planData.trial_ends_at).getTime() - Date.now()
          setTrialDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
        }
      }
      setLoading(false)
    }
    fetchPlan()
  }, [])

  return {
    plan,
    trialDaysLeft,
    isPro: plan === 'pro',
    isTrial: plan === 'trial',
    isFree: plan === 'free',
    loading,
  }
}
```

---

## TASK 4: Create src/hooks/useDailyLimits.ts

Hook that checks daily usage for the current user:
- journalCountToday: number of journal entries created today (Asia/Seoul timezone)
- analysisCountToday: number of analysis runs today
- canAddJournal(freeLimit: number): boolean
- canRunAnalysis(freeLimit: number): boolean

```typescript
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDailyLimits() {
  const [journalCountToday, setJournalCountToday] = useState(0)
  const [analysisCountToday, setAnalysisCountToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchCounts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Today in Asia/Seoul
      const now = new Date()
      const seoulOffset = 9 * 60
      const seoulNow = new Date(now.getTime() + (seoulOffset - now.getTimezoneOffset()) * 60000)
      const todayStart = new Date(seoulNow)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(seoulNow)
      todayEnd.setHours(23, 59, 59, 999)
      // Convert back to UTC for DB query
      const startUTC = new Date(todayStart.getTime() - (seoulOffset - now.getTimezoneOffset()) * 60000).toISOString()
      const endUTC = new Date(todayEnd.getTime() - (seoulOffset - now.getTimezoneOffset()) * 60000).toISOString()

      const [{ count: jCount }, { count: aCount }] = await Promise.all([
        supabase.from('trades').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', startUTC)
          .lte('created_at', endUTC),
        supabase.from('analysis_runs').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('run_at', startUTC)
          .lte('run_at', endUTC),
      ])

      setJournalCountToday(jCount || 0)
      setAnalysisCountToday(aCount || 0)
      setLoading(false)
    }
    fetchCounts()
  }, [])

  return {
    journalCountToday,
    analysisCountToday,
    canAddJournal: (limit: number) => journalCountToday < limit,
    canRunAnalysis: (limit: number) => analysisCountToday < limit,
    loading,
  }
}
```

---

## TASK 5: Create src/components/ProGate.tsx

Reusable "locked feature" overlay component:

Props:
- title?: string (default: "Pro에서 확인할 수 있는 상세 분석입니다")
- description?: string
- showUpgrade?: boolean (default: true)

```tsx
import { Lock } from 'lucide-react'
import Link from 'next/link'

interface ProGateProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function ProGate({
  title = 'Pro에서 확인할 수 있는 상세 분석입니다',
  description = '내가 어떤 감정, 진입 근거, 손절 습관에서 손실을 반복하는지 확인하려면 Pro 분석이 필요합니다.',
  children,
}: ProGateProps) {
  return (
    <div className="relative">
      {/* Blurred content behind */}
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>
      )}
      {/* Lock overlay */}
      <div className={`${children ? 'absolute inset-0' : ''} flex flex-col items-center justify-center bg-slate-900/80 rounded-xl border border-slate-700 p-8 text-center`}>
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
          <Lock className="h-6 w-6 text-slate-400" />
        </div>
        <h3 className="text-slate-100 font-bold mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">{description}</p>
        <Link href="/pricing">
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
            7일 무료로 Pro 시작하기
          </button>
        </Link>
      </div>
    </div>
  )
}
```

---

## TASK 6: Create src/components/LimitModal.tsx

Modal shown when free user hits daily limit:

Props:
- isOpen: boolean
- onClose: () => void
- type: 'journal' | 'analysis'

```tsx
'use client'
import { X } from 'lucide-react'
import Link from 'next/link'

interface LimitModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'journal' | 'analysis'
}

export default function LimitModal({ isOpen, onClose, type }: LimitModalProps) {
  if (!isOpen) return null

  const isJournal = type === 'journal'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-md w-full p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
          <X className="h-5 w-5" />
        </button>
        <div className="text-4xl mb-4">{isJournal ? '📒' : '📊'}</div>
        <h2 className="text-xl font-black text-slate-100 mb-3">
          {isJournal
            ? '오늘 무료 등록 가능 개수를 모두 사용했습니다'
            : '오늘 무료 분석 1회를 모두 사용했습니다'}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          {isJournal
            ? 'Free 플랜에서는 하루 5개까지 매매일지를 등록할 수 있습니다.\n더 많은 거래를 기록하고 싶다면 Pro로 업그레이드하세요.'
            : 'Free 플랜에서는 하루 1회 매매패턴 분석이 가능합니다.\n무제한 분석과 AI 리포트 전체 기능을 사용하려면 Pro로 업그레이드하세요.'}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/pricing" onClick={onClose}>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
              {isJournal ? 'Pro로 무제한 기록하기' : 'Pro로 무제한 분석하기'}
            </button>
          </Link>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors">
            {isJournal ? '내일 다시 기록하기' : '내일 다시 분석하기'}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-6">
          본 서비스는 사용자의 매매기록을 바탕으로 한 복기 도구입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
        </p>
      </div>
    </div>
  )
}
```

---

## TASK 7: Create src/components/TrialBanner.tsx

Banner shown to trial users showing days remaining:

```tsx
'use client'
import Link from 'next/link'

interface TrialBannerProps {
  daysLeft: number
}

export default function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft <= 0) return null

  const isLastDay = daysLeft === 1
  const bgColor = isLastDay ? 'bg-orange-500/20 border-orange-500/30' : 'bg-blue-500/20 border-blue-500/30'
  const textColor = isLastDay ? 'text-orange-300' : 'text-blue-300'

  return (
    <div className={`${bgColor} border rounded-xl px-4 py-3 flex items-center justify-between gap-4 mb-4`}>
      <p className={`${textColor} text-sm font-medium`}>
        {isLastDay
          ? '⚠️ Pro 무료 체험 마지막 날입니다. 내일부터 Free 플랜으로 전환됩니다.'
          : `🎉 Pro 무료 체험 중 — ${daysLeft}일 남았습니다.`}
      </p>
      <Link href="/pricing">
        <button className="shrink-0 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
          월 ₩9,900으로 Pro 계속 사용하기
        </button>
      </Link>
    </div>
  )
}
```

---

## TASK 8: Create src/app/pricing/page.tsx

Full pricing page with:
- Free vs Pro comparison
- Trial CTA
- FAQ / objection-busting section
- Disclaimer

```tsx
'use client'
import { Check, Lock } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

const freeFeatures = [
  '매매일지 하루 5개 등록',
  '하루 1회 기본 분석',
  '최근 7일 기록 기준 요약 분석',
  '승률, 총 손익, 평균 수익률 제공',
  '청산가 계산기 기본 기능',
]

const proFeatures = [
  '매매일지 무제한 등록',
  '매매패턴 무제한 분석',
  '오늘 / 이번 달 / 전체 기간 분석',
  '감정 상태별 성과 분석',
  '진입 근거별 성과 분석',
  '손절 기준 작성 여부 분석',
  '자산 유형별 상세 분석',
  'AI 매매 리포트 전체 제공',
  '월간 리포트 저장',
  '청산가·펀딩비 계산기 전체 기능',
]

const freeLocked = [
  '감정 상태별 성과 분석',
  '진입 근거별 성과 분석',
  '원칙 준수 여부별 성과 분석',
  '자산 유형별 상세 분석',
  'AI 매매 리포트 전체',
]

const faqs = [
  {
    q: '매매일지를 쓰는 데 돈을 내야 하나요?',
    a: '아닙니다. 기록은 무료로 시작할 수 있습니다. 다만 내가 왜 반복해서 손실을 내는지 깊게 분석하고 싶다면 Pro 기능이 필요합니다.',
  },
  {
    q: '월 9,900원이 아깝지 않을까요?',
    a: '한 번의 충동매매만 줄여도 월 이용료 이상의 손실을 아낄 수 있습니다.',
  },
  {
    q: '이 서비스가 종목을 추천하나요?',
    a: '아닙니다. TraderMirror는 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 사용자의 매매기록을 분석해 반복 실수를 보여주는 복기 도구입니다.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-16">

        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            요금제
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-4">기록은 무료, 깊은 분석은 Pro</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            깊은 분석이 필요할 때 Pro를 사용하면 됩니다.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

          {/* Free */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-8">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Free</p>
              <p className="text-4xl font-black text-slate-100">₩0</p>
              <p className="text-slate-400 text-sm mt-2">기록은 무료로 시작하세요.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
              {freeLocked.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                  <Lock className="h-4 w-4 text-slate-700 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <button className="w-full py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold rounded-xl transition-colors">
                무료로 시작하기
              </button>
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-blue-950/40 border-2 border-blue-500/50 rounded-2xl p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-blue-600 text-white text-xs font-black rounded-full">추천</span>
            </div>
            <div className="mb-6">
              <p className="text-blue-400 text-sm font-medium mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black text-slate-100">₩9,900</p>
                <p className="text-slate-400 text-sm">/ 월</p>
              </div>
              <p className="text-slate-400 text-sm mt-2">내 매매패턴을 깊게 분석하세요.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-200">
                  <Check className="h-4 w-4 text-blue-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors">
              7일 무료로 Pro 시작하기
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              7일 동안 Pro 기능을 무료로 사용해보고, 내 매매에 도움이 될 때 계속 이용하세요.
            </p>
          </div>
        </div>

        {/* FAQ / Objection busting */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-xl font-black text-slate-100 mb-6 text-center">자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
                <p className="font-bold text-slate-200 mb-2">"{faq.q}"</p>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-600 text-center leading-relaxed">
          본 서비스는 사용자의 매매기록을 바탕으로 한 복기 도구입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
        </p>
      </main>
    </div>
  )
}
```

---

## TASK 9: Update landing page pricing section (src/app/page.tsx)

Read src/app/page.tsx. Find the existing pricing/요금제 section.
Replace it with the new Free/Pro plan cards as described in the spec.

The section should have:
- Badge: "요금제"
- Title: "기록은 무료, 깊은 분석은 Pro"
- Two cards: Free (₩0) and Pro (월 ₩9,900 with 추천 badge)
- Free card features: 5 items
- Pro card features: 10 items + "7일 무료로 Pro 시작하기" CTA
- Below cards: 3 FAQ objection items (Q&A format)
- Bottom: disclaimer text

---

## TASK 10: Add /pricing to Header nav

Read src/components/Header.tsx.
Add a "요금제" nav link pointing to /pricing alongside existing nav items.

---

## TASK 11: Build and deploy

cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
Fix any errors.
git add .
git commit -m "feat: Free/Pro plan system - pricing page, plan gates, limit modals, trial banner"
git push origin master
