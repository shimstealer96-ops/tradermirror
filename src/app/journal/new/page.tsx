"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function NewTradePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    trade_date: new Date().toISOString().split('T')[0],
    asset_type: 'stock',
    ticker: '',
    ticker_name: '',
    direction: 'long',
    entry_price: '',
    exit_price: '',
    quantity: '',
    fee: '0',
    memo: '',
  })

  const calcPL = () => {
    if (!form.exit_price || !form.entry_price || !form.quantity) return null
    const entry = Number(form.entry_price)
    const exit = Number(form.exit_price)
    const qty = Number(form.quantity)
    const fee = Number(form.fee) || 0
    return form.direction === 'long'
      ? (exit - entry) * qty - fee
      : (entry - exit) * qty - fee
  }

  const pl = calcPL()
  const plRate =
    pl != null && form.entry_price && form.quantity
      ? (pl / (Number(form.entry_price) * Number(form.quantity))) * 100
      : null

  const set =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const payload: any = {
      user_id: user.id,
      trade_date: form.trade_date,
      asset_type: form.asset_type,
      ticker: form.ticker.toUpperCase(),
      ticker_name: form.ticker_name || null,
      direction: form.direction,
      entry_price: Number(form.entry_price),
      quantity: Number(form.quantity),
      fee: Number(form.fee) || 0,
      memo: form.memo || null,
      status: form.exit_price ? 'closed' : 'open',
    }
    if (form.exit_price) {
      payload.exit_price = Number(form.exit_price)
      payload.profit_loss = pl
      payload.profit_loss_rate = plRate
    }

    const { error } = await supabase.from('trades').insert(payload)
    setLoading(false)
    if (!error) {
      router.push('/journal')
    } else {
      alert('저장 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const inputClass =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-400 mb-1'

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">TraderMirror</span>
        </div>
        <Link href="/journal" className="text-sm text-slate-400 hover:text-slate-200">
          ← 일지 목록
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">새 매매 기록</h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-slate-900/40 border border-slate-800 rounded-xl p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>거래일</label>
              <input
                type="date"
                value={form.trade_date}
                onChange={set('trade_date')}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>자산 종류</label>
              <select value={form.asset_type} onChange={set('asset_type')} className={inputClass}>
                <option value="stock">주식</option>
                <option value="crypto">코인</option>
                <option value="futures">선물</option>
                <option value="etf">ETF</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>티커 (코드)</label>
              <input
                type="text"
                placeholder="005930 / BTC"
                value={form.ticker}
                onChange={set('ticker')}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>종목명</label>
              <input
                type="text"
                placeholder="삼성전자 / 비트코인"
                value={form.ticker_name}
                onChange={set('ticker_name')}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>방향</label>
            <div className="flex gap-3">
              {[
                { v: 'long', l: '롱 (매수)' },
                { v: 'short', l: '숏 (매도)' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border cursor-pointer transition-colors ${
                    form.direction === opt.v
                      ? opt.v === 'long'
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/50 text-red-400'
                      : 'border-slate-700 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="direction"
                    value={opt.v}
                    checked={form.direction === opt.v}
                    onChange={set('direction')}
                    className="hidden"
                  />
                  {opt.l}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>진입가</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={form.entry_price}
                onChange={set('entry_price')}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>청산가 (선택)</label>
              <input
                type="number"
                step="any"
                placeholder="미청산시 비워두기"
                value={form.exit_price}
                onChange={set('exit_price')}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>수량</label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={form.quantity}
                onChange={set('quantity')}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>수수료</label>
            <input
              type="number"
              step="any"
              placeholder="0"
              value={form.fee}
              onChange={set('fee')}
              className={inputClass}
            />
          </div>

          {pl != null && (
            <div
              className={`p-4 rounded-lg border ${
                pl >= 0
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <p className="text-xs text-slate-400 mb-1">예상 손익</p>
              <p className={`text-xl font-bold ${pl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {pl >= 0 ? '+' : ''}
                {pl.toLocaleString('ko-KR')}원
                {plRate != null && (
                  <span className="text-sm ml-2 font-normal">
                    ({plRate >= 0 ? '+' : ''}
                    {plRate.toFixed(2)}%)
                  </span>
                )}
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>메모</label>
            <textarea
              placeholder="매매 이유, 반성, 특이사항 등..."
              value={form.memo}
              onChange={set('memo')}
              className={inputClass + ' resize-none h-24'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? '저장 중...' : '매매 기록 저장'}
          </button>
        </form>
      </main>
    </div>
  )
}
