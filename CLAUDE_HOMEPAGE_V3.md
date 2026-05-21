Read src/app/page.tsx carefully first. Then REWRITE it completely according to this spec.
Keep all imports, state, and logic. Only change UI/copy/structure.

Project: C:\Users\home\.gemini\antigravity\scratch\tradermirror

---

## COMPLETE REWRITE OF src/app/page.tsx

Keep these imports and state exactly:
- All existing imports (Link, useState, useEffect, lucide-react icons, Header, LeadPopup)
- `const [leadPopupOpen, setLeadPopupOpen] = useState(false)` 
- The useEffect for auto popup after 3s
- LeadPopup component usage
- Floating button

---

## SECTION ORDER

1. HERO — main copy + 3 sample analysis cards
2. TARGET USERS — "이런 분이라면"
3. HOW IT WORKS — "거래내역만 넣으면"
4. FEATURES — 4 feature cards
5. TRUST — "안심하고 사용하셔도 됩니다"
6. PRICING — Free/Pro 2-card + objection FAQ + bottom CTA
7. EBOOK — existing ebook section (keep as-is, just reorder)
8. FAQ — 5 questions
9. FINAL CTA
10. FOOTER

---

## SECTION 1: HERO

Layout: lg:grid-cols-2 (left: copy, right: 3 cards). Mobile: stacked.

### LEFT: Copy

Background gradient behind hero:
```
absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(37,99,235,0.15)_0%,_transparent_70%)]
```

Badge above title:
```
"매매패턴 분석 도구"  — blue pill badge
```

Main title (text-4xl md:text-5xl lg:text-6xl font-black):
```
왜 사면 떨어지고,
팔면 오를까요?
```
Line 2 with gradient text:
```
당신의 매매기록이
반복되는 실수를 보여줍니다.
```
("매매기록" and "반복되는 실수" in blue-to-emerald gradient: `bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent`)

Subtitle (text-slate-400 text-lg):
```
거래내역을 붙여넣거나 매매일지를 기록하면
승률, 손익비, 손절 습관, 감정매매, 반복 실수를 분석합니다.

종목 추천이 아니라,
내가 왜 잃는지 확인하는 복기 도구입니다.
```

CTA buttons:
- Primary (bg-blue-600): "무료로 매매패턴 분석하기 →" → Link href="/analyze"
- Secondary (border-slate-600 text-slate-300): "샘플 리포트 보기" → scroll to sample cards or href="/analyze"

Trust line below CTAs (text-xs text-slate-500):
```
증권사 연동 없음 · 종목 추천 없음 · 수익 보장 없음
```

### RIGHT: 3 Sample Analysis Cards

Top label:
```
"샘플 분석 결과"  — small emerald badge
"거래기록을 넣으면 이런 패턴을 확인할 수 있습니다."  — text-xs text-slate-500
```

**Card 1: 승률 & 손익비**
```
bg-slate-900/80 border border-slate-700 rounded-xl p-4
Title: "승률 & 손익비" (text-xs text-slate-400)
Row 1: "승률 50%" → text-2xl font-black text-slate-100
Row 2: "손익비 0.49" → text-2xl font-black text-red-400
Description: "작게 벌고 크게 잃는 구조입니다." (text-xs text-slate-400)
Bottom badge: "손익비 낮음" — small red badge
Sub: "이기는 횟수보다, 질 때 얼마나 크게 잃는지가 더 문제일 수 있습니다." — text-xs text-slate-500
```

**Card 2: 수익 vs 손실 보유기간**
```
bg-slate-900/80 border border-slate-700 rounded-xl p-4
Title: "수익 vs 손실 보유기간"
Row 1: "수익 평균 1.2일" → text-emerald-400 font-black
Row 2: "손실 평균 6.8일" → text-red-400 font-black

Mini bar comparison (just visual divs, no chart lib):
  Profit bar: w-1/6 bg-emerald-500 h-2 rounded
  Loss bar: w-full bg-red-500 h-2 rounded
  (to show 1.2 vs 6.8 visually)

Description: "수익은 빨리 팔고, 손실은 오래 버티고 있습니다."
Sub: "손절 지연 패턴이 반복되면 계좌 손실이 커질 수 있습니다."
```

**Card 3: 반복 실수 TOP 1**
```
bg-slate-900/80 border border-amber-500/30 rounded-xl p-4
Title: "반복 실수 TOP 1"
Main: "장 초반 추격매수" → text-amber-400 font-black text-xl
Tag: "9시대 손실 집중" — small amber tag
Description: "9시대 진입 거래에서 손실이 집중됩니다."
Sub: "장이 열리자마자 변동성에 휩쓸려 진입하는 습관을 줄이는 것이 필요합니다."
Warning icon (⚠️ or AlertTriangle from lucide)
```

