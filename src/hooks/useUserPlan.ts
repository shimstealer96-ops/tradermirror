'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type PlanType = 'free' | 'pro' | 'trial'

interface UserPlan {
  plan: PlanType
  trialDaysLeft: number
  isPro: boolean
  isTrial: boolean
  isFree: boolean
  loading: boolean
}

export function useUserPlan(): UserPlan {
  const [plan, setPlan] = useState<PlanType>('trial')
  const [trialDaysLeft, setTrialDaysLeft] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      let { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!planData) {
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        const { data: newPlan } = await supabase
          .from('user_plans')
          .insert({
            user_id: user.id,
            plan: 'trial',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEndsAt,
          })
          .select()
          .single()
        planData = newPlan
      }

      if (planData) {
        let currentPlan: PlanType = planData.plan
        if (currentPlan === 'trial' && planData.trial_ends_at) {
          if (new Date(planData.trial_ends_at) < new Date()) {
            currentPlan = 'free'
            await supabase.from('user_plans').update({ plan: 'free' }).eq('user_id', user.id)
          }
        }
        setPlan(currentPlan)
        if (planData.trial_ends_at && currentPlan === 'trial') {
          const diff = new Date(planData.trial_ends_at).getTime() - Date.now()
          setTrialDaysLeft(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
        } else {
          setTrialDaysLeft(0)
        }
      }
      setLoading(false)
    }
    fetchPlan()
  }, [])

  return {
    plan,
    trialDaysLeft,
    isPro: plan === 'pro',
    isTrial: plan === 'trial',
    isFree: plan === 'free',
    loading,
  }
}
