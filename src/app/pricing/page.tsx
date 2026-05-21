'use client'
import { Check, Lock } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'

const freeFeatures = [
  '매매일지 하루 5개 등록',
  '하루 1회 기본 분석',
  '최근 7일 기록 기준 요약 분석',
  '승률, 총 손익, 평균 수익률 제공',
  '청산가 계산기 기본 기능',
]

const freeLocked = [
  '감정 상태별 성과 분석',
  '진입 근거별 성과 분석',
  '자산 유형별 상세 분석',
  'AI 매매 리포트 전체',
  '월간 리포트 저장',
]

const proFeatures = [
  '매매일지 무제한 등록',
  '매매패턴 무제한 분석',
  '오늘 / 이번 달 / 전체 기간 분석',
  '감정 상태별 성과 분석',
  '진입 근거별 성과 분석',
  '손절 기준 작성 여부 분석',
  '자산 유형별 상세 분석',
  'AI 매매 리포트 전체 제공',
  '월간 리포트 저장',
  '청산가·펀딩비 계산기 전체 기능',
]

const faqs = [
  {
    q: '매매일지를 쓰는 데 돈을 내야 하나요?',
    a: '아닙니다. 기록은 무료로 시작할 수 있습니다. 다만 내가 왜 반복해서 손실을 내는지 깊게 분석하고 싶다면 Pro 기능이 필요합니다.',
  },
  {
    q: '월 9,900원이 아깝지 않을까요?',
    a: '한 번의 충동매매만 줄여도 월 이용료 이상의 손실을 아낄 수 있습니다.',
  },
  {
    q: '이 서비스가 종목을 추천하나요?',
    a: '아닙니다. TraderMirror는 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 사용자의 매매기록을 분석해 반복 실수를 보여주는 복기 도구입니다.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            요금제
          </span>
          <h1 className="text-3xl md:text-4xl font-black mb-4">기록은 무료, 깊은 분석은 Pro</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            깊은 분석이 필요할 때 Pro를 사용하면 됩니다.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Free */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-medium mb-1">Free</p>
              <p className="text-4xl font-black text-slate-100">₩0</p>
              <p className="text-slate-400 text-sm mt-2">기록은 무료로 시작하세요.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {freeFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
              <div className="border-t border-slate-800 my-2" />
              {freeLocked.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                  <Lock className="h-4 w-4 text-slate-700 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/login">
              <button className="w-full py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold rounded-xl transition-colors">
                무료로 시작하기
              </button>
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">
              기록은 무료로 시작하세요. 깊은 분석이 필요할 때 Pro를 사용하면 됩니다.
            </p>
          </div>

          {/* Pro */}
          <div className="bg-blue-950/40 border-2 border-blue-500/50 rounded-2xl p-8 relative flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-blue-600 text-white text-xs font-black rounded-full">추천</span>
            </div>
            <div className="mb-6">
              <p className="text-blue-400 text-sm font-medium mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-black text-slate-100">₩9,900</p>
                <p className="text-slate-400 text-sm">/ 월</p>
              </div>
              <p className="text-slate-400 text-sm mt-2">내 매매패턴을 깊게 분석하세요.</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-200">
                  <Check className="h-4 w-4 text-blue-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors">
              7일 무료로 Pro 시작하기
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              7일 동안 Pro 기능을 무료로 사용해보고, 내 매매에 도움이 될 때 계속 이용하세요.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-xl font-black text-slate-100 mb-6 text-center">자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
                <p className="font-bold text-slate-200 mb-2 text-sm">"{faq.q}"</p>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-600 text-center leading-relaxed">
          본 서비스는 사용자의 매매기록을 바탕으로 한 복기 도구입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
        </p>
      </main>
    </div>
  )
}
