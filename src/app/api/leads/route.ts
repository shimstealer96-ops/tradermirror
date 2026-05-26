import { NextRequest, NextResponse } from 'next/server'
import { generateAutoTags } from '@/utils/autoTags'
import { createClient as createSupabase } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // anon client — lead_submissions insert
  const anonClient = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const autoTags = generateAutoTags(body)
  const { error } = await anonClient.from('lead_submissions').insert({
    ...body,
    auto_tags: autoTags,
    status: '신규',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 로그인된 유저라면 trial 7일 연장
  try {
    const adminClient = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 이메일로 유저 찾기
    const email = body.email
    if (email) {
      const { data: { users } } = await adminClient.auth.admin.listUsers()
      const user = users.find(u => u.email === email)

      if (user) {
        // 현재 플랜 조회
        const { data: planData } = await adminClient
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (planData) {
          // 현재 trial_ends_at 기준으로 +7일 연장 (이미 만료됐으면 지금부터 +7일)
          const base = planData.trial_ends_at
            ? new Date(Math.max(new Date(planData.trial_ends_at).getTime(), Date.now()))
            : new Date()
          const newTrialEndsAt = new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

          await adminClient
            .from('user_plans')
            .update({
              plan: 'trial',
              trial_ends_at: newTrialEndsAt,
            })
            .eq('user_id', user.id)
        } else {
          // user_plans 없으면 새로 생성 (7일 trial)
          const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          await adminClient.from('user_plans').insert({
            user_id: user.id,
            plan: 'trial',
            trial_started_at: new Date().toISOString(),
            trial_ends_at: trialEndsAt,
          })
        }
      }
    }
  } catch (e) {
    // 연장 실패해도 신청 자체는 성공 처리
    console.error('Trial extension failed:', e)
  }

  return NextResponse.json({ success: true })
}