---

## SECTION 2: TARGET USERS

Badge: "이런 분이라면 꼭 한 번 분석해보세요"
Title: "혹시 이런 경험, 반복되고 있나요?"

6 cards (grid-cols-2 md:grid-cols-3):
```
{ emoji: "📉", text: "사면 떨어지고 팔면 오르는 것 같다" }
{ emoji: "⏱️", text: "수익은 빨리 팔고 손실은 오래 버틴다" }
{ emoji: "🔔", text: "장 초반에 자주 물린다" }
{ emoji: "✂️", text: "손절 기준 없이 버틴다" }
{ emoji: "💥", text: "코인 선물 청산가가 늘 불안하다" }
{ emoji: "📓", text: "매매일지를 써도 뭘 봐야 할지 모르겠다" }
```

Below cards, a bold quote (text-center, bg-slate-900/40 rounded-xl p-6):
```
제목: "종목을 찍어주는 서비스가 아닙니다."
      "당신의 매매 습관을 비춰주는 거울입니다."
보조: "수익 종목보다 먼저 봐야 할 것은 내가 반복하는 실수입니다."
```

---

## SECTION 3: HOW IT WORKS

Keep existing 3-step structure. Badge: "사용 방법". Title: "거래내역만 넣으면 잃는 패턴이 보입니다"

---

## SECTION 4: FEATURES

Badge: "핵심 기능". Title: "매매 습관을 바꾸는 4가지 분석"

4 cards with highlighted keywords:

**Card 1: 매매일지 자동 분석**
Icon: big emoji "📊" or BarChart2 in a 3D-feel container (bg-blue-500/20, rounded-2xl, shadow-lg shadow-blue-500/20)
Body: "거래내역을 붙여넣거나 매일 기록한 매매일지를 불러와 <span class='text-blue-400'>승률, 손익비, 시간대, 감정상태, 진입근거별 성과</span>를 한눈에 보여줍니다."
→ Use inline span with text-blue-400 for key terms

**Card 2: 진짜 순수익 계산**
Icon: Calculator, emerald theme
Body: "수익인 줄 알았던 거래가 실제로 얼마나 남았는지 확인하세요. <span class='text-emerald-400'>수수료, 세금, 펀딩비</span>까지 반영해 실제 순수익을 계산합니다."

**Card 3: 청산가·위험 관리**
Icon: AlertTriangle, orange theme
Body: "코인 선물과 주식 선물의 <span class='text-orange-400'>레버리지 위험</span>을 진입 전에 확인하세요. 증거금, 레버리지, 진입가를 기준으로 청산 위험을 계산합니다."

**Card 4: 펀딩비 누적 비용 추적**
Icon: TrendingDown, purple theme
Body: "코인 선물 장기 보유 시 <span class='text-purple-400'>누적 펀딩비</span>가 수익을 얼마나 깎는지 보여줍니다."

For "3D feel" icons: wrap icon in:
```jsx
<div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg [iconBg] mb-4">
  <Icon className="h-7 w-7 [iconColor]" />
</div>
```

Use dangerouslySetInnerHTML or split text with <span> for colored keywords.
Actually — just use JSX with fragments and <span> for colored words, not dangerouslySetInnerHTML.

---

## SECTION 5: TRUST

Title: "안심하고 사용하셔도 됩니다"
6 checkmark items:
- 증권사 계정 연동이 필요 없습니다
- 거래내역을 복사해 붙여넣는 방식입니다
- 앱에 기록한 매매일지를 불러와 분석할 수 있습니다
- 종목 추천이나 매수·매도 신호를 제공하지 않습니다
- 수익 보장을 하지 않습니다
- 사용자의 매매 습관을 복기하기 위한 교육용 도구입니다

---

## SECTION 6: PRICING

Badge: "요금제". Title: "기록은 무료, 깊은 분석은 Pro"
Sub: "깊은 분석이 필요할 때 Pro를 사용하면 됩니다."

### MOBILE ORDER: Pro first (order-first on mobile), then Free
Use: `<div className="flex flex-col md:grid md:grid-cols-2 gap-6">`
Pro card: `className="... order-first md:order-last"`
Free card: `className="... md:order-first"`

### Free Card:
```
title: Free
price: ₩0
desc: "매매일지는 무료로 시작하세요."
features: [하루 5개, 하루 1회 분석, 최근 7일, 승률/손익/수익률, 청산가 기본]
bottom note: "기록 습관을 만드는 데 충분합니다."
CTA: outline button "무료로 시작하기" → /login
```

