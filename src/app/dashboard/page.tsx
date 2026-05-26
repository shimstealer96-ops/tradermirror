import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TrendingUp, Plus, BookOpen, LogOut } from 'lucide-react'
import TrialBannerWrapper from '@/components/TrialBannerWrapper'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0]

  const { data: allTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('trade_date', { ascending: false })

  const trades = allTrades || []
  const todayTrades = trades.filter((t: any) => t.trade_date === today)
  const monthTrades = trades.filter((t: any) => t.trade_date >= firstOfMonth)

  const sumPL = (arr: any[]) =>
    arr.filter(t => t.profit_loss != null).reduce((s, t) => s + Number(t.profit_loss), 0)

  const formatPL = (v: number) => {
    const sign = v >= 0 ? '+' : ''
    return `${sign}${v.toLocaleString('ko-KR')}원`
  }

  const stats = [
    { label: '오늘 매매', count: todayTrades.length, pl: sumPL(todayTrades) },
    { label: '이번달 매매', count: monthTrades.length, pl: sumPL(monthTrades) },
    { label: '전체 누적', count: trades.length, pl: sumPL(trades) },
  ]

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">TraderMirror</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 hidden sm:block">{user.email}</span>
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">홈</Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <TrialBannerWrapper />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">대시보드</h1>
          <Link
            href="/journal/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            새 매매 기록
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-100">{stat.count}건</p>
              <p className={`text-sm font-semibold mt-1 ${stat.pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPL(stat.pl)}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Trades */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="font-semibold">최근 매매 내역</h2>
            <Link href="/journal" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              전체 일지 보기
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800/60">
                  <th className="text-left px-6 py-3 font-medium">날짜</th>
                  <th className="text-left px-6 py-3 font-medium">종목</th>
                  <th className="text-left px-6 py-3 font-medium">방향</th>
                  <th className="text-right px-6 py-3 font-medium">진입가</th>
                  <th className="text-right px-6 py-3 font-medium">청산가</th>
                  <th className="text-right px-6 py-3 font-medium">손익</th>
                  <th className="text-center px-6 py-3 font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade: any) => (
                  <tr key={trade.id} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="px-6 py-3 text-slate-400 whitespace-nowrap">{trade.trade_date}</td>
                    <td className="px-6 py-3">
                      <div className="font-medium">{trade.ticker}</div>
                      {trade.ticker_name && <div className="text-xs text-slate-500">{trade.ticker_name}</div>}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {trade.direction === 'long' ? '롱' : '숏'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">{Number(trade.entry_price).toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">{trade.exit_price ? Number(trade.exit_price).toLocaleString() : '-'}</td>
                    <td className={`px-6 py-3 text-right font-semibold ${trade.profit_loss == null ? 'text-slate-500' : Number(trade.profit_loss) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trade.profit_loss == null ? '-' : formatPL(Number(trade.profit_loss))}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${trade.status === 'open' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                        {trade.status === 'open' ? '보유중' : '청산'}
                      </span>
                    </td>
                  </tr>
                ))}
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      아직 매매 기록이 없습니다.{' '}
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
