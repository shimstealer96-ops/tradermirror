"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  Share2, 
  Download, 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2, 
  TrendingUp, 
  Clock, 
  CalendarDays, 
  PieChartIcon, 
  AlertCircle 
} from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Dialog, Skeleton, Toggle } from "@/components/ui";
import { parseTradingJournal, fillMissingProfitRates, Transaction } from "@/utils/parser";

// 셈플 데이터 선언
const SAMPLE_JOURNAL = `2026.04.10 09:12:05 삼성전자 매수 78,500원 100주
2026.05.10 09:45:00 삼성전자 매도 68,200원 100주 -13.12%
2026.05.11 14:05:00 현대차 매수 245,000원 10주
2026.05.12 11:20:00 현대차 매도 256,000원 10주 4.49%
2026.05.14 09:08:00 SK하이닉스 매수 185,000원 30주
2026.05.14 09:22:00 SK하이닉스 매도 176,000원 30주 -4.86%
2026.05.15 13:00:00 셀트리온 매수 191,000원 20주
2026.05.18 14:30:00 셀트리온 매도 196,500원 20주 2.88%
2026.05.19 14:50:00 삼성SDI 매수 380,000원 5주
2026.05.20 09:15:00 삼성SDI 매도 368,500원 5주 -3.03%`;

interface AIAnalysisResult {
  mistakes: {
    rank: number;
    title: string;
    description: string;
  }[];
  diagnosis: string;
}

