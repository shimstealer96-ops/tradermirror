'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Zap, AlertTriangle } from 'lucide-react'
import { useUserPlan } from '@/hooks/useUserPlan'

// 배너를 닫으면 오늘 날짜 기준으로 하루 숨김
const BANNER_DISMISS_KEY = 'tm_trial_banner_dismissed_date'

export default function TrialExpiryBanner() {
  const { isTrial, trialDaysLeft, loading } = useUserPlan()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [showExpiredModal, setShowExpiredModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 오늘 날짜 기준으로 닫기 여부 체크
    const dismissed = localStorage.getItem(BANNER_DISMISS_KEY)
    const today = new Date().toDateString()
    if (dismissed === today) setBannerDismissed(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return
    // isFree인데 trialDaysLeft가 0 → 만료 모달
    if (!isTrial && trialDaysLeft === 0) {
      const shownKey = 'tm_expired_modal_shown'
      if (!sessionStorage.getItem(shownKey)) {
        // user_plans에서 trial이었다가 free로 전환된 직후만 표시
        // useUserPlan이 plan='free' 이면서 트라이얼이 끝난 경우
        // → 단순히 로컬에 체험 시작일이 있으면 표시
        const trialStart = localStorage.getItem('tm_trial_started')
        if (trialStart) {
          setShowExpiredModal(true)
          sessionStorage.setItem(shownKey, '1')
        }
      }
    }
    // 처음 trial이 되면 시작일 기록
    if (isTrial) {
      if (!localStorage.getItem('tm_trial_started')) {
        localStorage.setItem('tm_trial_started', new Date().toISOString())
      }
    }
  }, [mounted, loading, isTrial, trialDaysLeft])

  const dismissBanner = () => {
    setBannerDismissed(true)
    localStorage.setItem(BANNER_DISMISS_KEY, new Date().toDateString())
  }

  if (!mounted || loading) return null

  // D-0 만료 모달
  if (showExpiredModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-sm w-full p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-amber-400" />
          </div>
          <h2 className="text-xl font-black text-slate-100 mb-3">무료 체험이 종료되었습니다</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            7일 무료 체험 기간이 끝났습니다.<br />
            Pro로 전환하면 계속 이용하실 수 있습니다.
          </p>
          <div className="space-y-3">
            <Link href="/pricing">
              <button
                onClick={() => setShowExpiredModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors"
              >
                Pro 시작하기 →
              </button>
            </Link>
            <button
              onClick={() => setShowExpiredModal(false)}
              className="w-full text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      </div>
    )
  }

  // D-2 이하 배너 (trial 중이고, 2일 이하 남은 경우)
  if (!isTrial || trialDaysLeft > 2 || bannerDismissed) return null

  const isLastDay = trialDaysLeft <= 1

  return (
    <div className={`w-full sticky top-16 z-30 ${isLastDay ? 'bg-orange-500/90' : 'bg-amber-500/90'} backdrop-blur-sm`}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-white shrink-0" />
          <p className="text-white text-sm font-medium">
            {isLastDay
              ? '⚠️ 무료 체험 마지막 날입니다. 내일부터 기본 분석만 가능합니다.'
              : `무료 체험이 ${trialDaysLeft}일 후 종료됩니다. 지금까지 분석한 패턴을 계속 보려면 Pro로 전환하세요.`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/pricing">
            <button className="px-3 py-1 bg-white text-amber-700 hover:bg-amber-50 text-xs font-black rounded-lg transition-colors">
              Pro 전환하기
            </button>
          </Link>
          <button onClick={dismissBanner} className="text-white/70 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
