import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabase } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'shim.stealer96@gmail.com'

export async function GET(req: NextRequest) {
  // 서버 쿠키 기반으로 로그인 유저 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // service_role로 auth.users 조회
  const adminClient = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: authUsers, error } = await adminClient.auth.admin.listUsers({ perPage: 500 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // user_plans 조회
  const { data: plans } = await adminClient
    .from('user_plans')
    .select('user_id, plan, trial_started_at, trial_ends_at, updated_at')

  // trades 건수 조회
  const { data: tradeCounts } = await adminClient
    .from('trades')
    .select('user_id')

  const planMap = Object.fromEntries((plans ?? []).map((p: any) => [p.user_id, p]))
  const tradeCountMap: Record<string, number> = {}
  for (const t of tradeCounts ?? []) {
    tradeCountMap[(t as any).user_id] = (tradeCountMap[(t as any).user_id] ?? 0) + 1
  }

  const users = authUsers.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? '-',
    avatar: u.user_metadata?.avatar_url ?? null,
    provider: u.app_metadata?.provider ?? 'email',
    created_at: u.created_at,
    last_sign_in: u.last_sign_in_at,
    plan: (planMap as any)[u.id]?.plan ?? '없음',
    trial_ends_at: (planMap as any)[u.id]?.trial_ends_at ?? null,
    trade_count: tradeCountMap[u.id] ?? 0,
  }))

  return NextResponse.json({ users })
}
