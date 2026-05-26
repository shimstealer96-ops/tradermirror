# CLAUDE_JOURNAL_FORM_V2.md
# 매매 기록 폼 전면 개편 태스크

## 대상 파일
`src/app/journal/new/page.tsx`

## 목표
기존 5단계 탭 구조 → 2단계 구조로 전면 재작성.
30초 안에 필수 입력 완료 가능하도록 UX 개선.

---

## 1. 전체 구조 변경

### 기존
- 5개 탭(기본정보/진입청산/리스크/시장상황/감정복기) + 이전/다음 버튼

### 변경 후
- **1단계(필수)**: 상단에 항상 표시
- **[상세 기록하기 ▼] 버튼**: 클릭 시 아래로 부드럽게 펼쳐짐 (transition)
- **2단계(선택)**: 펼쳐진 영역에 상세 항목 표시
- 제출 버튼은 항상 하단에 표시

---

## 2. 진입 근거 태그 용어 변경

기존 key는 유지하되 label만 변경:
- `order_block` → "지지/저항"
- `fvg` → "가격 공백"
- `sr_flip` → "추세 전환"
- `moving_average` → "이동평균선" (유지)
- `rsi` → "RSI" (유지)
- `volume` → "거래량" (유지)
- `supply_demand` → "기관/외국인 수급"
- `earnings` → "실적" (유지)
- `news` → "뉴스" (유지)
- `macro` → "매크로" (유지)
- `community` → "커뮤니티" (유지)
- `gut_feeling` → "감(직관)"

---

## 3. 자산 유형별 1단계 필수 항목

### 주식 현물 (stock_spot)
1단계(필수):
- 종목명 (text input)
- 매수가 / 매도가 / 수량 (number inputs, 3열 그리드)
- 매수일시 / 매도일시 (datetime-local, 2열)
- 수익/손실 자동 계산 표시 (매수가·매도가·수량 입력 시 실시간)
- 진입 근거 태그 (단일 선택, 태그 버튼 UI)
- 감정 상태 태그 (단일 선택)
- 매매 점수 슬라이더 (1~10)

2단계(선택, 펼침):
- 손절 기준 (text)
- 목표가 (number)
- 원칙 준수 여부 (yes/no/partial 3버튼)
- 특이사항 메모 (textarea, 시장상황 체크박스 대체)
- 한 줄 복기 (text)
- 메모 (textarea, 자유입력 — 기존 잘한점/실수/개선점 통합)

### 코인 선물 (crypto_futures)
1단계(필수):
- 코인 심볼 (text, 예: BTCUSDT)
- 포지션 방향 토글 (롱 🟢 / 숏 🔴, 크게 표시)
- 레버리지 (number)
- 진입가 / 청산가 (number inputs, 2열)
- 진입일시 / 청산일시 (datetime-local, 2열)
- 실시간 계산 표시:
  - 수익률 % + 수익금액 (초록/빨강)
  - 예상 강제청산가 (빨간색 강조)
- 감정 상태 태그 (단일 선택)
- 매매 점수 슬라이더 (1~10)

2단계(선택, 펼침):
- 증거금 모드 (격리/교차 토글)
- 증거금 (number)
- 펀딩비 (number)
- 수수료 (number)
- 진입 근거 태그 (단일 선택)
- 한 줄 복기 (text)
- 메모 (textarea)

### 주식 선물 (stock_futures)
1단계(필수):
- 종목/계약명 (text)
- 포지션 방향 토글 (롱/숏)
- 레버리지 (number)
- 진입가 / 청산가 (number inputs, 2열)
- 계약수 / 승수 (number inputs, 2열)
- 진입일시 / 청산일시 (datetime-local, 2열)
- 실시간 계산 표시 (손익 + ROE)
- 강제청산가 자동 계산 (빨간색)
- 감정 상태 태그 (단일 선택)
- 매매 점수 슬라이더 (1~10)

2단계(선택, 펼침):
- 증거금 (number)
- 수수료 (number)
- 진입 근거 태그 (단일 선택)
- 손절 기준 (text)
- 특이사항 메모 (textarea)
- 한 줄 복기 (text)
- 메모 (textarea)

