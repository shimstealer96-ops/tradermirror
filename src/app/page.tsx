"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calculator,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import LeadPopup from "@/components/LeadPopup";

const targetUsers = [
  { emoji: "📉", text: "사면 떨어지고, 팔면 오르는 것 같은 분" },
  { emoji: "✂️", text: "수익은 짧게 먹고 손실은 오래 버티는 분" },
  { emoji: "⏰", text: "장 초반에 자주 물리는 분" },
  { emoji: "🎲", text: "손절 기준 없이 감으로 버티는 분" },
  { emoji: "₿", text: "코인 선물에서 펀딩비·청산가 계산이 헷갈리는 분" },
  { emoji: "📓", text: "매매일지를 써도 뭘 봐야 할지 모르는 분" },
];

const features = [
  {
    icon: <TrendingUp className="h-6 w-6 text-blue-400" />,
    iconBg: "bg-blue-500/10 border-blue-500/20",
    title: "매매일지 자동 분석",
    body: "거래내역을 붙여넣거나 매일 기록한 매매일지를 불러와 승률, 손익비, 시간대, 감정상태, 진입근거별 성과를 한눈에 보여줍니다.",
  },
  {
    icon: <Calculator className="h-6 w-6 text-emerald-400" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    title: "진짜 순수익 계산",
    body: "수익인 줄 알았던 거래가 실제로 얼마나 남았는지 확인하세요. 수수료, 세금, 펀딩비까지 반영해 실제 순수익을 계산합니다.",
  },
  {
    icon: <AlertTriangle className="h-6 w-6 text-orange-400" />,
    iconBg: "bg-orange-500/10 border-orange-500/20",
    title: "청산가·위험 관리",
    body: "코인 선물과 주식 선물의 레버리지 위험을 진입 전에 확인하세요. 증거금, 레버리지, 진입가를 기준으로 청산 위험을 계산합니다.",
  },
  {
    icon: <Clock className="h-6 w-6 text-purple-400" />,
    iconBg: "bg-purple-500/10 border-purple-500/20",
    title: "펀딩비 누적 비용 추적",
    body: "코인 선물 장기 보유 시 누적 펀딩비가 수익을 얼마나 깎는지 보여줍니다.",
  },
];

const steps = [
  {
    num: "STEP 1",
    title: "거래내역 입력",
    desc: "HTS/MTS, 거래소 거래내역을 복사해 붙여넣거나 앱에 기록한 매매일지를 불러옵니다.",
  },
  {
    num: "STEP 2",
    title: "AI 매매패턴 분석",
    desc: "승률, 손익비, 시간대, 진입 근거, 감정 상태, 손절 습관을 자동으로 분석합니다.",
  },
  {
    num: "STEP 3",
    title: "다음 매매 규칙 확인",
    desc: "반복 실수 TOP 3와 다음 거래에서 지켜야 할 규칙을 확인합니다.",
  },
];

const trustItems = [
  "증권사 계정 연동이 필요 없습니다",
  "거래내역을 복사해 붙여넣는 방식입니다",
  "앱에 기록한 매매일지를 불러와 분석할 수 있습니다",
  "종목 추천이나 매수·매도 신호를 제공하지 않습니다",
  "수익 보장을 하지 않습니다",
  "사용자의 매매 습관을 복기하기 위한 교육용 도구입니다",
];

const proFeatures = [
  "무제한 매매패턴 분석",
  "내 매매일지 불러오기 분석",
  "진입 근거별 / 감정별 / 원칙 준수별 성과",
  "자산 유형별 상세 분석",
  "AI 매매 리포트",
  "청산가·펀딩비 계산기",
];

const ebookPoints = [
  "왜 사는지 기록하는 법",
  "손절 기준을 먼저 정하는 법",
  "수익보다 먼저 손실을 줄이는 법",
  "매매일지를 복기하는 법",
];

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
    q: "어떤 걸 분석해주나요?",
    a: "승률, 손익비, 시간대별 성과, 진입 근거별 성과, 감정 상태별 성과, 손절 기준 작성 여부, 반복 실수 등을 분석합니다.",
  },
];


