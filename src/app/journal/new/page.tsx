"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, ChevronRight, ChevronLeft, Calculator } from 'lucide-react'
import LimitModal from '@/components/LimitModal'
import { useDailyLimits } from '@/hooks/useDailyLimits'
import { useUserPlan } from '@/hooks/useUserPlan'
import { DEFAULT_PLAN_CONFIG, isProOrTrial } from '@/lib/planConfig'

// ─────────────────────────────────────────
// 상수 정의
// ─────────────────────────────────────────
const ASSET_TYPES = [
  { key: 'stock_spot',      label: '주식 현물', emoji: '📈', desc: '국내·미국 주식, ETF' },
  { key: 'stock_futures',   label: '주식 선물', emoji: '📊', desc: '코스피200, 나스닥100 선물' },
  { key: 'crypto_spot',     label: '코인 현물', emoji: '🪙', desc: '업비트, 바이낸스 현물' },
  { key: 'crypto_futures',  label: '코인 선물', emoji: '⚡', desc: '바이낸스, 바이비트 선물' },
]

const ENTRY_REASONS = [
  { key: 'order_block',     label: '오더블록' },
  { key: 'fvg',             label: 'FVG' },
  { key: 'sr_flip',         label: 'SR플립' },
  { key: 'moving_average',  label: '이동평균선' },
  { key: 'rsi',             label: 'RSI' },
  { key: 'volume',          label: '거래량' },
  { key: 'supply_demand',   label: '수급' },
  { key: 'earnings',        label: '실적' },
  { key: 'news',            label: '뉴스' },
  { key: 'macro',           label: '매크로' },
  { key: 'community',       label: '커뮤니티' },
  { key: 'gut_feeling',     label: '단순 감' },
]

const EMOTIONS = [
  { key: 'calm',      label: '차분함', color: 'emerald' },
  { key: 'anxious',   label: '불안',   color: 'yellow' },
  { key: 'confident', label: '확신',   color: 'blue' },
  { key: 'impatient', label: '조급함', color: 'orange' },
  { key: 'fomo',      label: 'FOMO',   color: 'red' },
  { key: 'revenge',   label: '복수심', color: 'red' },
  { key: 'bored',     label: '지루함', color: 'slate' },
  { key: 'impulsive', label: '충동',   color: 'red' },
]

const EXIT_REASONS = [
  { key: 'target_reached',  label: '목표가 도달' },
  { key: 'stop_loss_hit',   label: '손절선 이탈' },
  { key: 'indicator_change',label: '지표 변화' },
  { key: 'volume_drop',     label: '거래량 감소' },
  { key: 'panic_sell',      label: '급락 공포' },
  { key: 'profit_fear',     label: '수익 반납 두려움' },
  { key: 'impulsive_sell',  label: '충동 매도' },
  { key: 'no_plan',         label: '계획 없음' },
]

const SECTIONS = ['기본 정보', '진입/청산', '리스크', '시장 상황', '감정/복기']

// ─────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────
const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'
const labelCls = 'block text-xs font-medium text-slate-400 mb-1'
const requiredStar = <span className="text-red-400 ml-0.5">*</span>

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && requiredStar}</label>
      {children}
    </div>
  )
}

