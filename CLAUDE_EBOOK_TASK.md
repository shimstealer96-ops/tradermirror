Read src/app/page.tsx first.

## TASK: Replace the ebook section in src/app/page.tsx

Find the existing ebook/전자책 section (currently shows "분석 후 읽으면 좋은 교재" badge and "내 패턴을 알았다면, 이제 고치는 기준이 필요합니다." title with a single book, ₩19,900 price, "전자책 보고 매매 기준 잡기" button).

REPLACE that entire section with the new multi-book series section below.

---

## NEW EBOOK SECTION

```jsx
<section className="py-20 px-4 bg-slate-900/20">
  <div className="max-w-6xl mx-auto">
    
    {/* Badge */}
    <div className="text-center mb-4">
      <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
        MoneyStep 전자책 50% 할인권 제공
      </span>
    </div>

    {/* Title */}
    <h2 className="text-3xl md:text-4xl font-black text-slate-100 text-center mb-4">
      내 매매 상태에 맞는 전자책을 선택하세요.
    </h2>

    {/* Body */}
    <div className="max-w-3xl mx-auto text-center mb-12">
      <p className="text-slate-400 leading-relaxed mb-4">
        TraderMirror로 내 매매 패턴을 확인했다면,<br />
        이제 중요한 건 <strong className="text-slate-200">'나에게 필요한 공부 순서'</strong>를 정하는 것입니다.
      </p>
      <p className="text-slate-400 leading-relaxed mb-4">
        주식이 처음이라면 첫 투자 기준부터,<br />
        매수 타이밍이 어렵다면 차트와 진입 기준부터,<br />
        자산을 장기적으로 키우고 싶다면 포트폴리오와 자산 설계부터 시작하세요.
      </p>
      <p className="text-slate-500 text-sm leading-relaxed">
        MoneyStep 전자책 시리즈는 종목 추천이나 수익 보장이 아니라,<br />
        투자자가 스스로 판단할 수 있는 기준을 단계별로 정리한 학습 자료입니다.
      </p>
    </div>

    {/* 3 Book Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

      {/* Vol.1 */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Vol.1</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">현재 제공</span>
        </div>
        <h3 className="text-lg font-black text-slate-100 mb-2">첫 투자 교과서</h3>
        <p className="text-xs text-blue-400 mb-3 font-medium">주식이 무섭고, 어디서부터 시작해야 할지 모르는 분</p>
        <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
          {['주식의 본질', '계좌 개설 후 첫 투자 순서', '기업과 시장을 보는 기본 기준', '차트 기초', '손절 기준', '비중 관리', '매매일지와 복기 루틴'].map(item => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-emerald-500">·</span> {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
          "좋은 종목보다 먼저, 첫 매수 전에 알아야 할 기준을 잡는 입문서입니다."
        </p>
        <div className="text-center">
          <p className="text-xs text-slate-500 line-through mb-1">정가 ₩19,900</p>
          <p className="text-emerald-400 font-black text-lg mb-3">신청자 한정 ₩9,900</p>
          <button onClick={() => {/* open lead popup */}}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
            50% 할인권 받기 →
          </button>
        </div>
      </div>

      {/* Vol.2 */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col relative opacity-80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Vol.2</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">출시 예정</span>
        </div>
        <h3 className="text-lg font-black text-slate-100 mb-2">차트·매수 타이밍 편</h3>
        <p className="text-xs text-purple-400 mb-3 font-medium">기초는 알지만 언제 사고팔아야 할지 어려운 분</p>
        <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
          {['차트 구조 이해', '지지와 저항', '거래량 해석', '오더블록', 'FVG', 'SR플립', '멀티타임프레임', '진입하면 안 되는 자리'].map(item => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-purple-500">·</span> {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
          "감으로 들어가는 매매를 줄이고, 차트에서 진입 기준을 찾는 실전편입니다."
        </p>
        <div className="text-center">
          <button onClick={() => {/* open lead popup */}}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold rounded-xl transition-colors">
            출시 알림 신청하기
          </button>
        </div>
      </div>

      {/* Vol.3 */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col relative opacity-80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Vol.3</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">출시 예정</span>
        </div>
        <h3 className="text-lg font-black text-slate-100 mb-2">자산 설계·포트폴리오 편</h3>
        <p className="text-xs text-orange-400 mb-3 font-medium">단기 매매를 넘어 자산을 장기적으로 키우고 싶은 분</p>
        <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
          {['시드별 투자 전략', 'ETF 활용법', '자산 배분', '리밸런싱', 'ISA·연금저축·IRP 기초', '세금과 환율', '장기 포트폴리오 설계'].map(item => (
            <li key={item} className="flex items-center gap-1.5">
              <span className="text-orange-500">·</span> {item}
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
          "단타와 종목 매매를 넘어, 내 자산 전체를 설계하는 포트폴리오편입니다."
        </p>
        <div className="text-center">
          <button onClick={() => {/* open lead popup */}}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold rounded-xl transition-colors">
            출시 알림 신청하기
          </button>
        </div>
      </div>

    </div>

    {/* Bottom checkpoints + CTA */}
    <div className="max-w-2xl mx-auto text-center">
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-sm text-slate-400">
        <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 내 투자 상태에 맞는 전자책 선택 가능</span>
        <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 단계별 학습 가능</span>
        <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 종목 추천 아닌 판단 기준 학습</span>
      </div>
      <button onClick={() => {/* open lead popup - pass setLeadPopupOpen(true) */}}
        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-emerald-500/10">
        내게 맞는 전자책 50% 할인권 받기 →
      </button>
      <p className="text-xs text-slate-600 mt-4">
        본 자료는 학습용이며 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
      </p>
    </div>

  </div>
</section>
```

IMPORTANT: The buttons in the ebook cards that say "50% 할인권 받기" and "출시 알림 신청하기" should call `setLeadPopupOpen(true)` — the same state that controls the LeadPopup. So these buttons open the existing LeadPopup modal.

Make sure setLeadPopupOpen is accessible in this section (it's already defined in the page component).

---

After replacing the section:
1. Run: cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
2. Fix TypeScript errors if any
3. git add . && git commit -m "feat: ebook section redesign - MoneyStep series Vol.1/2/3" && git push origin master