### Pro Card (추천 badge):
```
title: Pro
price: ₩9,900 / 월
desc: "내 매매패턴을 깊게 분석하세요."
features: [10 items as before]
bottom note: "한 번의 충동매매만 줄여도 월 이용료 이상의 손실을 아낄 수 있습니다."
CTA: blue filled "7일 무료로 Pro 시작하기" → /pricing
sub: "7일 무료 체험 · 이후 월 ₩9,900 · 언제든 해지 가능"
```

### Objection FAQ (3 cards below):
```
반박 1: "매매일지를 쓰는 데 돈을 내야 하나요?"
"아닙니다. 기록은 무료로 시작할 수 있습니다.
다만 내가 어떤 감정, 시간대, 진입 근거에서 반복해서 손실을 내는지 깊게 보고 싶다면 Pro 기능이 필요합니다."

반박 2: "월 9,900원이 아깝지 않을까요?"
"한 번의 충동매매만 줄여도 월 이용료 이상의 손실을 아낄 수 있습니다."

반박 3: "이 서비스가 종목을 추천하나요?"
"아닙니다. TraderMirror는 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
사용자의 매매기록을 분석해 반복 실수를 보여주는 도구입니다."
```

### Bottom CTA after pricing section:
```
"7일 동안 Pro 기능을 먼저 써보고 결정하세요."
CTA button: "7일 무료로 시작하기 →" → /analyze (blue, large)
sub: "무료 체험 종료 후 Free 플랜으로 전환됩니다."
```

---

## SECTION 7: EBOOK

Keep the existing ebook section EXACTLY as-is (Vol.1/2/3 cards). Just move it here in order.

---

## SECTION 8: FAQ

Title: "자주 묻는 질문"

5 accordion items (use useState for open/close per item):

```
Q1: "증권사 계정을 연결해야 하나요?"
A: "아니요. 계정 연동 없이 거래내역을 복사해 붙여넣거나, 앱에 작성한 매매일지를 불러와 분석합니다."

Q2: "종목 추천도 해주나요?"
A: "아니요. TraderMirror는 종목 추천, 매수·매도 신호, 수익 보장을 제공하지 않습니다. 사용자의 매매 습관을 분석하는 복기 도구입니다."

Q3: "초보자도 쓸 수 있나요?"
A: "네. 거래내역을 붙여넣거나 매매일지를 작성하면 자동으로 분석 결과를 보여주기 때문에 초보자도 사용할 수 있습니다."

Q4: "코인 선물도 분석되나요?"
A: "네. 코인 현물, 코인 선물, 주식 현물, 주식 선물 데이터를 구분해서 분석할 수 있도록 설계되어 있습니다."

Q5: "Free와 Pro 차이는 무엇인가요?"
A: "Free는 매매일지를 기록하고 기본 분석을 확인하는 용도입니다. Pro는 감정 상태, 진입 근거, 손절 기준, 자산 유형별 상세 분석까지 확인할 수 있는 깊은 분석 플랜입니다."
```

Accordion style:
- Each item: border-b border-slate-800
- Question row: flex justify-between items-center py-4 cursor-pointer
- ChevronDown/Up icon (rotate when open)
- Answer: collapsible div with text-slate-400 text-sm pb-4

---

## SECTION 9: FINAL CTA

Full-width bg-slate-900/40 section:
```
Title: "지금 내 매매패턴을 확인해보세요"
Sub: "거래내역을 붙여넣는 것만으로 반복 실수가 보입니다."
CTA: "무료로 매매패턴 분석하기 →" → /analyze (blue, large)
Trust line: "종목 추천 없음 · 매수/매도 지시 없음 · 수익 보장 없음"
```

---

## SECTION 10: FOOTER

Keep existing footer or simple:
```
© 2025 TraderMirror. 매매 복기 도구.
본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다.
Links: 매매분석 / 요금제 / 계산기 / 전자책
```

---

## FLOATING BUTTON & POPUP

Keep exactly as-is:
- Floating "🎁 무료 혜택 4종 받기" button (fixed bottom-right)
- LeadPopup modal
- leadPopupOpen state + useEffect 3s timer

---

## IMPORTANT NOTES

1. Do NOT use dangerouslySetInnerHTML. For colored keywords in feature cards, split text and use JSX spans.
2. Keep all TypeScript types correct.
3. The proFeatures array from the old code may no longer be needed — define features inline in the JSX or as local arrays.
4. Remove any unused variables (proFeatures, stepsData etc.) or keep them if still used.
5. The FAQ accordion needs useState — add `const [openFaq, setOpenFaq] = useState<number | null>(null)` to the component.
6. Import ChevronDown from lucide-react.

---

## BUILD & DEPLOY

After writing the file:
1. cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
2. Fix ALL TypeScript errors
3. git add src/app/page.tsx
4. git commit -m "feat: homepage redesign v3 - hero cards + section reorder + copy improvements"
5. git push origin master
