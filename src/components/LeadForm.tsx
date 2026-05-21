'use client'

import { useState } from 'react'
import { LeadSubmission } from '@/types/lead'

interface LeadFormProps {
  source: 'landing_form' | 'cta_popup' | 'onboarding'
  onSuccess: (data: unknown) => void
  compact?: boolean
  showBenefits?: boolean
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

const benefitOptions = [
  'TraderMirror 7일 무료 체험권',
  'MoneyStep 전자책 50% 할인권',
  '첫 매수 전 체크리스트',
  '투자상태별 1:1 맞춤 진단',
  '전자책 미리보기 PDF',
  '전부 받고 싶음',
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
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

export default function LeadForm({ source, onSuccess, compact = false }: LeadFormProps) {
  const [form, setForm] = useState<Partial<LeadSubmission>>({
    name: '',
    phone: '',
    email: '',
    investment_experience: '',
    investment_interest: '',
    pain_point: '',
    desired_benefits: [],
    investment_amount: '',
    preferred_contact: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleBenefit = (benefit: string) => {
    setForm(prev => ({
      ...prev,
      desired_benefits: prev.desired_benefits?.includes(benefit)
        ? prev.desired_benefits.filter(b => b !== benefit)
        : [...(prev.desired_benefits ?? []), benefit],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.')
      onSuccess(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="성함을 입력해주세요"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        required
        className={inputClass}
      />

      <div>
        <input
          type="tel"
          placeholder="혜택과 할인권을 받을 연락처를 입력해주세요"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          required
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-slate-500">
          정확한 연락처를 남겨주셔야 1:1 맞춤 진단 결과와 전자책 할인권 제공이 가능합니다.
        </p>
      </div>

      <input
        type="email"
        placeholder="전자책 할인권과 자료를 받을 이메일을 입력해주세요"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        required
        className={inputClass}
      />

      <select
        value={form.investment_experience}
        onChange={e => setForm({ ...form, investment_experience: e.target.value })}
        required
        className={inputClass}
      >
        <option value="">현재 투자 경험을 선택해주세요</option>
        {experienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <select
        value={form.investment_interest}
        onChange={e => setForm({ ...form, investment_interest: e.target.value })}
        required
        className={inputClass}
      >
        <option value="">관심 있는 투자 유형을 선택해주세요</option>
        {interestOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <select
        value={form.pain_point}
        onChange={e => setForm({ ...form, pain_point: e.target.value })}
        required
        className={inputClass}
      >
        <option value="">현재 가장 막히는 부분을 선택해주세요</option>
        {painOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      {!compact && (
        <>
          <div>
            <p className="text-slate-400 text-sm mb-3 font-medium">받고 싶은 혜택 (복수 선택 가능)</p>
            <div className="space-y-2.5">
              {benefitOptions.map(opt => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.desired_benefits?.includes(opt) ?? false}
                    onChange={() => toggleBenefit(opt)}
                    className="w-4 h-4 accent-blue-600 shrink-0"
                  />
                  <span className="text-slate-300 text-sm group-hover:text-slate-200 transition-colors">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <select
            value={form.investment_amount}
            onChange={e => setForm({ ...form, investment_amount: e.target.value })}
            className={inputClass}
          >
            <option value="">현재 투자금 규모 (선택)</option>
            {amountOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <select
            value={form.preferred_contact}
            onChange={e => setForm({ ...form, preferred_contact: e.target.value })}
            className={inputClass}
          >
            <option value="">희망 안내 방식 (선택)</option>
            {contactOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-colors"
      >
        {loading ? '처리 중...' : '혜택과 할인권 신청하기 →'}
      </button>

      <p className="text-center text-xs text-slate-500">
        종목 추천, 매수·매도 지시, 수익 보장은 제공하지 않습니다.
      </p>
      <p className="text-xs text-slate-600 leading-relaxed">
        본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다.
        특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
      </p>
    </form>
  )
}
