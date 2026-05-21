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

const benefitsList = [
  'TraderMirror 7일 무료 체험권',
  'MoneyStep 전자책 50% 할인권',
  '첫 매수 전 체크리스트',
  '투자상태별 1:1 맞춤 진단',
  '전자책 미리보기 PDF',
]

const inputClass =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

export default function LeadPopup({ isOpen, onClose }: LeadPopupProps) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
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

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = '성함을 입력해주세요'
    if (!formData.phone.trim()) errs.phone = '연락처를 입력해주세요'
    if (!formData.email.trim()) errs.email = '이메일을 입력해주세요'
    if (!formData.investment_experience) errs.investment_experience = '투자 경험을 선택해주세요'
    if (!formData.investment_interest) errs.investment_interest = '관심 투자를 선택해주세요'
    if (!formData.pain_point) errs.pain_point = '막히는 부분을 선택해주세요'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-4xl w-[95%] mx-auto my-8 overflow-y-auto max-h-[90vh]">
        {submitted ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-100 mb-4">신청 혜택이 제공될 예정입니다</h2>
            <p className="text-slate-400 leading-relaxed mb-8 max-w-lg mx-auto">
              입력해주신 정보를 기준으로 TraderMirror 7일 무료 체험권과 MoneyStep 전자책 50% 할인권을 안내드릴 예정입니다.
              정확한 연락처와 이메일을 남겨주셔야 혜택 제공이 가능합니다.
            </p>
            <div className="space-y-3 mb-8 inline-block text-left">
              {benefitsList.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link href="/analyze">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  TraderMirror 시작하기 →
                </button>
              </Link>
              <a href="#">
                <button className="w-full border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold px-6 py-3 rounded-xl transition-colors">
                  MoneyStep 전자책 보러가기 →
                </button>
              </a>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative p-6 pb-4 border-b border-slate-800">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="닫기"
              >
                <X className="h-6 w-6" />
              </button>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 pr-10">
                내 투자상태에 맞는 혜택과 전자책 할인권 받기
              </h2>
              <p className="mt-2 text-slate-400 text-sm leading-relaxed">
                30초만 입력하면 현재 투자 상태에 맞는 혜택과 MoneyStep 전자책 50% 할인권을 보내드립니다.
              </p>
              <p className="mt-2 text-amber-400 text-sm font-semibold">
                정확한 연락처를 남겨주셔야 혜택과 할인권 제공이 가능합니다.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900/60 rounded-xl p-6">
                <p className="text-slate-200 font-bold mb-4">신청 시 제공 혜택</p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm">TraderMirror 7일 무료 체험권</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">
                      MoneyStep 전자책 50% 할인권
                      <br />
                      <span className="text-slate-500 text-xs">
                        정가 <span className="line-through">₩19,900</span> → 신청자 한정 <span className="text-emerald-400 font-bold">₩9,900</span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm">첫 매수 전 체크리스트</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm">투자상태별 1:1 맞춤 진단</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span className="text-slate-300 text-sm">전자책 미리보기 PDF</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
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
                  <input
                    type="text"
                    placeholder="혜택과 할인권을 받을 연락처를 입력해주세요"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-amber-500">
                    정확한 연락처를 남겨주셔야 혜택과 할인권 제공이 가능합니다.
                  </p>
                  {errors.phone && <p className="mt-1 text-red-400 text-xs">{errors.phone}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="전자책 할인권과 자료를 받을 이메일을 입력해주세요"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass}
                  />
                  {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
                </div>

                <div>
                  <select
                    value={formData.investment_experience}
                    onChange={e => setFormData({ ...formData, investment_experience: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">현재 투자 경험을 선택해주세요</option>
                    {experienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.investment_experience && <p className="mt-1 text-red-400 text-xs">{errors.investment_experience}</p>}
                </div>

                <div>
                  <select
                    value={formData.investment_interest}
                    onChange={e => setFormData({ ...formData, investment_interest: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">주로 관심 있는 투자를 선택해주세요</option>
                    {interestOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.investment_interest && <p className="mt-1 text-red-400 text-xs">{errors.investment_interest}</p>}
                </div>

                <div>
                  <select
                    value={formData.pain_point}
                    onChange={e => setFormData({ ...formData, pain_point: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">현재 가장 막히는 부분을 선택해주세요</option>
                    {painOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.pain_point && <p className="mt-1 text-red-400 text-xs">{errors.pain_point}</p>}
                </div>

                <select
                  value={formData.investment_amount}
                  onChange={e => setFormData({ ...formData, investment_amount: e.target.value })}
                  className={inputClass}
                >
                  <option value="">현재 투자금 규모 (선택)</option>
                  {amountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>

                <select
                  value={formData.preferred_contact}
                  onChange={e => setFormData({ ...formData, preferred_contact: e.target.value })}
                  className={inputClass}
                >
                  <option value="">희망 안내 방식 (선택)</option>
                  {contactOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>

                {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-colors"
                >
                  {loading ? '처리 중...' : '혜택과 할인권 신청하기 →'}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors"
                >
                  나중에 볼게요
                </button>

                <p className="text-xs text-slate-600 leading-relaxed">
                  본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
