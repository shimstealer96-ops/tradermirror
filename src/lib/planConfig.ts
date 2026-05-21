export const DEFAULT_PLAN_CONFIG = {
  free_daily_journal_limit: 5,
  free_daily_analysis_limit: 1,
  free_analysis_days: 7,
  pro_price_krw: 9900,
  trial_days: 7,
}

export type PlanType = 'free' | 'pro' | 'trial'

export function isProOrTrial(plan: PlanType): boolean {
  return plan === 'pro' || plan === 'trial'
}

export function getTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
