'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, X } from 'lucide-react'

interface LeadPopupProps {
  isOpen: boolean
  onClose: () => void
}

const experienceOptions = [
  '아직 시작 전',
  '계좌는 있지만 거의 안 함',
  '주식 현물 경험 있음',
  '주식 선물 경험 있음',
  '코인 현물 경험 있음',
  '코인 선물 경험 있음',
  '현재 손실 중',
  '꾸준히 매매 중',
]

const interestOptions = [
  '주식 현물',
  '주식 선물',
  '코인 현물',
  '코인 선물',
  '주식과 코인 둘 다',
  '아직 모르겠음',
]

const painOptions = [
  '뭘 사야 할지 모르겠음',
  '손절 기준이 없음',
  '수익은 짧게 먹고 손실은 오래 버팀',
  '장 초반/급등주에 자주 물림',
  '코인 선물 청산가·레버리지가 헷갈림',
  '매매일지를 써도 어떻게 복기할지 모르겠음',
  '감정매매/FOMO가 심함',
  '적금만 하다가 투자를 시작하려니 무서움',
]

const amountOptions = [
  '아직 없음',
  '100만원 미만',
  '100~500만원',
  '500~1,000만원',
  '1,000만원 이상',
]

const contactOptions = [
  '문자로 받고 싶음',
  '카카오톡/문자로 받고 싶음',
  '이메일로 받고 싶음',
  '전화 안내도 괜찮음',
]

const inputClass =
  'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm transition-colors'

const labelClass = 'block text-xs font-medium text-slate-400 mb-1'

