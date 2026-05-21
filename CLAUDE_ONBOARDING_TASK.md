Read the spec file at C:\Users\home\Downloads\온보딩 디비수집.txt first. Then do all tasks below.

## PROJECT: TraderMirror — Add lead collection + onboarding system

Working directory: C:\Users\home\.gemini\antigravity\scratch\tradermirror

---

## TASK 1: Create src/lib/supabase/admin.ts (server-side admin client)

```typescript
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## TASK 2: Create src/types/lead.ts

Define TypeScript types:
```typescript
export interface LeadSubmission {
  id?: string
  user_id?: string
  source: 'landing_form' | 'cta_popup' | 'onboarding'
  name: string
  phone: string
  email: string
  investment_experience?: string
  investment_interest?: string
  pain_point?: string
  desired_benefits?: string[]
  investment_amount?: string
  preferred_contact?: string
  auto_tags?: string[]
  status?: string
  benefit_sent?: boolean
  coupon_sent?: boolean
  diagnosis_done?: boolean
  admin_memo?: string
  opt_out?: boolean
  created_at?: string
}
```

---

## TASK 3: Create src/utils/autoTags.ts

Function that generates auto tags from submission data:
```typescript
export function generateAutoTags(data: Partial<LeadSubmission>): string[] {
  const tags: string[] = []
  // source tag
  if (data.source === 'landing_form') tags.push('랜딩페이지 신청폼')
  if (data.source === 'cta_popup') tags.push('무료분석 버튼 팝업')
  if (data.source === 'onboarding') tags.push('회원가입 직후 온보딩')
  // experience
  const expMap: Record<string, string> = {
    '아직 시작 전': '시작 전',
    '주식 현물 경험 있음': '주식 경험자',
    '주식 선물 경험 있음': '주식 경험자',
    '코인 현물 경험 있음': '코인 경험자',
    '코인 선물 경험 있음': '선물 경험자',
    '현재 손실 중': '손실 중',
    '꾸준히 매매 중': '꾸준히 매매 중',
  }
  if (data.investment_experience && expMap[data.investment_experience]) {
    tags.push(expMap[data.investment_experience])
  }
  // interest
  const intMap: Record<string, string> = {
    '주식 현물': '주식 현물 관심',
    '주식 선물': '주식 선물 관심',
    '코인 현물': '코인 현물 관심',
    '코인 선물': '코인 선물 관심',
    '아직 모르겠음': '투자유형 미정',
  }
  if (data.investment_interest && intMap[data.investment_interest]) {
    tags.push(intMap[data.investment_interest])
  }
  // pain point
  const painMap: Record<string, string> = {
    '뭘 사야 할지 모르겠음': '종목선택 고민',
    '손절 기준이 없음': '손절기준 없음',
    '수익은 짧게 먹고 손실은 오래 버팀': '손실 장기보유',
    '장 초반/급등주에 자주 물림': '장초반 물림',
    '코인 선물 청산가·레버리지가 헷갈림': '청산가/레버리지 고민',
    '매매일지를 써도 어떻게 복기할지 모르겠음': '복기 어려움',
    '감정매매/FOMO가 심함': '감정매매',
    '적금만 하다가 투자를 시작하려니 무서움': '투자공포',
  }
  if (data.pain_point && painMap[data.pain_point]) {
    tags.push(painMap[data.pain_point])
  }
  // benefits
  if (data.desired_benefits?.includes('투자상태별 1:1 맞춤 진단')) tags.push('1:1 진단 희망')
  if (data.desired_benefits?.includes('MoneyStep 전자책 50% 할인권')) tags.push('전자책 할인권 희망')
  if (data.desired_benefits?.includes('전부 받고 싶음')) tags.push('전체 혜택 희망')
  return [...new Set(tags)]
}
```

---

## TASK 4: Create src/app/api/leads/route.ts (POST endpoint to save lead)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client' // use server version
// Actually use: import { createServerClient } or just use anon key insert
import { generateAutoTags } from '@/utils/autoTags'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { createClient: createSupabase } = await import('@supabase/supabase-js')
  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const autoTags = generateAutoTags(body)
  const { error } = await supabase.from('lead_submissions').insert({
    ...body,
    auto_tags: autoTags,
    status: '신규',
  })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

---

## TASK 5: Create shared form component src/components/LeadForm.tsx

Props:
- source: 'landing_form' | 'cta_popup' | 'onboarding'
- onSuccess: (data: any) => void
- compact?: boolean (for popup, show fewer fields)
- showBenefits?: boolean

Fields (all required unless noted):
1. name (text input)
2. phone (text input) — with helper: "정확한 연락처를 남겨주셔야 1:1 맞춤 진단 결과와 전자책 할인권 제공이 가능합니다."
3. email (email input)
4. investment_experience (select/radio):
   options: 아직 시작 전 / 계좌는 있지만 거의 안 함 / 주식 현물 경험 있음 / 주식 선물 경험 있음 / 코인 현물 경험 있음 / 코인 선물 경험 있음 / 현재 손실 중 / 꾸준히 매매 중
5. investment_interest (select):
   options: 주식 현물 / 주식 선물 / 코인 현물 / 코인 선물 / 주식과 코인 둘 다 / 아직 모르겠음
6. pain_point (select):
   options: 뭘 사야 할지 모르겠음 / 손절 기준이 없음 / 수익은 짧게 먹고 손실은 오래 버팀 / 장 초반/급등주에 자주 물림 / 코인 선물 청산가·레버리지가 헷갈림 / 매매일지를 써도 어떻게 복기할지 모르겠음 / 감정매매/FOMO가 심함 / 적금만 하다가 투자를 시작하려니 무서움
7. desired_benefits (multi-checkbox, only if !compact):
   options: TraderMirror 7일 무료 체험권 / MoneyStep 전자책 50% 할인권 / 첫 매수 전 체크리스트 / 투자상태별 1:1 맞춤 진단 / 전자책 미리보기 PDF / 전부 받고 싶음
8. investment_amount (select, optional, only if !compact):
   options: 아직 없음 / 100만원 미만 / 100~500만원 / 500~1,000만원 / 1,000만원 이상
9. preferred_contact (select, optional, only if !compact):
   options: 문자로 받고 싶음 / 카카오톡/문자로 받고 싶음 / 이메일로 받고 싶음 / 전화 안내도 괜찮음

On submit: POST to /api/leads, then call onSuccess()

Disclaimer at bottom:
"본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다."

Use dark theme styling (bg-slate-800 inputs, slate-700 borders, blue-600 button)

---

## TASK 6: Add landing page lead form section to src/app/page.tsx

Add a new section AFTER the features section (before the trust section):

Section title: "내 투자상태에 맞는 혜택과 전자책 할인권 받기"
Sub: "주식을 처음 시작하는 사람과 코인 선물을 하는 사람에게 필요한 기준은 다릅니다. 30초만 입력해주시면 현재 투자 상태에 맞는 혜택과 MoneyStep 전자책 50% 할인권을 보내드립니다."

Benefits list (left side):
- TraderMirror 7일 무료 체험권
- MoneyStep 전자책 50% 할인권
- 첫 매수 전 체크리스트
- 투자상태별 1:1 맞춤 진단
- 전자책 미리보기 PDF

Right side: <LeadForm source="landing_form" ... />

On success: show thank you message:
"신청 혜택이 접수되었습니다. 입력해주신 연락처와 이메일로 안내드릴 예정입니다."

---

## TASK 7: Add CTA popup to src/app/page.tsx

When user clicks "무료로 매매패턴 분석하기" CTA button:
- Show modal/popup FIRST before navigating to /analyze
- Popup title: "분석 결과와 전자책 할인권을 받을 연락처를 입력해주세요"
- Popup body: "TraderMirror 무료 분석 결과와 MoneyStep 전자책 50% 할인권을 보내드리기 위해 기본 정보를 입력해주세요. 정확한 연락처를 남겨주셔야 분석 결과와 할인권 제공이 가능합니다."
- Show benefits list
- <LeadForm source="cta_popup" compact={true} />
- On form success → navigate to /analyze
- "나중에 할게요" button → close popup and navigate to /analyze directly
- Bottom note: "종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다."

---

## TASK 8: Create src/app/onboarding/page.tsx

Multi-step onboarding page (5 steps with progress bar)

Redirect to this page from /auth/callback when user is newly registered (check if profiles table has onboarding_done = false, or just always show on first visit using localStorage)

Step indicator: "STEP 1 / 5" etc.

STEP 1: investment_experience (single select cards)
Title: "현재 투자 경험은 어느 정도인가요?"
Options as clickable cards

STEP 2: investment_interest (single select cards)
Title: "주로 관심 있는 투자 유형은 무엇인가요?"

STEP 3: pain_point (single select cards)
Title: "지금 가장 막히는 부분은 무엇인가요?"

STEP 4: Contact info
Title: "혜택과 전자책 할인권을 받을 연락처를 확인해주세요."
Fields: name, phone, email
Helper: "정확한 연락처를 남겨주셔야 1:1 맞춤 진단 결과와 MoneyStep 전자책 50% 할인권 제공이 가능합니다."

STEP 5: Complete screen
Title: "신청 혜택이 제공될 예정입니다"
Body: "입력해주신 정보를 기준으로 TraderMirror 7일 무료 체험권과 MoneyStep 전자책 50% 할인권을 안내드릴 예정입니다."
Benefits list
CTA: "TraderMirror 시작하기 →" → /analyze
Secondary: "나중에 →" → /dashboard

On step 4 submit: POST to /api/leads with source='onboarding' + all collected data

---

## TASK 9: Create src/app/admin/page.tsx (admin dashboard)

Admin page — only accessible if user email is in an admin list.
Check admin by: user email === process.env.NEXT_PUBLIC_ADMIN_EMAIL (or hardcode for now as a check against a list)

If not admin → redirect to /dashboard

Page shows lead_submissions table with:
Columns: 신청일시, 유입경로, 성함, 연락처, 이메일, 투자경험, 관심투자, 막히는부분, 원하는혜택, 상태, 쿠폰발송, 메모

Features:
- Search by name/phone/email
- Filter by source, status, investment_experience, investment_interest
- Status update (dropdown per row)
- Memo field (inline edit)
- Checkboxes for benefit_sent, coupon_sent, diagnosis_done
- CSV export button (downloads all filtered results as CSV)
- Pagination (20 per page)

Use service role or anon key to query — for now just use anon key with a select query
(The RLS policy allows admin to see all via service role, but for simplicity use anon key with no RLS filter)

Actually — modify the select policy for lead_submissions to allow select for all authenticated users for now (admin check is in the UI). Add this to the SQL migration.

---

## TASK 10: Build and deploy

After all files are written:
1. Run: cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
2. Fix any TypeScript errors
3. git add .
4. git commit -m "feat: lead collection system - landing form + CTA popup + onboarding + admin"
5. git push origin master

Report what was created and any issues.