function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left text-slate-200 font-semibold hover:bg-slate-900/40 transition-colors"
      >
        <span>{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-800/60 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [leadPopupOpen, setLeadPopupOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('lead_popup_dismissed')) {
        setLeadPopupOpen(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col bg-[#090d16] overflow-x-hidden">

      <LeadPopup isOpen={leadPopupOpen} onClose={() => setLeadPopupOpen(false)} />

      <button
        onClick={() => setLeadPopupOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 transition-colors">
        🎁 전자책 50% 할인권 받기
      </button>

      {/* SECTION 1: HERO */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 md:pt-32 md:pb-28 flex flex-col items-center text-center">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-100">
          왜 사면 떨어지고, 팔면 오를까요?
          <br />
          <span className="text-blue-400">당신의 매매기록이 답을 알고 있습니다.</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed whitespace-pre-line">
          {`거래내역을 붙여넣거나, 매일 기록한 매매일지를 불러오세요.\n승률, 손익비, 시간대, 진입 근거, 감정 상태, 손절 습관까지\n내가 반복해서 잃는 패턴을 데이터로 보여드립니다.`}
        </p>
        <Link href="/analyze">
          <button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            무료로 매매패턴 분석하기 →
          </button>
        </Link>
        <p className="mt-4 text-xs text-slate-500">증권사 연동 없음 · 종목 추천 없음 · 수익 보장 없음</p>
      </section>

      {/* SECTION 2: HOOK QUOTE */}
      <section className="w-full bg-slate-900/20 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-2xl sm:text-3xl font-black text-slate-100 leading-snug">
            수익 나는 종목을 알려주는 툴이 아니라,
            <br />
            내가 왜 잃는지 알려주는{" "}
            <span className="text-blue-400">거울</span>입니다.
          </p>
          <p className="mt-4 text-slate-500 text-sm font-semibold tracking-widest uppercase">
            TraderMirror — 매매 습관 복기 도구
          </p>
        </div>
      </section>

      {/* SECTION 3: TARGET USERS */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center mb-12">
          이런 분이라면 꼭 한 번 분석해보세요
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {targetUsers.map((item, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <span className="text-2xl">{item.emoji}</span>
              <p className="text-slate-300 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="w-full bg-slate-900/20 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center">
            거래내역만 넣으면, 잃는 패턴이 보입니다
          </h2>
          <p className="mt-4 text-slate-400 text-center max-w-2xl mx-auto leading-relaxed">
            복잡한 연동 없이도 괜찮습니다.
            붙여넣거나 기록한 매매일지를 불러오면, 반복되는 실수를 자동으로 분석합니다.
          </p>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center">
                <span className="inline-block text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
              <div className={`p-3 border rounded-xl w-fit ${f.iconBg}`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-slate-100">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: LEAD TEASER */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-slate-400 mb-4">내 투자상태에 맞는 혜택과 전자책 할인권을 받아보세요</p>
          <button onClick={() => setLeadPopupOpen(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
            혜택·할인권 받기
          </button>
        </div>
      </section>

      {/* SECTION 7: TRUST */}
      <section className="w-full bg-slate-900/20 border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center mb-10">
            안심하고 사용하셔도 됩니다
          </h2>
          <div className="space-y-4">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: PRICING */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
          7일 동안 무료로, 내 매매 습관을 확인해보세요
        </h2>
        <p className="mt-4 text-slate-400 leading-relaxed max-w-xl mx-auto">
          복잡한 증권사 연동은 필요 없습니다.
          거래내역을 붙여넣거나, 매매일지를 기록하면
          TraderMirror가 승률, 손익비, 시간대별 성과, 반복 실수까지 분석해드립니다.
          <br /><br />
          7일 동안 부담 없이 사용해보고,
          내 매매에 도움이 된다고 느낄 때 계속 이용하세요.
        </p>
        <div className="mt-10 bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-left max-w-sm mx-auto">
          <span className="inline-block text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
            7일 무료 체험
          </span>
          <div className="text-3xl font-black text-slate-100 mb-1">이후 월 ₩9,900</div>
          <p className="text-slate-500 text-xs mb-6">카드 등록 없이 7일 무료 · 언제든 해지 가능</p>
          <ul className="space-y-2 mb-6">
            {proFeatures.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link href="/analyze">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors">
              7일 무료로 시작하기 →
            </button>
          </Link>
          <p className="mt-3 text-center text-xs text-slate-500">종목 추천 · 매수/매도 지시 · 수익 보장은 제공하지 않습니다.</p>
        </div>
      </section>

      {/* SECTION 9: EBOOK CTA */}
      <section id="ebook" className="w-full bg-slate-900/20 border-y border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <span className="inline-block text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-6">
              분석 후 읽으면 좋은 교재
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-4">
              내 패턴을 알았다면, 이제 고치는 기준이 필요합니다.
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              거래내역 분석만으로도 내가 왜 잃는지 알 수 있습니다.
              하지만 같은 실수를 줄이려면 진입 기준, 손절 기준, 비중 관리, 매매일지 작성법이 필요합니다.
              <br /><br />
              이 전자책은 주식·코인 초보자가 감정매매에서 벗어나기 위해 필요한 기본 원칙을 정리한 자료입니다.
            </p>
            <div className="space-y-3 mb-8 text-left inline-block">
              {ebookPoints.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{p}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="text-3xl font-black text-slate-100 mb-4">₩19,900</div>
              <button className="border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold px-8 py-4 rounded-xl transition-colors inline-flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                전자책 보고 매매 기준 잡기 →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-100 text-center mb-10">
          자주 묻는 질문
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* SECTION 11: FOOTER CTA */}
      <section className="w-full bg-slate-900/20 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-6">
            지금 바로 내 매매패턴을 확인해보세요
          </h2>
          <Link href="/analyze">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">
              무료로 매매패턴 분석하기 →
            </button>
          </Link>
          <p className="mt-6 text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            본 서비스는 투자 판단을 대신하지 않으며, 종목 추천·매수/매도 지시·수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다.
          </p>
        </div>
      </section>

    </div>
  );
}