### 코인 현물 (crypto_spot)
1단계(필수):
- 코인 심볼 (text)
- 평균 매수가 / 평균 매도가 (number inputs, 2열)
- 수량 또는 투자금액 (input_method 선택: by_amount / by_quantity)
- 진입일시 / 청산일시 (datetime-local, 2열)
- 수익 자동 계산 표시 (실시간)
- 감정 상태 태그 (단일 선택)
- 매매 점수 슬라이더 (1~10)

2단계(선택, 펼침):
- 수수료 (number)
- 진입 근거 태그 (단일 선택)
- 한 줄 복기 (text)
- 메모 (textarea)

---

## 4. 강제청산가 자동 계산 공식

롱: `진입가 × (1 - 1/레버리지 + 0.004)`
숏: `진입가 × (1 + 1/레버리지 - 0.004)`

표시: "예상 강제청산가: ₩{value}" — 빨간색 텍스트로 강조
조건: 진입가 AND 레버리지 둘 다 입력됐을 때만 표시

---

## 5. 실시간 수익 계산 표시

모든 자산 유형에서:
- 진입가 + 청산가(매도가) 입력 시 실시간으로 계산
- 수익이면: `+23.5% / +₩235,000` 초록색
- 손실이면: `-15.2% / -₩152,000` 빨간색
- 카드 형태로 눈에 잘 띄게 표시

---

## 6. UI 스타일 가이드

- 다크 테마 유지: `bg-[#090d16]`, slate 색상 계열
- 필수 입력 섹션: `bg-slate-900/60 border border-slate-700 rounded-2xl p-6`
- 상세 펼침 섹션: `bg-slate-900/40 border border-slate-800 rounded-2xl p-6`
- 상세 펼침 버튼: `border border-slate-600 text-slate-400 hover:text-slate-200` + ChevronDown/ChevronUp 아이콘
- 포지션 토글(롱/숏): 롱=초록(bg-emerald-600), 숏=빨강(bg-red-600), 비선택=슬레이트
- 태그 버튼: 선택시 `bg-blue-600 text-white`, 미선택시 `bg-slate-800 text-slate-400`
- 감정 태그 색상 유지 (calm=emerald, anxious=yellow, fomo/revenge=red 등)
- 슬라이더: `accent-blue-500`
- 자동 계산 결과 카드: `bg-slate-800/60 rounded-xl p-4`
- 강제청산가: `text-red-400 font-black`
- 수익 표시: `text-emerald-400 font-black` / `text-red-400 font-black`

---

## 7. 기존에 유지할 것

- 4개 자산 유형 선택 카드 UI (상단)
- 자산 유형 선택 전에는 폼 숨김
- Supabase insert 로직 (기존 payload 구조 유지)
- 기존 상태 변수명 최대한 유지 (cf, ss, sf, cs, common)
- LimitModal 연결 (기존 추가된 것 유지)
- useUserPlan, useDailyLimits 훅 연결 (기존 유지)
- 면책 고지 하단 표시

---

## 8. 기존에 제거할 것

- 5개 탭(SECTIONS 배열, 탭 네비게이션 UI)
- 이전/다음 버튼
- 시장상황 탭의 체크박스 6개
  (check_foreign_flow, check_institutional_flow, check_retail_flow, has_earnings, has_disclosure, has_dividend)
  → "특이사항 메모" textarea 1개로 통합
- 잘한 점(good_points) / 실수한 점(mistakes) / 개선점(improvements)
  → "메모" 1개(review_summary 필드 재활용)로 통합

---

## 구현 주의사항

1. page.tsx는 'use client' 유지
2. Supabase payload에서 제거된 필드는 null로 전송
3. 슬라이더 값은 1~10 정수, 초기값 5
4. 모바일 우선 레이아웃 (max-w-2xl mx-auto)
5. 자산 유형 선택 카드는 그대로 유지 (상단 고정)
6. 파일 길이가 길어도 괜찮으니 완성도 있게 작성할 것
