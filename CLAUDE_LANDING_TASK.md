Read src/app/page.tsx first, then rewrite it completely according to the spec below.
Also read C:\Users\home\Downloads\수정요청.txt - but NOTE: that file is for the analyze page, not the landing page.
The landing page spec is in THIS file only.

## TASK: Rewrite src/app/page.tsx as a product landing page

Keep the existing dark theme: bg-[#090d16], slate colors, blue-600 primary.
Keep existing imports/components where possible.
All text in Korean.

---

## SECTION 1: HERO

Main headline (large, bold, two lines):
"왜 사면 떨어지고, 팔면 오를까요?"
"당신의 매매기록이 답을 알고 있습니다."

Sub copy:
"거래내역을 붙여넣거나, 매일 기록한 매매일지를 불러오세요.
승률, 손익비, 시간대, 진입 근거, 감정 상태, 손절 습관까지
내가 반복해서 잃는 패턴을 데이터로 보여드립니다."

CTA button (large, blue): "무료로 매매패턴 분석하기 →" → Link href="/analyze"

Below CTA (small grey text):
"증권사 연동 없음 · 종목 추천 없음 · 수익 보장 없음"

---

## SECTION 2: HOOK QUOTE (full-width dark card)

"수익 나는 종목을 알려주는 툴이 아니라,
내가 왜 잃는지 알려주는 거울입니다."

Emphasize "거울" and connect it to the TraderMirror brand name.
Subtitle: "TraderMirror — 매매 습관 복기 도구"

---

## SECTION 3: TARGET USERS — "이런 분이라면 꼭 한 번 분석해보세요"

6 cards in 2x3 or 3x2 grid:
1. "사면 떨어지고, 팔면 오르는 것 같은 분"
2. "수익은 짧게 먹고 손실은 오래 버티는 분"
3. "장 초반에 자주 물리는 분"
4. "손절 기준 없이 감으로 버티는 분"
5. "코인 선물에서 펀딩비·청산가 계산이 헷갈리는 분"
6. "매매일지를 써도 뭘 봐야 할지 모르는 분"

Each card: emoji + text, dark card style

---

## SECTION 4: HOW IT WORKS — "거래내역만 넣으면, 잃는 패턴이 보입니다"

Subtitle:
"복잡한 연동 없이도 괜찮습니다.
붙여넣거나 기록한 매매일지를 불러오면, 반복되는 실수를 자동으로 분석합니다."

3 steps:
STEP 1. 거래내역 입력
"HTS/MTS, 거래소 거래내역을 복사해 붙여넣거나 앱에 기록한 매매일지를 불러옵니다."

STEP 2. AI 매매패턴 분석
"승률, 손익비, 시간대, 진입 근거, 감정 상태, 손절 습관을 자동으로 분석합니다."

STEP 3. 다음 매매 규칙 확인
"반복 실수 TOP 3와 다음 거래에서 지켜야 할 규칙을 확인합니다."

---

## SECTION 5: FEATURES — 4 feature cards

Card 1:
Title: "매매일지 자동 분석"
Body: "거래내역을 붙여넣거나 매일 기록한 매매일지를 불러와 승률, 손익비, 시간대, 감정상태, 진입근거별 성과를 한눈에 보여줍니다."
Icon: TrendingUp (blue)

Card 2:
Title: "진짜 순수익 계산"
Body: "수익인 줄 알았던 거래가 실제로 얼마나 남았는지 확인하세요. 수수료, 세금, 펀딩비까지 반영해 실제 순수익을 계산합니다."
Icon: Calculator (emerald)

Card 3:
Title: "청산가·위험 관리"
Body: "코인 선물과 주식 선물의 레버리지 위험을 진입 전에 확인하세요. 증거금, 레버리지, 진입가를 기준으로 청산 위험을 계산합니다."
Icon: AlertTriangle (orange)

Card 4:
Title: "펀딩비 누적 비용 추적"
Body: "코인 선물 장기 보유 시 누적 펀딩비가 수익을 얼마나 깎는지 보여줍니다."
Icon: Clock (purple)

---

## SECTION 6: TRUST — "안심하고 사용하셔도 됩니다"

6 checkmark items:
- 증권사 계정 연동이 필요 없습니다
- 거래내역을 복사해 붙여넣는 방식입니다
- 앱에 기록한 매매일지를 불러와 분석할 수 있습니다
- 종목 추천이나 매수·매도 신호를 제공하지 않습니다
- 수익 보장을 하지 않습니다
- 사용자의 매매 습관을 복기하기 위한 교육용 도구입니다

---

## SECTION 7: PRICING — "7일 동안 무료로, 내 매매 습관을 확인해보세요"

Body:
"복잡한 증권사 연동은 필요 없습니다.
거래내역을 붙여넣거나, 매매일지를 기록하면
TraderMirror가 승률, 손익비, 시간대별 성과, 반복 실수까지 분석해드립니다.

7일 동안 부담 없이 사용해보고,
내 매매에 도움이 된다고 느낄 때 계속 이용하세요."

Pricing card:
Badge: "7일 무료 체험"
Price: "이후 월 ₩9,900"
Note: "카드 등록 없이 7일 무료 · 언제든 해지 가능"

Features list (Pro):
- 무제한 매매패턴 분석
- 내 매매일지 불러오기 분석
- 진입 근거별 / 감정별 / 원칙 준수별 성과
- 자산 유형별 상세 분석
- AI 매매 리포트
- 청산가·펀딩비 계산기

CTA: "7일 무료로 시작하기 →" → Link href="/analyze"

Small text: "종목 추천 · 매수/매도 지시 · 수익 보장은 제공하지 않습니다."

---

## SECTION 8: EBOOK CTA

Badge: "분석 후 읽으면 좋은 교재"

Title: "내 패턴을 알았다면, 이제 고치는 기준이 필요합니다."

Body:
"거래내역 분석만으로도 내가 왜 잃는지 알 수 있습니다.
하지만 같은 실수를 줄이려면 진입 기준, 손절 기준, 비중 관리, 매매일지 작성법이 필요합니다.

이 전자책은 주식·코인 초보자가 감정매매에서 벗어나기 위해 필요한 기본 원칙을 정리한 자료입니다."

4 checkpoints:
- 왜 사는지 기록하는 법
- 손절 기준을 먼저 정하는 법
- 수익보다 먼저 손실을 줄이는 법
- 매매일지를 복기하는 법

Price: "₩19,900"
CTA button: "전자책 보고 매매 기준 잡기 →"

---

## SECTION 9: FAQ

Accordion style (useState for open/close per item)

Q1: 증권사 계정을 연결해야 하나요?
A: 아니요. 계정 연동 없이 거래내역을 복사해 붙여넣거나, 앱에 작성한 매매일지를 불러와 분석합니다.

Q2: 종목 추천도 해주나요?
A: 아니요. TraderMirror는 종목 추천, 매수·매도 신호, 수익 보장을 제공하지 않습니다. 사용자의 매매 습관을 분석하는 복기 도구입니다.

Q3: 초보자도 쓸 수 있나요?
A: 네. 거래내역을 붙여넣거나 매매일지를 작성하면 자동으로 분석 결과를 보여주기 때문에 초보자도 사용할 수 있습니다.

Q4: 코인 선물도 분석되나요?
A: 네. 코인 현물, 코인 선물, 주식 현물, 주식 선물 데이터를 구분해서 분석할 수 있도록 설계되어 있습니다.

Q5: 어떤 걸 분석해주나요?
A: 승률, 손익비, 시간대별 성과, 진입 근거별 성과, 감정 상태별 성과, 손절 기준 작성 여부, 반복 실수 등을 분석합니다.

---

## SECTION 10: FOOTER CTA

"지금 바로 내 매매패턴을 확인해보세요"
CTA: "무료로 매매패턴 분석하기 →" → Link href="/analyze"
Disclaimer: "본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다."

---

## DESIGN RULES
- bg-[#090d16] background throughout
- Section backgrounds alternate: transparent / bg-slate-900/20
- Cards: bg-slate-900/40 border border-slate-800 rounded-xl p-6
- Primary button: bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl
- Secondary button: border border-slate-700 text-slate-300
- Headings: text-slate-100 font-black
- Body: text-slate-400
- Emerald for positive/trust items
- Keep existing Header component at top
- Add simple Footer at bottom with copyright

## AFTER WRITING
Run build:
cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"

Fix TypeScript errors if any.
Then: git add . && git commit -m "feat: landing page v2 redesign - product page" && git push origin master
