'use client'

import Link from 'next/link'
import { CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Clock, BarChart2, ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'

const trades = [
  { name: '삼성전자', buyDate: '2026.05.11', buyTime: '09:12', buyPrice: 78500, qty: 10, sellDate: '2026.05.11', sellTime: '09:46', sellPrice: 77200, pct: -1.66, pnl: -13000, holdDays: 0 },
  { name: '네이버', buyDate: '2026.05.12', buyTime: '10:20', buyPrice: 185000, qty: 3, sellDate: '2026.05.12', sellTime: '14:40', sellPrice: 190500, pct: 2.97, pnl: 16500, holdDays: 0 },
  { name: '카카오', buyDate: '2026.05.13', buyTime: '09:08', buyPrice: 48200, qty: 20, sellDate: '2026.05.16', sellTime: '13:30', sellPrice: 44800, pct: -7.05, pnl: -68000, holdDays: 3 },
  { name: '현대차', buyDate: '2026.05.14', buyTime: '11:15', buyPrice: 242000, qty: 2, sellDate: '2026.05.14', sellTime: '15:10', sellPrice: 249000, pct: 2.89, pnl: 14000, holdDays: 0 },
  { name: 'SK하이닉스', buyDate: '2026.05.15', buyTime: '09:18', buyPrice: 198000, qty: 5, sellDate: '2026.05.23', sellTime: '10:30', sellPrice: 181000, pct: -8.59, pnl: -85000, holdDays: 8 },
  { name: '삼성바이오로직스', buyDate: '2026.05.16', buyTime: '14:05', buyPrice: 810000, qty: 1, sellDate: '2026.05.17', sellTime: '10:20', sellPrice: 835000, pct: 3.09, pnl: 25000, holdDays: 1 },
  { name: '에코프로', buyDate: '2026.05.17', buyTime: '09:05', buyPrice: 98000, qty: 8, sellDate: '2026.05.28', sellTime: '14:10', sellPrice: 88000, pct: -10.20, pnl: -80000, holdDays: 11 },
  { name: 'LG에너지솔루션', buyDate: '2026.05.20', buyTime: '10:50', buyPrice: 392000, qty: 2, sellDate: '2026.05.20', sellTime: '13:35', sellPrice: 403000, pct: 2.81, pnl: 22000, holdDays: 0 },
  { name: '두산에너빌리티', buyDate: '2026.05.21', buyTime: '09:22', buyPrice: 21500, qty: 40, sellDate: '2026.05.21', sellTime: '10:10', sellPrice: 20700, pct: -3.72, pnl: -32000, holdDays: 0 },
  { name: '셀트리온', buyDate: '2026.05.22', buyTime: '13:20', buyPrice: 178000, qty: 3, sellDate: '2026.05.22', sellTime: '15:00', sellPrice: 184500, pct: 3.65, pnl: 19500, holdDays: 0 },
]

const wins = trades.filter(t => t.pct > 0)
const losses = trades.filter(t => t.pct < 0)

export default function SampleReportPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> 홈으로 돌아가기
        </Link>

        {/* Header */}
        <div className="mb-8">
          <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            샘플 분석 리포트
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-100 mb-2">
            2026년 5월 매매 분석 결과
          </h1>
          <p className="text-slate-400 text-sm">
            총 10건 거래 · 2026.05.11 ~ 2026.05.22 · 주식 현물
          </p>
        </div>

        {/* ── 핵심 요약 카드 ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">승률</p>
            <p className="text-3xl font-black text-slate-100">50%</p>
            <p className="text-xs text-slate-500 mt-1">5승 5패</p>
          </div>
          <div className="bg-slate-900/60 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">손익비</p>
            <p className="text-3xl font-black text-red-400">0.35</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400 border border-red-500/30">매우 낮음</span>
          </div>
          <div className="bg-slate-900/60 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">총 손익</p>
            <p className="text-3xl font-black text-red-400">-181,000</p>
            <p className="text-xs text-slate-500 mt-1">원</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">평균 수익률</p>
            <p className="text-3xl font-black text-red-400">-3.08%</p>
            <p className="text-xs text-slate-500 mt-1">거래당</p>
          </div>
        </div>

        {/* ── 핵심 패턴 진단 ── */}
        <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-black text-red-400">핵심 패턴 진단</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-red-400 font-black text-lg leading-none mt-0.5">1</span>
              <div>
                <p className="text-slate-100 font-bold text-sm">작게 벌고 크게 잃는 구조</p>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                  평균 수익 +19,400원, 평균 손실 -55,600원. 손익비 0.35로 이기는 횟수(50%)보다 질 때의 크기가 훨씬 큽니다.
                  승률을 60%로 올려도 이 손익비로는 계좌가 줄어드는 구조입니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-amber-400 font-black text-lg leading-none mt-0.5">2</span>
              <div>
                <p className="text-slate-100 font-bold text-sm">수익은 0.2일, 손실은 4.4일 보유</p>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                  수익 거래는 당일 빠르게 청산하지만, 손실 거래는 평균 4.4일을 버팁니다.
                  손절 기준 없이 &lsquo;언젠가 올라오겠지&rsquo; 심리로 버티는 패턴입니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-orange-400 font-black text-lg leading-none mt-0.5">3</span>
              <div>
                <p className="text-slate-100 font-bold text-sm">9시대 진입 5건 → 전부 손실 (-278,000원)</p>
                <p className="text-slate-400 text-xs leading-relaxed mt-0.5">
                  삼성전자, 카카오, SK하이닉스, 에코프로, 두산에너빌리티 — 9시대 진입한 거래 5건이 전부 손실입니다.
                  장 초반 변동성에 추격 매수하는 습관이 손실의 핵심 원인입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 보유기간 비교 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200">보유기간 비교</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>수익 거래 평균</span>
                  <span className="text-emerald-400 font-bold">0.2일</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '4%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>손실 거래 평균</span>
                  <span className="text-red-400 font-bold">4.4일</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              수익은 빨리 팔고, 손실은 오래 버티는 패턴이 반복됩니다.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-200">평균 손익 비교</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>평균 수익 거래</span>
                  <span className="text-emerald-400 font-bold">+19,400원</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>평균 손실 거래</span>
                  <span className="text-red-400 font-bold">-55,600원</span>
                </div>
                <div className="bg-slate-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              손익비 0.35 — 3번 이겨도 1번 크게 지면 계좌가 줄어드는 구조입니다.
            </p>
          </div>
        </div>

        {/* ── 시간대별 분석 ── */}
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">반복 실수 TOP 1 — 장 초반 추격매수</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-3">9시대 진입 거래 (5건)</p>
              <div className="space-y-2">
                {trades.filter(t => t.buyTime.startsWith('09:')).map(t => (
                  <div key={t.name} className="flex items-center justify-between bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200">{t.name}</span>
                      <span className="text-xs text-slate-500 ml-2">{t.buyTime}</span>
                    </div>
                    <span className="text-xs font-bold text-red-400">{t.pct.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center bg-slate-900/40 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">9시대 진입 요약</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">진입 건수</span>
                  <span className="font-bold text-slate-100">5건</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">전부 손실</span>
                  <span className="font-bold text-red-400">5건 (100%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">손실 합계</span>
                  <span className="font-bold text-red-400">-278,000원</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                장이 열리는 9시대는 변동성이 가장 높은 구간입니다. 이 시간대의 추격 매수를 줄이는 것만으로 손실의 상당 부분을 줄일 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 거래 내역 상세 ── */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            전체 거래 내역
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">종목</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">매수일</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">진입시간</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">수익률</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">손익</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">보유</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => {
                  const isEarly = t.buyTime.startsWith('09:')
                  return (
                    <tr key={i} className={`border-b border-slate-800/50 ${isEarly && t.pct < 0 ? 'bg-red-950/10' : ''}`}>
                      <td className="py-2.5 px-2 font-medium text-slate-200">
                        {t.name}
                        {isEarly && <span className="ml-1.5 px-1.5 py-0.5 rounded text-amber-400 bg-amber-500/10 text-xs">장초반</span>}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">{t.buyDate}</td>
                      <td className="py-2.5 px-2 text-slate-400">{t.buyTime}</td>
                      <td className={`py-2.5 px-2 text-right font-bold ${t.pct > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.pct > 0 ? '+' : ''}{t.pct.toFixed(2)}%
                      </td>
                      <td className={`py-2.5 px-2 text-right font-bold ${t.pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {t.pnl > 0 ? '+' : ''}{t.pnl.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-400">
                        {t.holdDays === 0 ? '당일' : `${t.holdDays}일`}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-700">
                  <td colSpan={4} className="py-3 px-2 text-slate-400 text-xs">합계 (10건)</td>
                  <td className="py-3 px-2 text-right font-black text-red-400">-181,000원</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ── 다음 매매를 위한 체크리스트 ── */}
        <div className="bg-slate-900/40 border border-slate-700 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-black text-slate-100 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            다음 매매에서 지켜야 할 기준
          </h3>
          <div className="space-y-3">
            {[
              { color: 'text-red-400', text: '9시~9시 30분 사이 진입 금지 — 장 초반 변동성 구간 대기' },
              { color: 'text-red-400', text: '매수 전 손절가 설정 필수 — 진입 전 -3% 또는 지지선 이탈 시 손절 기준 확인' },
              { color: 'text-amber-400', text: '손실 거래 보유 3일 초과 금지 — 3일 이상 버티는 종목은 재검토' },
              { color: 'text-emerald-400', text: '수익 거래 목표가 설정 — 바로 팔지 않고 +5% 이상 목표 설정 후 분할 청산' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`text-lg font-black leading-none mt-0.5 ${item.color}`}>{i + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-black text-slate-100 mb-2">내 실제 거래내역으로 분석해보세요</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            이 샘플처럼 내 거래내역을 붙여넣으면<br />
            실제 매매 패턴과 반복 실수를 바로 확인할 수 있습니다.
          </p>
          <Link href="/analyze">
            <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-base">
              무료로 내 매매패턴 분석하기 →
            </button>
          </Link>
          <p className="text-xs text-slate-600 mt-4">
            본 리포트는 교육 목적의 샘플입니다. 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
          </p>
        </div>

      </main>
    </div>
  )
}
