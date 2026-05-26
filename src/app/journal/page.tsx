import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { TrendingUp, Plus, Pencil, Trash2 } from 'lucide-react'
import TrialBannerWrapper from '@/components/TrialBannerWrapper'

async function deleteTrade(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  await supabase.from('trades').delete().eq('id', id)
  revalidatePath('/journal')
  revalidatePath('/dashboard')
}

async function toggleStatus(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const id = formData.get('id') as string
  const currentStatus = formData.get('current_status') as string
  const newStatus = currentStatus === 'open' ? 'closed' : 'open'
  await supabase.from('trades').update({ status: newStatus }).eq('id', id)
  revalidatePath('/journal')
}

const ASSET_LABELS: Record<string, { label: string; color: string }> = {
  stock_spot:     { label: '주식 현물', color: 'bg-blue-500/10 text-blue-400' },
  stock_futures:  { label: '주식 선물', color: 'bg-purple-500/10 text-purple-400' },
  crypto_spot:    { label: '코인 현물', color: 'bg-amber-500/10 text-amber-400' },
  crypto_futures: { label: '코인 선물', color: 'bg-orange-500/10 text-orange-400' },
  // 구 schema 호환
  stock:   { label: '주식', color: 'bg-blue-500/10 text-blue-400' },
  crypto:  { label: '코인', color: 'bg-amber-500/10 text-amber-400' },
  futures: { label: '선물', color: 'bg-purple-500/10 text-purple-400' },
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const filter = params?.filter || 'all'

  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0]

  let query = supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

  if (filter === 'stock')   query = query.in('asset_type', ['stock_spot', 'stock_futures', 'stock'])
  else if (filter === 'crypto') query = query.in('asset_type', ['crypto_spot', 'crypto_futures', 'crypto'])
  else if (filter === 'open')   query = query.eq('status', 'open')
  else if (filter === 'today')  query = query.eq('trade_date', today)
  else if (filter === 'month')  query = query.gte('trade_date', firstOfMonth)

  const { data } = await query
  const trades = data || []

  const filters = [
    { key: 'all',    label: '전체' },
    { key: 'stock',  label: '주식' },
    { key: 'crypto', label: '코인' },
    { key: 'open',   label: '보유중' },
    { key: 'today',  label: '오늘' },
    { key: 'month',  label: '이번달' },
  ]

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">TraderMirror</span>
        </div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">← 대시보드</Link>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <TrialBannerWrapper />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">매매 일지</h1>
          <Link
            href="/journal/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            새 매매 기록
          </Link>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Link
              key={f.key}
              href={`/journal?filter=${f.key}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
              {f.key === 'open' && trades.length > 0 && filter !== 'open' && (
                /* 보유중 건수 뱃지 — 전체 조회 시엔 별도 쿼리 없이 생략 */
                null
              )}
            </Link>
          ))}
        </div>

        {/* 테이블 */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">날짜</th>
                  <th className="text-left px-4 py-3 font-medium">종목</th>
                  <th className="text-left px-4 py-3 font-medium">유형</th>
                  <th className="text-left px-4 py-3 font-medium">방향</th>
                  <th className="text-right px-4 py-3 font-medium">진입가</th>
                  <th className="text-right px-4 py-3 font-medium">청산가</th>
                  <th className="text-right px-4 py-3 font-medium">손익</th>
                  <th className="text-right px-4 py-3 font-medium">수익률</th>
                  <th className="text-center px-4 py-3 font-medium">상태</th>
                  <th className="text-center px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any) => {
                  const assetInfo = ASSET_LABELS[trade.asset_type] || { label: trade.asset_type, color: 'bg-slate-700 text-slate-400' }
                  const isOpen = trade.status === 'open'
                  return (
                    <tr key={trade.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{trade.trade_date}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-100">{trade.asset_name || trade.ticker || '-'}</div>
                        {trade.ticker && trade.asset_name && (
                          <div className="text-xs text-slate-500">{trade.ticker}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${assetInfo.color}`}>
                          {assetInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {trade.position_direction ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            trade.position_direction === 'long'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {trade.position_direction === 'long' ? '롱' : '숏'}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                        {trade.entry_price ? Number(trade.entry_price).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                        {trade.exit_price ? Number(trade.exit_price).toLocaleString() : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        trade.profit_loss == null ? 'text-slate-500'
                          : Number(trade.profit_loss) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.profit_loss == null ? '-'
                          : `${Number(trade.profit_loss) >= 0 ? '+' : ''}${Number(trade.profit_loss).toLocaleString()}원`}
                      </td>
                      <td className={`px-4 py-3 text-right text-xs tabular-nums ${
                        trade.profit_loss_rate == null ? 'text-slate-500'
                          : Number(trade.profit_loss_rate) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.profit_loss_rate == null ? '-'
                          : `${Number(trade.profit_loss_rate) >= 0 ? '+' : ''}${Number(trade.profit_loss_rate).toFixed(2)}%`}
                      </td>

                      {/* 상태 토글 버튼 */}
                      <td className="px-4 py-3 text-center">
                        <form action={toggleStatus}>
                          <input type="hidden" name="id" value={trade.id} />
                          <input type="hidden" name="current_status" value={trade.status} />
                          <button
                            type="submit"
                            title="클릭하면 상태가 전환됩니다"
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 hover:scale-105 active:scale-95 cursor-pointer ${
                              isOpen
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-slate-700/60 text-slate-400 border border-slate-600 hover:bg-slate-600/60'
                            }`}
                          >
                            {isOpen ? '● 보유중' : '○ 청산'}
                          </button>
                        </form>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/journal/${trade.id}/edit`} className="text-slate-500 hover:text-blue-400 transition-colors">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <form action={deleteTrade}>
                            <input type="hidden" name="id" value={trade.id} />
                            <button type="submit" className="text-slate-500 hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                      매매 기록이 없습니다.{' '}
                      <Link href="/journal/new" className="text-blue-400 hover:underline">첫 번째 매매를 기록해보세요!</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {trades.length > 0 && (
          <p className="text-xs text-slate-600 text-center">
            총 {trades.length}건 · 상태 버튼을 클릭하면 보유중/청산이 즉시 전환됩니다
          </p>
        )}
      </main>
    </div>
  )
}
