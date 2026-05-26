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

const ASSET_LABELS: Record<string, string> = {
  stock: '주식', crypto: '코인', futures: '선물', etf: 'ETF', other: '기타'
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

  if (filter === 'stock') query = query.eq('asset_type', 'stock')
  else if (filter === 'crypto') query = query.eq('asset_type', 'crypto')
  else if (filter === 'today') query = query.eq('trade_date', today)
  else if (filter === 'month') query = query.gte('trade_date', firstOfMonth)

  const { data } = await query
  const trades = data || []

  const filters = [
    { key: 'all', label: '전체' },
    { key: 'stock', label: '주식' },
    { key: 'crypto', label: '코인' },
    { key: 'today', label: '오늘' },
    { key: 'month', label: '이번달' },
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

        {/* Filter Tabs */}
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
            </Link>
          ))}
        </div>

        {/* Trades Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800">
                  <th className="text-left px-4 py-3 font-medium">날짜</th>
                  <th className="text-left px-4 py-3 font-medium">종목</th>
                  <th className="text-left px-4 py-3 font-medium">유형</th>
                  <th className="text-left px-4 py-3 font-medium">방향</th>
                  <th className="text-right px-4 py-3 font-medium">진입가</th>
                  <th className="text-right px-4 py-3 font-medium">청산가</th>
                  <th className="text-right px-4 py-3 font-medium">수량</th>
                  <th className="text-right px-4 py-3 font-medium">손익</th>
                  <th className="text-right px-4 py-3 font-medium">수익률</th>
                  <th className="text-center px-4 py-3 font-medium">상태</th>
                  <th className="text-center px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade: any) => (
                  <tr key={trade.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{trade.trade_date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{trade.ticker}</div>
                      {trade.ticker_name && <div className="text-xs text-slate-500">{trade.ticker_name}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {ASSET_LABELS[trade.asset_type] || trade.asset_type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trade.direction === 'long' ? '롱' : '숏'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{Number(trade.entry_price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{trade.exit_price ? Number(trade.exit_price).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-right">{Number(trade.quantity).toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${trade.profit_loss == null ? 'text-slate-500' : Number(trade.profit_loss) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.profit_loss == null ? '-' : `${Number(trade.profit_loss) >= 0 ? '+' : ''}${Number(trade.profit_loss).toLocaleString('ko-KR')}원`}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs ${trade.profit_loss_rate == null ? 'text-slate-500' : Number(trade.profit_loss_rate) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.profit_loss_rate == null ? '-' : `${Number(trade.profit_loss_rate) >= 0 ? '+' : ''}${Number(trade.profit_loss_rate).toFixed(2)}%`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${trade.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                        {trade.status === 'open' ? '보유중' : '청산'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/journal/${trade.id}/edit`} className="text-slate-400 hover:text-blue-400 transition-colors">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <form action={deleteTrade}>
                          <input type="hidden" name="id" value={trade.id} />
                          <button type="submit" className="text-slate-400 hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                      매매 기록이 없습니다.{' '}
                      <Link href="/journal/new" className="text-blue-400 hover:underline">첫 번째 매매를 기록해보세요!</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
