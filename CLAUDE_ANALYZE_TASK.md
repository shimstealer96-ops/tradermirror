Read C:\Users\home\Downloads\수정요청.txt for the full spec.
Also read the current src/app/analyze/page.tsx before making changes.

Here is additional technical context you need:

## Supabase client
import { createClient } from '@/lib/supabase/client'

## Transaction type extension
The existing Transaction type is in src/utils/parser.ts. Add these optional fields to it (or extend it locally):
- assetType?: string
- entryReason?: string[]
- emotion?: string
- principleFollowed?: string
- stopLossBasis?: string
- direction?: string
- profitLoss?: number
- profitLossKrw?: number
- exchange?: string
- sector?: string
- leverage?: number
- marginMode?: string
- overtrading?: string
- btcDirection?: string
- exitReason?: string
- tradeType?: string

## fetchJournalTrades function to add
async function fetchJournalTrades(filters: { assetType: string, period: string, startDate?: string, endDate?: string }): Promise<Transaction[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase.from('trades').select('*').eq('user_id', user.id)
  
  if (filters.assetType !== 'all') {
    query = query.eq('asset_type', filters.assetType)
  }
  
  const today = new Date()
  if (filters.period === 'today') {
    const todayStr = today.toISOString().split('T')[0]
    query = query.gte('trade_date', todayStr)
  } else if (filters.period === 'current_month') {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
    query = query.gte('trade_date', firstDay)
  } else if (filters.period === 'custom' && filters.startDate) {
    query = query.gte('trade_date', filters.startDate)
    if (filters.endDate) query = query.lte('trade_date', filters.endDate)
  }
  
  const { data } = await query.order('trade_date', { ascending: true })
  if (!data || data.length === 0) return []
  
  return data.map((t: any) => ({
    id: t.id,
    date: t.trade_date,
    time: t.entry_datetime ? new Date(t.entry_datetime).toTimeString().slice(0,8) : undefined,
    ticker: t.ticker,
    type: 'SELL' as const,
    price: t.exit_price || t.entry_price || 0,
    quantity: t.quantity || t.position_quantity || t.coin_quantity || 1,
    profitRate: t.profit_loss_rate || 0,
    amount: t.total_sell_amount || t.profit_loss || 0,
    assetType: t.asset_type,
    entryReason: t.entry_reason || [],
    emotion: t.emotion_before,
    principleFollowed: t.principle_followed,
    stopLossBasis: t.stop_loss_basis,
    direction: t.position_direction || t.direction,
    profitLoss: t.profit_loss,
    profitLossKrw: t.profit_loss_krw,
    exchange: t.exchange || t.exchange_name,
    sector: t.sector,
    leverage: t.leverage,
    marginMode: t.margin_mode,
    overtrading: t.overtrading,
    btcDirection: t.btc_direction,
    exitReason: t.exit_reason,
    tradeType: t.trade_type,
  }))
}

## New state variables to add
- analysisSource: 'text_paste' | 'journal'  (default: 'text_paste')
- journalAssetType: string (default: 'all')
- journalPeriod: string (default: 'all')
- journalStartDate: string (default: '')
- journalEndDate: string (default: '')
- analysisContext: object to store what was analyzed (for the banner)
- noDataFound: boolean (default: false)

## handleJournalAnalyze function
async function handleJournalAnalyze(period: string, assetType?: string) {
  const at = assetType || journalAssetType
  const trades = await fetchJournalTrades({
    assetType: at,
    period,
    startDate: journalStartDate,
    endDate: journalEndDate
  })
  if (trades.length === 0) {
    setNoDataFound(true)
    return
  }
  setNoDataFound(false)
  setAnalysisContext({ source: 'journal', assetType: at, period, count: trades.length })
  handleAnalyze(trades)
}

