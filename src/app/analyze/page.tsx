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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Filter
} from "lucide-react";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Dialog, Skeleton, Toggle } from "@/components/ui";
import { parseTradingJournal, fillMissingProfitRates, Transaction } from "@/utils/parser";
import { createClient } from "@/lib/supabase/client";

// ─── 확장 트랜잭션 타입 ────────────────────────────────────────────────────────
interface ExtendedTransaction extends Transaction {
  assetType?: string;
  entryReason?: string[];
  emotion?: string;
  principleFollowed?: string;
  stopLossBasis?: string;
  direction?: string;
  profitLoss?: number;
  profitLossKrw?: number;
  exchange?: string;
  sector?: string;
  leverage?: number;
  marginMode?: string;
  overtrading?: string;
  btcDirection?: string;
  exitReason?: string;
  tradeType?: string;
}

interface AIAnalysisResult {
  mistakes: {
    rank: number;
    title: string;
    description: string;
  }[];
  diagnosis: string;
}

interface AnalysisContext {
  source: "text_paste" | "journal";
  assetType?: string;
  period?: string;
  count?: number;
}

// ─── 샘플 데이터 ──────────────────────────────────────────────────────────────
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

// ─── 레이블 헬퍼 ──────────────────────────────────────────────────────────────
const ASSET_TYPE_LABEL: Record<string, string> = {
  all: "전체",
  stock_spot: "주식 현물",
  stock_futures: "주식 선물",
  crypto_spot: "코인 현물",
  crypto_futures: "코인 선물"
};

const PERIOD_LABEL: Record<string, string> = {
  today: "오늘",
  current_month: "이번 달",
  all: "전체",
  custom: "직접 기간 선택"
};

// ─── Supabase에서 매매일지 데이터 가져오기 ───────────────────────────────────
async function fetchJournalTrades(filters: {
  assetType: string;
  period: string;
  startDate?: string;
  endDate?: string;
}): Promise<ExtendedTransaction[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase.from("trades").select("*").eq("user_id", user.id);

  if (filters.assetType !== "all") {
    query = query.eq("asset_type", filters.assetType);
  }

  const today = new Date();
  if (filters.period === "today") {
    const todayStr = today.toISOString().split("T")[0];
    query = query.gte("trade_date", todayStr);
  } else if (filters.period === "current_month") {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    query = query.gte("trade_date", firstDay);
  } else if (filters.period === "custom" && filters.startDate) {
    query = query.gte("trade_date", filters.startDate);
    if (filters.endDate) query = query.lte("trade_date", filters.endDate);
  }

  const { data } = await query.order("trade_date", { ascending: true });
  if (!data || data.length === 0) return [];

  return data.map((t: any) => ({
    id: t.id,
    date: t.trade_date,
    time: t.entry_datetime
      ? new Date(t.entry_datetime).toTimeString().slice(0, 8)
      : undefined,
    ticker: t.ticker,
    type: "SELL" as const,
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
    tradeType: t.trade_type
  }));
}