export default function LeadPopup({ isOpen, onClose }: LeadPopupProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    investment_experience: '',
    investment_interest: '',
    pain_point: '',
    investment_amount: '',
    preferred_contact: '',
  })

  const handleClose = () => {
    sessionStorage.setItem('lead_popup_dismissed', '1')
    onClose()
  }

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = '성함을 입력해주세요'
    if (!formData.phone.trim()) errs.phone = '연락처를 입력해주세요'
    if (!formData.email.trim()) errs.email = '이메일을 입력해주세요'
    return errs
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!formData.investment_experience) errs.investment_experience = '투자 경험을 선택해주세요'
    if (!formData.investment_interest) errs.investment_interest = '관심 투자를 선택해주세요'
    if (!formData.pain_point) errs.pain_point = '막히는 부분을 선택해주세요'
    return errs
  }

  const handleNext = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setErrors({})
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'landing_form' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '오류가 발생했습니다.')
      }
      setSubmitted(true)
    } catch (err: unknown) {
      setErrors({ submit: err instanceof Error ? err.message : '오류가 발생했습니다.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-4xl w-[95%] mx-auto overflow-hidden">

        {/* ── SUCCESS SCREEN ── */}
        {submitted ? (
          <div className="p-8 text-center">
            <button onClick={handleClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="h-6 w-6" />
            </button>
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-100 mb-4">신청 혜택이 제공될 예정입니다</h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto text-sm">
              입력해주신 정보를 기준으로 TraderMirror Pro 기능 7일권과
              실수를 줄이는 투자 교과서 50% 할인권을 안내드릴 예정입니다.<br />
              혜택은 입력하신 연락처와 이메일로 발송됩니다.
            </p>
            <div className="space-y-2.5 mb-8 inline-block text-left">
              {[
                'Pro 기능 7일권 추가 무료제공',
                '실수를 줄이는 투자 교과서 50% 할인권',
                '첫 매수 전 체크리스트',
                '투자상태별 1:1 맞춤 진단',
              ].map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link href="/analyze" onClick={handleClose}>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  TraderMirror 시작하기 →
                </button>
              </Link>
              <a href="https://moneystep.imweb.me/" target="_blank" rel="noopener noreferrer">
                <button className="w-full border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold px-6 py-3 rounded-xl transition-colors">
                  전자책 할인권 확인하기 →
                </button>
              </a>
              <button onClick={handleClose} className="text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors">
                닫기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div className="relative px-6 pt-6 pb-4 text-center border-b border-slate-800">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="닫기"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                첫 방문자 한정 혜택
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 mb-2">
                지금 내 투자상태, 어디서 막히는지 확인해보세요
              </h2>
              <p className="text-slate-400 text-sm mb-1">
                30초만 입력하면 TraderMirror Pro 기능 7일권과 실수를 줄이는 투자 교과서 50% 할인권을 보내드립니다.
              </p>
              <p className="text-emerald-400 text-xs font-medium">
                혜택은 입력하신 연락처와 이메일로 발송됩니다.
              </p>
            </div>

            {/* ── BODY: 2-col ── */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT: Benefit Cards */}
              <div className="space-y-3">
                {/* Card 1: Free trial */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    무료 제공
                  </span>
                  <p className="text-sm font-bold text-slate-100 mb-1">Pro 기능 7일권 추가 무료제공</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    내 매매패턴, 승률, 손익비, 반복 실수를 직접 확인해볼 수 있습니다.
                  </p>
                </div>

                {/* Card 2: Ebook discount */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    50% 할인
                  </span>
                  <p className="text-sm font-bold text-slate-100 mb-1">실수를 줄이는 투자 교과서 50% 할인권</p>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">
                    계좌 개설, 첫 매수 기준, 손절, 비중 관리, 차트, 자산 설계까지 내 투자 단계에 맞는 전자책을 신청자 한정가로 받을 수 있습니다.
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="line-through">₩19,900</span>
                    <span className="text-emerald-400 font-black text-sm ml-2">→ ₩9,900</span>
                    <span className="text-slate-600 ml-2">by MoneyStep</span>
                  </p>
                </div>

                {/* Small benefits */}
                <div className="space-y-2 px-1">
                  {['첫 매수 전 체크리스트', '투자상태별 1:1 맞춤 진단'].map((b) => (
                    <div key={b} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-slate-400">{b}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 pt-1">
                  종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다.
                </p>
              </div>

              {/* RIGHT: 2-step Form */}
              <div>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    STEP 1 · 기본 정보
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (Object.keys(validateStep1()).length === 0) setStep(2) }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    STEP 2 · 투자상태
                  </button>
                </div>

                {step === 1 && (
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>성함 *</label>
                      <input
                        type="text"
                        placeholder="성함을 입력해주세요"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                      />
                      {errors.name && <p className="mt-1 text-red-400 text-xs">{errors.name}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>연락처 *</label>
                      <input
                        type="text"
                        placeholder="혜택과 할인권을 받을 연락처를 입력해주세요"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className={inputClass}
                      />
                      <p className="mt-1 text-xs text-amber-400">혜택은 입력하신 연락처와 이메일로 발송됩니다.</p>
                      {errors.phone && <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>이메일 *</label>
                      <input
                        type="email"
                        placeholder="전자책 할인권과 자료를 받을 이메일을 입력해주세요"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                      />
                      {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors mt-2"
                    >
                      다음 →
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full text-slate-500 hover:text-slate-400 text-xs py-1.5 transition-colors"
                    >
                      나중에 볼게요
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className={labelClass}>현재 투자 경험 *</label>
                      <select
                        value={formData.investment_experience}
                        onChange={e => setFormData({ ...formData, investment_experience: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">선택해주세요</option>
                        {experienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {errors.investment_experience && <p className="mt-1 text-red-400 text-xs">{errors.investment_experience}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>주로 관심 있는 투자 *</label>
                      <select
                        value={formData.investment_interest}
                        onChange={e => setFormData({ ...formData, investment_interest: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">선택해주세요</option>
                        {interestOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {errors.investment_interest && <p className="mt-1 text-red-400 text-xs">{errors.investment_interest}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>현재 가장 막히는 부분 *</label>
                      <select
                        value={formData.pain_point}
                        onChange={e => setFormData({ ...formData, pain_point: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">선택해주세요</option>
                        {painOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                      {errors.pain_point && <p className="mt-1 text-red-400 text-xs">{errors.pain_point}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>현재 투자금 규모 (선택)</label>
                      <select
                        value={formData.investment_amount}
                        onChange={e => setFormData({ ...formData, investment_amount: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">선택해주세요</option>
                        {amountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>희망 안내 방식 (선택)</label>
                      <select
                        value={formData.preferred_contact}
                        onChange={e => setFormData({ ...formData, preferred_contact: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">선택해주세요</option>
                        {contactOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>

                    {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors text-sm"
                      >
                        ← 이전
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                      >
                        {loading ? '처리 중...' : '30초 입력하고 혜택 받기 →'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 text-center leading-relaxed">
                      종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다.
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full text-slate-500 hover:text-slate-400 text-xs py-1 transition-colors"
                    >
                      나중에 볼게요
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* BOTTOM disclaimer */}
            <div className="px-6 pb-4">
              <p className="text-xs text-slate-600 text-center leading-relaxed">
                본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
