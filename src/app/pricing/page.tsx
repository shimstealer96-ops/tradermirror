'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, ChevronUp, Zap, X } from 'lucide-react'
import { useUserPlan } from '@/hooks/useUserPlan'

const ALL_FEATURES = [
  { label: '매매 일지 기록', free: true },
  { label: '기본 승률 / 손익 요약', free: true },
  { label: '시간대별 승률 차트', free: true },
  { label: '수익/손실 보유기간 비교', free: true },
  { label: '요일별 성과', free: true },
  { label: '청산가 계산기', free: true },
  { label: '진입 근거별 성과 분석', free: false },
  { label: '감정 상태별 성과 분석', free: false },
  { label: '원칙 준수 여부별 분석', free: false },
  { label: '손절 기준 작성 여부 분석', free: false },
  { label: '자산 유형별 상세 분석', free: false },
  { label: 'AI 매매 리포트', free: false },
  { label: '수익률 착시 교정기', free: false },
  { label: '펀딩피 계산기 전체 기능', free: false },
]

const FAQS = [
  {
    q: '7일 후 자동 결제 되나요?',
    a: '아니요. 7일 체험 후 자동 결제는 없습니다. 계속 이용하시려면 직접 Pro로 전환해주세요.',
  },
  {
    q: '해지는 언제든 가능한가요?',
    a: '네. 언제든 즉시 해지 가능합니다. 해지 후 남은 기간은 계속 사용하실 수 있습니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '결제 후 7일 이내 전액 환불 가능합니다. 고객센터로 문의해주세요.',
  },
  {
    q: '이 서비스가 종목을 추천하나요?',
    a: '아닙니다. TraderMirror는 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 사용자의 매매기록을 분석해 반복 실수를 보여주는 복기 도구입니다.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-slate-200 font-semibold hover:text-white transition-colors text-sm"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-4" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-4" />}
      </button>
      {open && <p className="pb-4 text-slate-400 text-sm leading-relaxed">{a}</p>}
    </div>
  )
}

function PaymentComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-sm w-full p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="text-xl font-black text-slate-100 mb-3">결제 시스템 준비 중</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          토스페이먼츠 결제 연동을 준비 중입니다.<br />
          현재는 <span className="text-blue-400 font-bold">7일 무료 체험</span>으로 Pro 기능을 모두 사용하실 수 있습니다.
        </p>
        <div className="space-y-3">
          <Link href="/login" onClick={onClose}>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors">
              7일 무료로 먼저 사용해보기 →
            </button>
          </Link>
          <button onClick={onClose} className="w-full text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors">
            닫기
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-4">결제 오픈 시 알림을 원하시면 하단 리드폼을 통해 신청해주세요.</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentType, setPaymentType] = useState<'monthly' | 'yearly'>('yearly')
  const { isTrial, trialDaysLeft } = useUserPlan()

  const handlePro = (type: 'monthly' | 'yearly') => {
    setPaymentType(type)
    setShowPaymentModal(true)
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {showPaymentModal && <PaymentComingSoonModal onClose={() => setShowPaymentModal(false)} />}

      <main className="max-w-6xl mx-auto px-4 py-16">

        {/* ── 헤드라인 ── */}
        <div className="text-center mb-14">
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            요금제
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-100 mb-4 leading-tight">
            7일 무료로 시작하세요.<br />
            <span className="text-blue-400">내 매매 패턴을 먼저 확인해보세요.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            신용카드 없이 바로 시작할 수 있습니다. 7일 후 자동 결제 없이 직접 선택하세요.
          </p>
        </div>

        {/* ── 체험 중 배너 ── */}
        {isTrial && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-10 max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-sm font-medium">
                현재 Pro 무료 체험 중 — <span className="font-black text-white">{trialDaysLeft}일</span> 남았습니다.
              </p>
            </div>
            <button
              onClick={() => handlePro('monthly')}
              className="shrink-0 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              지금 Pro로 전환하기
            </button>
          </div>
        )}

        {/* ── 요금제 카드 3개 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 items-start">

          {/* 무료 체험 */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">무료 체험</p>
              <p className="text-4xl font-black text-slate-100">₩0</p>
              <p className="text-slate-400 text-sm mt-2">7일간 전체 기능 무제한</p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1 text-sm text-slate-300">
              {['7일간 전체 기능 무제한', '신용카드 불필요', '가입 즉시 시작', '7일 후 자동 결제 없음'].map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <button className="w-full py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold rounded-xl transition-colors text-sm">
                무료로 시작하기
              </button>
            </Link>
            <p className="text-xs text-slate-600 text-center mt-3">카드 정보 필요 없음</p>
          </div>

          {/* Pro 연간 — 가운데 강조 */}
          <div className="relative bg-gradient-to-b from-emerald-950/60 to-slate-900/80 border-2 border-emerald-500/60 rounded-2xl p-7 flex flex-col shadow-xl shadow-emerald-500/10 md:-mt-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full">가장 인기</span>
              <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-black rounded-full">2개월 무료</span>
            </div>
            <div className="mb-6 mt-2">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Pro 연간</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <p className="text-4xl font-black text-slate-100">₩6,600</p>
                <p className="text-slate-400 text-sm">/ 월</p>
              </div>
              <p className="text-slate-500 text-xs line-through">월 ₩9,900</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                  33% 할인
                </span>
                <p className="text-slate-400 text-sm">연 ₩79,200 청구</p>
              </div>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1 text-sm text-slate-200">
              {['모든 Pro 기능 무제한', 'AI 매매 리포트', '전체 기간 분석', '연간 최저가'].map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePro('yearly')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-500/20 text-sm"
            >
              연간 시작하기 →
            </button>
            <p className="text-xs text-emerald-600 text-center mt-3">연 ₩79,200 · 언제든 해지 가능</p>
          </div>

          {/* Pro 월간 */}
          <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Pro 월간</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black text-slate-100">₩9,900</p>
                <p className="text-slate-400 text-sm">/ 월</p>
              </div>
              <p className="text-slate-400 text-sm mt-2">전체 기능 무제한</p>
            </div>
            <ul className="space-y-2.5 mb-8 flex-1 text-sm text-slate-200">
              {['모든 Pro 기능 무제한', 'AI 매매 리포트', '전체 기간 분석', '월 단위 결제'].map(f => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-blue-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePro('monthly')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors text-sm"
            >
              월간 시작하기
            </button>
            <p className="text-xs text-slate-600 text-center mt-3">월 ₩9,900 · 언제든 해지 가능</p>
          </div>
        </div>

        {/* ── 기능 비교표 ── */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-xl font-black text-slate-100 text-center mb-6">전체 기능 비교</h2>
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-800/60 px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">
              <div>기능</div>
              <div className="text-center">Free</div>
              <div className="text-center text-emerald-400">Pro</div>
            </div>
            {ALL_FEATURES.map((f, i) => (
              <div
                key={f.label}
                className={`grid grid-cols-3 px-6 py-3.5 text-sm items-center ${i % 2 === 0 ? 'bg-slate-900/20' : ''} border-b border-slate-800/50 last:border-0`}
              >
                <span className="text-slate-300">{f.label}</span>
                <div className="flex justify-center">
                  {f.free
                    ? <Check className="h-4 w-4 text-emerald-400" />
                    : <span className="text-slate-700 text-lg">—</span>}
                </div>
                <div className="flex justify-center">
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-xl font-black text-slate-100 text-center mb-6">자주 묻는 질문</h2>
          <div className="divide-y divide-slate-800">
            {FAQS.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>

        {/* ── 전자책 CTA ── */}
        <div className="max-w-3xl mx-auto mb-12 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-4xl shrink-0">📚</div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xs font-bold text-emerald-400 mb-1">함께 사용하면 더 효과적입니다</p>
              <h3 className="text-lg font-black text-slate-100 mb-2">
                이 패턴을 고치는 방법 →<br />
                <span className="text-emerald-400">실수를 줄이는 투자 교과서</span>
              </h3>
              <p className="text-slate-400 text-sm">
                TraderMirror로 내 실수 패턴을 발견했다면, 전자책으로 개선 방법을 학습하세요.
              </p>
            </div>
            <div className="shrink-0 text-center">
              <p className="text-slate-500 text-xs line-through mb-1">정가 ₩19,900</p>
              <p className="text-emerald-400 font-black text-lg mb-3">신청자 한정 ₩9,900</p>
              <a href="https://moneystep.imweb.me/" target="_blank" rel="noopener noreferrer">
                <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors text-sm">
                  전자책 50% 할인 받기 →
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-xs text-slate-700 text-center leading-relaxed">
          본 서비스는 사용자의 매매기록을 바탕으로 한 복기 도구입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다.
        </p>
      </main>
    </div>
  )
}