// ─── 아코디언 컴포넌트 ────────────────────────────────────────────────────────
function AccordionSection({
  title,
  isOpen,
  onToggle,
  children
}: {
  title: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-slate-800">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left"
      >
        <span className="text-base font-bold text-slate-200">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
        )}
      </button>
      {isOpen && <div className="mt-4">{children}</div>}
    </Card>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function AnalyzePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // 분석 방식 선택
  const [analysisSource, setAnalysisSource] = useState<"text_paste" | "journal">("text_paste");

  // 매매일지 필터
  const [journalAssetType, setJournalAssetType] = useState("all");
  const [journalPeriod, setJournalPeriod] = useState("all");
  const [journalStartDate, setJournalStartDate] = useState("");
  const [journalEndDate, setJournalEndDate] = useState("");
  const [analysisContext, setAnalysisContext] = useState<AnalysisContext | null>(null);
  const [noDataFound, setNoDataFound] = useState(false);

  // 아코디언 상태
  const [entryReasonOpen, setEntryReasonOpen] = useState(false);
  const [principleOpen, setPrincipleOpen] = useState(false);
  const [emotionOpen, setEmotionOpen] = useState(false);
  const [stopLossOpen, setStopLossOpen] = useState(false);
  const [assetTypeOpen, setAssetTypeOpen] = useState(false);
  const [assetDetailOpen, setAssetDetailOpen] = useState(false);

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
    holdPeriodData: [] as any[],
    // 확장 통계
    totalTrades: 0,
    totalPnl: 0,
    avgReturnRate: 0,
    totalKrwPnl: 0,
    maxWinTrade: null as ExtendedTransaction | null,
    maxLossTrade: null as ExtendedTransaction | null,
    entryReasonStats: [] as { reason: string; count: number; winRate: number; avgReturn: number }[],
    principleStats: [] as { label: string; count: number; winRate: number; avgReturn: number }[],
    emotionStats: [] as { emotion: string; count: number; winRate: number; avgReturn: number }[],
    stopLossStats: {
      withStop: { count: 0, winRate: 0, avgReturn: 0 },
      withoutStop: { count: 0, winRate: 0, avgReturn: 0 }
    } as { withStop: { count: number; winRate: number; avgReturn: number }; withoutStop: { count: number; winRate: number; avgReturn: number } },
    assetTypeStats: [] as {
      assetType: string;
      label: string;
      count: number;
      winRate: number;
      totalPnl: number;
      avgReturn: number;
    }[]
  });

  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ─── 통계 계산 ──────────────────────────────────────────────────────────────
  const calculateMetrics = (txs: ExtendedTransaction[]) => {
    if (txs.length === 0) return;

    const sells = txs.filter(t => t.type === "SELL");
    const buys = txs.filter(t => t.type === "BUY");
    const totalSells = sells.length;

    let wins = 0;
    let losses = 0;
    let winProfitSum = 0;
    let lossProfitSum = 0;
    let totalPnlSum = 0;
    let totalKrwPnlSum = 0;
    let returnRateSum = 0;

    const hourlyMap: Record<number, { total: number; win: number }> = {};
    for (let h = 9; h <= 15; h++) {
      hourlyMap[h] = { total: 0, win: 0 };
    }

    const buyPool: Record<string, { date: string; qty: number }[]> = {};
    buys.forEach(b => {
      if (!buyPool[b.ticker]) buyPool[b.ticker] = [];
      buyPool[b.ticker].push({ date: b.date, qty: b.quantity });
    });

    let holdWinDaysTotal = 0;
    let holdWinCount = 0;
    let holdLossDaysTotal = 0;
    let holdLossCount = 0;

    let maxWinTrade: ExtendedTransaction | null = null;
    let maxLossTrade: ExtendedTransaction | null = null;

    // 진입 근거별
    const entryReasonMap: Record<string, { total: number; wins: number; returnSum: number }> = {};
    // 원칙 준수별
    const principleMap: Record<string, { total: number; wins: number; returnSum: number }> = {};
    // 감정별
    const emotionMap: Record<string, { total: number; wins: number; returnSum: number }> = {};
    // 손절 기준별
    const stopLossMap = {
      with: { total: 0, wins: 0, returnSum: 0 },
      without: { total: 0, wins: 0, returnSum: 0 }
    };
    // 자산 유형별
    const assetTypeMap: Record<string, { total: number; wins: number; returnSum: number; pnlSum: number }> = {};

    sells.forEach(s => {
      const profitRate = s.profitRate !== undefined ? s.profitRate : 0;
      const isWin = profitRate > 0;
      const pnl = (s as ExtendedTransaction).profitLoss ?? (profitRate / 100) * s.amount;
      const krwPnl = (s as ExtendedTransaction).profitLossKrw ?? 0;

      totalPnlSum += pnl;
      totalKrwPnlSum += krwPnl;
      returnRateSum += profitRate;

      if (isWin) {
        wins++;
        winProfitSum += profitRate;
        if (!maxWinTrade || profitRate > (maxWinTrade.profitRate ?? 0)) {
          maxWinTrade = s;
        }
      } else {
        losses++;
        lossProfitSum += Math.abs(profitRate);
        if (!maxLossTrade || profitRate < (maxLossTrade.profitRate ?? 0)) {
          maxLossTrade = s;
        }
      }

      if (s.time) {
        const hour = parseInt(s.time.split(":")[0]);
        if (hour >= 9 && hour <= 15) {
          hourlyMap[hour].total++;
          if (isWin) hourlyMap[hour].win++;
        }
      }

      const bList = buyPool[s.ticker];
      if (bList && bList.length > 0) {
        let remainingSellQty = s.quantity;
        let totalHoldDays = 0;
        let matchedQtyForHold = 0;
        while (remainingSellQty > 0 && bList.length > 0) {
          const matchingBuy = bList[0];
          const takeQty = Math.min(remainingSellQty, matchingBuy.qty);
          const diff = Math.max(0, dayjs(s.date).diff(dayjs(matchingBuy.date), "day"));
          totalHoldDays += diff * takeQty;
          matchedQtyForHold += takeQty;
          remainingSellQty -= takeQty;
          matchingBuy.qty -= takeQty;
          if (matchingBuy.qty <= 0) bList.shift();
        }
        if (matchedQtyForHold > 0) {
          const avg = totalHoldDays / matchedQtyForHold;
          if (isWin) { holdWinDaysTotal += avg; holdWinCount++; }
          else { holdLossDaysTotal += avg; holdLossCount++; }
        }
      }

      // 진입 근거별 집계
      const reasons = (s as ExtendedTransaction).entryReason || [];
      if (reasons.length > 0) {
        reasons.forEach(r => {
          if (!entryReasonMap[r]) entryReasonMap[r] = { total: 0, wins: 0, returnSum: 0 };
          entryReasonMap[r].total++;
          if (isWin) entryReasonMap[r].wins++;
          entryReasonMap[r].returnSum += profitRate;
        });
      }

      // 원칙 준수별 집계
      const principle = (s as ExtendedTransaction).principleFollowed;
      if (principle) {
        if (!principleMap[principle]) principleMap[principle] = { total: 0, wins: 0, returnSum: 0 };
        principleMap[principle].total++;
        if (isWin) principleMap[principle].wins++;
        principleMap[principle].returnSum += profitRate;
      }

      // 감정별 집계
      const emotion = (s as ExtendedTransaction).emotion;
      if (emotion) {
        if (!emotionMap[emotion]) emotionMap[emotion] = { total: 0, wins: 0, returnSum: 0 };
        emotionMap[emotion].total++;
        if (isWin) emotionMap[emotion].wins++;
        emotionMap[emotion].returnSum += profitRate;
      }

      // 손절 기준별 집계
      const stopBasis = (s as ExtendedTransaction).stopLossBasis;
      if (stopBasis && stopBasis.trim()) {
        stopLossMap.with.total++;
        if (isWin) stopLossMap.with.wins++;
        stopLossMap.with.returnSum += profitRate;
      } else {
        stopLossMap.without.total++;
        if (isWin) stopLossMap.without.wins++;
        stopLossMap.without.returnSum += profitRate;
      }

      // 자산 유형별 집계
      const at = (s as ExtendedTransaction).assetType || "unknown";
      if (!assetTypeMap[at]) assetTypeMap[at] = { total: 0, wins: 0, returnSum: 0, pnlSum: 0 };
      assetTypeMap[at].total++;
      if (isWin) assetTypeMap[at].wins++;
      assetTypeMap[at].returnSum += profitRate;
      assetTypeMap[at].pnlSum += pnl;
    });

    const hourlyData = Object.keys(hourlyMap).map(hKey => {
      const h = parseInt(hKey);
      const d = hourlyMap[h];
      return {
        hour: `${h}시`,
        winRate: d.total > 0 ? Math.round((d.win / d.total) * 100) : 0,
        total: d.total
      };
    });

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
    if (!foundActiveHour) { dangerHour = "오전 9시"; minWinRate = 35; }

    const winRate = totalSells > 0 ? Math.round((wins / totalSells) * 100) : 0;
    const avgWinRate = wins > 0 ? winProfitSum / wins : 0;
    const avgLossRate = losses > 0 ? lossProfitSum / losses : 0;
    const profitToLossRatio = avgLossRate > 0 ? avgWinRate / avgLossRate : 0;
    const avgHoldWinDays = holdWinCount > 0 ? parseFloat((holdWinDaysTotal / holdWinCount).toFixed(1)) : 1.0;
    const avgHoldLossDays = holdLossCount > 0 ? parseFloat((holdLossDaysTotal / holdLossCount).toFixed(1)) : 12.5;

    // 진입 근거 통계
    const entryReasonStats = Object.entries(entryReasonMap).map(([reason, v]) => ({
      reason,
      count: v.total,
      winRate: Math.round((v.wins / v.total) * 100),
      avgReturn: parseFloat((v.returnSum / v.total).toFixed(2))
    })).sort((a, b) => b.avgReturn - a.avgReturn);

    // 원칙 준수 통계
    const principleOrder = ["완전히지킴", "일부지킴", "안지킴"];
    const principleStats = principleOrder
      .filter(k => principleMap[k])
      .map(k => ({
        label: k,
        count: principleMap[k].total,
        winRate: Math.round((principleMap[k].wins / principleMap[k].total) * 100),
        avgReturn: parseFloat((principleMap[k].returnSum / principleMap[k].total).toFixed(2))
      }));
    // 데이터에 없으면 모든 원칙 항목 포함
    if (principleStats.length === 0) {
      Object.entries(principleMap).forEach(([k, v]) => {
        principleStats.push({
          label: k,
          count: v.total,
          winRate: Math.round((v.wins / v.total) * 100),
          avgReturn: parseFloat((v.returnSum / v.total).toFixed(2))
        });
      });
    }

    // 감정 통계
    const emotionStats = Object.entries(emotionMap).map(([emotion, v]) => ({
      emotion,
      count: v.total,
      winRate: Math.round((v.wins / v.total) * 100),
      avgReturn: parseFloat((v.returnSum / v.total).toFixed(2))
    })).sort((a, b) => b.avgReturn - a.avgReturn);

    // 손절 기준 통계
    const stopLossStats = {
      withStop: {
        count: stopLossMap.with.total,
        winRate: stopLossMap.with.total > 0 ? Math.round((stopLossMap.with.wins / stopLossMap.with.total) * 100) : 0,
        avgReturn: stopLossMap.with.total > 0 ? parseFloat((stopLossMap.with.returnSum / stopLossMap.with.total).toFixed(2)) : 0
      },
      withoutStop: {
        count: stopLossMap.without.total,
        winRate: stopLossMap.without.total > 0 ? Math.round((stopLossMap.without.wins / stopLossMap.without.total) * 100) : 0,
        avgReturn: stopLossMap.without.total > 0 ? parseFloat((stopLossMap.without.returnSum / stopLossMap.without.total).toFixed(2)) : 0
      }
    };

    // 자산 유형별 통계
    const assetTypeStats = Object.entries(assetTypeMap).map(([at, v]) => ({
      assetType: at,
      label: ASSET_TYPE_LABEL[at] || at,
      count: v.total,
      winRate: Math.round((v.wins / v.total) * 100),
      totalPnl: parseFloat(v.pnlSum.toFixed(0)),
      avgReturn: parseFloat((v.returnSum / v.total).toFixed(2))
    }));

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
      ],
      totalTrades: totalSells,
      totalPnl: parseFloat(totalPnlSum.toFixed(0)),
      avgReturnRate: totalSells > 0 ? parseFloat((returnRateSum / totalSells).toFixed(2)) : 0,
      totalKrwPnl: parseFloat(totalKrwPnlSum.toFixed(0)),
      maxWinTrade,
      maxLossTrade,
      entryReasonStats,
      principleStats,
      emotionStats,
      stopLossStats,
      assetTypeStats
    });
  };

  // ─── 분석 핸들러 ────────────────────────────────────────────────────────────
  const handleAnalyze = async (txList: ExtendedTransaction[]) => {
    if (txList.length === 0) {
      alert("거래 내역을 먼저 입력해 주세요.");
      return;
    }

    const usageKey = "tradermirror_trial_start";
    const stored = localStorage.getItem(usageKey);
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    if (!stored) {
      localStorage.setItem(usageKey, String(now));
    } else {
      const startTime = Number(stored);
      if (now - startTime > SEVEN_DAYS_MS) {
        setLimitModalOpen(true);
        return;
      }
    }

    setIsLoading(true);
    const filledTxs = fillMissingProfitRates(txList) as ExtendedTransaction[];
    setTransactions(filledTxs);
    calculateMetrics(filledTxs);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: filledTxs })
      });
      if (!response.ok) throw new Error("분석 API 호출 실패");
      const aiData = await response.json();
      setAiResult(aiData);
      setIsAnalyzed(true);
    } catch (err) {
      console.error(err);
      alert("AI 분석 도중 문제가 발생했습니다. 임시 분석 결과를 표출합니다.");
      setIsAnalyzed(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── 매매일지 분석 핸들러 ─────────────────────────────────────────────────
  const handleJournalAnalyze = async (period: string, assetType?: string) => {
    const at = assetType || journalAssetType;
    const trades = await fetchJournalTrades({
      assetType: at,
      period,
      startDate: journalStartDate,
      endDate: journalEndDate
    });
    if (trades.length === 0) {
      setNoDataFound(true);
      return;
    }
    setNoDataFound(false);
    setAnalysisContext({ source: "journal", assetType: at, period, count: trades.length });
    handleAnalyze(trades);
  };

  // ─── 텍스트 파싱 ──────────────────────────────────────────────────────────
  const handleParseText = () => {
    const parsed = parseTradingJournal(inputText) as ExtendedTransaction[];
    if (parsed.length === 0) {
      alert("거래 데이터를 해석하지 못했습니다. 형식을 확인하거나 직접 입력 폼을 이용해 주세요.");
      setShowManualForm(true);
    } else {
      setTransactions(parsed);
      setAnalysisContext({ source: "text_paste" });
      handleAnalyze(parsed);
    }
  };

  // ─── 수동 입력 ─────────────────────────────────────────────────────────────
  const handleAddManualTx = () => {
    if (!manualTx.ticker || !manualTx.price || !manualTx.quantity) {
      alert("종목명, 가격, 수량을 올바르게 입력해 주세요.");
      return;
    }
    const priceNum = parseFloat(manualTx.price.replace(/,/g, ""));
    const qtyNum = parseFloat(manualTx.quantity.replace(/,/g, ""));
    const pRate = manualTx.profitRate ? parseFloat(manualTx.profitRate) : undefined;
    const newTx: ExtendedTransaction = {
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
    setManualTx({ ...manualTx, ticker: "", price: "", quantity: "", profitRate: "" });
  };

  const sRateCalculate = (type: "BUY" | "SELL", price: number, qty: number, rate?: number) => {
    if (type === "BUY") return undefined;
    if (rate !== undefined) return rate;
    return 0;
  };

  const handleRemoveTx = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_JOURNAL);
    setShowManualForm(false);
  };

  const handleSaveImage = () => {
    if (!dashboardRef.current) return;
    html2canvas(dashboardRef.current, {
      backgroundColor: "#090d16",
      scale: 2,
      logging: false,
      useCORS: true
    }).then(canvas => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `TraderMirror_매매분석_${dayjs().format("YYYYMMDD")}.png`;
      link.click();
    });
  };

  const handleShareClipboard = () => {
    const mainMistake = aiResult?.mistakes?.[0]?.title || "수익률 뇌동 매매";
    const text = `🔥 내 최대 투자 실수: [ ${mainMistake} ] 😭\nTraderMirror에서 내 거래 내역을 분석해봤더니 충격적인 결과가...\n👉 지금 무료로 투자 유형과 반복되는 실수를 진단해 보세요! https://tradermirror.com`;
    navigator.clipboard.writeText(text).then(() => {
      alert("공유 문구가 클립보드에 복사되었습니다! SNS나 단톡방에 붙여넣어 공유하세요.");
    }).catch(err => console.error("클립보드 복사 실패", err));
  };

  const pieData = [
    { name: "익절", value: stats.profitCount || 1, color: "#10b981" },
    { name: "손절", value: stats.lossCount || 1, color: "#ef4444" }
  ];

  // ─── 도우미: 잘한점/문제점 계산 ──────────────────────────────────────────
  const getStrength = () => {
    if (stats.winRate >= 60) return "승률이 60%를 넘어 수익 거래가 더 많습니다.";
    if (stats.avgHoldWinDays < stats.avgHoldLossDays) return "수익 거래는 평균 보유 기간이 짧아 빠른 수익 실현은 잘하고 있습니다.";
    if (stats.profitToLossRatio >= 1) return "손익비가 1.0을 상회하며 수익 대비 손실 관리가 되고 있습니다.";
    return "분석 데이터를 꾸준히 기록하고 있어 패턴 파악의 기반이 갖춰져 있습니다.";
  };

  const getWeakness = () => {
    if (stats.avgHoldLossDays > stats.avgHoldWinDays * 1.5) return "손실 거래의 평균 보유 기간이 수익 거래보다 길어 손절 지연 문제가 반복되고 있습니다.";
    if (stats.profitToLossRatio < 1) return "손익비가 1.0 미만으로 장기적으로 계좌 우하향 가능성이 높습니다.";
    if (stats.winRate < 40) return "전체 승률이 40% 미만으로 진입 근거를 더 엄격하게 적용할 필요가 있습니다.";
    return "수익 거래와 손실 거래의 균형을 더 개선할 여지가 있습니다.";
  };

  const isJournalMode = analysisContext?.source === "journal";

  // ─── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center space-x-2 mb-8">
        <Link href="/" className="p-2 hover:bg-slate-800/60 rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">매매 패턴 분석기</h1>
          <p className="text-xs text-slate-400">
            거래내역을 직접 붙여넣거나, 매일 기록한 매매일지를 불러와 나의 매매 습관을 분석할 수 있습니다.
          </p>
        </div>
      </div>

      {!isAnalyzed ? (
        /* ====================================================================
           1단계: 입력 화면
           ==================================================================== */
        <div className="space-y-6">
          {/* 분석 방식 탭 */}
          <div className="flex bg-[#050811] border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setAnalysisSource("text_paste"); setNoDataFound(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                analysisSource === "text_paste"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Upload className="h-4 w-4" />
              거래내역 붙여넣기
            </button>
            <button
              onClick={() => { setAnalysisSource("journal"); setNoDataFound(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                analysisSource === "journal"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="h-4 w-4" />
              내 매매일지 불러오기
            </button>
          </div>

          {/* ── 텍스트 붙여넣기 모드 ── */}
          {analysisSource === "text_paste" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-blue-500" />
                      거래내역 텍스트 붙여넣기
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      증권사 HTS/MTS 또는 거래소에서 조회한 체결 내역을 복사해 붙여넣어 주세요.
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLoadSample} className="text-xs shrink-0">
                    샘플 데이터 로드
                  </Button>
                </div>

                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={`키움증권, 미래에셋, 삼성증권 등 거래내역을 복사해 붙여넣으세요.\n(예시)\n2026.05.10 09:12:05 삼성전자 매수 78,500원 100주\n2026.05.10 09:45:00 삼성전자 매도 68,200원 100주 -13.12%`}
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
                      <><Loader2 className="h-4 w-4 animate-spin" /> AI 분석 중...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> 패턴 분석하기</>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-950/15 to-transparent border-blue-900/30">
                  <h3 className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    분석 시 주의사항
                  </h3>
                  <ul className="text-xs text-slate-400 space-y-2 mt-4 leading-relaxed list-disc pl-4">
                    <li>시간대별 승률 분석을 위해 거래 시분초 정보가 함께 입력되는 것이 좋습니다.</li>
                    <li>정확한 포지션 보유 기간을 위해 <strong>동일한 종목의 매수와 매도 내역</strong>이 한 쌍으로 존재해야 합니다.</li>
                    <li>무료 버전은 브라우저 세션당 7일 무료 분석이 적용됩니다.</li>
                  </ul>
                </Card>

                {showManualForm && (
                  <Card className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-200">단일 거래 내역 추가</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-slate-400 block mb-1">날짜</label>
                        <input type="date" value={manualTx.date} onChange={e => setManualTx({ ...manualTx, date: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">시간</label>
                        <input type="time" value={manualTx.time} onChange={e => setManualTx({ ...manualTx, time: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-slate-400 block mb-1">종목명</label>
                        <input type="text" placeholder="삼성전자 / BTC" value={manualTx.ticker} onChange={e => setManualTx({ ...manualTx, ticker: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-slate-400 block mb-1">구분</label>
                        <Toggle checked={manualTx.type === "SELL"} onChange={checked => setManualTx({ ...manualTx, type: checked ? "SELL" : "BUY" })} labelLeft="매수 (BUY)" labelRight="매도 (SELL)" className="w-full" />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">체결 단가</label>
                        <input type="text" placeholder="78,500" value={manualTx.price} onChange={e => setManualTx({ ...manualTx, price: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">수량</label>
                        <input type="text" placeholder="10" value={manualTx.quantity} onChange={e => setManualTx({ ...manualTx, quantity: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                      </div>
                      {manualTx.type === "SELL" && (
                        <div className="col-span-2">
                          <label className="text-slate-400 block mb-1">수익률 (%) - 생략 가능</label>
                          <input type="text" placeholder="2.5" value={manualTx.profitRate} onChange={e => setManualTx({ ...manualTx, profitRate: e.target.value })} className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2" />
                        </div>
                      )}
                    </div>
                    <Button variant="secondary" className="w-full text-xs font-bold gap-1" onClick={handleAddManualTx}>
                      <Plus className="h-4 w-4" /> 거래 리스트에 추가
                    </Button>
                  </Card>
                )}
              </div>

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
                        {transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-slate-900/40">
                            <td className="p-3 font-mono text-slate-400">{tx.date} {tx.time || ""}</td>
                            <td className="p-3 font-bold text-slate-200">{tx.ticker}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded font-bold ${tx.type === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
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
          )}

          {/* ── 매매일지 불러오기 모드 ── */}
          {analysisSource === "journal" && (
            <div className="space-y-6">
              <Card className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-1">
                    <Database className="h-5 w-5 text-blue-500" />
                    내 매매일지에서 불러오기
                  </h3>
                  <p className="text-xs text-slate-400">
                    자산 유형과 기간만 선택하면 기록해둔 매매일지를 기준으로 자동 분석합니다.
                  </p>
                </div>

                {/* 빠른 분석 버튼 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => { setJournalPeriod("today"); handleJournalAnalyze("today", "all"); }}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-1 py-5 px-4 rounded-xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 transition-all text-blue-300 font-bold text-sm disabled:opacity-50"
                  >
                    <Clock className="h-6 w-6 mb-1" />
                    오늘 매매패턴 분석하기
                    <span className="text-[11px] font-normal text-blue-400/70">오늘 기록된 매매일지</span>
                  </button>
                  <button
                    onClick={() => { setJournalPeriod("current_month"); handleJournalAnalyze("current_month", "all"); }}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-1 py-5 px-4 rounded-xl bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 transition-all text-emerald-300 font-bold text-sm disabled:opacity-50"
                  >
                    <CalendarDays className="h-6 w-6 mb-1" />
                    이번 달 매매패턴 분석하기
                    <span className="text-[11px] font-normal text-emerald-400/70">이번 달 기록된 매매일지</span>
                  </button>
                  <button
                    onClick={() => { setJournalPeriod("all"); handleJournalAnalyze("all", "all"); }}
                    disabled={isLoading}
                    className="flex flex-col items-center justify-center gap-1 py-5 px-4 rounded-xl bg-purple-600/10 border border-purple-500/30 hover:bg-purple-600/20 transition-all text-purple-300 font-bold text-sm disabled:opacity-50"
                  >
                    <TrendingUp className="h-6 w-6 mb-1" />
                    총 매매패턴 분석하기
                    <span className="text-[11px] font-normal text-purple-400/70">전체 매매일지</span>
                  </button>
                </div>

                {/* 직접 조건 선택 */}
                <div className="border-t border-slate-800 pt-5">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-4">
                    <Filter className="h-4 w-4 text-slate-400" />
                    직접 조건 선택
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* 자산 유형 선택 */}
                    <div>
                      <label className="text-xs text-slate-400 font-semibold block mb-2">자산 유형</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(ASSET_TYPE_LABEL).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => setJournalAssetType(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              journalAssetType === val
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 매매기간 선택 */}
                    <div>
                      <label className="text-xs text-slate-400 font-semibold block mb-2">매매 기간</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PERIOD_LABEL).map(([val, label]) => (
                          <button
                            key={val}
                            onClick={() => setJournalPeriod(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              journalPeriod === val
                                ? "bg-blue-600 text-white"
                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 직접 기간 선택 시 날짜 입력 */}
                  {journalPeriod === "custom" && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">시작일</label>
                        <input
                          type="date"
                          value={journalStartDate}
                          onChange={e => setJournalStartDate(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded-lg border border-slate-800 p-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">종료일</label>
                        <input
                          type="date"
                          value={journalEndDate}
                          onChange={e => setJournalEndDate(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded-lg border border-slate-800 p-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => handleJournalAnalyze(journalPeriod)}
                    disabled={isLoading}
                    className="w-full mt-5 gap-2 font-bold"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> 분석 중...</>
                    ) : (
                      <><Sparkles className="h-4 w-4" /> 선택한 조건으로 분석하기</>
                    )}
                  </Button>
                </div>
              </Card>

              {/* 데이터 없음 */}
              {noDataFound && (
                <Card className="bg-gradient-to-r from-amber-950/15 via-transparent to-transparent border-amber-800/30 text-center py-8 space-y-4">
                  <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
                  <p className="text-sm text-slate-300">
                    선택한 조건에 해당하는 매매일지가 없습니다.<br />
                    기간을 변경하거나 매매일지를 먼저 작성해 주세요.
                  </p>
                  <Link href="/journal">
                    <Button variant="secondary" size="sm" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      매매일지 작성하러 가기
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ====================================================================
           2단계: 결과 대시보드
           ==================================================================== */
        <div className="space-y-8 animate-fadeIn">
          {/* 액션 헤더 */}
          <div className="flex flex-wrap justify-between items-center gap-4 bg-[#050811] p-4 rounded-xl border border-slate-900">
            <Button variant="outline" size="sm" onClick={() => { setIsAnalyzed(false); setAiResult(null); setNoDataFound(false); }} className="gap-1">
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

          {/* 대시보드 캡처 영역 */}
          <div ref={dashboardRef} id="dashboard-capture" className="p-6 md:p-8 bg-[#090d16] border border-slate-800 rounded-2xl space-y-8">

            {/* 분석 결과 배너 */}
            <div className="bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
              {analysisContext?.source === "text_paste" ? (
                <>
                  <span><span className="text-slate-500">분석 방식:</span> 거래 내역 텍스트 붙여넣기</span>
                  <span><span className="text-slate-500">분석 대상:</span> 붙여넣은 거래내역</span>
                </>
              ) : (
                <>
                  <span><span className="text-slate-500">분석 방식:</span> 내 매매일지</span>
                  <span><span className="text-slate-500">자산 유형:</span> {ASSET_TYPE_LABEL[analysisContext?.assetType || "all"] || "전체"}</span>
                  <span><span className="text-slate-500">분석 기간:</span> {PERIOD_LABEL[analysisContext?.period || "all"] || "전체"}</span>
                  <span><span className="text-slate-500">총</span> <span className="text-slate-200 font-bold">{analysisContext?.count ?? 0}건</span></span>
                </>
              )}
            </div>

            {/* Logo/Watermark */}
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

            {/* 1. 종합 진단 */}
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

            {/* A. 핵심 성과 요약 */}
            <div>
              <h2 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-400" />
                핵심 성과 요약
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">총 거래 수</p>
                  <p className="text-2xl font-black text-slate-100">{stats.totalTrades > 0 ? stats.totalTrades : "-"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">건</p>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">수익 거래 수</p>
                  <p className="text-2xl font-black text-emerald-400">{stats.profitCount > 0 ? stats.profitCount : "-"}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">건</p>
                </div>
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">손실 거래 수</p>
                  <p className="text-2xl font-black text-red-400">{stats.lossCount > 0 ? stats.lossCount : "-"}</p>
                  <p className="text-[10px] text-red-600 mt-0.5">건</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${stats.totalPnl >= 0 ? "bg-emerald-950/20 border-emerald-900/30" : "bg-red-950/20 border-red-900/30"}`}>
                  <p className="text-xs text-slate-400 mb-1">총 순손익</p>
                  <p className={`text-2xl font-black ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.totalTrades > 0 ? (stats.totalPnl >= 0 ? `+${stats.totalPnl.toLocaleString()}` : stats.totalPnl.toLocaleString()) : "-"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">원</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${stats.avgReturnRate >= 0 ? "bg-emerald-950/20 border-emerald-900/30" : "bg-red-950/20 border-red-900/30"}`}>
                  <p className="text-xs text-slate-400 mb-1">평균 수익률</p>
                  <p className={`text-2xl font-black ${stats.avgReturnRate >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.totalTrades > 0 ? `${stats.avgReturnRate >= 0 ? "+" : ""}${stats.avgReturnRate}%` : "-"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">%</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${stats.totalKrwPnl >= 0 ? "bg-emerald-950/20 border-emerald-900/30" : "bg-red-950/20 border-red-900/30"}`}>
                  <p className="text-xs text-slate-400 mb-1">원화 환산 총수익</p>
                  <p className={`text-xl font-black ${stats.totalKrwPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {stats.totalKrwPnl !== 0 ? (stats.totalKrwPnl >= 0 ? `+${stats.totalKrwPnl.toLocaleString()}` : stats.totalKrwPnl.toLocaleString()) : "-"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">원</p>
                </div>
              </div>
            </div>

            {/* 2~4. 기존 3단 차트 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    시간대별 매매 승률
                  </CardTitle>
                  <CardDescription>일중 체결 시간대별 거래 승률 데이터</CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.hourlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="hour" stroke="#475569" fontSize={11} />
                        <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} itemStyle={{ color: "#f1f5f9" }} labelStyle={{ color: "#94a3b8" }} formatter={v => [`${v}%`, "승률"]} />
                        <Bar dataKey="winRate">
                          {stats.hourlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.hour === stats.dangerousHour ? "#ef4444" : "#3b82f6"} fillOpacity={entry.hour === stats.dangerousHour ? 1 : 0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Skeleton className="w-full h-full" />}
                </CardContent>
                <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">DANGER</span>
                  <span className="text-[11px] text-slate-300">{stats.dangerousHour} 승률 {stats.dangerousHourWinRate}% — 가장 취약한 구간</span>
                </div>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-400" />
                    수익 vs 손실 평균 보유 기간
                  </CardTitle>
                  <CardDescription>체결 종목 보유 일수 패턴 비교</CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.holdPeriodData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }} layout="vertical">
                        <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={v => `${v}일`} />
                        <YAxis type="category" dataKey="name" stroke="#475569" fontSize={11} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} itemStyle={{ color: "#f1f5f9" }} formatter={v => [`${v}일`, "평균 보유일"]} />
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

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-blue-400" />
                    투자 승률 &amp; 손익비
                  </CardTitle>
                  <CardDescription>익절 대 손절 횟수 비중 및 비율</CardDescription>
                </CardHeader>
                <CardContent className="h-40 flex items-center justify-center relative">
                  {isMounted ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={65} paddingAngle={3} dataKey="value">
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

            {/* B. 수익/손실 거래 상세 비교 */}
            <Card className="border border-slate-800">
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                수익 거래 / 손실 거래 상세 비교
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">수익 거래</p>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>평균 수익률</span>
                    <span className="font-bold text-emerald-400">+{stats.avgWinRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>최대 수익 거래</span>
                    <span className="font-bold text-emerald-400">
                      {stats.maxWinTrade ? `${(stats.maxWinTrade as ExtendedTransaction).ticker} (+${stats.maxWinTrade.profitRate}%)` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>수익 거래 수</span>
                    <span className="font-bold text-slate-200">{stats.profitCount}건</span>
                  </div>
                </div>
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider">손실 거래</p>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>평균 손실률</span>
                    <span className="font-bold text-red-400">-{stats.avgLossRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>최대 손실 거래</span>
                    <span className="font-bold text-red-400">
                      {stats.maxLossTrade ? `${(stats.maxLossTrade as ExtendedTransaction).ticker} (${stats.maxLossTrade.profitRate}%)` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>손실 거래 수</span>
                    <span className="font-bold text-slate-200">{stats.lossCount}건</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-400 mb-1">평균 손익비</p>
                <p className={`text-3xl font-black ${stats.profitToLossRatio >= 1 ? "text-emerald-400" : "text-red-400"}`}>
                  {stats.profitToLossRatio}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {stats.profitToLossRatio >= 1 ? "손익비 양호 — 지속적인 수익 구조입니다." : "손익비 주의 — 손실 한 번이 수익 여러 번을 지웁니다."}
                </p>
              </div>
            </Card>

            {/* C. 진입 근거별 성과 (저널 모드, 아코디언) */}
            {isJournalMode && (
              <AccordionSection
                title={<span className="flex items-center gap-2"><Filter className="h-4 w-4 text-blue-400" />진입 근거별 성과</span>}
                isOpen={entryReasonOpen}
                onToggle={() => setEntryReasonOpen(!entryReasonOpen)}
              >
                {stats.entryReasonStats.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">분석 가능한 진입 근거 데이터가 부족합니다.</p>
                ) : (
                  <div className="space-y-4">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={Math.max(200, stats.entryReasonStats.length * 40)}>
                        <BarChart data={stats.entryReasonStats} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                          <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={v => `${v}%`} />
                          <YAxis type="category" dataKey="reason" stroke="#475569" fontSize={11} width={80} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} formatter={v => [`${v}%`, "평균 수익률"]} />
                          <Bar dataKey="avgReturn">
                            {stats.entryReasonStats.map((entry, i) => (
                              <Cell key={i} fill={entry.avgReturn >= 0 ? "#10b981" : "#ef4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="space-y-2 text-xs text-slate-400">
                      {stats.entryReasonStats[0] && (
                        <p className="text-emerald-400">✓ <strong>{stats.entryReasonStats[0].reason}</strong> 근거로 진입한 거래의 평균 수익률이 가장 높았습니다.</p>
                      )}
                      {stats.entryReasonStats[stats.entryReasonStats.length - 1] && stats.entryReasonStats.length > 1 && (
                        <p className="text-red-400">✗ <strong>{stats.entryReasonStats[stats.entryReasonStats.length - 1].reason}</strong> 기반 진입은 손실 비중이 높았습니다.</p>
                      )}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead className="text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="py-2 text-left">진입 근거</th>
                            <th className="py-2 text-right">거래 수</th>
                            <th className="py-2 text-right">승률</th>
                            <th className="py-2 text-right">평균 수익률</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.entryReasonStats.map((s, i) => (
                            <tr key={i} className="border-b border-slate-900">
                              <td className="py-2 text-slate-300">{s.reason}</td>
                              <td className="py-2 text-right text-slate-400">{s.count}건</td>
                              <td className="py-2 text-right text-slate-400">{s.winRate}%</td>
                              <td className={`py-2 text-right font-bold ${s.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {s.avgReturn >= 0 ? "+" : ""}{s.avgReturn}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </AccordionSection>
            )}

            {/* D. 원칙 준수 여부별 성과 (저널 모드, 아코디언) */}
            {isJournalMode && (
              <AccordionSection
                title={<span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-400" />원칙 준수 여부별 성과</span>}
                isOpen={principleOpen}
                onToggle={() => setPrincipleOpen(!principleOpen)}
              >
                {stats.principleStats.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">분석 가능한 원칙 준수 데이터가 부족합니다.</p>
                ) : (
                  <div className="space-y-4">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={stats.principleStats} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <XAxis dataKey="label" stroke="#475569" fontSize={11} />
                          <YAxis stroke="#475569" fontSize={11} tickFormatter={v => `${v}%`} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} formatter={v => [`${v}%`, "평균 수익률"]} />
                          <Bar dataKey="avgReturn">
                            {stats.principleStats.map((entry, i) => (
                              <Cell key={i} fill={entry.avgReturn >= 0 ? "#10b981" : "#ef4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {stats.principleStats.map((p, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 mb-1">{p.label}</p>
                          <p className={`text-xl font-black ${p.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>{p.avgReturn >= 0 ? "+" : ""}{p.avgReturn}%</p>
                          <p className="text-[11px] text-slate-500 mt-1">{p.count}건 · 승률 {p.winRate}%</p>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const notFollowed = stats.principleStats.find(p => p.label === "안지킴");
                      return notFollowed && notFollowed.avgReturn < -1 ? (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400">
                          ⚠️ 원칙을 지키지 않은 거래에서 손실이 집중되고 있습니다. 진입 전 손절가와 목표가를 반드시 기록하세요.
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </AccordionSection>
            )}

            {/* E. 감정 상태별 성과 (저널 모드, 아코디언) */}
            {isJournalMode && (
              <AccordionSection
                title={<span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-400" />감정 상태별 성과</span>}
                isOpen={emotionOpen}
                onToggle={() => setEmotionOpen(!emotionOpen)}
              >
                {stats.emotionStats.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4">분석 가능한 감정 상태 데이터가 부족합니다.</p>
                ) : (
                  <div className="space-y-4">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height={Math.max(200, stats.emotionStats.length * 40)}>
                        <BarChart data={stats.emotionStats} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                          <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={v => `${v}%`} />
                          <YAxis type="category" dataKey="emotion" stroke="#475569" fontSize={11} width={60} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} formatter={v => [`${v}%`, "평균 수익률"]} />
                          <Bar dataKey="avgReturn">
                            {stats.emotionStats.map((entry, i) => (
                              <Cell key={i} fill={entry.avgReturn >= 0 ? "#10b981" : "#ef4444"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    <div className="space-y-2 text-xs text-slate-400">
                      {stats.emotionStats[stats.emotionStats.length - 1] && (
                        <p className="text-red-400">⚠️ <strong>{stats.emotionStats[stats.emotionStats.length - 1].emotion}</strong> 상태에서 진입한 거래의 평균 수익률이 가장 낮습니다.</p>
                      )}
                      {stats.emotionStats[0] && stats.emotionStats.length > 1 && (
                        <p className="text-emerald-400">✓ <strong>{stats.emotionStats[0].emotion}</strong> 상태에서 진입한 거래의 평균 수익률이 가장 높습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </AccordionSection>
            )}

            {/* F. 손절 기준 작성 여부별 성과 (저널 모드, 아코디언) */}
            {isJournalMode && (
              <AccordionSection
                title={<span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-red-400" />손절 기준 작성 여부별 성과</span>}
                isOpen={stopLossOpen}
                onToggle={() => setStopLossOpen(!stopLossOpen)}
              >
                <div className="space-y-4">
                  {isMounted && (stats.stopLossStats.withStop.count > 0 || stats.stopLossStats.withoutStop.count > 0) ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={[
                            { name: "손절 기준 있음", avgReturn: stats.stopLossStats.withStop.avgReturn, winRate: stats.stopLossStats.withStop.winRate },
                            { name: "손절 기준 없음", avgReturn: stats.stopLossStats.withoutStop.avgReturn, winRate: stats.stopLossStats.withoutStop.winRate }
                          ]}
                          margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                        >
                          <XAxis dataKey="name" stroke="#475569" fontSize={11} />
                          <YAxis stroke="#475569" fontSize={11} tickFormatter={v => `${v}%`} />
                          <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} formatter={v => [`${v}%`, "평균 수익률"]} />
                          <Bar dataKey="avgReturn">
                            <Cell fill={stats.stopLossStats.withStop.avgReturn >= 0 ? "#10b981" : "#ef4444"} />
                            <Cell fill={stats.stopLossStats.withoutStop.avgReturn >= 0 ? "#10b981" : "#ef4444"} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 mb-1">손절 기준 있음</p>
                          <p className={`text-xl font-black ${stats.stopLossStats.withStop.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {stats.stopLossStats.withStop.avgReturn >= 0 ? "+" : ""}{stats.stopLossStats.withStop.avgReturn}%
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">{stats.stopLossStats.withStop.count}건 · 승률 {stats.stopLossStats.withStop.winRate}%</p>
                        </div>
                        <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-400 mb-1">손절 기준 없음</p>
                          <p className={`text-xl font-black ${stats.stopLossStats.withoutStop.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {stats.stopLossStats.withoutStop.avgReturn >= 0 ? "+" : ""}{stats.stopLossStats.withoutStop.avgReturn}%
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">{stats.stopLossStats.withoutStop.count}건 · 승률 {stats.stopLossStats.withoutStop.winRate}%</p>
                        </div>
                      </div>
                      {stats.stopLossStats.withoutStop.avgReturn < stats.stopLossStats.withStop.avgReturn && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400">
                          ⚠️ 손절 기준 없이 진입한 거래의 평균 손실률이 더 큽니다. 진입 전 손절 기준을 기록하면 손실 관리가 쉬워집니다.
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 py-4">분석 가능한 손절 기준 데이터가 부족합니다.</p>
                  )}
                </div>
              </AccordionSection>
            )}

            {/* G. 자산 유형별 성과 (아코디언) */}
            <AccordionSection
              title={<span className="flex items-center gap-2"><PieChartIcon className="h-4 w-4 text-purple-400" />자산 유형별 성과</span>}
              isOpen={assetTypeOpen}
              onToggle={() => setAssetTypeOpen(!assetTypeOpen)}
            >
              {stats.assetTypeStats.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">분석 가능한 자산 유형 데이터가 부족합니다.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.assetTypeStats.map((a, i) => (
                      <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-bold text-slate-300">{a.label}</p>
                        <p className={`text-2xl font-black ${a.avgReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {a.avgReturn >= 0 ? "+" : ""}{a.avgReturn}%
                        </p>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          <div className="flex justify-between"><span>거래 수</span><span>{a.count}건</span></div>
                          <div className="flex justify-between"><span>승률</span><span>{a.winRate}%</span></div>
                          <div className="flex justify-between"><span>총 손익</span>
                            <span className={a.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}>
                              {a.totalPnl >= 0 ? "+" : ""}{a.totalPnl.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 자산 유형별 상세 분석 */}
                  <div className="border-t border-slate-800 pt-4">
                    <button
                      onClick={() => setAssetDetailOpen(!assetDetailOpen)}
                      className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-slate-100 transition-colors"
                    >
                      {assetDetailOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      자산 유형별 상세 분석
                    </button>
                    {assetDetailOpen && (
                      <div className="mt-4 space-y-4">
                        {stats.assetTypeStats.map((a, i) => (
                          <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-slate-200 mb-3">{a.label} 상세 분석</h4>
                            {a.assetType === "stock_spot" && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                {["섹터별 성과", "국내 vs 미국 주식", "코스피/코스닥/나스닥 성과", "수급 확인 여부별 성과", "실적 발표 전후 거래 성과", "배당주 vs 성장주"].map(item => (
                                  <div key={item} className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <p className="text-slate-400">{item}</p>
                                    <p className="text-slate-600 text-[10px] mt-0.5">분석 가능한 데이터가 부족합니다</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {a.assetType === "stock_futures" && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                {["롱/숏 성과 비교", "기초자산별 성과", "레버리지 배율별 성과", "야간장 거래 성과", "만기일 근접 거래 성과", "롤오버 여부별 성과"].map(item => (
                                  <div key={item} className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <p className="text-slate-400">{item}</p>
                                    <p className="text-slate-600 text-[10px] mt-0.5">분석 가능한 데이터가 부족합니다</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {a.assetType === "crypto_spot" && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                {["코인 종류별 성과", "BTC 방향별 성과", "시간대별 성과", "거래소별 성과", "변동성 상태별 성과", "뉴스/이벤트 매매 성과"].map(item => (
                                  <div key={item} className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <p className="text-slate-400">{item}</p>
                                    <p className="text-slate-600 text-[10px] mt-0.5">분석 가능한 데이터가 부족합니다</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {a.assetType === "crypto_futures" && (
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                {["롱/숏 성과 비교", "레버리지 배율별 성과", "격리/교차 모드별 성과", "과매매 여부별 손실률", "새벽 거래 성과", "거래소별 성과"].map(item => (
                                  <div key={item} className="p-2 bg-slate-900 rounded border border-slate-800">
                                    <p className="text-slate-400">{item}</p>
                                    <p className="text-slate-600 text-[10px] mt-0.5">분석 가능한 데이터가 부족합니다</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {!["stock_spot", "stock_futures", "crypto_spot", "crypto_futures"].includes(a.assetType) && (
                              <p className="text-xs text-slate-500">분석 가능한 데이터가 부족합니다.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </AccordionSection>

            {/* 5. 반복 실수 TOP 3 */}
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
                  aiResult.mistakes.map(m => (
                    <div key={m.rank} className="flex space-x-4 items-start pb-4 border-b border-slate-900/60 last:border-0 last:pb-0">
                      <span className="text-2xl font-black text-slate-700 font-mono tracking-tighter shrink-0 w-8">0{m.rank}</span>
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

            {/* H. AI 매매 리포트 */}
            <Card className="border border-blue-900/30 bg-gradient-to-br from-blue-950/10 to-transparent">
              <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                AI 매매 리포트
              </h3>
              <div className="space-y-5">
                {/* 한 줄 요약 */}
                <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">한 줄 요약</p>
                  <p className="text-sm text-slate-200 font-medium">
                    {aiResult?.diagnosis || "이번 분석에서는 승률보다 손실 거래의 보유 기간과 손익비 문제가 더 크게 나타났습니다."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 잘한 점 */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-xl">
                    <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-2">잘한 점</p>
                    <p className="text-xs text-slate-300">{getStrength()}</p>
                  </div>
                  {/* 문제점 */}
                  <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl">
                    <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2">가장 큰 문제점</p>
                    <p className="text-xs text-slate-300">{getWeakness()}</p>
                  </div>
                </div>

                {/* 수치 기반 분석 */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">수치 기반 분석</p>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between"><span>전체 승률</span><span className="font-bold text-slate-200">{stats.winRate}%</span></div>
                    <div className="flex justify-between"><span>평균 수익률</span><span className="font-bold text-emerald-400">+{stats.avgWinRate}%</span></div>
                    <div className="flex justify-between"><span>평균 손실률</span><span className="font-bold text-red-400">-{stats.avgLossRate}%</span></div>
                  </div>
                </div>

                {/* 반복 실수 */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">반복되는 실수</p>
                  <ul className="space-y-1.5 text-xs text-slate-400 list-disc pl-4">
                    {aiResult ? (
                      aiResult.mistakes.map((m, i) => <li key={i}>{m.title}</li>)
                    ) : (
                      <>
                        <li>장 초반 충동 매매</li>
                        <li>손실 방치 및 수익 조기 실현</li>
                        <li>잦은 단타로 인한 수수료 부담</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* 다음 거래 규칙 */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">다음 거래에서 지켜야 할 규칙</p>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                    <li>장 시작 후 10분 동안은 진입 금지</li>
                    <li>진입 전 손절가와 목표가를 반드시 입력</li>
                    <li>하루 거래 횟수를 최대 3회로 제한</li>
                  </ul>
                </div>

                {/* 주의 문구 */}
                <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-900 pt-4">
                  이 분석은 사용자의 기록을 바탕으로 한 매매 습관 복기이며, 특정 종목 추천이나 매수·매도 지시가 아닙니다.
                </p>
              </div>
            </Card>

            {/* 하단 면책 고지 */}
            <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-[11px] text-slate-500 leading-relaxed text-center">
              본 분석은 사용자가 기록한 매매일지를 바탕으로 한 복기용 자료입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다. 모든 투자의 책임은 투자자 본인에게 있습니다.
            </div>

          </div>

          {/* 하단 전자책 CTA */}
          <div className="glass-panel border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-transparent to-slate-950/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-left">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit">
                가장 완벽한 리스크 관리법
              </span>
              <h3 className="text-xl font-bold text-slate-100">AI 분석으로 확인한 치명적 매매 실수들을 고치는 방법</h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                장 초반 뇌동 매매를 차단하고, 손절 포지션을 타이트하게 관리하며 복리로 계좌를 불려 나가는 손익비 1:2 공식과 멘탈 통제 실전 규칙이 담겨 있습니다.
              </p>
            </div>
            <Button variant="success" size="md" onClick={() => setPurchaseModalOpen(true)} className="w-full md:w-auto font-bold shrink-0 shadow-lg shadow-emerald-500/10">
              주린이를 위한 첫 투자 교과서 보러가기 →
            </Button>
          </div>
        </div>
      )}

      {/* 무료 체험 기간 만료 모달 */}
      <Dialog isOpen={limitModalOpen} onClose={() => setLimitModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-full w-fit mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">7일 무료 체험 기간 만료</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            7일 무료 체험 기간이 끝났습니다. 계속 이용하시려면 <strong>프로 플랜</strong>으로 업그레이드하세요!
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl text-left border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>무료 체험 기간:</span><span className="text-slate-200">7일</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>상태:</span><span className="text-red-400 font-bold">체험 기간 만료</span>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setLimitModalOpen(false)}>닫기</Button>
            <Button variant="primary" className="flex-1 font-bold shadow-md shadow-blue-500/25" onClick={() => {
              alert("프로 플랜 모의 결제가 완료되었습니다. 무제한 분석이 해제됩니다.");
              localStorage.removeItem("tradermirror_trial_start");
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
            <Button variant="outline" className="flex-1" onClick={() => setPurchaseModalOpen(false)}>취소</Button>
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
