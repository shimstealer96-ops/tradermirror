'use client'
import Link from 'next/link'

interface TrialBannerProps {
  daysLeft: number
}

export default function TrialBanner({ daysLeft }: TrialBannerProps) {
  if (daysLeft <= 0) return null
  const isLastDay = daysLeft === 1

  return (
    <div className={`${isLastDay ? 'bg-orange-500/20 border-orange-500/30' : 'bg-blue-500/20 border-blue-500/30'} border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4`}>
      <p className={`${isLastDay ? 'text-orange-300' : 'text-blue-300'} text-sm font-medium`}>
        {isLastDay
          ? '⚠️ Pro 무료 체험 마지막 날입니다. 내일부터 Free 플랜으로 전환됩니다.'
          : `🎉 Pro 무료 체험 중 — ${daysLeft}일 남았습니다.`}
      </p>
      <Link href="/pricing">
        <button className="shrink-0 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
          월 ₩9,900으로 Pro 계속 사용하기
        </button>
      </Link>
    </div>
  )
}
