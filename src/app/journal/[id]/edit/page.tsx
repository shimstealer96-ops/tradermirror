"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function EditTradePage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState({
    trade_date: '',
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

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('trades').select('*').eq('id', id).single()
      if (data) {
        setForm({
          trade_date: data.trade_date,
          asset_type: data.asset_type,
          ticker: data.ticker,
          ticker_name: data.ticker_name || '',
          direction: data.direction,
          entry_price: String(data.entry_price),
          exit_price: data.exit_price ? String(data.exit_price) : '',
          quantity: String(data.quantity),
          fee: String(data.fee || 0),
          memo: data.memo || '',
        })
      }
      setFetching(false)
    }
    if (id) load()
  }, [id])

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
    const payload: any = {
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
      exit_price: form.exit_price ? Number(form.exit_price) : null,
      profit_loss: form.exit_price ? pl : null,
      profit_loss_rate: form.exit_price ? plRate : null,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('trades').update(payload).eq('id', id)
    setLoading(false)
    if (!error) {
      router.push('/journal')
    } else {
      alert('수정 중 오류: ' + error.message)
    }
  }

  const inputClass =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm'
  const labelClass = 'block text-sm font-medium text-slate-400 mb-1'

  if (fetching)
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400">
        불러오는 중...
      </div>
    )

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
        <h1 className="text-2xl font-bold mb-8">매매 기록 수정</h1>
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
              <label className={labelClass}>티커</label>
              <input
                type="text"
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
                      : 'border-slate-700 text-slate-500'
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
                value={form.entry_price}
                onChange={set('entry_price')}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>청산가</label>
              <input
                type="number"
                step="any"
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
            {loading ? '수정 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
