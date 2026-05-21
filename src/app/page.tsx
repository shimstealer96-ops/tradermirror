"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ArrowRight, 
  BrainCircuit, 
  Percent, 
  ShieldAlert, 
  Coins, 
  Sparkles, 
  CheckCircle2, 
  BookOpen,
  HelpCircle
} from "lucide-react";
import { Button, Card, Dialog } from "@/components/ui";

export default function LandingPage() {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const features = [
    {
      icon: <BrainCircuit className="h-6 w-6 text-blue-400" />,
      title: "매매 일지 자동 분석",
      desc: "거래 데이터만 복사 붙여넣기 하면 복잡한 계산 없이 AI가 실수를 탐지하고 교정해 드립니다.",
    },
    {
      icon: <Percent className="h-6 w-6 text-emerald-400" />,
      title: "수익률 착시 교정기",
      desc: "수수료, 세금, 김치프리미엄, 달러 환율 및 기회비용을 반영한 '진짜 수익률'을 알려드립니다.",
    },
    {
      icon: <ShieldAlert className="h-6 w-6 text-red-400" />,
      title: "실시간 청산가 계산기",
      desc: "레버리지 조절 및 추가 증거금 수량에 따른 거래소별 청산가를 계산해 포지션을 보호합니다.",
    },
    {
      icon: <Coins className="h-6 w-6 text-amber-400" />,
      title: "펀딩피 누적 비용 추적",
      desc: "장기 보유 시 나도 모르게 계좌를 갉아먹는 숨겨진 펀딩 비용을 계산하고 경고합니다.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "거래 내역 입력",
      desc: "사용 중인 증권사(키움, 미래에셋 등)나 거래소의 일지 텍스트를 그대로 복사해서 붙여넣습니다.",
    },
    {
      num: "02",
      title: "AI 매매 패턴 진단",
      desc: "시스템이 거래 데이터를 시간대별 승률, 보유기간 등으로 시각화하고 AI가 투자 실수 패턴을 짚어냅니다.",
    },
    {
      num: "03",
      title: "투자 습관 교정 및 복리화",
      desc: "제공된 리스크 점수와 피드백을 통해 뇌동매매를 방지하고 장기적으로 우상향하는 계좌를 만듭니다.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-100 bg-[#090d16] overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-950/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
        {/* Sub-badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>업그레이드된 투자 분석 에이전트 v1.5</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl text-slate-100 font-outfit">
          당신이 왜 계속 잃는지, <br className="sm:hidden" />
          <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400 bg-clip-text text-transparent">
            데이터로 보여드립니다.
          </span>
        </h1>
        
        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
          어려운 분석 툴은 필요 없습니다. 사용하시는 증권사 거래 내역을 복사해 붙여넣으면 무의식 중에 반복하는 뇌동매매와 투자 실수를 완전히 시각화합니다.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <Link href="/analyze" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full gap-2 text-base">
              내 매매 패턴 분석하기
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/tools" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full text-base">
              투자 계산기 사용하기
            </Button>
          </Link>
        </div>

        {/* Dashboard Preview Mock */}
        <div className="mt-16 w-full max-w-4xl border border-slate-800 bg-slate-950/40 rounded-2xl p-2 shadow-2xl shadow-blue-950/20 backdrop-blur-md">
          <div className="bg-[#090d16] rounded-xl p-4 md:p-6 text-left border border-slate-900 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 ml-2 font-mono">tradermirror-dashboard.exe</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">실시간 경고 감지</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">가장 위험한 시간대</span>
                <div className="text-xl font-bold text-red-500 mt-1">오전 09:00 ~ 10:00</div>
                <div className="text-xs text-slate-400 mt-2">해당 시간 승률 31.4%로 전체 평균 대비 극히 낮음.</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">평균 포지션 보유 기간</span>
                <div className="flex justify-between items-baseline mt-1">
                  <div className="text-sm font-bold text-emerald-400">익절: 1.2일</div>
                  <div className="text-sm font-bold text-red-400">손절: 14.8일</div>
                </div>
                <div className="text-xs text-slate-400 mt-2">수익은 빠르게 팔고, 손실은 물타기로 방치 중.</div>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500">투자 손익비 (R:R Ratio)</span>
                <div className="text-xl font-bold text-amber-500 mt-1">0.42 <span className="text-xs text-red-500 font-normal">(경고)</span></div>
                <div className="text-xs text-slate-400 mt-2">승률 70%를 달성해도 한 번의 큰 손절로 파산할 구조.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="w-full py-16 bg-[#050811] border-y border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-100 font-outfit">성공하는 매매로 가기 위한 4가지 도구</h2>
            <p className="text-slate-400 mt-4">단순한 매매 일지 기록을 넘어, 행동 편향과 보이지 않는 비용을 차갑게 추적하고 제어해 줍니다.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="glass-panel-hover flex flex-col justify-between">
                <div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-200 mt-6">{feature.title}</h3>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed">{feature.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Steps / Usage Guide Section */}
      <section className="w-full py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-100 font-outfit">바이브 코딩하듯 쉬운 3단계 사용 방법</h2>
          <p className="text-slate-400 mt-4">복잡한 양식 작성이 필요 없습니다. 오직 복사해서 붙여넣기만 하세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* Connector line for large screens */}
          <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-800 z-0" />
          
          {steps.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center p-6 bg-slate-950/20 rounded-2xl border border-slate-900/40">
              <span className="text-4xl font-extrabold text-blue-500/20 font-mono tracking-widest bg-slate-900/60 border border-slate-800 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                {step.num}
              </span>
              <h3 className="text-lg font-bold text-slate-200">{step.title}</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ebook Promotional CTA Section */}
      <section id="ebook" className="w-full py-20 bg-gradient-to-b from-[#050811] to-[#090d16] border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel border-blue-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-blue-950/15">
            {/* Book Cover Visual Mock */}
            <div className="w-48 sm:w-56 md:w-64 h-72 sm:h-80 md:h-96 shrink-0 relative rounded-r-xl bg-gradient-to-r from-blue-950 to-blue-900 p-6 flex flex-col justify-between shadow-2xl border border-blue-800/40 overflow-hidden transform hover:-translate-y-2 hover:rotate-1 transition-all duration-300">
              {/* Gold Accents */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400/20 to-transparent blur-md" />
              <div className="border-l-4 border-emerald-500/60 h-full absolute left-2 top-0" />

              <div className="space-y-4">
                <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">TraderMirror 베스트셀러</span>
                <h3 className="text-2xl font-black text-slate-100 tracking-tight leading-snug">
                  주린이를 위한<br />첫 투자 교과서
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  반복되는 파산 패턴을 파괴하고 월 복리 10%로 가기 위한 심리 및 매매 규칙 가이드북.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-400">TraderMirror 연구소 지음</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-400 font-bold">1st Edition</span>
              </div>
            </div>

            {/* Book Info & Sales Pitch */}
            <div className="space-y-6 flex-1 text-left">
              <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                전자책 즉시 다운로드 제공
              </span>
              
              <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                "이 나쁜 패턴을 깨닫는 것만으로도, 시드의 절반을 구하는 일입니다."
              </h2>
              
              <p className="text-slate-400 leading-relaxed text-sm">
                거래 내역을 마주하고 충격을 받으셨나요? 오전 뇌동매매와 익절은 짧고 손절은 긴 매매 습관은 시드를 갉아먹는 암세포와 같습니다. 본 가이드북에서는 이 고질적인 심리 오류를 극복하고 손익비 1:2 구조를 세우는 핵심 수칙 7가지를 알려드립니다.
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>일지 파싱 결과를 해석하고 심리적 편향을 제거하는 방법</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>손익비 2.0 이상을 창출하는 완벽한 손절라인 설정 규칙</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span>레버리지 10배 이상 포지션의 심리 붕괴 복구 프로세스</span>
                </div>
              </div>

              {/* Price & Button */}
              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-900">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl font-black text-slate-100">₩19,900</span>
                  <span className="text-sm text-slate-500 line-through">₩49,000</span>
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">얼리버드 60% 할인</span>
                </div>
                <Button 
                  variant="success" 
                  size="lg" 
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="w-full sm:w-auto font-bold tracking-wide"
                >
                  얼리버드 ₩19,900 구매하기 →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Book Purchase Mock Dialog */}
      <Dialog isOpen={isPurchaseModalOpen} onClose={() => setIsPurchaseModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-full w-fit mx-auto">
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">"주린이를 위한 첫 투자 교과서"</h3>
          <p className="text-sm text-slate-400">
            현재 데모 시스템입니다. 실제 연동 시 토스페이먼츠/카카오페이 결제창이 팝업됩니다. 
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl text-left border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>구매 상품:</span>
              <span className="text-slate-200">초보 투자 교과서 PDF (즉시 다운로드)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>결제 금액:</span>
              <span className="text-slate-200 font-bold">19,900 원</span>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsPurchaseModalOpen(false)}>
              취소
            </Button>
            <Button variant="primary" className="flex-1 font-bold" onClick={() => {
              alert("모의 결제가 진행되었습니다. 이용해 주셔서 감사합니다!");
              setIsPurchaseModalOpen(false);
            }}>
              모의 결제 승인
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
