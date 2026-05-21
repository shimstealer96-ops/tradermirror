'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

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

const benefitsList = [
  'TraderMirror 7일 무료 체험권',
  'MoneyStep 전자책 50% 할인권',
  '첫 매수 전 체크리스트',
  '전자책 미리보기 PDF',
  '투자상태별 1:1 맞춤 진단',
]

const inputClass =
  'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    investment_experience: '',
    investment_interest: '',
    pain_point: '',
    name: '',
    phone: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('onboarding_done') === 'true') {
      router.replace('/dashboard')
    }
  }, [router])

  const handleSelect = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => setStep(s => s + 1)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'onboarding' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '오류가 발생했습니다.')
      localStorage.setItem('onboarding_done', 'true')
      setStep(5)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Progress bar */}
        {step < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-400">STEP {step} / 4</span>
              <span className="text-xs text-slate-500">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: 투자 경험 */}
        {step === 1 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              혜택 제공을 위해 투자상태를 알려주세요
            </p>
            <h1 className="text-2xl font-black text-slate-100 mb-2">
              현재 투자 경험은 어느 정도인가요?
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              1분만 입력하면 TraderMirror 7일 무료 체험권과 MoneyStep 전자책 50% 할인권을 받을 수 있습니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {experienceOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => { handleSelect('investment_experience', opt); handleNext() }}
                  className={`text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all ${
                    data.investment_experience === opt
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 관심 투자 유형 */}
        {step === 2 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              혜택 제공을 위해 투자상태를 알려주세요
            </p>
            <h1 className="text-2xl font-black text-slate-100 mb-8">
              주로 관심 있는 투자 유형은 무엇인가요?
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => { handleSelect('investment_interest', opt); handleNext() }}
                  className={`text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all ${
                    data.investment_interest === opt
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-6 text-sm text-slate-500 hover:text-slate-400">
              ← 이전
            </button>
          </div>
        )}

        {/* STEP 3: 가장 막히는 부분 */}
        {step === 3 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              혜택 제공을 위해 투자상태를 알려주세요
            </p>
            <h1 className="text-2xl font-black text-slate-100 mb-8">
              지금 가장 막히는 부분은 무엇인가요?
            </h1>
            <div className="grid grid-cols-1 gap-3">
              {painOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => { handleSelect('pain_point', opt); handleNext() }}
                  className={`text-left px-5 py-4 rounded-xl border font-medium text-sm transition-all ${
                    data.pain_point === opt
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-6 text-sm text-slate-500 hover:text-slate-400">
              ← 이전
            </button>
          </div>
        )}

        {/* STEP 4: 연락처 */}
        {step === 4 && (
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              거의 다 됐습니다
            </p>
            <h1 className="text-2xl font-black text-slate-100 mb-2">
              혜택과 전자책 할인권을 받을 연락처를 확인해주세요.
            </h1>
            <p className="text-slate-500 text-sm mb-8">
              정확한 연락처를 남겨주셔야 1:1 맞춤 진단 결과와 MoneyStep 전자책 50% 할인권 제공이 가능합니다.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="성함을 입력해주세요"
                value={data.name}
                onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                required
                className={inputClass}
              />
              <div>
                <input
                  type="tel"
                  placeholder="혜택과 할인권을 받을 연락처를 입력해주세요"
                  value={data.phone}
                  onChange={e => setData(prev => ({ ...prev, phone: e.target.value }))}
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
                value={data.email}
                onChange={e => setData(prev => ({ ...prev, email: e.target.value }))}
                required
                className={inputClass}
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={loading || !data.name || !data.phone || !data.email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                {loading ? '처리 중...' : '혜택과 할인권 신청하기 →'}
              </button>
              <p className="text-center text-xs text-slate-600">
                본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다.
                특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
              </p>
            </div>
            <button onClick={() => setStep(3)} className="mt-6 text-sm text-slate-500 hover:text-slate-400">
              ← 이전
            </button>
          </div>
        )}

        {/* STEP 5: 완료 */}
        {step === 5 && (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-slate-100 mb-4">
              신청 혜택이 제공될 예정입니다
            </h1>
            <p className="text-slate-400 leading-relaxed mb-8">
              입력해주신 정보를 기준으로 TraderMirror 7일 무료 체험권과 MoneyStep 전자책 50% 할인권을 안내드릴 예정입니다.
              정확한 연락처와 이메일을 남겨주셔야 혜택 제공이 가능합니다.
            </p>
            <div className="space-y-2.5 mb-10 text-left">
              {benefitsList.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/analyze')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                TraderMirror 시작하기 →
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full border border-slate-700 text-slate-400 hover:bg-slate-800 font-medium px-8 py-3 rounded-xl transition-colors"
              >
                나중에 →
              </button>
            </div>
            <p className="mt-8 text-xs text-slate-600 leading-relaxed">
              본 진단은 사용자가 입력한 투자 상태를 바탕으로 한 학습자료 및 복기 방향 안내입니다.
              특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