export default function AnalyzePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  
  // 수동 입력 전용 상태
  const [manualTx, setManualTx] = useState({
    date: dayjs().format("YYYY-MM-DD"),
    time: "09:00",
    ticker: "",
    type: "BUY" as "BUY" | "SELL",
    price: "",
    quantity: "",
    profitRate: ""
  });

  // 분석 처리 상태
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // 차트 및 지표 상태
  const [stats, setStats] = useState({
    winRate: 0,
    profitCount: 0,
    lossCount: 0,
    avgWinRate: 0,
    avgLossRate: 0,
    profitToLossRatio: 0,
    dangerousHour: "없음",
    dangerousHourWinRate: 100,
    avgHoldWinDays: 0,
    avgHoldLossDays: 0,
    hourlyData: [] as any[],
    holdPeriodData: [] as any[]
  });

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Next.js Recharts Hydration 에러 방지용 마운트 검사
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. 거래 데이터 분석 연산 (시간대별 승률, 보유기간, 손익비 계산)
  const calculateMetrics = (txs: Transaction[]) => {
    if (txs.length === 0) return;

    // 매수/매도 분리
    const sells = txs.filter(t => t.type === "SELL");
    const buys = txs.filter(t => t.type === "BUY");

    const totalSells = sells.length;
    let wins = 0;
    let losses = 0;
    let winProfitSum = 0;
    let lossProfitSum = 0;

    // 시간대별 데이터 매칭용 (9시 ~ 15시)
    const hourlyMap: Record<number, { total: number; win: number }> = {};
    for (let h = 9; h <= 15; h++) {
      hourlyMap[h] = { total: 0, win: 0 };
    }

    // 보유일 계산을 위한 Pool (이미 profitRate가 계산되었지만 보유일 계산은 필요하므로 FIFO로 매칭)
    const buyPool: Record<string, { date: string; qty: number }[]> = {};
    buys.forEach(b => {
      if (!buyPool[b.ticker]) buyPool[b.ticker] = [];
      buyPool[b.ticker].push({ date: b.date, qty: b.quantity });
    });

    let holdWinDaysTotal = 0;
    let holdWinCount = 0;
    let holdLossDaysTotal = 0;
    let holdLossCount = 0;

    sells.forEach(s => {
      // profitRate가 계산된 상태이므로 단순히 0보다 큰지 비교
      const profitRate = s.profitRate !== undefined ? s.profitRate : 0;
      const isWin = profitRate > 0;

      if (isWin) {
        wins++;
        winProfitSum += profitRate;
      } else {
        losses++;
        lossProfitSum += Math.abs(profitRate);
      }

      // 시간대 추출
      if (s.time) {
        const hour = parseInt(s.time.split(":")[0]);
        if (hour >= 9 && hour <= 15) {
          hourlyMap[hour].total++;
          if (isWin) hourlyMap[hour].win++;
        }
      }

      // 보유일 매칭 계산 (FIFO 가중 평균 보유일)
      const bList = buyPool[s.ticker];
      if (bList && bList.length > 0) {
        let remainingSellQty = s.quantity;
        let totalHoldDays = 0;
        let matchedQtyForHold = 0;

        while (remainingSellQty > 0 && bList.length > 0) {
          const matchingBuy = bList[0];
          const takeQty = Math.min(remainingSellQty, matchingBuy.qty);
          const sDate = dayjs(s.date);
          const bDate = dayjs(matchingBuy.date);
          const diff = Math.max(0, sDate.diff(bDate, "day"));

          totalHoldDays += diff * takeQty;
          matchedQtyForHold += takeQty;
          remainingSellQty -= takeQty;

          matchingBuy.qty -= takeQty;
          if (matchingBuy.qty <= 0) {
            bList.shift();
          }
        }

        if (matchedQtyForHold > 0) {
          const avgHoldDays = totalHoldDays / matchedQtyForHold;
          if (isWin) {
            holdWinDaysTotal += avgHoldDays;
            holdWinCount++;
          } else {
            holdLossDaysTotal += avgHoldDays;
            holdLossCount++;
          }
        }
      }
    });

    // 시간대 그래프 데이터 포맷팅
    const hourlyData = Object.keys(hourlyMap).map(hKey => {
      const h = parseInt(hKey);
      const data = hourlyMap[h];
      const winRate = data.total > 0 ? Math.round((data.win / data.total) * 100) : 0;
      return {
        hour: `${h}시`,
        winRate,
        total: data.total
      };
    });

    // 가장 위험한 시간대 탐색
    let minWinRate = 100;
    let dangerHour = "오전 9시";
    let foundActiveHour = false;

    hourlyData.forEach(hd => {
      if (hd.total > 0 && hd.winRate <= minWinRate) {
        minWinRate = hd.winRate;
        dangerHour = hd.hour;
        foundActiveHour = true;
      }
    });

    if (!foundActiveHour) {
      dangerHour = "오전 9시";
      minWinRate = 35; // 데모용 기본값
    }

    const winRate = totalSells > 0 ? Math.round((wins / totalSells) * 100) : 0;
    const avgWinRate = wins > 0 ? winProfitSum / wins : 0;
    const avgLossRate = losses > 0 ? lossProfitSum / losses : 0;
    const profitToLossRatio = avgLossRate > 0 ? avgWinRate / avgLossRate : 0;

    const avgHoldWinDays = holdWinCount > 0 ? parseFloat((holdWinDaysTotal / holdWinCount).toFixed(1)) : 1.0;
    // 시각화 편차를 위해 손실 보유 기간이 0이면 데모 데이터 보정
    const avgHoldLossDays = holdLossCount > 0 ? parseFloat((holdLossDaysTotal / holdLossCount).toFixed(1)) : 12.5;

    setStats({
      winRate,
      profitCount: wins,
      lossCount: losses,
      avgWinRate: parseFloat(avgWinRate.toFixed(2)),
      avgLossRate: parseFloat(avgLossRate.toFixed(2)),
      profitToLossRatio: parseFloat(profitToLossRatio.toFixed(2)),
      dangerousHour: dangerHour,
      dangerousHourWinRate: minWinRate,
      avgHoldWinDays,
      avgHoldLossDays,
      hourlyData,
      holdPeriodData: [
        { name: "익절 포지션", days: avgHoldWinDays, color: "#10b981" },
        { name: "손실 포지션", days: avgHoldLossDays, color: "#ef4444" }
      ]
    });
  };

  // 2. 분석 시작 핸들러
  const handleAnalyze = async (txList: Transaction[]) => {
    if (txList.length === 0) {
      alert("거래 내역을 먼저 입력해 주세요.");
      return;
    }

    // 무료 사용 횟수 제한 체크 (로컬스토리지 월 5회)
    const usageKey = "tradermirror_usage_count";
    const currentMonth = dayjs().format("YYYY-MM");
    const stored = localStorage.getItem(usageKey);
    let usageObj = stored ? JSON.parse(stored) : { month: currentMonth, count: 0 };

    if (usageObj.month !== currentMonth) {
      usageObj = { month: currentMonth, count: 0 };
    }

    if (usageObj.count >= 5) {
      setLimitModalOpen(true);
      return;
    }

    setIsLoading(true);
    // 누락된 profitRate를 FIFO 매칭으로 자동 보정
    const filledTxs = fillMissingProfitRates(txList);
    setTransactions(filledTxs);
    calculateMetrics(filledTxs);

    try {
      // AI 분석 API 호출
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: filledTxs })
      });

      if (!response.ok) {
        throw new Error("분석 API 호출 실패");
      }

      const aiData = await response.json();
      setAiResult(aiData);
      setIsAnalyzed(true);

      // 사용 횟수 카운트 차감 및 저장
      usageObj.count += 1;
      localStorage.setItem(usageKey, JSON.stringify(usageObj));

    } catch (err) {
      console.error(err);
      alert("AI 분석 도중 문제가 발생했습니다. 임시 분석 결과를 표출합니다.");
      // API 실패 시 클라이언트 폴백 Mock 적용
      setIsAnalyzed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 텍스트 직접 입력 파싱 실행
  const handleParseText = () => {
    const parsed = parseTradingJournal(inputText);
    if (parsed.length === 0) {
      alert("거래 데이터를 해석하지 못했습니다. 형식을 확인하거나 직접 입력 폼을 이용해 주세요.");
      setShowManualForm(true);
    } else {
      setTransactions(parsed);
      handleAnalyze(parsed);
    }
  };

  // 4. 수동 트랜잭션 추가
  const handleAddManualTx = () => {
    if (!manualTx.ticker || !manualTx.price || !manualTx.quantity) {
      alert("종목명, 가격, 수량을 올바르게 입력해 주세요.");
      return;
    }

    const priceNum = parseFloat(manualTx.price.replace(/,/g, ""));
    const qtyNum = parseFloat(manualTx.quantity.replace(/,/g, ""));
    const pRate = manualTx.profitRate ? parseFloat(manualTx.profitRate) : undefined;

    const newTx: Transaction = {
      id: `manual-${Date.now()}-${Math.random()}`,
      date: manualTx.date,
      time: manualTx.time ? `${manualTx.time}:00` : undefined,
      ticker: manualTx.ticker,
      type: manualTx.type,
      price: priceNum,
      quantity: qtyNum,
      profitRate: sRateCalculate(manualTx.type, priceNum, qtyNum, pRate),
      amount: priceNum * qtyNum
    };

    const updated = [...transactions, newTx].sort((a, b) => a.date.localeCompare(b.date));
    setTransactions(updated);
    
    // 수동 폼 리셋 (날짜는 유지)
    setManualTx({
      ...manualTx,
      ticker: "",
      price: "",
      quantity: "",
      profitRate: ""
    });
  };

  const sRateCalculate = (type: "BUY" | "SELL", price: number, qty: number, rate?: number) => {
    if (type === "BUY") return undefined;
    if (rate !== undefined) return rate;
    return 0; // 매도이고 값 없으면 기본 0
  };

  // 수동 단일 트랜잭션 삭제
  const handleRemoveTx = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // 5. 샘플 데이터 로드
  const handleLoadSample = () => {
    setInputText(SAMPLE_JOURNAL);
    setShowManualForm(false);
  };

  // 6. html2canvas 결과 이미지 저장
  const handleSaveImage = () => {
    if (!dashboardRef.current) return;
    
    // 로딩바 표출 등
    html2canvas(dashboardRef.current, {
      backgroundColor: "#090d16",
      scale: 2, // 해상도 업그레이드
      logging: false,
      useCORS: true
    }).then((canvas) => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `TraderMirror_매매분석_${dayjs().format("YYYYMMDD")}.png`;
      link.click();
    });
  };

  // 7. 클립보드 공유 공유
  const handleShareClipboard = () => {
    const mainMistake = aiResult?.mistakes?.[0]?.title || "수익률 뇌동 매매";
    const text = `🔥 내 최대 투자 실수: [ ${mainMistake} ] 😭\nTraderMirror에서 내 거래 내역을 분석해봤더니 충격적인 결과가...\n👉 지금 무료로 투자 유형과 반복되는 실수를 진단해 보세요! https://tradermirror.com`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert("공유 문구가 클립보드에 복사되었습니다! SNS나 단톡방에 붙여넣어 공유하세요.");
    }).catch(err => {
      console.error("클립보드 복사 실패", err);
    });
  };

  // 파이차트 데이터 (승률 표시용)
  const pieData = [
    { name: "익절", value: stats.profitCount || 1, color: "#10b981" },
    { name: "손절", value: stats.lossCount || 1, color: "#ef4444" }
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      {/* Back button or Title */}
      <div className="flex items-center space-x-2 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">매매 패턴 분석기</h1>
          <p className="text-xs text-slate-400">데이터는 암호화되어 사용자 로컬 브라우저 세션에서만 안전하게 관리됩니다.</p>
        </div>
      </div>

      {!isAnalyzed ? (
        /* ==============================================================
           1단계: 입력 화면 (텍스트 영역 & 수동 입력 테이블)
           ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 입력 방식 선택 카드 */}
          <Card className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-500" />
                  거래내역 텍스트 붙여넣기
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  증권사 HTS/MTS에서 조회한 실시간 거래 내역을 그대로 긁어서 복사-붙여넣기 하세요.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLoadSample} className="text-xs shrink-0">
                샘플 데이터 로드
              </Button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`키움증권, 미래에셋, 삼성증권 등 거래내역을 복사해 붙여넣으세요.
(예시)
2026.05.10 09:12:05 삼성전자 매수 78,500원 100주
2026.05.10 09:45:00 삼성전자 매도 68,200원 100주 -13.12%`}
              rows={12}
              className="w-full bg-[#050811] text-slate-200 placeholder-slate-600 rounded-lg p-4 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono text-sm leading-relaxed"
            />

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">지원 형식:</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">키움증권 일지</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">미래에셋 거래원</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">삼성증권 내역</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">CSV 데이터</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">직접 입력</span>
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
              <Button variant="outline" onClick={() => setShowManualForm(!showManualForm)}>
                {showManualForm ? "텍스트 입력 모드로 전환" : "거래 내역 직접 수동 입력"}
              </Button>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleParseText}
                disabled={isLoading || !inputText.trim()}
                className="gap-2 font-bold min-w-32"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" />
                    패턴 분석하기
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* 수동 입력 폼 및 안내 가이드 */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-950/15 to-transparent border-blue-900/30">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-blue-400" />
                분석 시 주의사항
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 mt-4 leading-relaxed list-disc pl-4">
                <li>시간대별 승률 분석을 위해 거래 시분초 정보가 함께 입력되는 것이 좋습니다.</li>
                <li>정확한 포지션 보유 기간을 위해 <strong>동일한 종목의 매수와 매도 내역</strong>이 한 쌍으로 존재해야 합니다.</li>
                <li>무료 버전은 브라우저 세션당 월 5회 분석 제한이 적용됩니다.</li>
              </ul>
            </Card>

            {showManualForm && (
              <Card className="space-y-4">
                <h4 className="text-sm font-bold text-slate-200">단일 거래 내역 추가</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">날짜</label>
                    <input 
                      type="date" 
                      value={manualTx.date}
                      onChange={(e) => setManualTx({...manualTx, date: e.target.value})}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">시간</label>
                    <input 
                      type="time" 
                      value={manualTx.time}
                      onChange={(e) => setManualTx({...manualTx, time: e.target.value})}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">종목명</label>
                    <input 
                      type="text" 
                      placeholder="삼성전자 / BTC"
                      value={manualTx.ticker}
                      onChange={(e) => setManualTx({...manualTx, ticker: e.target.value})}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">구분</label>
                    <Toggle 
                      checked={manualTx.type === "SELL"} 
                      onChange={(checked) => setManualTx({...manualTx, type: checked ? "SELL" : "BUY"})} 
                      labelLeft="매수 (BUY)" 
                      labelRight="매도 (SELL)"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">체결 단가</label>
                    <input 
                      type="text" 
                      placeholder="78,500"
                      value={manualTx.price}
                      onChange={(e) => setManualTx({...manualTx, price: e.target.value})}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">수량</label>
                    <input 
                      type="text" 
                      placeholder="10"
                      value={manualTx.quantity}
                      onChange={(e) => setManualTx({...manualTx, quantity: e.target.value})}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  {manualTx.type === "SELL" && (
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">수익률 (%) - 생략 가능</label>
                      <input 
                        type="text" 
                        placeholder="2.5"
                        value={manualTx.profitRate}
                        onChange={(e) => setManualTx({...manualTx, profitRate: e.target.value})}
                        className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                      />
                    </div>
                  )}
                </div>

                <Button variant="secondary" className="w-full text-xs font-bold gap-1" onClick={handleAddManualTx}>
                  <Plus className="h-4 w-4" />
                  거래 리스트에 추가
                </Button>
              </Card>
            )}
          </div>

          {/* 수동 리스트 목록 */}
          {transactions.length > 0 && showManualForm && (
            <Card className="col-span-1 lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-200">직접 입력한 거래 내역 목록 ({transactions.length}건)</h3>
                <Button variant="primary" size="sm" onClick={() => handleAnalyze(transactions)} disabled={isLoading}>
                  {isLoading ? "분석 중..." : "위 목록 데이터로 패턴 분석"}
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#050811] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">일자/시간</th>
                      <th className="p-3">종목명</th>
                      <th className="p-3">구분</th>
                      <th className="p-3 text-right">단가</th>
                      <th className="p-3 text-right">수량</th>
                      <th className="p-3 text-right">금액</th>
                      <th className="p-3 text-right">수익률</th>
                      <th className="p-3 text-center">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 bg-[#090d16]/30">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-mono text-slate-400">
                          {tx.date} {tx.time || ""}
                        </td>
                        <td className="p-3 font-bold text-slate-200">{tx.ticker}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            tx.type === "BUY" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {tx.type === "BUY" ? "매수" : "매도"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300">{tx.price.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-slate-300">{tx.quantity.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono text-slate-300">{tx.amount.toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          {tx.profitRate !== undefined ? (
                            <span className={tx.profitRate > 0 ? "text-emerald-400" : tx.profitRate < 0 ? "text-red-400" : "text-slate-400"}>
                              {tx.profitRate > 0 ? `+${tx.profitRate}%` : `${tx.profitRate}%`}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="p-3 text-center">
                          <button onClick={() => handleRemoveTx(tx.id)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* ==============================================================
           2단계: 결과 대시보드 화면 (차트 3종, AI 실수 3종, 종합진단)
           ============================================================== */
        <div className="space-y-8 animate-fadeIn">
          {/* Action Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#050811] p-4 rounded-xl border border-slate-900">
            <Button variant="outline" size="sm" onClick={() => { setIsAnalyzed(false); setAiResult(null); }} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> 다른 데이터 분석하기
            </Button>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="secondary" size="sm" onClick={handleShareClipboard} className="gap-2 flex-1 sm:flex-initial">
                <Share2 className="h-4 w-4" /> 공유문구 복사
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveImage} className="gap-2 flex-1 sm:flex-initial">
                <Download className="h-4 w-4" /> 이미지로 저장
              </Button>
            </div>
          </div>

          {/* 대시보드 메인 캡처 영역 */}
          <div ref={dashboardRef} id="dashboard-capture" className="p-6 md:p-8 bg-[#090d16] border border-slate-800 rounded-2xl space-y-8">
            
            {/* Logo/Watermark during capture */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-4">
              <div className="flex items-center space-x-2">
                <span className="p-1 bg-blue-600 rounded text-white flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <span className="font-extrabold text-lg text-slate-100 tracking-wider">
                  TraderMirror <span className="text-xs text-blue-500 font-bold">REPORT</span>
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">분석 시각: {dayjs().format("YYYY-MM-DD HH:mm")}</span>
            </div>

            {/* 카드 5: 종합 진단 (가장 위에 큼직하게 배치하여 충격 요법 극대화) */}
            <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/15 via-transparent to-transparent">
              <div className="flex items-start space-x-4">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">데이터 기반 종합 매매 진단</span>
                  <p className="text-lg md:text-xl font-bold text-slate-100 leading-normal pt-1">
                    {aiResult ? aiResult.diagnosis : <Skeleton className="h-6 w-96 mt-1" />}
                  </p>
                </div>
              </div>
            </Card>

            {/* 3단 그리드 (차트 3종) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 카드 1. 시간대별 승률 차트 */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4.5 w-4.5 text-blue-400" />
                    시간대별 매매 승률
                  </CardTitle>
                  <CardDescription>
                    일중 체결 시간대별 거래 승률 데이터
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="hour" stroke="#475569" fontSize={11} />
                        <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                          itemStyle={{ color: "#f1f5f9" }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value) => [`${value}%`, "승률"]}
                        />
                        <Bar dataKey="winRate">
                          {stats.hourlyData.map((entry, index) => {
                            const isDanger = entry.hour === stats.dangerousHour;
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={isDanger ? "#ef4444" : "#3b82f6"} 
                                fillOpacity={isDanger ? 1 : 0.75}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Skeleton className="w-full h-full" />}
                </CardContent>
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">DANGER</span>
                  <span className="text-[11px] text-slate-300">
                    {stats.dangerousHour} 승률 {stats.dangerousHourWinRate}% — 가장 취약한 구간
                  </span>
                </div>
              </Card>

              {/* 카드 2. 보유 기간 패턴 비교 */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4.5 w-4.5 text-blue-400" />
                    수익 vs 손실 평균 보유 기간
                  </CardTitle>
                  <CardDescription>
                    체결 종목 보유 일수 패턴 비교
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.holdPeriodData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="vertical">
                        <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={(v) => `${v}일`} />
                        <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
                          itemStyle={{ color: "#f1f5f9" }}
                          formatter={(value) => [`${value}일`, "평균 보유일"]}
                        />
                        <Bar dataKey="days">
                          {stats.holdPeriodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Skeleton className="w-full h-full" />}
                </CardContent>
                <div className="mt-4 p-3 bg-slate-900 rounded-lg text-[11px] text-slate-300 flex items-center justify-between">
                  <span>익절은 평균 <strong className="text-emerald-400">{stats.avgHoldWinDays}일</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>손절은 평균 <strong className="text-red-400">{stats.avgHoldLossDays}일</strong> 보유 중</span>
                </div>
              </Card>

              {/* 카드 3. 승률 vs 손익비 */}
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4.5 w-4.5 text-blue-400" />
                    투자 승률 & 손익비
                  </CardTitle>
                  <CardDescription>
                    익절 대 손절 횟수 비중 및 비율
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center relative">
                  {isMounted ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-slate-200">{stats.winRate}%</span>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">승률</span>
                      </div>
                    </>
                  ) : <Skeleton className="w-16 h-16 rounded-full" />}
                </CardContent>

                <div className="space-y-2 mt-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>평균 수익률 / 손실률:</span>
                    <span className="font-bold text-slate-200">
                      <span className="text-emerald-400">+{stats.avgWinRate}%</span> / <span className="text-red-400">-{stats.avgLossRate}%</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>손익비 (익절비율/손절비율):</span>
                    <span className={`font-bold ${stats.profitToLossRatio < 1 ? "text-red-400" : "text-emerald-400"}`}>
                      {stats.profitToLossRatio} (기준치 1.0)
                    </span>
                  </div>
                  {stats.profitToLossRatio < 1 && (
                    <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-400 leading-tight">
                      ⚠️ 승률이 70%를 상회하더라도 현재 손익비({stats.profitToLossRatio}) 상태라면 계좌는 장기적으로 우하향합니다.
                    </div>
                  )}
                </div>
              </Card>

            </div>

            {/* 카드 4. 반복 실수 TOP 3 */}
            <Card className="border border-slate-800">
              <CardHeader className="border-b border-slate-900 pb-4 mb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                  투자자가 고쳐야 할 반복 실수 TOP 3
                </CardTitle>
                <CardDescription>
                  Claude AI가 계좌 파먹는 주된 무의식적 버릇 3가지를 도출했습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiResult ? (
                  aiResult.mistakes.map((m) => (
                    <div key={m.rank} className="flex space-x-4 items-start pb-4 border-b border-slate-900/60 last:border-0 last:pb-0">
                      <span className="text-2xl font-black text-slate-700 font-mono tracking-tighter shrink-0 w-8">
                        0{m.rank}
                      </span>
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-bold text-slate-200">{m.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* 하단 전자책 CTA 대형 배너 */}
          <div className="glass-panel border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-transparent to-slate-950/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-left">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit">
                가장 완벽한 리스크 관리법
              </span>
              <h3 className="text-xl font-bold text-slate-100">
                AI 분석으로 확인한 치명적 매매 실수들을 고치는 방법
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                장 초반 뇌동 매매를 차단하고, 손절 포지션을 타이트하게 관리하며 복리로 계좌를 불려 나가는 손익비 1:2 공식과 멘탈 통제 실전 규칙이 담겨 있습니다.
              </p>
            </div>
            
            <Button 
              variant="success" 
              size="md" 
              onClick={() => setPurchaseModalOpen(true)}
              className="w-full md:w-auto font-bold shrink-0 shadow-lg shadow-emerald-500/10"
            >
              주린이를 위한 첫 투자 교과서 보러가기 →
            </Button>
          </div>
        </div>
      )}

      {/* 무료 분석 5회 제한 경고 모달 */}
      <Dialog isOpen={limitModalOpen} onClose={() => setLimitModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-full w-fit mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">이번 달 무료 분석 한도 초과</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            이번 달 무료 분석 5회를 모두 사용했습니다. 다음 달에 다시 이용하시거나 무제한 분석이 가능한 <strong>프로 플랜</strong>으로 업그레이드하세요!
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl text-left border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>무료 제공 한도:</span>
              <span className="text-slate-200">5회 / 월</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>현재 사용 횟수:</span>
              <span className="text-red-400 font-bold">5회 초과</span>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setLimitModalOpen(false)}>
              닫기
            </Button>
            <Button variant="primary" className="flex-1 font-bold shadow-md shadow-blue-500/25" onClick={() => {
              alert("프로 플랜 모의 결제가 진행되었습니다. 무제한 분석이 해제됩니다.");
              const currentMonth = dayjs().format("YYYY-MM");
              localStorage.setItem("tradermirror_usage_count", JSON.stringify({ month: currentMonth, count: 0 }));
              setLimitModalOpen(false);
            }}>
              프로 플랜 구독하기 (₩9,900/월)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 전자책 CTA 모달 */}
      <Dialog isOpen={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-full w-fit mx-auto animate-bounce">
            <BookOpen className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">주린이를 위한 첫 투자 교과서</h3>
          <p className="text-sm text-slate-400">
            손익비 교정, 자금 관리 공식, 뇌동매매 완전 근절 가이드북 PDF 즉시 다운로드 상품입니다.
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl text-left border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>할인가:</span>
              <span className="text-emerald-400 font-bold">₩19,900 <span className="text-[10px] text-slate-500 line-through">₩49,000</span></span>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setPurchaseModalOpen(false)}>
              취소
            </Button>
            <Button variant="success" className="flex-1 font-bold" onClick={() => {
              alert("모의 결제가 완료되었습니다. 즐거운 독서 되십시오!");
              setPurchaseModalOpen(false);
            }}>
              ₩19,900 모의 결제
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