## New computed stats from transactions (add to calculateMetrics or compute separately)
Compute these from the transactions array after analysis:
- totalTrades = sells.length
- profitCount (already exists)
- lossCount (already exists)  
- totalPnl = sum of (t.profitLoss || (t.profitRate/100 * t.amount) for sells)
- avgReturnRate = average profitRate of sells
- totalKrwPnl = sum of t.profitLossKrw
- maxWinTrade = sell with highest profitRate
- maxLossTrade = sell with lowest profitRate
- entryReasonStats: group by entryReason[], compute count/winRate/avgReturn per reason
- principleStats: group by principleFollowed, compute count/winRate/avgReturn
- emotionStats: group by emotion, compute count/winRate/avgReturn
- stopLossStats: has stopLossBasis vs not, compute winRate/avgLoss
- assetTypeStats: group by assetType, compute count/winRate/totalPnl/avgReturn

Add all these to the stats state object.

## Results banner (add at very top of results dashboard, before the logo row)
Show a small info bar:
- If analysisContext.source === 'text_paste': "분석 방식: 거래 내역 텍스트 붙여넣기 | 분석 대상: 붙여넣은 거래내역"
- If journal: "분석 방식: 내 매매일지 | 자산 유형: [label] | 분석 기간: [label] | 총 N건"

## New result sections to ADD after the existing 3-chart grid (keep all existing sections):

### A. 핵심 성과 요약 (place BEFORE the 3-chart grid, always expanded)
6-card grid showing: 총거래수, 수익거래수(emerald), 손실거래수(red), 총순손익(color by sign), 평균수익률, 원화환산총수익

### B. 수익/손실 거래 상세 비교 (after charts, always expanded)
Left: profit stats (avg win rate, max win trade ticker+rate)
Right: loss stats (avg loss rate, max loss trade ticker+rate)  
Bottom: 평균손익비

### C. 진입 근거별 성과 (accordion, collapsed, journal mode only)
Bar chart ranked by avgReturn. Green if positive, red if negative.
Show insight text: best and worst entry reason.

### D. 원칙 준수 여부별 성과 (accordion, collapsed, journal mode only)
3 bars: 완전히지킴/일부지킴/안지킴
If notFollowed avgReturn < -1%: show warning card

### E. 감정 상태별 성과 (accordion, collapsed, journal mode only)
Bar chart by emotion sorted by avgReturn
Highlight worst emotion in red

### F. 손절 기준 작성 여부별 성과 (accordion, collapsed, journal mode only)
2-bar comparison: 있음 vs 없음

### G. 자산 유형별 성과 (accordion, collapsed by default)
4 cards for stock_spot/stock_futures/crypto_spot/crypto_futures
Show count, winRate, totalPnl, avgReturn per type

### H. AI 매매 리포트 (always expanded, after 반복실수TOP3)
Card with:
1. 한줄요약 (from aiResult.diagnosis)
2. 잘한점 1개 (computed from stats)
3. 문제점 1개 (computed from stats)
4. 수치기반분석 3개 (winRate, avgWinRate, avgLossRate)
5. 반복실수 3개 (from aiResult.mistakes)
6. 다음거래규칙 3개 (static sensible Korean rules)
7. Disclaimer: "이 분석은 사용자의 기록을 바탕으로 한 매매 습관 복기이며, 특정 종목 추천이나 매수·매도 지시가 아닙니다."

## Bottom disclaimer (always in results)
"본 분석은 사용자가 기록한 매매일지를 바탕으로 한 복기용 자료입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다."

## IMPORTANT RULES
1. Keep ALL existing code (modals, share, save image, manual form, sample data, etc.)
2. Keep existing Trial limit logic (7-day trial using tradermirror_trial_start localStorage key)
3. Use isMounted check for all Recharts
4. Dark theme throughout
5. All UI text in Korean
6. After writing, run build: set PATH and use node directly:
   cmd /c "set PATH=C:\Program Files\nodejs;%PATH% && node node_modules\next\dist\bin\next build"
7. Fix all TypeScript errors
8. Then: git add . && git commit -m "feat: analyze v2 - journal mode + deep analytics" && git push origin master