function SelectField({ label, required, value, onChange, options }: {
  label: string; required?: boolean; value: string;
  onChange: (v: string) => void; options: { key: string; label: string }[]
}) {
  return (
    <Field label={label} required={required}>
      <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        <option value="">선택</option>
        {options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
    </Field>
  )
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────
export default function NewTradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assetType, setAssetType] = useState('')
  const [section, setSection] = useState(0)
  const [showLimitModal, setShowLimitModal] = useState(false)

  // 플랜/한도 훅
  const { plan, loading: planLoading } = useUserPlan()
  const { journalCountToday, loading: limitsLoading } = useDailyLimits()

  // ── 공통 필드
  const [common, setCommon] = useState({
    trade_date: new Date().toISOString().split('T')[0],
    asset_name: '', ticker: '', trade_type: '', stop_loss_basis: '',
    target_price: '', emotion_before: '', exit_reason: '',
    principle_followed: '', good_points: '', mistakes: '',
    improvements: '', score: '', review_summary: '',
    currency: 'KRW', exchange_rate: '1', status: 'open',
    entry_reason: [] as string[],
  })

  // ── 코인 선물 필드
  const [cf, setCf] = useState({
    exchange_name: '', coin_symbol: '',
    position_direction: 'long', margin_mode: 'isolated',
    leverage: '', entry_datetime: '', exit_datetime: '',
    input_method: 'by_margin',
    margin: '', position_quantity: '',
    entry_price: '', exit_price: '',
    liquidation_price: '', funding_fee: '', fee: '',
    btc_direction: '', btc_dominance: '', volatility: '',
    entry_session: '', news_event: '', overtrading: '',
    stop_loss_method: '',
  })

  // ── 주식 현물 필드
  const [ss, setSs] = useState({
    market_type: '', exchange: '', sector: '',
    entry_datetime: '', exit_datetime: '',
    quantity: '', entry_price: '', exit_price: '',
    fee: '', tax: '', trade_session: '',
    check_foreign_flow: false, check_institutional_flow: false, check_retail_flow: false,
    has_earnings: false, has_disclosure: false,
    macro_issue: '', investment_period: '', has_dividend: false,
  })

  // ── 주식 선물 필드
  const [sf, setSf] = useState({
    futures_type: '', underlying_asset: '', contract_name: '',
    direction: 'long', contract_count: '', contract_multiplier: '',
    margin: '', leverage: '', entry_datetime: '', exit_datetime: '',
    entry_price: '', exit_price: '', expiry_date: '',
    is_rollover: false, liquidation_risk_memo: '', fee: '', tax: '',
    market_direction: '', volatility: '', major_event: '', trade_session: '',
  })

  // ── 코인 현물 필드
  const [cs, setCs] = useState({
    exchange_name: '', coin_symbol: '', market_pair: 'KRW',
    input_method: 'by_amount',
    entry_datetime: '', exit_datetime: '',
    invest_amount: '', coin_quantity: '',
    avg_buy_price: '', avg_sell_price: '',
    fee: '', btc_direction: '', btc_dominance: '',
    coin_category: '', volatility: '', entry_session: '',
    news_event: '', overtrading: '',
  })

  // ─────────────────────────────────────
  // 자동 계산
  // ─────────────────────────────────────
  const calcCF = () => {
    const ep = Number(cf.entry_price), xp = Number(cf.exit_price)
    const fee = Number(cf.fee) || 0, ff = Number(cf.funding_fee) || 0
    const lev = Number(cf.leverage) || 1
    let qty = 0, margin = 0, posSize = 0

    if (cf.input_method === 'by_margin') {
      margin = Number(cf.margin) || 0
      posSize = margin * lev
      qty = ep > 0 ? posSize / ep : 0
    } else {
      qty = Number(cf.position_quantity) || 0
      posSize = ep * qty
      margin = lev > 0 ? posSize / lev : 0
    }

    if (!ep || !xp || !qty) return null
    const raw = cf.position_direction === 'long'
      ? (xp - ep) * qty : (ep - xp) * qty
    const pl = raw - fee - ff
    const plRate = margin > 0 ? (pl / margin) * 100 : 0
    const plKrw = common.currency !== 'KRW' ? pl * Number(common.exchange_rate) : pl
    return { pl, plRate, plKrw, qty: qty.toFixed(6), posSize: posSize.toFixed(2), margin: margin.toFixed(2) }
  }

  const calcSS = () => {
    const ep = Number(ss.entry_price), xp = Number(ss.exit_price)
    const qty = Number(ss.quantity), fee = Number(ss.fee) || 0, tax = Number(ss.tax) || 0
    if (!ep || !qty) return null
    const buyAmt = ep * qty
    const sellAmt = xp > 0 ? xp * qty : 0
    const pl = xp > 0 ? sellAmt - buyAmt - fee - tax : null
    const plRate = pl != null && buyAmt > 0 ? (pl / buyAmt) * 100 : null
    return { buyAmt, sellAmt, pl, plRate }
  }

  const calcSF = () => {
    const ep = Number(sf.entry_price), xp = Number(sf.exit_price)
    const cnt = Number(sf.contract_count), mul = Number(sf.contract_multiplier) || 1
    const margin = Number(sf.margin), fee = Number(sf.fee) || 0, tax = Number(sf.tax) || 0
    if (!ep || !xp || !cnt) return null
    const raw = sf.direction === 'long' ? (xp - ep) * cnt * mul : (ep - xp) * cnt * mul
    const pl = raw - fee - tax
    const roe = margin > 0 ? (pl / margin) * 100 : 0
    return { pl, roe }
  }

  const calcCS = () => {
    const buyP = Number(cs.avg_buy_price), sellP = Number(cs.avg_sell_price)
    const fee = Number(cs.fee) || 0
    let qty = 0, investAmt = 0
    if (cs.input_method === 'by_amount') {
      investAmt = Number(cs.invest_amount) || 0
      qty = buyP > 0 ? investAmt / buyP : 0
    } else {
      qty = Number(cs.coin_quantity) || 0
      investAmt = buyP * qty
    }
    if (!buyP || !qty) return null
    const sellAmt = sellP > 0 ? sellP * qty : 0
    const pl = sellP > 0 ? sellAmt - investAmt - fee : null
    const plRate = pl != null && investAmt > 0 ? (pl / investAmt) * 100 : null
    return { qty: qty.toFixed(8), investAmt, sellAmt, pl, plRate }
  }

  const cfCalc = assetType === 'crypto_futures' ? calcCF() : null
  const ssCalc = assetType === 'stock_spot' ? calcSS() : null
  const sfCalc = assetType === 'stock_futures' ? calcSF() : null
  const csCalc = assetType === 'crypto_spot' ? calcCS() : null

  // ─────────────────────────────────────
  // 제출
  // ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetType) { alert('자산 유형을 선택해주세요.'); return }

    // Free 플랜 일지 한도 체크
    if (!isProOrTrial(plan) && journalCountToday >= DEFAULT_PLAN_CONFIG.free_daily_journal_limit) {
      setShowLimitModal(true)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const payload: any = {
      user_id: user.id,
      asset_type: assetType,
      trade_date: common.trade_date,
      asset_name: common.asset_name,
      ticker: common.ticker.toUpperCase(),
      trade_type: common.trade_type || null,
      entry_reason: common.entry_reason.length ? common.entry_reason : null,
      stop_loss_basis: common.stop_loss_basis || null,
      target_price: common.target_price ? Number(common.target_price) : null,
      emotion_before: common.emotion_before || null,
      exit_reason: common.exit_reason || null,
      principle_followed: common.principle_followed || null,
      good_points: common.good_points || null,
      mistakes: common.mistakes || null,
      improvements: common.improvements || null,
      score: common.score ? Number(common.score) : null,
      review_summary: common.review_summary || null,
      currency: common.currency,
      exchange_rate: Number(common.exchange_rate) || 1,
      status: common.status,
    }

    if (assetType === 'crypto_futures') {
      const calc = cfCalc
      Object.assign(payload, {
        exchange_name: cf.exchange_name || null,
        coin_symbol: cf.coin_symbol || null,
        position_direction: cf.position_direction,
        margin_mode: cf.margin_mode,
        leverage: cf.leverage ? Number(cf.leverage) : null,
        entry_datetime: cf.entry_datetime || null,
        exit_datetime: cf.exit_datetime || null,
        entry_price: cf.entry_price ? Number(cf.entry_price) : null,
        exit_price: cf.exit_price ? Number(cf.exit_price) : null,
        margin: calc ? Number(calc.margin) : (cf.margin ? Number(cf.margin) : null),
        position_size: calc ? Number(calc.posSize) : null,
        position_quantity: calc ? Number(calc.qty) : (cf.position_quantity ? Number(cf.position_quantity) : null),
        liquidation_price: cf.liquidation_price ? Number(cf.liquidation_price) : null,
        funding_fee: cf.funding_fee ? Number(cf.funding_fee) : null,
        fee: cf.fee ? Number(cf.fee) : 0,
        profit_loss: calc ? calc.pl : null,
        profit_loss_rate: calc ? calc.plRate : null,
        profit_loss_krw: calc ? calc.plKrw : null,
        roe: calc ? calc.plRate : null,
        btc_direction: cf.btc_direction || null,
        btc_dominance: cf.btc_dominance ? Number(cf.btc_dominance) : null,
        volatility: cf.volatility || null,
        entry_session: cf.entry_session || null,
        news_event: cf.news_event || null,
        overtrading: cf.overtrading || null,
      })
    }

    if (assetType === 'stock_spot') {
      const calc = ssCalc
      Object.assign(payload, {
        market_type: ss.market_type || null,
        exchange: ss.exchange || null,
        sector: ss.sector || null,
        entry_datetime: ss.entry_datetime || null,
        exit_datetime: ss.exit_datetime || null,
        quantity: ss.quantity ? Number(ss.quantity) : null,
        entry_price: ss.entry_price ? Number(ss.entry_price) : null,
        exit_price: ss.exit_price ? Number(ss.exit_price) : null,
        total_buy_amount: calc ? calc.buyAmt : null,
        total_sell_amount: calc ? calc.sellAmt : null,
        fee: ss.fee ? Number(ss.fee) : 0,
        tax: ss.tax ? Number(ss.tax) : 0,
        profit_loss: calc ? calc.pl : null,
        profit_loss_rate: calc ? calc.plRate : null,
        trade_session: ss.trade_session || null,
        check_foreign_flow: ss.check_foreign_flow,
        check_institutional_flow: ss.check_institutional_flow,
        check_retail_flow: ss.check_retail_flow,
        has_earnings: ss.has_earnings,
        has_disclosure: ss.has_disclosure,
        macro_issue: ss.macro_issue || null,
        investment_period: ss.investment_period || null,
        has_dividend: ss.has_dividend,
      })
    }

    if (assetType === 'stock_futures') {
      const calc = sfCalc
      Object.assign(payload, {
        futures_type: sf.futures_type || null,
        underlying_asset: sf.underlying_asset || null,
        contract_name: sf.contract_name || null,
        direction: sf.direction,
        contract_count: sf.contract_count ? Number(sf.contract_count) : null,
        contract_multiplier: sf.contract_multiplier ? Number(sf.contract_multiplier) : null,
        margin: sf.margin ? Number(sf.margin) : null,
        leverage: sf.leverage ? Number(sf.leverage) : null,
        entry_datetime: sf.entry_datetime || null,
        exit_datetime: sf.exit_datetime || null,
        entry_price: sf.entry_price ? Number(sf.entry_price) : null,
        exit_price: sf.exit_price ? Number(sf.exit_price) : null,
        expiry_date: sf.expiry_date || null,
        is_rollover: sf.is_rollover,
        liquidation_risk_memo: sf.liquidation_risk_memo || null,
        fee: sf.fee ? Number(sf.fee) : 0,
        tax: sf.tax ? Number(sf.tax) : 0,
        profit_loss: calc ? calc.pl : null,
        roe: calc ? calc.roe : null,
        market_direction: sf.market_direction || null,
        volatility: sf.volatility || null,
        major_event: sf.major_event || null,
        trade_session: sf.trade_session || null,
      })
    }

    if (assetType === 'crypto_spot') {
      const calc = csCalc
      Object.assign(payload, {
        exchange_name: cs.exchange_name || null,
        coin_symbol: cs.coin_symbol || null,
        market_pair: cs.market_pair || null,
        input_method: cs.input_method,
        entry_datetime: cs.entry_datetime || null,
        exit_datetime: cs.exit_datetime || null,
        invest_amount: calc ? calc.investAmt : (cs.invest_amount ? Number(cs.invest_amount) : null),
        coin_quantity: calc ? Number(calc.qty) : (cs.coin_quantity ? Number(cs.coin_quantity) : null),
        avg_buy_price: cs.avg_buy_price ? Number(cs.avg_buy_price) : null,
        avg_sell_price: cs.avg_sell_price ? Number(cs.avg_sell_price) : null,
        total_sell_amount_coin: calc ? calc.sellAmt : null,
        fee: cs.fee ? Number(cs.fee) : 0,
        profit_loss: calc ? calc.pl : null,
        profit_loss_rate: calc ? calc.plRate : null,
        btc_direction: cs.btc_direction || null,
        btc_dominance: cs.btc_dominance ? Number(cs.btc_dominance) : null,
        coin_category: cs.coin_category || null,
        volatility: cs.volatility || null,
        entry_session: cs.entry_session || null,
        news_event: cs.news_event || null,
        overtrading: cs.overtrading || null,
      })
    }

    const { error } = await supabase.from('trades').insert(payload)
    setLoading(false)
    if (!error) router.push('/journal')
    else alert('저장 오류: ' + error.message)
  }

  const setC = (k: string) => (e: any) => setCommon(p => ({ ...p, [k]: e.target.value }))
  const setCF = (k: string) => (e: any) => setCf(p => ({ ...p, [k]: e.target.value }))
  const setSS = (k: string) => (e: any) => setSs(p => ({ ...p, [k]: e.target.value }))
  const setSF = (k: string) => (e: any) => setSf(p => ({ ...p, [k]: e.target.value }))
  const setCS = (k: string) => (e: any) => setCs(p => ({ ...p, [k]: e.target.value }))

  const toggleReason = (k: string) => setCommon(p => ({
    ...p,
    entry_reason: p.entry_reason.includes(k)
      ? p.entry_reason.filter(r => r !== k)
      : [...p.entry_reason, k]
  }))

  const plColor = (v: number | null | undefined) =>
    v == null ? 'text-slate-400' : v >= 0 ? 'text-emerald-400' : 'text-red-400'

  const fmtNum = (v: number | null | undefined, decimals = 0) =>
    v == null ? '-' : v.toLocaleString('ko-KR', { maximumFractionDigits: decimals })

  // ─────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">

      {/* 한도 초과 모달 */}
      <LimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        type="journal"
      />

      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">TraderMirror</span>
        </div>
        <Link href="/journal" className="text-sm text-slate-400 hover:text-slate-200">← 일지 목록</Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">새 매매 기록</h1>

        {/* 자산 유형 선택 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {ASSET_TYPES.map(a => (
            <button key={a.key} type="button"
              onClick={() => { setAssetType(a.key); setSection(0) }}
              className={`p-4 rounded-xl border text-left transition-all ${
                assetType === a.key
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                  : 'bg-slate-900/40 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}>
              <div className="text-2xl mb-1">{a.emoji}</div>
              <div className="font-semibold text-sm">{a.label}</div>
              <div className="text-xs mt-1 opacity-70">{a.desc}</div>
            </button>
          ))}
        </div>

        {!assetType && (
          <div className="text-center py-16 text-slate-500">
            위에서 자산 유형을 선택하세요
          </div>
        )}

        {assetType && (
          <form onSubmit={handleSubmit}>
            {/* 섹션 탭 */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {SECTIONS.map((s, i) => (
                <button key={s} type="button" onClick={() => setSection(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    section === i ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}>
                  {i + 1}. {s}
                </button>
              ))}
            </div>

            {/* ═══════════════════════════
                섹션 0: 기본 정보
            ═══════════════════════════ */}
            {section === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="거래일" required>
                    <input type="date" value={common.trade_date} onChange={setC('trade_date')} className={inputCls} required />
                  </Field>
                  <SelectField label="상태" value={common.status} onChange={v => setCommon(p => ({...p, status: v}))}
                    options={[{key:'open',label:'보유중'},{key:'closed',label:'청산완료'}]} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="자산명" required>
                    <input type="text" placeholder="삼성전자 / 비트코인" value={common.asset_name} onChange={setC('asset_name')} className={inputCls} required />
                  </Field>
                  <Field label="티커/심볼" required>
                    <input type="text" placeholder="005930 / BTCUSDT" value={common.ticker} onChange={setC('ticker')} className={inputCls} required />
                  </Field>
                </div>
                <SelectField label="매매 유형" value={common.trade_type} onChange={v => setCommon(p=>({...p,trade_type:v}))}
                  options={[
                    {key:'scalping',label:'단타'},{key:'swing',label:'스윙'},{key:'long_term',label:'장기'},
                    {key:'split_buy',label:'분할매수'},{key:'take_profit',label:'익절'},{key:'stop_loss',label:'손절'}
                  ]} />
                <div>
                  <label className={labelCls}>진입 근거 (복수 선택)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ENTRY_REASONS.map(r => (
                      <button key={r.key} type="button" onClick={() => toggleReason(r.key)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          common.entry_reason.includes(r.key)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <SelectField label="수익 통화" value={common.currency} onChange={v => setCommon(p=>({...p,currency:v}))}
                    options={[{key:'KRW',label:'KRW (₩)'},{key:'USD',label:'USD ($)'},{key:'USDT',label:'USDT'}]} />
                  {common.currency !== 'KRW' && (
                    <Field label="환율">
                      <input type="number" step="any" placeholder="1350" value={common.exchange_rate} onChange={setC('exchange_rate')} className={inputCls} />
                    </Field>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════
                섹션 1: 진입/청산
            ═══════════════════════════ */}
            {section === 1 && (
              <div className="space-y-4">

                {/* 코인 선물 */}
                {assetType === 'crypto_futures' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="거래소" value={cf.exchange_name} onChange={v => setCf(p=>({...p,exchange_name:v}))}
                      options={[{key:'binance',label:'바이낸스'},{key:'bybit',label:'바이비트'},{key:'okx',label:'OKX'},{key:'other',label:'기타'}]} />
                    <Field label="심볼">
                      <input type="text" placeholder="BTCUSDT" value={cf.coin_symbol} onChange={setCF('coin_symbol')} className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>포지션 방향{requiredStar}</label>
                      <div className="flex gap-2">
                        {[{v:'long',l:'롱'},{v:'short',l:'숏'}].map(o => (
                          <button key={o.v} type="button" onClick={() => setCf(p=>({...p,position_direction:o.v}))}
                            className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                              cf.position_direction === o.v
                                ? o.v === 'long' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                 : 'bg-red-500/20 border-red-500 text-red-400'
                                : 'border-slate-700 text-slate-500'
                            }`}>{o.l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>증거금 모드</label>
                      <div className="flex gap-2">
                        {[{v:'isolated',l:'격리'},{v:'cross',l:'교차'}].map(o => (
                          <button key={o.v} type="button" onClick={() => setCf(p=>({...p,margin_mode:o.v}))}
                            className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                              cf.margin_mode === o.v ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-slate-700 text-slate-500'
                            }`}>{o.l}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="진입 일시">
                      <input type="datetime-local" value={cf.entry_datetime} onChange={setCF('entry_datetime')} className={inputCls} />
                    </Field>
                    <Field label="청산 일시">
                      <input type="datetime-local" value={cf.exit_datetime} onChange={setCF('exit_datetime')} className={inputCls} />
                    </Field>
                  </div>
                  <div>
                    <label className={labelCls}>입력 방식</label>
                    <div className="flex gap-2 mb-3">
                      {[{v:'by_margin',l:'증거금 기준'},{v:'by_quantity',l:'수량 기준'}].map(o => (
                        <button key={o.v} type="button" onClick={() => setCf(p=>({...p,input_method:o.v}))}
                          className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${
                            cf.input_method === o.v ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'border-slate-700 text-slate-500'
                          }`}>{o.l}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {cf.input_method === 'by_margin' ? (
                        <Field label="증거금">
                          <input type="number" step="any" placeholder="0" value={cf.margin} onChange={setCF('margin')} className={inputCls} />
                        </Field>
                      ) : (
                        <Field label="포지션 수량">
                          <input type="number" step="any" placeholder="0.001" value={cf.position_quantity} onChange={setCF('position_quantity')} className={inputCls} />
                        </Field>
                      )}
                      <Field label="레버리지 배율">
                        <input type="number" step="1" placeholder="10" value={cf.leverage} onChange={setCF('leverage')} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="진입 가격" required>
                      <input type="number" step="any" placeholder="0" value={cf.entry_price} onChange={setCF('entry_price')} className={inputCls} />
                    </Field>
                    <Field label="청산 가격">
                      <input type="number" step="any" placeholder="미청산 시 비워두기" value={cf.exit_price} onChange={setCF('exit_price')} className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="강제청산가">
                      <input type="number" step="any" placeholder="0" value={cf.liquidation_price} onChange={setCF('liquidation_price')} className={inputCls} />
                    </Field>
                    <Field label="펀딩비">
                      <input type="number" step="any" placeholder="0" value={cf.funding_fee} onChange={setCF('funding_fee')} className={inputCls} />
                    </Field>
                    <Field label="수수료">
                      <input type="number" step="any" placeholder="0" value={cf.fee} onChange={setCF('fee')} className={inputCls} />
                    </Field>
                  </div>

                  {/* 실시간 계산 */}
                  {cfCalc && (
                    <div className={`p-4 rounded-xl border ${cfCalc.pl >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">실시간 계산</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-slate-500">포지션 크기</div>
                          <div className="font-bold">{fmtNum(Number(cfCalc.posSize), 2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">수량</div>
                          <div className="font-bold">{cfCalc.qty}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">증거금</div>
                          <div className="font-bold">{fmtNum(Number(cfCalc.margin), 2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">손익</div>
                          <div className={`font-bold text-lg ${plColor(cfCalc.pl)}`}>
                            {cfCalc.pl >= 0 ? '+' : ''}{fmtNum(cfCalc.pl, 2)}
                            <span className="text-xs ml-1">({cfCalc.plRate >= 0 ? '+' : ''}{cfCalc.plRate.toFixed(2)}%)</span>
                          </div>
                        </div>
                      </div>
                      {common.currency !== 'KRW' && (
                        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                          원화 환산: <span className={`font-bold ${plColor(cfCalc.plKrw)}`}>
                            {cfCalc.plKrw >= 0 ? '+' : ''}₩{fmtNum(cfCalc.plKrw, 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>)}

                {/* 주식 현물 */}
                {assetType === 'stock_spot' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="시장 구분" value={ss.market_type} onChange={v => setSs(p=>({...p,market_type:v}))}
                      options={[{key:'domestic',label:'국내주식'},{key:'us',label:'미국주식'},{key:'etf',label:'ETF'},{key:'dividend',label:'배당주'},{key:'theme',label:'테마주'}]} />
                    <SelectField label="거래소" value={ss.exchange} onChange={v => setSs(p=>({...p,exchange:v}))}
                      options={[{key:'kospi',label:'코스피'},{key:'kosdaq',label:'코스닥'},{key:'nasdaq',label:'나스닥'},{key:'nyse',label:'NYSE'},{key:'amex',label:'AMEX'}]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="매수 일시"><input type="datetime-local" value={ss.entry_datetime} onChange={setSS('entry_datetime')} className={inputCls} /></Field>
                    <Field label="매도 일시"><input type="datetime-local" value={ss.exit_datetime} onChange={setSS('exit_datetime')} className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="매수 가격" required><input type="number" step="any" placeholder="0" value={ss.entry_price} onChange={setSS('entry_price')} className={inputCls} /></Field>
                    <Field label="매도 가격"><input type="number" step="any" placeholder="0" value={ss.exit_price} onChange={setSS('exit_price')} className={inputCls} /></Field>
                    <Field label="수량" required><input type="number" step="any" placeholder="0" value={ss.quantity} onChange={setSS('quantity')} className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="수수료"><input type="number" step="any" placeholder="0" value={ss.fee} onChange={setSS('fee')} className={inputCls} /></Field>
                    <Field label="세금"><input type="number" step="any" placeholder="0" value={ss.tax} onChange={setSS('tax')} className={inputCls} /></Field>
                  </div>
                  {ssCalc && ssCalc.pl != null && (
                    <div className={`p-4 rounded-xl border ${ssCalc.pl >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><div className="text-xs text-slate-500">총 매수금액</div><div className="font-bold">₩{fmtNum(ssCalc.buyAmt)}</div></div>
                        <div><div className="text-xs text-slate-500">총 매도금액</div><div className="font-bold">₩{fmtNum(ssCalc.sellAmt)}</div></div>
                        <div><div className="text-xs text-slate-500">순손익</div><div className={`font-bold text-lg ${plColor(ssCalc.pl)}`}>{ssCalc.pl >= 0?'+':''}₩{fmtNum(ssCalc.pl)}</div></div>
                        <div><div className="text-xs text-slate-500">수익률</div><div className={`font-bold ${plColor(ssCalc.plRate)}`}>{ssCalc.plRate != null ? `${ssCalc.plRate >= 0?'+':''}${ssCalc.plRate.toFixed(2)}%` : '-'}</div></div>
                      </div>
                    </div>
                  )}
                </>)}

                {/* 주식 선물 */}
                {assetType === 'stock_futures' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="선물 종류" value={sf.futures_type} onChange={v => setSf(p=>({...p,futures_type:v}))}
                      options={[{key:'kospi200',label:'코스피200 선물'},{key:'mini_kospi200',label:'미니 코스피200'},{key:'sp500',label:'S&P500 선물'},{key:'nasdaq100',label:'나스닥100 선물'},{key:'dow',label:'다우 선물'},{key:'individual',label:'개별주식선물'},{key:'other',label:'기타'}]} />
                    <Field label="기초자산"><input type="text" placeholder="코스피200, 나스닥100..." value={sf.underlying_asset} onChange={setSF('underlying_asset')} className={inputCls} /></Field>
                  </div>
                  <div>
                    <label className={labelCls}>포지션 방향</label>
                    <div className="flex gap-2">
                      {[{v:'long',l:'롱'},{v:'short',l:'숏'}].map(o => (
                        <button key={o.v} type="button" onClick={() => setSf(p=>({...p,direction:o.v}))}
                          className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${sf.direction===o.v?(o.v==='long'?'bg-emerald-500/20 border-emerald-500 text-emerald-400':'bg-red-500/20 border-red-500 text-red-400'):'border-slate-700 text-slate-500'}`}>{o.l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="진입 일시"><input type="datetime-local" value={sf.entry_datetime} onChange={setSF('entry_datetime')} className={inputCls} /></Field>
                    <Field label="청산 일시"><input type="datetime-local" value={sf.exit_datetime} onChange={setSF('exit_datetime')} className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="진입 가격"><input type="number" step="any" placeholder="0" value={sf.entry_price} onChange={setSF('entry_price')} className={inputCls} /></Field>
                    <Field label="청산 가격"><input type="number" step="any" placeholder="0" value={sf.exit_price} onChange={setSF('exit_price')} className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="계약 수"><input type="number" step="any" placeholder="1" value={sf.contract_count} onChange={setSF('contract_count')} className={inputCls} /></Field>
                    <Field label="계약 승수"><input type="number" step="any" placeholder="250000" value={sf.contract_multiplier} onChange={setSF('contract_multiplier')} className={inputCls} /></Field>
                    <Field label="증거금"><input type="number" step="any" placeholder="0" value={sf.margin} onChange={setSF('margin')} className={inputCls} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="만기일"><input type="date" value={sf.expiry_date} onChange={setSF('expiry_date')} className={inputCls} /></Field>
                    <Field label="수수료"><input type="number" step="any" placeholder="0" value={sf.fee} onChange={setSF('fee')} className={inputCls} /></Field>
                    <Field label="세금"><input type="number" step="any" placeholder="0" value={sf.tax} onChange={setSF('tax')} className={inputCls} /></Field>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="rollover" checked={sf.is_rollover} onChange={e => setSf(p=>({...p,is_rollover:e.target.checked}))} className="w-4 h-4" />
                    <label htmlFor="rollover" className="text-sm text-slate-400">롤오버 여부</label>
                  </div>
                  {sfCalc && (
                    <div className={`p-4 rounded-xl border ${sfCalc.pl >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><div className="text-xs text-slate-500">순손익</div><div className={`font-bold text-lg ${plColor(sfCalc.pl)}`}>{sfCalc.pl>=0?'+':''}₩{fmtNum(sfCalc.pl)}</div></div>
                        <div><div className="text-xs text-slate-500">ROE</div><div className={`font-bold ${plColor(sfCalc.roe)}`}>{sfCalc.roe>=0?'+':''}{sfCalc.roe.toFixed(2)}%</div></div>
                      </div>
                    </div>
                  )}
                </>)}

                {/* 코인 현물 */}
                {assetType === 'crypto_spot' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="거래소" value={cs.exchange_name} onChange={v => setCs(p=>({...p,exchange_name:v}))}
                      options={[{key:'upbit',label:'업비트'},{key:'bithumb',label:'빗썸'},{key:'binance',label:'바이낸스'},{key:'bybit',label:'바이비트'},{key:'okx',label:'OKX'},{key:'other',label:'기타'}]} />
                    <SelectField label="마켓" value={cs.market_pair} onChange={v => setCs(p=>({...p,market_pair:v}))}
                      options={[{key:'KRW',label:'KRW'},{key:'USDT',label:'USDT'},{key:'USD',label:'USD'},{key:'BTC',label:'BTC'}]} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="매수 일시"><input type="datetime-local" value={cs.entry_datetime} onChange={setCS('entry_datetime')} className={inputCls} /></Field>
                    <Field label="매도 일시"><input type="datetime-local" value={cs.exit_datetime} onChange={setCS('exit_datetime')} className={inputCls} /></Field>
                  </div>
                  <div>
                    <label className={labelCls}>입력 방식</label>
                    <div className="flex gap-2 mb-3">
                      {[{v:'by_amount',l:'투자 원금 기준'},{v:'by_quantity',l:'코인 수량 기준'}].map(o => (
                        <button key={o.v} type="button" onClick={() => setCs(p=>({...p,input_method:o.v}))}
                          className={`flex-1 py-2 rounded-lg border text-sm transition-colors ${cs.input_method===o.v?'bg-blue-600/20 border-blue-500 text-blue-300':'border-slate-700 text-slate-500'}`}>{o.l}</button>
                      ))}
                    </div>
                    {cs.input_method === 'by_amount' ? (
                      <Field label="투자 원금"><input type="number" step="any" placeholder="0" value={cs.invest_amount} onChange={setCS('invest_amount')} className={inputCls} /></Field>
                    ) : (
                      <Field label="코인 수량"><input type="number" step="any" placeholder="0.001" value={cs.coin_quantity} onChange={setCS('coin_quantity')} className={inputCls} /></Field>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="평균 매수 가격"><input type="number" step="any" placeholder="0" value={cs.avg_buy_price} onChange={setCS('avg_buy_price')} className={inputCls} /></Field>
                    <Field label="평균 매도 가격"><input type="number" step="any" placeholder="0" value={cs.avg_sell_price} onChange={setCS('avg_sell_price')} className={inputCls} /></Field>
                  </div>
                  <Field label="수수료"><input type="number" step="any" placeholder="0" value={cs.fee} onChange={setCS('fee')} className={inputCls} /></Field>
                  {csCalc && csCalc.pl != null && (
                    <div className={`p-4 rounded-xl border ${csCalc.pl >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><div className="text-xs text-slate-500">투자 원금</div><div className="font-bold">{fmtNum(csCalc.investAmt, 2)}</div></div>
                        <div><div className="text-xs text-slate-500">코인 수량</div><div className="font-bold">{csCalc.qty}</div></div>
                        <div><div className="text-xs text-slate-500">순손익</div><div className={`font-bold text-lg ${plColor(csCalc.pl)}`}>{csCalc.pl>=0?'+':''}{fmtNum(csCalc.pl,2)}</div></div>
                        <div><div className="text-xs text-slate-500">수익률</div><div className={`font-bold ${plColor(csCalc.plRate)}`}>{csCalc.plRate!=null?`${csCalc.plRate>=0?'+':''}${csCalc.plRate.toFixed(2)}%`:'-'}</div></div>
                      </div>
                    </div>
                  )}
                </>)}
              </div>
            )}

            {/* ═══════════════════════════
                섹션 2: 리스크 관리
            ═══════════════════════════ */}
            {section === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="손절 기준">
                    <input type="text" placeholder="지지선 이탈 시 / -3% 도달 시" value={common.stop_loss_basis} onChange={setC('stop_loss_basis')} className={inputCls} />
                  </Field>
                  <Field label="목표가">
                    <input type="number" step="any" placeholder="0" value={common.target_price} onChange={setC('target_price')} className={inputCls} />
                  </Field>
                </div>
                {assetType === 'crypto_futures' && (
                  <SelectField label="손절 방식" value={cf.stop_loss_method} onChange={v => setCf(p=>({...p,stop_loss_method:v}))}
                    options={[{key:'price',label:'가격 손절'},{key:'pre_liquidation',label:'청산 전 수동 손절'},{key:'time',label:'시간 손절'},{key:'trailing',label:'트레일링 스탑'},{key:'none',label:'손절 없음'}]} />
                )}
                {assetType === 'stock_futures' && (
                  <Field label="청산 위험 메모">
                    <textarea value={sf.liquidation_risk_memo} onChange={setSF('liquidation_risk_memo')} placeholder="증거금 부족 위험, 만기 임박 등..." className={inputCls + ' resize-none h-20'} />
                  </Field>
                )}
                <SelectField label="원칙 준수 여부" value={common.principle_followed} onChange={v => setCommon(p=>({...p,principle_followed:v}))}
                  options={[{key:'fully_followed',label:'✅ 완전히 지킴'},{key:'partially_followed',label:'⚠️ 일부 지킴'},{key:'not_followed',label:'❌ 안 지킴'}]} />
              </div>
            )}

            {/* ═══════════════════════════
                섹션 3: 시장 상황
            ═══════════════════════════ */}
            {section === 3 && (
              <div className="space-y-4">
                {(assetType === 'crypto_futures' || assetType === 'crypto_spot') && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="BTC 방향" value={assetType==='crypto_futures'?cf.btc_direction:cs.btc_direction}
                      onChange={v => assetType==='crypto_futures'?setCf(p=>({...p,btc_direction:v})):setCs(p=>({...p,btc_direction:v}))}
                      options={[{key:'up',label:'상승'},{key:'down',label:'하락'},{key:'sideways',label:'횡보'},{key:'dump_recovery',label:'급락 후 반등'},{key:'pump_correction',label:'급등 후 조정'}]} />
                    <Field label="BTC 도미넌스 (%)">
                      <input type="number" step="any" placeholder="50.0" value={assetType==='crypto_futures'?cf.btc_dominance:cs.btc_dominance}
                        onChange={assetType==='crypto_futures'?setCF('btc_dominance'):setCS('btc_dominance')} className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="변동성" value={assetType==='crypto_futures'?cf.volatility:cs.volatility}
                      onChange={v => assetType==='crypto_futures'?setCf(p=>({...p,volatility:v})):setCs(p=>({...p,volatility:v}))}
                      options={[{key:'low',label:'낮음'},{key:'normal',label:'보통'},{key:'high',label:'높음'},{key:'very_high',label:'매우 높음'}]} />
                    <SelectField label="진입 시간대" value={assetType==='crypto_futures'?cf.entry_session:cs.entry_session}
                      onChange={v => assetType==='crypto_futures'?setCf(p=>({...p,entry_session:v})):setCs(p=>({...p,entry_session:v}))}
                      options={[{key:'asia',label:'아시아장'},{key:'europe',label:'유럽장'},{key:'us',label:'미국장'},{key:'midnight',label:'새벽'}]} />
                  </div>
                  <SelectField label="뉴스/이벤트" value={assetType==='crypto_futures'?cf.news_event:cs.news_event}
                    onChange={v => assetType==='crypto_futures'?setCf(p=>({...p,news_event:v})):setCs(p=>({...p,news_event:v}))}
                    options={[{key:'listing',label:'상장'},{key:'unlock',label:'락업해제'},{key:'etf',label:'ETF 이슈'},{key:'hack',label:'해킹'},{key:'regulation',label:'규제'},{key:'twitter',label:'X/트위터 이슈'},{key:'none',label:'없음'}]} />
                  <SelectField label="과매매 여부" value={assetType==='crypto_futures'?cf.overtrading:cs.overtrading}
                    onChange={v => assetType==='crypto_futures'?setCf(p=>({...p,overtrading:v})):setCs(p=>({...p,overtrading:v}))}
                    options={[{key:'1_2',label:'오늘 1~2회'},{key:'3_5',label:'3~5회'},{key:'6_plus',label:'6회 이상'},{key:'dont_remember',label:'기억 안 남'}]} />
                </>)}
                {assetType === 'stock_spot' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="매매 시간대" value={ss.trade_session} onChange={v => setSs(p=>({...p,trade_session:v}))}
                      options={[{key:'market_open',label:'장 초반'},{key:'intraday',label:'장중'},{key:'pre_close',label:'장 마감 전'},{key:'pre_market',label:'프리마켓'},{key:'after_market',label:'애프터마켓'}]} />
                    <SelectField label="투자 기간" value={ss.investment_period} onChange={v => setSs(p=>({...p,investment_period:v}))}
                      options={[{key:'day',label:'당일'},{key:'1_3days',label:'1~3일'},{key:'1_2weeks',label:'1~2주'},{key:'1month_plus',label:'1개월 이상'},{key:'long_term',label:'장기'}]} />
                  </div>
                  <Field label="섹터">
                    <input type="text" placeholder="반도체, 바이오, 금융..." value={ss.sector} onChange={setSS('sector')} className={inputCls} />
                  </Field>
                  <div className="space-y-2">
                    {[
                      {key:'check_foreign_flow',label:'외국인 수급 확인'},
                      {key:'check_institutional_flow',label:'기관 수급 확인'},
                      {key:'check_retail_flow',label:'개인 수급 확인'},
                      {key:'has_earnings',label:'실적 발표 여부'},
                      {key:'has_disclosure',label:'공시 여부'},
                      {key:'has_dividend',label:'배당 여부'},
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={(ss as any)[item.key]}
                          onChange={e => setSs(p=>({...p,[item.key]:e.target.checked}))} className="w-4 h-4 accent-blue-500" />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </>)}
                {assetType === 'stock_futures' && (<>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="진입 당시 시장 방향" value={sf.market_direction} onChange={v => setSf(p=>({...p,market_direction:v}))}
                      options={[{key:'up',label:'상승'},{key:'down',label:'하락'},{key:'sideways',label:'횡보'},{key:'pump_correction',label:'급등 후 조정'},{key:'dump_recovery',label:'급락 후 반등'}]} />
                    <SelectField label="변동성" value={sf.volatility} onChange={v => setSf(p=>({...p,volatility:v}))}
                      options={[{key:'low',label:'낮음'},{key:'normal',label:'보통'},{key:'high',label:'높음'},{key:'very_high',label:'매우 높음'}]} />
                  </div>
                  <SelectField label="주요 이벤트" value={sf.major_event} onChange={v => setSf(p=>({...p,major_event:v}))}
                    options={[{key:'fomc',label:'FOMC'},{key:'cpi',label:'CPI'},{key:'employment',label:'고용지표'},{key:'option_expiry',label:'옵션만기'},{key:'futures_expiry',label:'선물만기'},{key:'earnings_season',label:'실적 시즌'},{key:'none',label:'없음'}]} />
                  <SelectField label="매매 시간대" value={sf.trade_session} onChange={v => setSf(p=>({...p,trade_session:v}))}
                    options={[{key:'market_open',label:'장 초반'},{key:'intraday',label:'장중'},{key:'pre_close',label:'장 마감 전'},{key:'night',label:'야간장'}]} />
                </>)}
              </div>
            )}

            {/* ═══════════════════════════
                섹션 4: 감정/복기
            ═══════════════════════════ */}
            {section === 4 && (
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>진입 전 감정 상태</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {EMOTIONS.map(em => (
                      <button key={em.key} type="button"
                        onClick={() => setCommon(p=>({...p,emotion_before:p.emotion_before===em.key?'':em.key}))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          common.emotion_before===em.key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}>{em.label}</button>
                    ))}
                  </div>
                </div>
                <SelectField label="청산 이유" value={common.exit_reason} onChange={v => setCommon(p=>({...p,exit_reason:v}))}
                  options={EXIT_REASONS} />
                <div>
                  <label className={labelCls}>매매 점수 (1~10)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="1" max="10" value={common.score || 5}
                      onChange={setC('score')} className="flex-1 accent-blue-500" />
                    <span className="text-2xl font-bold text-blue-400 w-8 text-center">{common.score || 5}</span>
                  </div>
                </div>
                <Field label="잘한 점">
                  <textarea value={common.good_points} onChange={setC('good_points')} placeholder="이번 매매에서 잘한 점..." className={inputCls + ' resize-none h-20'} />
                </Field>
                <Field label="실수한 점">
                  <textarea value={common.mistakes} onChange={setC('mistakes')} placeholder="이번 매매에서 실수한 점..." className={inputCls + ' resize-none h-20'} />
                </Field>
                <Field label="다음에 고칠 점">
                  <textarea value={common.improvements} onChange={setC('improvements')} placeholder="다음 매매에서 개선할 점..." className={inputCls + ' resize-none h-20'} />
                </Field>
                <Field label="한 줄 복기">
                  <input type="text" placeholder="이번 매매의 핵심 교훈 한 줄로..." value={common.review_summary} onChange={setC('review_summary')} className={inputCls} />
                </Field>
              </div>
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
              <button type="button" onClick={() => setSection(s => Math.max(0, s-1))}
                disabled={section === 0}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors text-sm">
                <ChevronLeft className="h-4 w-4" /> 이전
              </button>

              {section < SECTIONS.length - 1 ? (
                <button type="button" onClick={() => setSection(s => s+1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                  다음 <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="submit" disabled={loading}
                  className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                  {loading ? '저장 중...' : '💾 매매 기록 저장'}
                </button>
              )}
            </div>

            {/* 면책 고지 */}
            <p className="text-xs text-slate-600 text-center mt-6 leading-relaxed">
              본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다.<br />
              모든 투자의 책임은 투자자 본인에게 있습니다.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
