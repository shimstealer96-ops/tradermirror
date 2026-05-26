"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calculator,
  AlertTriangle,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import LeadPopup from "@/components/LeadPopup";

const faqs = [
  {
    q: "증권사 계정을 연결해야 하나요?",
    a: "아니요. 계정 연동 없이 거래내역을 복사해 붙여넣거나, 앱에 작성한 매매일지를 불러와 분석합니다.",
  },
  {
    q: "종목 추천도 해주나요?",
    a: "아니요. TraderMirror는 종목 추천, 매수·매도 신호, 수익 보장을 제공하지 않습니다. 사용자의 매매 습관을 분석하는 복기 도구입니다.",
  },
  {
    q: "초보자도 쓸 수 있나요?",
    a: "네. 거래내역을 붙여넣거나 매매일지를 작성하면 자동으로 분석 결과를 보여주기 때문에 초보자도 사용할 수 있습니다.",
  },
  {
    q: "코인 선물도 분석되나요?",
    a: "네. 코인 현물, 코인 선물, 주식 현물, 주식 선물 데이터를 구분해서 분석할 수 있도록 설계되어 있습니다.",
  },
  {
    q: "Free와 Pro 차이는 무엇인가요?",
    a: "Free는 매매일지를 기록하고 기본 분석을 확인하는 용도입니다. Pro는 감정 상태, 진입 근거, 손절 기준, 자산 유형별 상세 분석까지 확인할 수 있는 깊은 분석 플랜입니다.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-slate-200 font-semibold hover:text-slate-100 transition-colors"
      >
        <span className="text-sm">{q}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-4" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-4" />
        )}
      </button>
      {open && (
        <div className="pb-4 text-slate-400 text-sm leading-relaxed">{a}</div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [leadPopupOpen, setLeadPopupOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("lead_popup_dismissed")) {
        setLeadPopupOpen(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      {/* Floating button */}
      <button
        onClick={() => setLeadPopupOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors"
      >
        🎁 무료 혜택 4종 받기
      </button>

      <LeadPopup isOpen={leadPopupOpen} onClose={() => setLeadPopupOpen(false)} />

      {/* ═══════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_rgba(37,99,235,0.18)_0%,_transparent_65%)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Copy */}
            <div>
              <span className="inline-block mb-6 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                매매패턴 분석 도구
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
                <span className="text-slate-100">왜 사면 떨어지고,</span>
                <br />
                <span className="text-slate-100">팔면 오를까요?</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  당신의 매매기록이
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  반복되는 실수를
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">
                  보여줍니다.
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                거래내역을 붙여넣거나 매매일지를 기록하면
                <br />
                승률, 손익비, 손절 습관, 감정매매, 반복 실수를 분석합니다.
                <br />
                <br />
                종목 추천이 아니라,
                <br />
                내가 왜 잃는지 확인하는 복기 도구입니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link href="/analyze">
                  <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 text-base">
                    무료로 매매패턴 분석하기 →
                  </button>
                </Link>
                <Link href="/sample-report">
                  <button className="px-6 py-3.5 border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold rounded-xl transition-colors text-base">
                    샘플 리포트 보기
                  </button>
                </Link>
              </div>
              <p className="text-xs text-slate-500">
                증권사 연동 없음 · 종목 추천 없음 · 수익 보장 없음
              </p>
            </div>

            {/* RIGHT: Sample Analysis Cards */}
            <div>
              <div className="mb-3">
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  샘플 분석 결과
                </span>
                <p className="text-xs text-slate-500 mt-1">거래기록을 넣으면 이런 패턴을 확인할 수 있습니다.</p>
              </div>

              <div className="space-y-3">
                {/* Card 1: 승률 & 손익비 */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2 font-medium">승률 &amp; 손익비</p>
                  <div className="flex items-center gap-6 mb-2">
                    <div>
                      <p className="text-xs text-slate-500">승률</p>
                      <p className="text-2xl font-black text-slate-100">50%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">손익비</p>
                      <p className="text-2xl font-black text-red-400">0.35</p>
                    </div>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                      손익비 낮음
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-1">작게 벌고 크게 잃는 구조입니다.</p>
                  <p className="text-xs text-slate-500">이기는 횟수보다, 질 때 얼마나 크게 잃는지가 더 문제일 수 있습니다.</p>
                </div>

                {/* Card 2: 수익 vs 손실 보유기간 */}
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2 font-medium">수익 vs 손실 보유기간</p>
                  <div className="flex items-center gap-6 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">수익 평균</p>
                      <p className="text-xl font-black text-emerald-400">0.2일</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">손실 평균</p>
                      <p className="text-xl font-black text-red-400">4.4일</p>
                    </div>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-12">수익</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "4%" }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-12">손실</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-1">수익은 빨리 팔고, 손실은 오래 버티고 있습니다.</p>
                  <p className="text-xs text-slate-500">손절 지연 패턴이 반복되면 계좌 손실이 커질 수 있습니다.</p>
                </div>

                {/* Card 3: 반복 실수 TOP 1 */}
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 shadow-lg">
                  <p className="text-xs text-slate-400 mb-2 font-medium">반복 실수 TOP 1</p>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <p className="text-xl font-black text-amber-400">장 초반 추격매수</p>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      9시대 5건 전부 손실
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium mb-1">9시대 진입 거래에서 손실이 집중됩니다.</p>
                  <p className="text-xs text-slate-500">장이 열리자마자 변동성에 휩쓸려 진입하는 습관을 줄이는 것이 필요합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2: TARGET USERS
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-slate-900/20 border-y border-slate-800 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300 border border-slate-600">
              이런 분이라면 꼭 한 번 분석해보세요
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              혹시 이런 경험, 반복되고 있나요?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {[
              { emoji: "📉", text: "사면 떨어지고 팔면 오르는 것 같다" },
              { emoji: "⏱️", text: "수익은 빨리 팔고 손실은 오래 버틴다" },
              { emoji: "🔔", text: "장 초반에 자주 물린다" },
              { emoji: "✂️", text: "손절 기준 없이 버틴다" },
              { emoji: "💥", text: "코인 선물 청산가가 늘 불안하다" },
              { emoji: "📓", text: "매매일지를 써도 뭘 봐야 할지 모르겠다" },
            ].map((item, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <p className="text-sm text-slate-300 leading-snug">{item.text}</p>
              </div>
            ))}
          </div>
          {/* Quote */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-black text-slate-100 mb-2">
              종목을 찍어주는 서비스가 아닙니다.
              <br />
              당신의 매매 습관을 비춰주는 거울입니다.
            </h3>
            <p className="text-slate-400 text-sm mt-3">
              수익 종목보다 먼저 봐야 할 것은 내가 반복하는 실수입니다.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3: HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section className="w-full py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              사용 방법
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              거래내역만 넣으면 잃는 패턴이 보입니다
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "STEP 1", title: "거래내역 입력", desc: "HTS/MTS, 거래소 거래내역을 복사해 붙여넣거나 앱에 기록한 매매일지를 불러옵니다." },
              { num: "STEP 2", title: "AI 매매패턴 분석", desc: "승률, 손익비, 시간대, 진입 근거, 감정 상태, 손절 습관을 자동으로 분석합니다." },
              { num: "STEP 3", title: "다음 매매 규칙 확인", desc: "반복 실수 TOP 3와 다음 거래에서 지켜야 할 규칙을 확인합니다." },
            ].map((step) => (
              <div key={step.num} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <span className="inline-block text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full mb-4">
                  {step.num}
                </span>
                <h3 className="text-lg font-black text-slate-100 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4: FEATURES
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-slate-900/20 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              핵심 기능
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
              매매 습관을 바꾸는 4가지 분석
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <TrendingUp className="h-7 w-7 text-blue-400" />,
                iconBg: "bg-blue-500/20 shadow-blue-500/20",
                title: "매매일지 자동 분석",
                body: (
                  <>
                    거래내역을 붙여넣거나 매일 기록한 매매일지를 불러와{" "}
                    <span className="text-blue-400 font-medium">승률, 손익비, 시간대, 감정상태, 진입근거별 성과</span>를 한눈에 보여줍니다.
                  </>
                ),
              },
              {
                icon: <Calculator className="h-7 w-7 text-emerald-400" />,
                iconBg: "bg-emerald-500/20 shadow-emerald-500/20",
                title: "진짜 순수익 계산",
                body: (
                  <>
                    수익인 줄 알았던 거래가 실제로 얼마나 남았는지 확인하세요.{" "}
                    <span className="text-emerald-400 font-medium">수수료, 세금, 펀딩비</span>까지 반영해 실제 순수익을 계산합니다.
                  </>
                ),
              },
              {
                icon: <AlertTriangle className="h-7 w-7 text-orange-400" />,
                iconBg: "bg-orange-500/20 shadow-orange-500/20",
                title: "청산가·위험 관리",
                body: (
                  <>
                    코인 선물과 주식 선물의{" "}
                    <span className="text-orange-400 font-medium">레버리지 위험</span>을 진입 전에 확인하세요. 증거금, 레버리지, 진입가를 기준으로 청산 위험을 계산합니다.
                  </>
                ),
              },
              {
                icon: <TrendingDown className="h-7 w-7 text-purple-400" />,
                iconBg: "bg-purple-500/20 shadow-purple-500/20",
                title: "펀딩비 누적 비용 추적",
                body: (
                  <>
                    코인 선물 장기 보유 시{" "}
                    <span className="text-purple-400 font-medium">누적 펀딩비</span>가 수익을 얼마나 깎는지 보여줍니다.
                  </>
                ),
              },
            ].map((feat) => (
              <div key={feat.title} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${feat.iconBg} mb-4`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black text-slate-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5: TRUST
      ═══════════════════════════════════════════ */}
      <section className="w-full py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center mb-10">
            안심하고 사용하셔도 됩니다
          </h2>
          <div className="space-y-4">
            {[
              "증권사 계정 연동이 필요 없습니다",
              "거래내역을 복사해 붙여넣는 방식입니다",
              "앱에 기록한 매매일지를 불러와 분석할 수 있습니다",
              "종목 추천이나 매수·매도 신호를 제공하지 않습니다",
              "수익 보장을 하지 않습니다",
              "사용자의 매매 습관을 복기하기 위한 교육용 도구입니다",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6: PRICING
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-slate-900/20 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">요금제</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-3">기록은 무료, 깊은 분석은 Pro</h2>
            <p className="text-slate-400 text-sm">깊은 분석이 필요할 때 Pro를 사용하면 됩니다.</p>
          </div>

          {/* 3 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-start">

            {/* Free */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Free</p>
                <p className="text-4xl font-black text-slate-100">₩0</p>
                <p className="text-slate-400 text-sm mt-2">매매일지는 무료로 시작하세요.</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  "매매일지 하루 5개 등록",
                  "하루 1회 기본 분석",
                  "최근 7일 기록 요약 분석",
                  "승률·총손익·평균수익률",
                  "청산가 계산기 기본 기능",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-slate-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <button className="w-full py-3 border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold rounded-xl transition-colors text-sm">
                  무료로 시작하기
                </button>
              </Link>
              <p className="text-xs text-slate-600 text-center mt-3">카드 정보 필요 없음</p>
            </div>

            {/* Pro 연간 — 강조 */}
            <div className="relative bg-gradient-to-b from-emerald-950/60 to-slate-900/80 border-2 border-emerald-500/60 rounded-2xl p-7 flex flex-col shadow-xl shadow-emerald-500/10 md:-mt-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2 whitespace-nowrap">
                <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-black rounded-full">가장 인기</span>
                <span className="px-3 py-1 bg-emerald-700 text-white text-xs font-black rounded-full">2개월 무료</span>
              </div>
              <div className="mb-6 mt-2">
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Pro 연간</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <p className="text-4xl font-black text-slate-100">₩6,600</p>
                  <p className="text-slate-400 text-sm">/ 월</p>
                </div>
                <p className="text-slate-500 text-xs line-through">월 ₩9,900</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">33% 할인</span>
                  <p className="text-slate-400 text-xs">연 ₩79,200 청구</p>
                </div>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm text-slate-200">
                {[
                  "매매일지 무제한 등록",
                  "매매패턴 무제한 분석",
                  "전체 기간 분석",
                  "감정·진입근거·자산유형별 분석",
                  "AI 매매 리포트",
                  "연간 최저가",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <button className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-500/20 text-sm">
                  연간 시작하기 →
                </button>
              </Link>
              <p className="text-xs text-emerald-700 text-center mt-3">연 ₩79,200 · 언제든 해지 가능</p>
            </div>

            {/* Pro 월간 */}
            <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Pro 월간</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black text-slate-100">₩9,900</p>
                  <p className="text-slate-400 text-sm">/ 월</p>
                </div>
                <p className="text-slate-400 text-sm mt-2">전체 기능 무제한</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1 text-sm text-slate-200">
                {[
                  "매매일지 무제한 등록",
                  "매매패턴 무제한 분석",
                  "전체 기간 분석",
                  "감정·진입근거·자산유형별 분석",
                  "AI 매매 리포트",
                  "월 단위 결제",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <Check className="h-4 w-4 text-blue-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/pricing">
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-colors text-sm">
                  월간 시작하기
                </button>
              </Link>
              <p className="text-xs text-slate-600 text-center mt-3">월 ₩9,900 · 언제든 해지 가능</p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <p className="text-slate-300 font-medium mb-4">7일 동안 Pro 기능을 먼저 써보고 결정하세요.</p>
            <Link href="/pricing">
              <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-emerald-500/20">
                요금제 자세히 보기 →
              </button>
            </Link>
            <p className="text-xs text-slate-500 mt-3">무료 체험 종료 후 Free 플랜으로 전환됩니다.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 7: EBOOK
      ═══════════════════════════════════════════ */}
      <section id="ebook" className="py-20 px-4 bg-slate-900/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              MoneyStep 전자책 50% 할인권 제공
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-100 text-center mb-4">
            내 매매 상태에 맞는 전자책을 선택하세요.
          </h2>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-slate-400 leading-relaxed mb-4">
              TraderMirror로 내 매매 패턴을 확인했다면,<br />
              이제 중요한 건 <strong className="text-slate-200">&apos;나에게 필요한 공부 순서&apos;</strong>를 정하는 것입니다.
            </p>
            <p className="text-slate-400 leading-relaxed mb-4">
              주식이 처음이라면 첫 투자 기준부터,<br />
              매수 타이밍이 어렵다면 차트와 진입 기준부터,<br />
              자산을 장기적으로 키우고 싶다면 포트폴리오와 자산 설계부터 시작하세요.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              MoneyStep 전자책 시리즈는 종목 추천이나 수익 보장이 아니라,<br />
              투자자가 스스로 판단할 수 있는 기준을 단계별로 정리한 학습 자료입니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Vol.1 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Vol.1</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">현재 제공</span>
              </div>
              <h3 className="text-lg font-black text-slate-100 mb-2">첫 투자 교과서</h3>
              <p className="text-xs text-blue-400 mb-3 font-medium">주식이 무섭고, 어디서부터 시작해야 할지 모르는 분</p>
              <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
                {["주식의 본질", "계좌 개설 후 첫 투자 순서", "기업과 시장을 보는 기본 기준", "차트 기초", "손절 기준", "비중 관리", "매매일지와 복기 루틴"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="text-emerald-500">·</span> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
                &quot;좋은 종목보다 먼저, 첫 매수 전에 알아야 할 기준을 잡는 입문서입니다.&quot;
              </p>
              <div className="text-center">
                <p className="text-xs text-slate-500 line-through mb-1">정가 ₩19,900</p>
                <p className="text-emerald-400 font-black text-lg mb-3">신청자 한정 ₩9,900</p>
                <button onClick={() => setLeadPopupOpen(true)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors">
                  50% 할인권 받기 →
                </button>
              </div>
            </div>
            {/* Vol.2 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col opacity-80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Vol.2</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">출시 예정</span>
              </div>
              <h3 className="text-lg font-black text-slate-100 mb-2">차트·매수 타이밍 편</h3>
              <p className="text-xs text-purple-400 mb-3 font-medium">기초는 알지만 언제 사고팔아야 할지 어려운 분</p>
              <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
                {["차트 구조 이해", "지지와 저항", "거래량 해석", "오더블록", "FVG", "SR플립", "멀티타임프레임", "진입하면 안 되는 자리"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="text-purple-500">·</span> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
                &quot;감으로 들어가는 매매를 줄이고, 차트에서 진입 기준을 찾는 실전편입니다.&quot;
              </p>
              <button onClick={() => setLeadPopupOpen(true)} className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold rounded-xl transition-colors">
                출시 알림 신청하기
              </button>
            </div>
            {/* Vol.3 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-6 flex flex-col opacity-80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">Vol.3</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-700 text-slate-400 border border-slate-600">출시 예정</span>
              </div>
              <h3 className="text-lg font-black text-slate-100 mb-2">자산 설계·포트폴리오 편</h3>
              <p className="text-xs text-orange-400 mb-3 font-medium">단기 매매를 넘어 자산을 장기적으로 키우고 싶은 분</p>
              <ul className="text-xs text-slate-400 space-y-1 mb-4 flex-1">
                {["시드별 투자 전략", "ETF 활용법", "자산 배분", "리밸런싱", "ISA·연금저축·IRP 기초", "세금과 환율", "장기 포트폴리오 설계"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <span className="text-orange-500">·</span> {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3 mb-4">
                &quot;단타와 종목 매매를 넘어, 내 자산 전체를 설계하는 포트폴리오편입니다.&quot;
              </p>
              <button onClick={() => setLeadPopupOpen(true)} className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-bold rounded-xl transition-colors">
                출시 알림 신청하기
              </button>
            </div>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-sm text-slate-400">
              <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 내 투자 상태에 맞는 전자책 선택 가능</span>
              <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 단계별 학습 가능</span>
              <span className="flex items-center gap-2"><span className="text-emerald-400">✓</span> 종목 추천 아닌 판단 기준 학습</span>
            </div>
            <a href="https://moneystep.imweb.me/" target="_blank" rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-lg transition-colors shadow-lg shadow-emerald-500/10">
              내게 맞는 전자책 보러가기 →
            </a>
            <p className="text-xs text-slate-600 mt-4">
              본 자료는 학습용이며 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 8: FAQ
      ═══════════════════════════════════════════ */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center mb-10">
          자주 묻는 질문
        </h2>
        <div className="divide-y divide-slate-800">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 9: FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="w-full bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-4">
            지금 내 매매패턴을 확인해보세요
          </h2>
          <p className="text-slate-400 mb-8 text-sm">
            거래내역을 붙여넣는 것만으로 반복 실수가 보입니다.
          </p>
          <Link href="/analyze">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-blue-500/20">
              무료로 매매패턴 분석하기 →
            </button>
          </Link>
          <p className="mt-4 text-xs text-slate-600">
            종목 추천 없음 · 매수/매도 지시 없음 · 수익 보장 없음
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="w-full border-t border-slate-800 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-bold">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <span>Trader<span className="text-blue-500">Mirror</span></span>
            <span className="text-slate-600 font-normal text-xs ml-2">매매 복기 도구</span>
          </div>
          <nav className="flex gap-6 text-xs text-slate-500">
            <Link href="/analyze" className="hover:text-slate-300 transition-colors">매매분석</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">요금제</Link>
            <Link href="/tools" className="hover:text-slate-300 transition-colors">계산기</Link>
            <a href="#ebook" className="hover:text-slate-300 transition-colors">전자책</a>
          </nav>
        </div>
        <div className="max-w-5xl mx-auto mt-4">
          <p className="text-xs text-slate-700 text-center leading-relaxed">
            본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다.
          </p>
          <p className="text-xs text-slate-800 text-center mt-1">© 2025 TraderMirror.</p>
        </div>
      </footer>
    </div>
  );
}
