"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, BarChart2, Coins, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import LimitModal from '@/components/LimitModal'
import { useDailyLimits } from '@/hooks/useDailyLimits'
import { useUserPlan } from '@/hooks/useUserPlan'
import { DEFAULT_PLAN_CONFIG, isProOrTrial } from '@/lib/planConfig'

// ─────────────────────────────────────────
// 상수
// ─────────────────────────────────────────
const ASSET_TYPES = [
  { key: 'stock_spot',     label: '주식 현물', icon: 'stock',   desc: '국내·미국 주식, ETF' },
  { key: 'stock_futures',  label: '주식 선물', icon: 'futures', desc: '코스피200, 나스닥100 선물' },
  { key: 'crypto_spot',    label: '코인 현물', icon: 'coin',    desc: '업비트, 바이낸스 현물' },
  { key: 'crypto_futures', label: '코인 선물', icon: 'cf',      desc: '바이낸스, 바이비트 선물' },
]

function AssetIcon({ icon, className = 'h-6 w-6' }: { icon: string; className?: string }) {
  if (icon === 'stock')   return <TrendingUp className={className} />
  if (icon === 'futures') return <BarChart2 className={className} />
  if (icon === 'coin')    return <Coins className={className} />
  if (icon === 'cf')      return <Zap className={className} />
  return <TrendingUp className={className} />
}

const ENTRY_REASONS = [
  { key: 'order_block',    label: '지지/저항' },
  { key: 'fvg',            label: '가격 공백' },
  { key: 'sr_flip',        label: '추세 전환' },
  { key: 'moving_average', label: '이동평균선' },
  { key: 'rsi',            label: 'RSI' },
  { key: 'volume',         label: '거래량' },
  { key: 'supply_demand',  label: '기관/외국인 수급' },
  { key: 'earnings',       label: '실적' },
  { key: 'news',           label: '뉴스' },
  { key: 'macro',          label: '매크로' },
  { key: 'community',      label: '커뮤니티' },
  { key: 'gut_feeling',    label: '감(직관)' },
]

const EMOTIONS = [
  { key: 'calm',      label: '차분함', color: 'bg-emerald-600' },
  { key: 'anxious',   label: '불안',   color: 'bg-yellow-600' },
  { key: 'confident', label: '확신',   color: 'bg-blue-600' },
  { key: 'impatient', label: '조급함', color: 'bg-orange-600' },
  { key: 'fomo',      label: 'FOMO',   color: 'bg-red-600' },
  { key: 'revenge',   label: '복수심', color: 'bg-red-700' },
  { key: 'bored',     label: '지루함', color: 'bg-slate-600' },
  { key: 'impulsive', label: '충동',   color: 'bg-red-500' },
]

// ─────────────────────────────────────────
// 헬퍼 컴포넌트
// ─────────────────────────────────────────
const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'
const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

