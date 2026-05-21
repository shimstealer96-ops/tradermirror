Read src/app/page.tsx first to understand current structure.
Read src/components/LeadForm.tsx to understand the existing form component.

## TASK: Convert landing page lead form section → first-visit popup modal

### 1. Modify src/app/page.tsx

REMOVE the existing lead form section (the full section with "내 투자상태에 맞는 혜택과 전자책 할인권 받기" that has the form embedded inline).

REPLACE it with a simple teaser section:
```
<section className="py-16 px-4">
  <div className="max-w-2xl mx-auto text-center">
    <p className="text-slate-400 mb-4">내 투자상태에 맞는 혜택과 전자책 할인권을 받아보세요</p>
    <button onClick={() => setLeadPopupOpen(true)}
      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
      혜택·할인권 받기
    </button>
  </div>
</section>
```

ADD state: const [leadPopupOpen, setLeadPopupOpen] = useState(false)

ADD useEffect that auto-opens popup after 3 seconds IF sessionStorage key 'lead_popup_dismissed' is NOT set:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (!sessionStorage.getItem('lead_popup_dismissed')) {
      setLeadPopupOpen(true)
    }
  }, 3000)
  return () => clearTimeout(timer)
}, [])
```

ADD floating button (fixed bottom-right):
```jsx
<button
  onClick={() => setLeadPopupOpen(true)}
  className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors">
  🎁 전자책 50% 할인권 받기
</button>
```

### 2. Create src/components/LeadPopup.tsx

Full-screen modal popup component.

Props:
- isOpen: boolean
- onClose: () => void

On close: set sessionStorage.setItem('lead_popup_dismissed', '1') then call onClose()

Internal state:
- submitted: boolean (show success screen after form submit)
- formData: { name, phone, email, investment_experience, investment_interest, pain_point, investment_amount, preferred_contact }
- loading: boolean
- errors: object

#### POPUP STRUCTURE:

Overlay: fixed inset-0 bg-black/70 backdrop-blur-sm z-50, click outside closes
Modal card: bg-[#0d1421] border border-slate-700 rounded-2xl max-w-4xl w-[95%] mx-auto my-8 overflow-y-auto max-h-[90vh]

#### FORM SCREEN (submitted === false):

TOP SECTION (header):
```
제목: "내 투자상태에 맞는 혜택과 전자책 할인권 받기"
서브: "30초만 입력하면 현재 투자 상태에 맞는 혜택과 MoneyStep 전자책 50% 할인권을 보내드립니다."
강조: "정확한 연락처를 남겨주셔야 혜택과 할인권 제공이 가능합니다." (amber/yellow text)
X close button top-right
```

TWO COLUMN LAYOUT (md:grid-cols-2, mobile: 1 col):

LEFT COLUMN — Benefits card (bg-slate-900/60 rounded-xl p-6):
```
제목: "신청 시 제공 혜택"
리스트 (체크마크 + 초록):
✅ TraderMirror 7일 무료 체험권
✅ MoneyStep 전자책 50% 할인권
   정가 ₩19,900 → 신청자 한정 ₩9,900
✅ 첫 매수 전 체크리스트
✅ 투자상태별 1:1 맞춤 진단
✅ 전자책 미리보기 PDF

하단 disclaimer:
"종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다."
```

RIGHT COLUMN — Form:

Fields (all dark theme: bg-slate-800 border-slate-700):

1. 성함* — text input, placeholder: "성함을 입력해주세요"
2. 연락처* — text input, placeholder: "혜택과 할인권을 받을 연락처를 입력해주세요"
   helper text (amber): "정확한 연락처를 남겨주셔야 혜택과 할인권 제공이 가능합니다."
3. 이메일* — email input, placeholder: "전자책 할인권과 자료를 받을 이메일을 입력해주세요"
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

BUTTONS:
- Primary: "혜택과 할인권 신청하기 →" (bg-blue-600, full width)
- Secondary: "나중에 볼게요" (text-slate-500, full width, closes popup)

BOTTOM:
"본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다."

ON SUBMIT:
- Validate required fields
- POST to /api/leads with source='landing_form' (first visit popup)
- Set submitted = true

#### SUCCESS SCREEN (submitted === true):

Center layout with:
- ✅ big green checkmark icon
- 제목: "신청 혜택이 제공될 예정입니다"
- 본문: "입력해주신 정보를 기준으로 TraderMirror 7일 무료 체험권과 MoneyStep 전자책 50% 할인권을 안내드릴 예정입니다. 정확한 연락처와 이메일을 남겨주셔야 혜택 제공이 가능합니다."
- Benefits list (same as left column)
- CTA: "TraderMirror 시작하기 →" → Link href="/analyze"
- Secondary: "MoneyStep 전자책 보러가기 →" → (href="#" for now)
- Close button

### 3. Update src/app/page.tsx to use LeadPopup

Import and add <LeadPopup isOpen={leadPopupOpen} onClose={() => setLeadPopupOpen(false)} />

Make sure all existing "무료로 매매패턴 분석하기" CTA buttons still have the popup intercept (the CTA popup from before). Keep that logic too. But the lead popup (first visit) is separate from the CTA analyze popup.

Actually — simplify: remove the CTA analyze popup interceptor (the one that showed before going to /analyze). Keep only:
1. First-visit auto popup (LeadPopup) — for lead collection
2. Direct navigation to /analyze for the CTA buttons

The CTA analyze popup was getting in the way of user flow. Just navigate directly to /analyze.

### 4. Build and deploy

cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
Fix errors.
git add . && git commit -m "feat: first-visit lead popup + floating button + remove inline form" && git push origin master
