Read src/components/LeadPopup.tsx carefully first.

Then REWRITE src/components/LeadPopup.tsx completely according to the spec below.
Keep all existing logic (form submission, API call, sessionStorage, onClose, state management).
Only change the UI/copy.

---

## SPEC: LeadPopup redesign

### STATE
Keep existing state: formData, loading, submitted, errors
Add: step (1 or 2) for the two-part form layout

---

### POPUP WRAPPER
- Overlay: fixed inset-0 bg-black/75 backdrop-blur-sm z-50
- Modal: bg-[#0d1421] border border-slate-700 rounded-2xl
  max-w-4xl w-[95%] mx-auto my-4 overflow-y-auto max-h-[92vh]
- X close button: absolute top-4 right-4, text-slate-400 hover:text-slate-200

---

### FORM SCREEN (submitted === false)

#### HEADER (full width, top of modal)
```
Badge: "첫 방문자 한정 혜택" 
  → small pill, bg-emerald-500/20 text-emerald-400 border border-emerald-500/30

Title: "지금 내 투자상태, 어디서 막히는지 확인해보세요"
  → text-2xl md:text-3xl font-black text-slate-100

Subtitle: "30초만 입력하면 TraderMirror 7일 무료 체험권과 실수를 줄이는 투자 교과서 50% 할인권을 보내드립니다."
  → text-slate-400 text-sm

Small note: "혜택은 입력하신 연락처와 이메일로 발송됩니다."
  → text-emerald-400 text-xs font-medium
```

#### TWO COLUMN BODY (md:grid-cols-2, mobile: single col)

**LEFT COLUMN — Benefits cards**

Top 2 big benefit cards:

Card 1 (blue theme):
```
bg-blue-500/10 border border-blue-500/30 rounded-xl p-4
Badge: "무료 체험" (blue pill)
Title: "TraderMirror 7일 무료 체험권"
Desc: "내 매매패턴, 승률, 손익비, 반복 실수를 직접 확인해볼 수 있습니다."
```

Card 2 (emerald theme):
```
bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4
Badge: "50% 할인" (emerald pill)
Title: "실수를 줄이는 투자 교과서 50% 할인권"
Desc: "계좌 개설, 첫 매수 기준, 손절, 비중 관리, 차트, 자산 설계까지 내 투자 단계에 맞는 전자책을 신청자 한정가로 받을 수 있습니다."
Price: strikethrough "₩19,900" → "₩9,900" (emerald, bold)
Small: "by MoneyStep"
```

Bottom 2 small benefit rows (with check icons):
```
✓ 첫 매수 전 체크리스트
✓ 투자상태별 1:1 맞춤 진단
```
(text-sm text-slate-400, emerald checkmarks)

Bottom disclaimer (left col):
```
text-xs text-slate-600
"종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다."
```

**RIGHT COLUMN — Form**

Visual step indicator (not functional tabs, just labels):
```
STEP 1: 기본 정보  |  STEP 2: 투자상태
(show active step highlighted)
```

STEP 1 fields (show when step === 1):
1. 성함* — text, placeholder: "성함을 입력해주세요"
2. 연락처* — text, placeholder: "혜택과 할인권을 받을 연락처를 입력해주세요"
   helper (text-xs text-amber-400): "혜택은 입력하신 연락처와 이메일로 발송됩니다."
3. 이메일* — email, placeholder: "전자책 할인권과 자료를 받을 이메일을 입력해주세요"

STEP 1 button: "다음 →" (bg-blue-600, full width) → validates name/phone/email then setStep(2)

STEP 2 fields (show when step === 2):
4. 현재 투자 경험* — select:
   아직 시작 전 / 계좌는 있지만 거의 안 함 / 주식 현물 경험 있음 / 주식 선물 경험 있음 / 코인 현물 경험 있음 / 코인 선물 경험 있음 / 현재 손실 중 / 꾸준히 매매 중
5. 주로 관심 있는 투자* — select:
   주식 현물 / 주식 선물 / 코인 현물 / 코인 선물 / 주식과 코인 둘 다 / 아직 모르겠음
6. 현재 가장 막히는 부분* — select:
   뭘 사야 할지 모르겠음 / 손절 기준이 없음 / 수익은 짧게 먹고 손실은 오래 버팀 / 장 초반/급등주에 자주 물림 / 코인 선물 청산가·레버리지가 헷갈림 / 매매일지를 써도 어떻게 복기할지 모르겠음 / 감정매매/FOMO가 심함 / 적금만 하다가 투자를 시작하려니 무서움
7. 현재 투자금 규모 (선택) — select:
   아직 없음 / 100만원 미만 / 100~500만원 / 500~1,000만원 / 1,000만원 이상
8. 희망 안내 방식 (선택) — select:
   문자로 받고 싶음 / 카카오톡/문자로 받고 싶음 / 이메일로 받고 싶음 / 전화 안내도 괜찮음

STEP 2 buttons:
- "← 이전" (text button, goes back to step 1)
- "30초 입력하고 혜택 받기 →" (bg-blue-600, full width, submits form)

Below submit button:
```
text-xs text-slate-600 text-center
"종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다."
```

"나중에 볼게요" — text-slate-500 text-xs text-center, below everything, closes popup

---

### SUCCESS SCREEN (submitted === true)

Centered layout:

```
Big green check: ✅ or CheckCircle icon (large, emerald)

Title: "신청 혜택이 제공될 예정입니다"
  text-2xl font-black text-slate-100

Body:
"입력해주신 정보를 기준으로 TraderMirror 7일 무료 체험권과
실수를 줄이는 투자 교과서 50% 할인권을 안내드릴 예정입니다.
혜택은 입력하신 연락처와 이메일로 발송됩니다."

Benefits list (4 items with check icons):
✓ TraderMirror 7일 무료 체험권
✓ 실수를 줄이는 투자 교과서 50% 할인권
✓ 첫 매수 전 체크리스트
✓ 투자상태별 1:1 맞춤 진단

CTA (blue): "TraderMirror 시작하기 →" → Link href="/analyze"
Secondary (outline): "전자책 할인권 확인하기 →" → opens https://moneystep.imweb.me/ in new tab

Close button (text): "닫기"
```

---

## INPUT FIELD STYLING
All inputs/selects:
```
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
```

Labels: text-xs font-medium text-slate-400 mb-1

---

## ON SUBMIT
Same as before: POST to /api/leads with source='landing_form', then setSubmitted(true)
Add auto_tags via generateAutoTags if available, otherwise just submit formData

---

## AFTER WRITING
Run: cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
Fix errors.
git add . && git commit -m "feat: LeadPopup redesign - benefit cards + 2-step form" && git push origin master