function TagButtons({ options, value, onChange }: {
  options: { key: string; label: string; color?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(value === o.key ? '' : o.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            value === o.key
              ? (o.color ? `${o.color} text-white` : 'bg-blue-600 text-white')
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function PnLDisplay({ pnl, pnlRate }: { pnl: number | null; pnlRate: number | null }) {
  if (pnl === null || pnlRate === null) return null
  const isProfit = pnl >= 0
  return (
    <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${isProfit ? 'bg-emerald-950/40 border border-emerald-500/30' : 'bg-red-950/40 border border-red-500/30'}`}>
      <span className="text-xs text-slate-400">실시간 손익</span>
      <span className={`text-sm font-black ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
        {isProfit ? '+' : ''}{pnlRate.toFixed(2)}% / {isProfit ? '+' : ''}₩{Math.round(pnl).toLocaleString()}
      </span>
    </div>
  )
}

function LiquidationDisplay({ price }: { price: number | null }) {
  if (!price) return null
  return (
    <div className="bg-red-950/30 border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
      <span className="text-xs text-slate-400">⚠️ 예상 강제청산가</span>
      <span className="text-sm font-black text-red-400">₩{Math.round(price).toLocaleString()}</span>
    </div>
  )
}

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────
export default function NewTradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [assetType, setAssetType] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)

  const { plan, loading: planLoading } = useUserPlan()
  const { journalCountToday, loading: limitsLoading } = useDailyLimits()

  // ── 공통 필드
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split('T')[0])
  const [entryReason, setEntryReason] = useState('')
  const [emotion, setEmotion] = useState('')
  const [score, setScore] = useState(5)
  const [stopLoss, setStopLoss] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [principleFollowed, setPrincipleFollowed] = useState('')
  const [specialNote, setSpecialNote] = useState('')   // 특이사항 메모 (시장상황 통합)
  const [oneLineMemo, setOneLineMemo] = useState('')   // 한 줄 복기
  const [memo, setMemo] = useState('')                  // 자유 메모 (잘한점/실수/개선점 통합)

  // ── 주식 현물
  const [ssName, setSsName]       = useState('')
  const [ssBuyPrice, setSsBuyPrice] = useState('')
  const [ssSellPrice, setSsSellPrice] = useState('')
  const [ssQty, setSsQty]         = useState('')
  const [ssBuyDt, setSsBuyDt]     = useState('')
  const [ssSellDt, setSsSellDt]   = useState('')
  const [ssFee, setSsFee]         = useState('')
  const [ssTax, setSsTax]         = useState('')

  // ── 코인 선물
  const [cfSymbol, setCfSymbol]   = useState('')
  const [cfDir, setCfDir]         = useState<'long'|'short'>('long')
  const [cfLev, setCfLev]         = useState('')
  const [cfEntry, setCfEntry]     = useState('')
  const [cfExit, setCfExit]       = useState('')
  const [cfEntryDt, setCfEntryDt] = useState('')
  const [cfExitDt, setCfExitDt]   = useState('')
  const [cfMarginMode, setCfMarginMode] = useState<'isolated'|'cross'>('isolated')
  const [cfMargin, setCfMargin]   = useState('')
  const [cfFunding, setCfFunding] = useState('')
  const [cfFee, setCfFee]         = useState('')

  // ── 주식 선물
  const [sfName, setSfName]       = useState('')
  const [sfDir, setSfDir]         = useState<'long'|'short'>('long')
  const [sfLev, setSfLev]         = useState('')
  const [sfEntry, setSfEntry]     = useState('')
  const [sfExit, setSfExit]       = useState('')
  const [sfContracts, setSfContracts] = useState('')
  const [sfMultiplier, setSfMultiplier] = useState('')
  const [sfEntryDt, setSfEntryDt] = useState('')
  const [sfExitDt, setSfExitDt]   = useState('')
  const [sfMargin, setSfMargin]   = useState('')
  const [sfFee, setSfFee]         = useState('')

  // ── 코인 현물
  const [csSymbol, setCsSymbol]   = useState('')
  const [csBuyPrice, setCsBuyPrice] = useState('')
  const [csSellPrice, setCsSellPrice] = useState('')
  const [csInputMethod, setCsInputMethod] = useState<'by_amount'|'by_quantity'>('by_amount')
  const [csAmount, setCsAmount]   = useState('')
  const [csQty, setCsQty]         = useState('')
  const [csEntryDt, setCsEntryDt] = useState('')
  const [csExitDt, setCsExitDt]   = useState('')
  const [csFee, setCsFee]         = useState('')

  // ─────────────────────────────────────
  // 자동 계산
  // ─────────────────────────────────────
  const calcSS = () => {
    const ep = Number(ssBuyPrice), xp = Number(ssSellPrice)
    const qty = Number(ssQty), fee = Number(ssFee) || 0, tax = Number(ssTax) || 0
    if (!ep || !qty || !xp) return { pnl: null, pnlRate: null }
    const buy = ep * qty, sell = xp * qty
    const pnl = sell - buy - fee - tax
    const pnlRate = (pnl / buy) * 100
    return { pnl, pnlRate }
  }

  const calcCF = () => {
    const ep = Number(cfEntry), xp = Number(cfExit), lev = Number(cfLev) || 1
    const fee = Number(cfFee) || 0, funding = Number(cfFunding) || 0
    const margin = Number(cfMargin) || 0
    if (!ep || !xp || !lev) return { pnl: null, pnlRate: null, liqPrice: null }
    const qty = margin > 0 ? (margin * lev) / ep : 1
    const raw = cfDir === 'long' ? (xp - ep) * qty : (ep - xp) * qty
    const pnl = raw - fee - funding
    const pnlRate = margin > 0 ? (pnl / margin) * 100 : ((xp - ep) / ep) * lev * (cfDir === 'long' ? 1 : -1) * 100
    const liqPrice = ep > 0 && lev > 0
      ? cfDir === 'long'
        ? ep * (1 - 1 / lev + 0.004)
        : ep * (1 + 1 / lev - 0.004)
      : null
    return { pnl, pnlRate, liqPrice }
  }

  const calcSF = () => {
    const ep = Number(sfEntry), xp = Number(sfExit)
    const cnt = Number(sfContracts), mul = Number(sfMultiplier) || 1
    const margin = Number(sfMargin) || 0, fee = Number(sfFee) || 0
    const lev = Number(sfLev) || 1
    if (!ep || !xp || !cnt) return { pnl: null, pnlRate: null, liqPrice: null }
    const raw = sfDir === 'long' ? (xp - ep) * cnt * mul : (ep - xp) * cnt * mul
    const pnl = raw - fee
    const pnlRate = margin > 0 ? (pnl / margin) * 100 : null
    const liqPrice = ep > 0 && lev > 0
      ? sfDir === 'long'
        ? ep * (1 - 1 / lev + 0.004)
        : ep * (1 + 1 / lev - 0.004)
      : null
    return { pnl, pnlRate, liqPrice }
  }

  const calcCS = () => {
    const bp = Number(csBuyPrice), sp = Number(csSellPrice)
    const fee = Number(csFee) || 0
    if (!bp || !sp) return { pnl: null, pnlRate: null }
    const qty = csInputMethod === 'by_amount' ? (Number(csAmount) || 0) / bp : (Number(csQty) || 0)
    if (!qty) return { pnl: null, pnlRate: null }
    const investAmt = bp * qty
    const pnl = (sp - bp) * qty - fee
    const pnlRate = investAmt > 0 ? (pnl / investAmt) * 100 : null
    return { pnl, pnlRate }
  }

  // ─────────────────────────────────────
  // 제출
  // ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assetType) { alert('자산 유형을 선택해주세요.'); return }

    if (!isProOrTrial(plan) && journalCountToday >= DEFAULT_PLAN_CONFIG.free_daily_journal_limit) {
      setShowLimitModal(true)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let pnl: number | null = null
    let pnlRate: number | null = null

    const payload: Record<string, unknown> = {
      user_id: user.id,
      asset_type: assetType,
      trade_date: tradeDate,
      entry_reason: entryReason ? [entryReason] : null,
      emotion_before: emotion || null,
      score: score || null,
      stop_loss_basis: stopLoss || null,
      target_price: targetPrice ? Number(targetPrice) : null,
      principle_followed: principleFollowed || null,
      review_summary: [specialNote, oneLineMemo, memo].filter(Boolean).join('\n\n') || null,
      good_points: null,
      mistakes: null,
      improvements: null,
      currency: 'KRW',
      exchange_rate: 1,
      status: 'closed',
    }

    if (assetType === 'stock_spot') {
      const calc = calcSS()
      pnl = calc.pnl; pnlRate = calc.pnlRate
      Object.assign(payload, {
        asset_name: ssName,
        entry_price: Number(ssBuyPrice) || null,
        exit_price: Number(ssSellPrice) || null,
        quantity: Number(ssQty) || null,
        entry_datetime: ssBuyDt || null,
        exit_datetime: ssSellDt || null,
        fee: Number(ssFee) || null,
        tax: Number(ssTax) || null,
        profit_loss: pnl,
        profit_loss_rate: pnlRate,
        position_direction: null,
        leverage: null,
      })
    } else if (assetType === 'crypto_futures') {
      const calc = calcCF()
      pnl = calc.pnl; pnlRate = calc.pnlRate
      Object.assign(payload, {
        asset_name: cfSymbol,
        position_direction: cfDir,
        leverage: Number(cfLev) || null,
        entry_price: Number(cfEntry) || null,
        exit_price: Number(cfExit) || null,
        entry_datetime: cfEntryDt || null,
        exit_datetime: cfExitDt || null,
        margin_mode: cfMarginMode,
        margin: Number(cfMargin) || null,
        funding_fee: Number(cfFunding) || null,
        fee: Number(cfFee) || null,
        profit_loss: pnl,
        profit_loss_rate: pnlRate,
        quantity: null,
        tax: null,
      })
    } else if (assetType === 'stock_futures') {
      const calc = calcSF()
      pnl = calc.pnl; pnlRate = calc.pnlRate
      Object.assign(payload, {
        asset_name: sfName,
        position_direction: sfDir,
        leverage: Number(sfLev) || null,
        entry_price: Number(sfEntry) || null,
        exit_price: Number(sfExit) || null,
        contract_count: Number(sfContracts) || null,
        contract_multiplier: Number(sfMultiplier) || null,
        entry_datetime: sfEntryDt || null,
        exit_datetime: sfExitDt || null,
        margin: Number(sfMargin) || null,
        fee: Number(sfFee) || null,
        profit_loss: pnl,
        profit_loss_rate: pnlRate,
        quantity: null,
        tax: null,
        funding_fee: null,
      })
    } else if (assetType === 'crypto_spot') {
      const calc = calcCS()
      pnl = calc.pnl; pnlRate = calc.pnlRate
      const qty = csInputMethod === 'by_amount'
        ? (Number(csAmount) || 0) / (Number(csBuyPrice) || 1)
        : Number(csQty) || null
      Object.assign(payload, {
        asset_name: csSymbol,
        entry_price: Number(csBuyPrice) || null,
        exit_price: Number(csSellPrice) || null,
        quantity: qty,
        entry_datetime: csEntryDt || null,
        exit_datetime: csExitDt || null,
        fee: Number(csFee) || null,
        profit_loss: pnl,
        profit_loss_rate: pnlRate,
        position_direction: null,
        leverage: null,
        tax: null,
        funding_fee: null,
      })
    }

    const { error } = await supabase.from('trades').insert(payload)
    setLoading(false)
    if (error) { alert('저장 중 오류가 발생했습니다: ' + error.message); return }
    router.push('/journal')
  }

  // ─────────────────────────────────────
  // 계산 결과
  // ─────────────────────────────────────
  const ssCalc = assetType === 'stock_spot' ? calcSS() : { pnl: null, pnlRate: null }
  const cfCalc = assetType === 'crypto_futures' ? calcCF() : { pnl: null, pnlRate: null, liqPrice: null }
  const sfCalc = assetType === 'stock_futures' ? calcSF() : { pnl: null, pnlRate: null, liqPrice: null }
  const csCalc = assetType === 'crypto_spot' ? calcCS() : { pnl: null, pnlRate: null }

  // ─────────────────────────────────────
  // 공통 2단계 상세 섹션
  // ─────────────────────────────────────
  const DetailSection = ({ showEntryReason = true }: { showEntryReason?: boolean }) => (
    <div className="space-y-5">
      {showEntryReason && (
        <Field label="진입 근거">
          <TagButtons options={ENTRY_REASONS} value={entryReason} onChange={setEntryReason} />
        </Field>
      )}
      <Field label="손절 기준">
        <input className={inputCls} placeholder="예: -3% 이탈 시 손절" value={stopLoss} onChange={e => setStopLoss(e.target.value)} />
      </Field>
      <Field label="목표가">
        <input type="number" className={inputCls} placeholder="목표 매도가 (원)" value={targetPrice} onChange={e => setTargetPrice(e.target.value)} />
      </Field>
      <Field label="원칙 준수 여부">
        <div className="flex gap-2">
          {[{ v: 'yes', l: '✅ 지킴' }, { v: 'partial', l: '⚠️ 일부' }, { v: 'no', l: '❌ 안 지킴' }].map(o => (
            <button key={o.v} type="button"
              onClick={() => setPrincipleFollowed(principleFollowed === o.v ? '' : o.v)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${principleFollowed === o.v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="특이사항 메모">
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="시장 특이사항, 뉴스, 매크로 이벤트 등" value={specialNote} onChange={e => setSpecialNote(e.target.value)} />
      </Field>
      <Field label="한 줄 복기">
        <input className={inputCls} placeholder="이 거래에서 한 줄로 배운 점" value={oneLineMemo} onChange={e => setOneLineMemo(e.target.value)} />
      </Field>
      <Field label="메모">
        <textarea className={`${inputCls} resize-none`} rows={3} placeholder="잘한 점, 실수, 개선할 점 자유 기록" value={memo} onChange={e => setMemo(e.target.value)} />
      </Field>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} type="journal" />

      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">TraderMirror</span>
        </div>
        <Link href="/journal" className="text-sm text-slate-400 hover:text-slate-200">← 일지 목록</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-black text-slate-100 mb-6">새 매매 기록</h1>

        {/* 자산 유형 선택 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ASSET_TYPES.map(a => (
            <button key={a.key} type="button"
              onClick={() => { setAssetType(a.key); setShowDetail(false) }}
              className={`p-4 rounded-xl border text-left transition-all ${assetType === a.key ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'}`}>
              <div className={`mb-2 ${assetType === a.key ? 'text-blue-400' : 'text-slate-400'}`}>
                <AssetIcon icon={a.icon} className="h-6 w-6" />
              </div>
              <div className="font-bold text-sm text-slate-100">{a.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{a.desc}</div>
            </button>
          ))}
        </div>

        {assetType && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ══════════════════════════════════
                주식 현물 — 1단계
            ══════════════════════════════════ */}
            {assetType === 'stock_spot' && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">필수 정보</p>
                <Field label="종목명" required>
                  <input className={inputCls} placeholder="예: 삼성전자" value={ssName} onChange={e => setSsName(e.target.value)} required />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="매수가" required>
                    <input type="number" className={inputCls} placeholder="원" value={ssBuyPrice} onChange={e => setSsBuyPrice(e.target.value)} required />
                  </Field>
                  <Field label="매도가">
                    <input type="number" className={inputCls} placeholder="원" value={ssSellPrice} onChange={e => setSsSellPrice(e.target.value)} />
                  </Field>
                  <Field label="수량" required>
                    <input type="number" className={inputCls} placeholder="주" value={ssQty} onChange={e => setSsQty(e.target.value)} required />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="매수일시">
                    <input type="datetime-local" className={inputCls} value={ssBuyDt} onChange={e => setSsBuyDt(e.target.value)} />
                  </Field>
                  <Field label="매도일시">
                    <input type="datetime-local" className={inputCls} value={ssSellDt} onChange={e => setSsSellDt(e.target.value)} />
                  </Field>
                </div>
                {ssCalc.pnl !== null && <PnLDisplay pnl={ssCalc.pnl} pnlRate={ssCalc.pnlRate} />}
                <Field label="감정 상태">
                  <TagButtons options={EMOTIONS} value={emotion} onChange={setEmotion} />
                </Field>
                <Field label={`매매 점수: ${score}점`}>
                  <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))}
                    className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1</span><span>10</span></div>
                </Field>
              </div>
            )}

            {/* ══════════════════════════════════
                코인 선물 — 1단계
            ══════════════════════════════════ */}
            {assetType === 'crypto_futures' && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">필수 정보</p>
                <Field label="코인 심볼" required>
                  <input className={inputCls} placeholder="예: BTCUSDT" value={cfSymbol} onChange={e => setCfSymbol(e.target.value.toUpperCase())} required />
                </Field>
                {/* 롱/숏 토글 */}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setCfDir('long')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${cfDir === 'long' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    🟢 롱 (매수)
                  </button>
                  <button type="button" onClick={() => setCfDir('short')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${cfDir === 'short' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    🔴 숏 (매도)
                  </button>
                </div>
                <Field label="레버리지" required>
                  <input type="number" className={inputCls} placeholder="예: 10" value={cfLev} onChange={e => setCfLev(e.target.value)} required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="진입가" required>
                    <input type="number" className={inputCls} placeholder="USDT" value={cfEntry} onChange={e => setCfEntry(e.target.value)} required />
                  </Field>
                  <Field label="청산가">
                    <input type="number" className={inputCls} placeholder="USDT" value={cfExit} onChange={e => setCfExit(e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="진입일시">
                    <input type="datetime-local" className={inputCls} value={cfEntryDt} onChange={e => setCfEntryDt(e.target.value)} />
                  </Field>
                  <Field label="청산일시">
                    <input type="datetime-local" className={inputCls} value={cfExitDt} onChange={e => setCfExitDt(e.target.value)} />
                  </Field>
                </div>
                {cfCalc.liqPrice !== null && <LiquidationDisplay price={cfCalc.liqPrice} />}
                {cfCalc.pnl !== null && <PnLDisplay pnl={cfCalc.pnl} pnlRate={cfCalc.pnlRate} />}
                <Field label="감정 상태">
                  <TagButtons options={EMOTIONS} value={emotion} onChange={setEmotion} />
                </Field>
                <Field label={`매매 점수: ${score}점`}>
                  <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))}
                    className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1</span><span>10</span></div>
                </Field>
              </div>
            )}

            {/* ══════════════════════════════════
                주식 선물 — 1단계
            ══════════════════════════════════ */}
            {assetType === 'stock_futures' && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">필수 정보</p>
                <Field label="계약명" required>
                  <input className={inputCls} placeholder="예: 코스피200 선물" value={sfName} onChange={e => setSfName(e.target.value)} required />
                </Field>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setSfDir('long')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${sfDir === 'long' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    🟢 롱 (매수)
                  </button>
                  <button type="button" onClick={() => setSfDir('short')}
                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-colors ${sfDir === 'short' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    🔴 숏 (매도)
                  </button>
                </div>
                <Field label="레버리지">
                  <input type="number" className={inputCls} placeholder="예: 5" value={sfLev} onChange={e => setSfLev(e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="진입가" required>
                    <input type="number" className={inputCls} placeholder="원" value={sfEntry} onChange={e => setSfEntry(e.target.value)} required />
                  </Field>
                  <Field label="청산가">
                    <input type="number" className={inputCls} placeholder="원" value={sfExit} onChange={e => setSfExit(e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="계약수">
                    <input type="number" className={inputCls} placeholder="계약" value={sfContracts} onChange={e => setSfContracts(e.target.value)} />
                  </Field>
                  <Field label="계약 승수">
                    <input type="number" className={inputCls} placeholder="예: 250000" value={sfMultiplier} onChange={e => setSfMultiplier(e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="진입일시">
                    <input type="datetime-local" className={inputCls} value={sfEntryDt} onChange={e => setSfEntryDt(e.target.value)} />
                  </Field>
                  <Field label="청산일시">
                    <input type="datetime-local" className={inputCls} value={sfExitDt} onChange={e => setSfExitDt(e.target.value)} />
                  </Field>
                </div>
                {(sfCalc as any).liqPrice !== null && <LiquidationDisplay price={(sfCalc as any).liqPrice} />}
                {sfCalc.pnl !== null && <PnLDisplay pnl={sfCalc.pnl} pnlRate={sfCalc.pnlRate} />}
                <Field label="감정 상태">
                  <TagButtons options={EMOTIONS} value={emotion} onChange={setEmotion} />
                </Field>
                <Field label={`매매 점수: ${score}점`}>
                  <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))}
                    className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1</span><span>10</span></div>
                </Field>
              </div>
            )}

            {/* ══════════════════════════════════
                코인 현물 — 1단계
            ══════════════════════════════════ */}
            {assetType === 'crypto_spot' && (
              <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 space-y-4">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">필수 정보</p>
                <Field label="코인 심볼" required>
                  <input className={inputCls} placeholder="예: BTC" value={csSymbol} onChange={e => setCsSymbol(e.target.value.toUpperCase())} required />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="평균 매수가" required>
                    <input type="number" className={inputCls} placeholder="원/USDT" value={csBuyPrice} onChange={e => setCsBuyPrice(e.target.value)} required />
                  </Field>
                  <Field label="평균 매도가">
                    <input type="number" className={inputCls} placeholder="원/USDT" value={csSellPrice} onChange={e => setCsSellPrice(e.target.value)} />
                  </Field>
                </div>
                {/* 수량/금액 선택 */}
                <div>
                  <div className="flex gap-2 mb-2">
                    {[{ v: 'by_amount' as const, l: '투자금액으로 입력' }, { v: 'by_quantity' as const, l: '수량으로 입력' }].map(o => (
                      <button key={o.v} type="button" onClick={() => setCsInputMethod(o.v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${csInputMethod === o.v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                  {csInputMethod === 'by_amount' ? (
                    <input type="number" className={inputCls} placeholder="투자 금액 (원/USDT)" value={csAmount} onChange={e => setCsAmount(e.target.value)} />
                  ) : (
                    <input type="number" className={inputCls} placeholder="코인 수량" value={csQty} onChange={e => setCsQty(e.target.value)} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="진입일시">
                    <input type="datetime-local" className={inputCls} value={csEntryDt} onChange={e => setCsEntryDt(e.target.value)} />
                  </Field>
                  <Field label="청산일시">
                    <input type="datetime-local" className={inputCls} value={csExitDt} onChange={e => setCsExitDt(e.target.value)} />
                  </Field>
                </div>
                {csCalc.pnl !== null && <PnLDisplay pnl={csCalc.pnl} pnlRate={csCalc.pnlRate} />}
                <Field label="감정 상태">
                  <TagButtons options={EMOTIONS} value={emotion} onChange={setEmotion} />
                </Field>
                <Field label={`매매 점수: ${score}점`}>
                  <input type="range" min={1} max={10} value={score} onChange={e => setScore(Number(e.target.value))}
                    className="w-full accent-blue-500" />
                  <div className="flex justify-between text-xs text-slate-600 mt-1"><span>1</span><span>10</span></div>
                </Field>
              </div>
            )}

            {/* ══════════════════════════════════
                상세 기록 펼침 버튼
            ══════════════════════════════════ */}
            <button
              type="button"
              onClick={() => setShowDetail(!showDetail)}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-700 rounded-xl text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors text-sm font-medium"
            >
              {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showDetail ? '상세 정보 닫기' : '상세 기록하기 (선택)'}
            </button>

            {/* ══════════════════════════════════
                2단계: 상세 정보 (펼침)
            ══════════════════════════════════ */}
            {showDetail && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fadeIn">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">상세 정보 (선택)</p>

                {/* 자산별 상세 추가 항목 */}
                {(assetType === 'crypto_futures') && (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">증거금 설정</p>
                      <div className="flex gap-2">
                        {[{ v: 'isolated' as const, l: '격리 마진' }, { v: 'cross' as const, l: '교차 마진' }].map(o => (
                          <button key={o.v} type="button" onClick={() => setCfMarginMode(o.v)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${cfMarginMode === o.v ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {o.l}
                          </button>
                        ))}
                      </div>
                      <input type="number" className={inputCls} placeholder="증거금 (USDT)" value={cfMargin} onChange={e => setCfMargin(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="펀딩비">
                        <input type="number" className={inputCls} placeholder="USDT" value={cfFunding} onChange={e => setCfFunding(e.target.value)} />
                      </Field>
                      <Field label="수수료">
                        <input type="number" className={inputCls} placeholder="USDT" value={cfFee} onChange={e => setCfFee(e.target.value)} />
                      </Field>
                    </div>
                  </>
                )}
                {(assetType === 'stock_futures') && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="증거금">
                      <input type="number" className={inputCls} placeholder="원" value={sfMargin} onChange={e => setSfMargin(e.target.value)} />
                    </Field>
                    <Field label="수수료">
                      <input type="number" className={inputCls} placeholder="원" value={sfFee} onChange={e => setSfFee(e.target.value)} />
                    </Field>
                  </div>
                )}
                {(assetType === 'stock_spot') && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="수수료">
                      <input type="number" className={inputCls} placeholder="원" value={ssFee} onChange={e => setSsFee(e.target.value)} />
                    </Field>
                    <Field label="세금">
                      <input type="number" className={inputCls} placeholder="원" value={ssTax} onChange={e => setSsTax(e.target.value)} />
                    </Field>
                  </div>
                )}
                {(assetType === 'crypto_spot') && (
                  <Field label="수수료">
                    <input type="number" className={inputCls} placeholder="원/USDT" value={csFee} onChange={e => setCsFee(e.target.value)} />
                  </Field>
                )}

                {/* 공통 상세 항목 */}
                <DetailSection showEntryReason={true} />
              </div>
            )}

            {/* ══════════════════════════════════
                제출 버튼
            ══════════════════════════════════ */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black rounded-xl transition-colors text-base shadow-lg shadow-blue-500/20"
            >
              {loading ? '저장 중...' : '매매 기록 저장하기'}
            </button>

            <p className="text-xs text-slate-600 text-center leading-relaxed pb-4">
              본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다.<br />
              모든 투자의 책임은 투자자 본인에게 있습니다.
            </p>
          </form>
        )}
      </main>
    </div>
  )
}
