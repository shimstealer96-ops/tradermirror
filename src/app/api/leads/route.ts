import { NextRequest, NextResponse } from 'next/server'
import { generateAutoTags } from '@/utils/autoTags'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { createClient: createSupabase } = await import('@supabase/supabase-js')
  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const autoTags = generateAutoTags(body)
  const { error } = await supabase.from('lead_submissions').insert({
    ...body,
    auto_tags: autoTags,
    status: '신규',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
