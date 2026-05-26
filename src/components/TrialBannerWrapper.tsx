'use client'
import TrialBanner from '@/components/TrialBanner'
import { useUserPlan } from '@/hooks/useUserPlan'

export default function TrialBannerWrapper() {
  const { isTrial, trialDaysLeft, loading } = useUserPlan()
  if (loading || !isTrial) return null
  return <TrialBanner daysLeft={trialDaysLeft} />
}
