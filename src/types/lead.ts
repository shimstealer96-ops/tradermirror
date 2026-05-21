export interface LeadSubmission {
  id?: string
  user_id?: string
  source: 'landing_form' | 'cta_popup' | 'onboarding'
  name: string
  phone: string
  email: string
  investment_experience?: string
  investment_interest?: string
  pain_point?: string
  desired_benefits?: string[]
  investment_amount?: string
  preferred_contact?: string
  auto_tags?: string[]
  status?: string
  benefit_sent?: boolean
  coupon_sent?: boolean
  diagnosis_done?: boolean
  admin_memo?: string
  opt_out?: boolean
  created_at?: string
}
