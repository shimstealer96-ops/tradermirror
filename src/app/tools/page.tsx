"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { 
  Percent, 
  ShieldAlert, 
  Coins, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRight,
  TrendingDown, 
  Info,
  DollarSign
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent, Dialog, Toggle } from "@/components/ui";

export default function ToolsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("illusion");

  // 공유 제한 모달 & 상태
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  // 1. 수익률 착시 교정기 상태
  const [isCoinMode, setIsCoinMode] = useState(false);
  const [stockMarket, setStockMarket] = useState("domestic"); // domestic, overseas
  const [buyAmount, setBuyAmount] = useState("10,000,000");
  const [sellAmount, setSellAmount] = useState("11,200,000");
  const [buyDate, setBuyDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [sellDate, setSellDate] = useState(dayjs().format("YYYY-MM-DD"));
  
  // 코인 전용 추가 입력
  const [btcBuyPrice, setBtcBuyPrice] = useState("95,000,000");
  const [btcSellPrice, setBtcSellPrice] = useState("98,000,000");
  const [buyExchangeRate, setBuyExchangeRate] = useState("1,350");
  const [sellExchangeRate, setSellExchangeRate] = useState("1,380");

  const [illusionResults, setIllusionResults] = useState<any>(null);
  const [isIllusionLoading, setIsIllusionLoading] = useState(false);

  // 2. 청산가 계산기 상태
  const [isLongPosition, setIsLongPosition] = useState(true);
  const [entryPrice, setEntryPrice] = useState("50,000");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState("1,000,000");
  const [exchange, setExchange] = useState("binance"); // binance, bybit, upbit
  const [additionalMargin, setAdditionalMargin] = useState("200,000");
  const [liqResults, setLiqResults] = useState<any>(null);

  // 3. 펀딩피 누적 계산기 상태
  const [fundingPosLong, setFundingPosLong] = useState(true);
  const [positionSize, setPositionSize] = useState("10,000");
  const [fundingRate, setFundingRate] = useState("0.01"); // %
  const [holdingDays, setHoldingDays] = useState("3");
  const [holdingHours, setHoldingHours] = useState("12");
  const [fundingResults, setFundingResults] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트 시 청산가 및 펀딩피 기본 계산 트리거
  useEffect(() => {
    if (isMounted) {
      calculateLiquidation();
      calculateFunding();
    }
  }, [isMounted, isLongPosition, entryPrice, leverage, margin, exchange, additionalMargin, fundingPosLong, positionSize, fundingRate, holdingDays, holdingHours]);

  const cleanNum = (str: string): number => {
    return parseFloat(str.replace(/,/g, "")) || 0;
  };

  const formatKRW = (num: number): string => {
    return Math.round(num).toLocaleString("ko-KR");
  };

  // ==========================================
  // 수익률 착시 교정기 연산
  // ==========================================
  const handleCalculateIllusion = async () => {
    // 제한 로직
    const usageKey = "tradermirror_illusion_usage";
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

    setIsIllusionLoading(true);

    const buyAmt = cleanNum(buyAmount);
    const sellAmt = cleanNum(sellAmount);
    
    // 1. 인지 수익률
    const rawRoi = ((sellAmt - buyAmt) / buyAmt) * 100;

    // 2. 세금 계산
    let tax = 0;
    let taxDetail = "";
    
    if (!isCoinMode) {
      if (stockMarket === "domestic") {
        // 거래세 0.18%
        tax = sellAmt * 0.0018;
        taxDetail = `증권거래세 0.18% (${formatKRW(tax)}원) 포함`;
      } else {
        // 해외주식: 양도소득세 22% (250만원 공제)
        const profit = sellAmt - buyAmt;
        if (profit > 2500000) {
          tax = (profit - 2500000) * 0.22;
          taxDetail = `해외주식 양도소득세 22% (250만원 기본공제 적용)`;
        } else {
          tax = 0;
          taxDetail = `해외주식 양도소득세 면세 한도 내 (250만원 미만 수익)`;
        }
      }
    } else {
      // 가상자산 소득세 22% (250만원 공제 예정법안 기준)
      const profit = sellAmt - buyAmt;
      if (profit > 2500000) {
        tax = (profit - 2500000) * 0.22;
        taxDetail = `가상자산 소득세 22% (250만원 기본공제 적용)`;
      } else {
        tax = 0;
        taxDetail = `가상자산 소득세 면세 한도 내 (250만원 미만 수익)`;
      }
    }

    const netProfit = sellAmt - buyAmt - tax;
    const netRoi = (netProfit / buyAmt) * 100;

    // 3. KOSPI 또는 BTC 대비 수익률 연동
    let benchmarkRoi = 0;
    let benchmarkName = "KOSPI 지수";
    let benchmarkSource = "Local Backup";

    if (isCoinMode) {
      // BTC 수익률 계산
      const btcBuy = cleanNum(btcBuyPrice);
      const btcSell = cleanNum(btcSellPrice);
      benchmarkRoi = ((btcSell - btcBuy) / btcBuy) * 100;
      benchmarkName = "비트코인 (BTC)";
      benchmarkSource = "수동 입력값";
    } else {
      try {
        const res = await fetch(`/api/kospi?startDate=${buyDate}&endDate=${sellDate}`);
        if (res.ok) {
          const data = await res.json();
          benchmarkRoi = data.kospiReturn;
          benchmarkSource = data.source;
        } else {
          benchmarkRoi = 2.45; // 에러 대비 디폴트 폴백
        }
      } catch (err) {
        benchmarkRoi = 2.45;
      }
    }

    // 4. 달러 기준 실수익률 (코인 선택 시만 제공)
    let usdBuyAmt = 0;
    let usdSellAmt = 0;
    let usdRoi = 0;
    
    if (isCoinMode) {
      const buyRate = cleanNum(buyExchangeRate);
      const sellRate = cleanNum(sellExchangeRate);
      usdBuyAmt = buyAmt / buyRate;
      usdSellAmt = sellAmt / sellRate;
      usdRoi = ((usdSellAmt - usdBuyAmt) / usdBuyAmt) * 100;
    }

    // 5. 기회비용 계산 (벤치마크 ETF 샀으면 벌었을 금액)
    const benchmarkProfit = buyAmt * (benchmarkRoi / 100);
    const opportunityCost = benchmarkProfit - netProfit;

    setIllusionResults({
      rawRoi: parseFloat(rawRoi.toFixed(2)),
      netProfit,
      netRoi: parseFloat(netRoi.toFixed(2)),
      tax,
      taxDetail,
      benchmarkName,
      benchmarkRoi: parseFloat(benchmarkRoi.toFixed(2)),
      benchmarkSource,
      opportunityCost,
      usdRoi: parseFloat(usdRoi.toFixed(2)),
      usdDiff: usdRoi - rawRoi,
      isUnderperforming: netRoi < benchmarkRoi
    });

    // 횟수 기록 차감
    usageObj.count += 1;
    localStorage.setItem(usageKey, JSON.stringify(usageObj));
    setIsIllusionLoading(false);
  };

  // ==========================================
  // 청산가 계산기 연산
  // ==========================================
  const calculateLiquidation = () => {
    const price = cleanNum(entryPrice);
    const lev = leverage;
    const marg = cleanNum(margin);
    const addMarg = cleanNum(additionalMargin);

    if (price <= 0 || lev <= 0 || marg <= 0) return;

    // 유지증거금율 (MMR)
    let mmr = 0.005; // 바이비트, 업비트 0.5%
    if (exchange === "binance") mmr = 0.004; // 바이낸스 0.4%

    // 청산가 공식 계산
    // 롱: Entry * (1 - 1/Lev + MMR)
    // 숏: Entry * (1 + 1/Lev - MMR)
    let liqPrice = 0;
    if (isLongPosition) {
      liqPrice = price * (1 - 1 / lev + mmr);
    } else {
      liqPrice = price * (1 + 1 / lev - mmr);
    }

    // 청산까지 필요한 변동성 %
    const distancePercent = ((Math.abs(price - liqPrice)) / price) * 100;

    // 1. 추가 증거금 반영 청산가
    const newMargin = marg + addMarg;
    // New Leverage = Contract Size * EntryPrice / NewMargin
    const newLev = (marg * lev) / newMargin;
    
    let newLiqPrice = 0;
    if (isLongPosition) {
      newLiqPrice = price * (1 - 1 / newLev + mmr);
    } else {
      newLiqPrice = price * (1 + 1 / newLev - mmr);
    }

    // 2. 레버리지 변경 시 청산가 (레버리지 절반 또는 임의 지정)
    const reducedLev = Math.max(1, Math.round(lev / 2));
    let reducedLiqPrice = 0;
    if (isLongPosition) {
      reducedLiqPrice = price * (1 - 1 / reducedLev + mmr);
    } else {
      reducedLiqPrice = price * (1 + 1 / reducedLev - mmr);
    }

    setLiqResults({
      liqPrice: parseFloat(liqPrice.toFixed(4)),
      distancePercent: parseFloat(distancePercent.toFixed(2)),
      newLiqPrice: parseFloat(newLiqPrice.toFixed(4)),
      reducedLev,
      reducedLiqPrice: parseFloat(reducedLiqPrice.toFixed(4)),
      isHighRisk: lev >= 10
    });
  };

  // ==========================================
  // 펀딩피 누적 계산기 연산
  // ==========================================
  const calculateFunding = () => {
    const size = cleanNum(positionSize);
    const rate = parseFloat(fundingRate) || 0;
    const days = parseInt(holdingDays) || 0;
    const hours = parseInt(holdingHours) || 0;

    const totalHours = days * 24 + hours;
    // 8시간마다 납부
    const intervals = Math.floor(totalHours / 8);

    // 롱: 양수(비용/지불), 숏: 음수(수익/수수)
    const directionalRate = fundingPosLong ? rate : -rate;

    const cumulativeFee = intervals * size * (directionalRate / 100);
    const fee1Day = 3 * size * (directionalRate / 100);
    const fee1Week = 21 * size * (directionalRate / 100);

    // 연환산 펀딩피율 = |F| * 3 * 365
    const annualizedRate = rate * 3 * 365;

    // 본전 탈출 변동폭 (롱: 비용 커버 필요 상승폭, 숏: 수익으로 상쇄 가능 하락폭)
    const breakevenMove = intervals * rate;

    setFundingResults({
      cumulativeFee: parseFloat(cumulativeFee.toFixed(2)),
      fee1Day: parseFloat(fee1Day.toFixed(2)),
      fee1Week: parseFloat(fee1Week.toFixed(2)),
      annualizedRate: parseFloat(annualizedRate.toFixed(2)),
      breakevenMove: parseFloat(Math.abs(breakevenMove).toFixed(4)),
      feePercentOfMargin: parseFloat(Math.abs(fee1Day / (size / 10) * 100).toFixed(2)),
      isHighFee: rate >= 0.05
    });
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">투자 계산기 종합 도구</h1>
        <p className="text-xs text-slate-400">보이지 않는 투자 실상과 청산 리스크를 수학적으로 계산해 드립니다.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="illusion" className="flex items-center gap-1.5 justify-center">
            <Percent className="h-4 w-4" />
            <span className="hidden sm:inline">수익률 착시 교정기</span>
            <span className="sm:hidden">수익률교정</span>
          </TabsTrigger>
          <TabsTrigger value="liquidation" className="flex items-center gap-1.5 justify-center">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden sm:inline">실시간 청산가 계산기</span>
            <span className="sm:hidden">청산가계산</span>
          </TabsTrigger>
          <TabsTrigger value="funding" className="flex items-center gap-1.5 justify-center">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">펀딩피 누적 계산기</span>
            <span className="sm:hidden">펀딩피계산</span>
          </TabsTrigger>
        </TabsList>

        {/* ==============================================================
           탭 1: 수익률 착시 교정기
           ============================================================== */}
        <TabsContent value="illusion">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            
            {/* 입력 폼 카드 */}
            <Card className="lg:col-span-1 space-y-5">
              <CardHeader className="p-0">
                <CardTitle className="text-base">조건 입력</CardTitle>
                <CardDescription>과장된 명목 수익률 속의 실세금 및 벤치마크 성과를 검증합니다.</CardDescription>
              </CardHeader>

              <div className="space-y-4 text-xs">
                {/* 투자 유형 토글 */}
                <div>
                  <label className="text-slate-400 block mb-1">투자 유형</label>
                  <Toggle 
                    checked={isCoinMode} 
                    onChange={setIsCoinMode} 
                    labelLeft="국내/해외 주식" 
                    labelRight="가상자산(코인)" 
                    className="w-full"
                  />
                </div>

                {!isCoinMode ? (
                  <div>
                    <label className="text-slate-400 block mb-1">주식 시장</label>
                    <Toggle 
                      checked={stockMarket === "overseas"} 
                      onChange={(checked) => setStockMarket(checked ? "overseas" : "domestic")} 
                      labelLeft="국내주식" 
                      labelRight="해외주식(미국)" 
                      className="w-full"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="text-slate-400 block mb-1">총 매수 금액 (원화)</label>
                  <input 
                    type="text" 
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">총 매도 금액 (원화)</label>
                  <input 
                    type="text" 
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">매수일자</label>
                    <input 
                      type="date" 
                      value={buyDate}
                      onChange={(e) => setBuyDate(e.target.value)}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">매도일자</label>
                    <input 
                      type="date" 
                      value={sellDate}
                      onChange={(e) => setSellDate(e.target.value)}
                      className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2"
                    />
                  </div>
                </div>

                {isCoinMode && (
                  <div className="space-y-4 border-t border-slate-900 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">매수시 BTC 가격(원)</label>
                        <input 
                          type="text" 
                          value={btcBuyPrice}
                          onChange={(e) => setBtcBuyPrice(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">매도시 BTC 가격(원)</label>
                        <input 
                          type="text" 
                          value={btcSellPrice}
                          onChange={(e) => setBtcSellPrice(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">매수시 환율(원/$)</label>
                        <input 
                          type="text" 
                          value={buyExchangeRate}
                          onChange={(e) => setBuyExchangeRate(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">매도시 환율(원/$)</label>
                        <input 
                          type="text" 
                          value={sellExchangeRate}
                          onChange={(e) => setSellExchangeRate(e.target.value)}
                          className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  variant="primary" 
                  className="w-full text-sm font-bold h-10 mt-2" 
                  onClick={handleCalculateIllusion}
                  disabled={isIllusionLoading}
                >
                  {isIllusionLoading ? "계산 중..." : "실수익률 진단하기"}
                </Button>
              </div>
            </Card>

            {/* 결과 뷰 카드 */}
            <div className="lg:col-span-2 space-y-6">
              {illusionResults ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 카드 1. 인지수익률 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-[#0f172a]/40 border-slate-800">
                      <span className="text-xs text-slate-500 font-semibold block">내가 알던 명목 수익률</span>
                      <div className={`text-4xl font-extrabold mt-2 ${illusionResults.rawRoi >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {illusionResults.rawRoi >= 0 ? `+${illusionResults.rawRoi}%` : `${illusionResults.rawRoi}%`}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">수수료나 세금을 차감하지 않은 차트 상 수치입니다.</p>
                    </Card>

                    {/* 카드 2. 세금 감안 실수익률 */}
                    <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-950/15 via-transparent to-transparent">
                      <span className="text-xs text-emerald-400 font-bold block">세금 감안 진짜 실수익률</span>
                      <div className="text-4xl font-extrabold text-slate-100 mt-2">
                        {illusionResults.netRoi >= 0 ? `+${illusionResults.netRoi}%` : `${illusionResults.netRoi}%`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                        세금으로 <strong className="text-red-400">{formatKRW(illusionResults.tax)}원</strong>이 차감됩니다.<br />
                        <span className="text-slate-500 text-[10px]">{illusionResults.taxDetail}</span>
                      </div>
                    </Card>
                  </div>

                  {/* 지수 대비 성과 & 달러 환산 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 카드 3. KOSPI 대비 성과 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-semibold block">{illusionResults.benchmarkName} 수익률</span>
                        <div className="text-2xl font-black text-slate-200">
                          {illusionResults.benchmarkRoi >= 0 ? `+${illusionResults.benchmarkRoi}%` : `${illusionResults.benchmarkRoi}%`}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          동일 기간 시장 지수의 순 변동입니다 ({illusionResults.benchmarkSource} 참조).
                        </p>
                      </div>

                      {illusionResults.isUnderperforming && (
                        <div className="mt-4 p-2 bg-red-500/5 border border-red-500/10 rounded text-[10px] text-red-400 font-bold leading-snug">
                          ⚠️ 동기간 {illusionResults.benchmarkName} ETF 매수 후 방치보다 수익률이 낮습니다.
                        </div>
                      )}
                    </Card>

                    {/* 카드 4. 달러 실수익률 (코인 모드) */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-semibold block flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5 text-blue-400" /> 달러 기준 실수익률
                        </span>
                        <div className="text-2xl font-black text-slate-200">
                          {isCoinMode ? `${illusionResults.usdRoi >= 0 ? `+${illusionResults.usdRoi}%` : `${illusionResults.usdRoi}%`}` : "N/A"}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {isCoinMode 
                            ? "환율 변동 효과를 완전 배제한 순수 달러 가치 증감률입니다."
                            : "주식 모드는 달러 수익률을 산출하지 않습니다."}
                        </p>
                      </div>
                      
                      {isCoinMode && illusionResults.usdDiff < 0 && (
                        <div className="mt-4 p-2 bg-amber-500/5 border border-amber-500/10 rounded text-[10px] text-amber-400 leading-snug">
                          원화 대비 달러 수익률이 마이너스입니다 (환차손 발생).
                        </div>
                      )}
                    </Card>

                    {/* 카드 5. 기회비용 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-semibold block">시장 지수 대비 초과 손익</span>
                        <div className={`text-2xl font-black ${illusionResults.opportunityCost < 0 ? "text-red-400" : "text-emerald-400"}`}>
                          {illusionResults.opportunityCost >= 0 
                            ? `+${formatKRW(illusionResults.opportunityCost)}원` 
                            : `${formatKRW(illusionResults.opportunityCost)}원`}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          단순 벤치마크 지수에 묻어두었을 때 대비 내가 창출한 가치 편차입니다.
                        </p>
                      </div>

                      {illusionResults.opportunityCost < 0 && (
                        <div className="mt-4 p-2 bg-red-500/5 border border-red-500/10 rounded text-[10px] text-red-400 font-semibold leading-snug">
                          지수 추종보다 {formatKRW(Math.abs(illusionResults.opportunityCost))}원 더 적게 벌었습니다.
                        </div>
                      )}
                    </Card>

                  </div>

                  {/* 쇼킹 가이드 배너 */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">"진짜 수익률을 알고 투자에 임하셔야 계좌가 성장합니다."</span>
                    <Button variant="ghost" size="sm" onClick={() => setPurchaseModalOpen(true)} className="text-blue-400 hover:text-blue-300 gap-1 text-[11px]">
                      교과서 보기 <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="h-96 flex flex-col items-center justify-center text-slate-500 text-center border-dashed">
                  <Percent className="h-10 w-10 mb-4 opacity-30 text-blue-500" />
                  <p className="text-sm font-semibold">입력 조건을 입력하고 [실수익률 진단하기] 버튼을 누르세요.</p>
                  <p className="text-xs text-slate-600 mt-1">세금 공제액 및 지수 대비 초과 수익률(알파)을 정밀 계산합니다.</p>
                </Card>
              )}
            </div>

          </div>
        </TabsContent>

        {/* ==============================================================
           탭 2: 실시간 청산가 계산기
           ============================================================== */}
        <TabsContent value="liquidation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            
            {/* 조건 입력 */}
            <Card className="lg:col-span-1 space-y-5">
              <CardHeader className="p-0">
                <CardTitle className="text-base">청산 매개변수</CardTitle>
                <CardDescription>레버리지 변동과 거래소별 유지증거금율에 기반한 청산 지점을 확인합니다.</CardDescription>
              </CardHeader>

              <div className="space-y-4 text-xs">
                {/* 롱 / 숏 토글 */}
                <div>
                  <label className="text-slate-400 block mb-1">포지션 방향</label>
                  <Toggle 
                    checked={!isLongPosition} 
                    onChange={(checked) => setIsLongPosition(!checked)} 
                    labelLeft="롱 (LONG)" 
                    labelRight="숏 (SHORT)" 
                    className="w-full"
                  />
                </div>

                {/* 거래소 선택 */}
                <div>
                  <label className="text-slate-400 block mb-1">거래소 (유지증거금률)</label>
                  <div className="grid grid-cols-3 gap-2 bg-[#050811] p-1 border border-slate-800 rounded-lg">
                    {["binance", "bybit", "upbit"].map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setExchange(ex)}
                        className={`py-1.5 rounded text-center font-bold transition-all cursor-pointer ${
                          exchange === ex
                            ? "bg-slate-800 text-slate-100"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {ex === "binance" ? "바이낸스 (0.4%)" : ex === "bybit" ? "바이비트 (0.5%)" : "업비트 (0.5%)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">평균 진입 가격</label>
                  <input 
                    type="text" 
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                </div>

                {/* 레버리지 슬라이더 */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-slate-400">레버리지 배율</label>
                    <span className="font-bold text-blue-400">{leverage}x</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={125} 
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">지정 증거금</label>
                  <input 
                    type="text" 
                    value={margin}
                    onChange={(e) => setMargin(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                </div>

                <div className="border-t border-slate-900 pt-4">
                  <label className="text-slate-400 block mb-1">방어용 추가 증거금 설정</label>
                  <input 
                    type="text" 
                    value={additionalMargin}
                    onChange={(e) => setAdditionalMargin(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">청산가 방어를 위해 추가 투입할 증거금 금액을 지정하세요.</p>
                </div>
              </div>
            </Card>

            {/* 청산 계산 결과 */}
            <div className="lg:col-span-2 space-y-6">
              {liqResults ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 메인 청산가 카드 */}
                  <Card className="bg-[#0f172a]/30 border-red-950/80 border-l-4 border-l-red-500">
                    <span className="text-xs text-red-400 font-bold block uppercase tracking-wider">추정 강제 청산가격</span>
                    <div className="text-4xl font-extrabold text-slate-100 mt-2 font-mono">
                      {liqResults.liqPrice.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USDT/원</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-slate-500 shrink-0" />
                      현재 진입가로부터 <strong className="text-red-400">{liqResults.distancePercent}%</strong> 가격 이동 시 포지션이 전액 공중분해(청산)됩니다.
                    </p>
                  </Card>

                  {/* 보조 리스크 진단 카드 3종 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 카드 1. 추가증거금 효과 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">추가 증거금 반영 청산가</span>
                        <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                          {liqResults.newLiqPrice.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          증거금 {cleanNum(additionalMargin).toLocaleString()}원 투입 시 개선되는 청산가격입니다.
                        </p>
                      </div>
                    </Card>

                    {/* 카드 2. 레버리지 하향 효과 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">레버리지 하향 제안 ({liqResults.reducedLev}x)</span>
                        <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                          {liqResults.reducedLiqPrice.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          배율을 절반 수준으로 경감했을 때 기대할 수 있는 안정적인 청산가 지점입니다.
                        </p>
                      </div>
                    </Card>

                    {/* 카드 3. 리스크 등급 진단 */}
                    <Card className={`flex flex-col justify-between ${liqResults.isHighRisk ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">리스크 경보 등급</span>
                        <div className={`text-base font-black mt-1 ${liqResults.isHighRisk ? "text-red-400" : "text-emerald-400"}`}>
                          {liqResults.isHighRisk ? "위험 (High Leverage)" : "안정 (Low Leverage)"}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {liqResults.isHighRisk 
                            ? `레버리지 10배 이상은 극단적인 변동성(${liqResults.distancePercent}%)에 포지션 전체가 청산될 확률이 높습니다.`
                            : "포지션 청산 리스크가 통제 가능한 범위 내에 있습니다."}
                        </p>
                      </div>
                    </Card>

                  </div>

                </div>
              ) : null}
            </div>

          </div>
        </TabsContent>

        {/* ==============================================================
           탭 3: 펀딩피 누적 계산기
           ============================================================== */}
        <TabsContent value="funding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            
            {/* 조건 입력 */}
            <Card className="lg:col-span-1 space-y-5">
              <CardHeader className="p-0">
                <CardTitle className="text-base">펀딩 피 파라미터</CardTitle>
                <CardDescription>가상자산 무기한 선물 보유 시 8시간 단위로 수수 및 지불되는 펀딩 누적 비용을 확인합니다.</CardDescription>
              </CardHeader>

              <div className="space-y-4 text-xs">
                {/* 롱숏 방향 */}
                <div>
                  <label className="text-slate-400 block mb-1">포지션 방향</label>
                  <Toggle 
                    checked={!fundingPosLong} 
                    onChange={(checked) => setFundingPosLong(!checked)} 
                    labelLeft="롱 (지불)" 
                    labelRight="숏 (수수)" 
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">포지션 총 크기 (USDT)</label>
                  <input 
                    type="text" 
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">현재 펀딩피율 (%)</label>
                  <input 
                    type="text" 
                    value={fundingRate}
                    onChange={(e) => setFundingRate(e.target.value)}
                    className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">일반적으로 무기한 선물 시장의 기본 비율은 0.01%입니다.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 block">보유 예정 기간</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input 
                        type="number" 
                        placeholder="일" 
                        value={holdingDays}
                        onChange={(e) => setHoldingDays(e.target.value)}
                        className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">일</span>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        placeholder="시간" 
                        value={holdingHours}
                        onChange={(e) => setHoldingHours(e.target.value)}
                        className="w-full bg-[#050811] text-slate-200 rounded border border-slate-800 p-2 font-mono text-sm"
                      />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">시간</span>
                    </div>
                  </div>
                </div>

              </div>
            </Card>

            {/* 계산 결과 */}
            <div className="lg:col-span-2 space-y-6">
              {fundingResults ? (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* 누적 비용/수익 카드 */}
                  <Card className={`bg-[#0f172a]/30 border-l-4 ${fundingResults.cumulativeFee >= 0 ? "border-amber-900/60 border-l-amber-500" : "border-emerald-900/60 border-l-emerald-500"}`}>
                    <span className={`text-xs font-bold block uppercase tracking-wider ${fundingResults.cumulativeFee >= 0 ? "text-amber-500" : "text-emerald-400"}`}>
                      {fundingResults.cumulativeFee >= 0 ? "누적 추정 펀딩 비용 (지불)" : "누적 추정 펀딩 수익 (수수)"}
                    </span>
                    <div className={`text-4xl font-extrabold mt-2 font-mono ${fundingResults.cumulativeFee >= 0 ? "text-slate-100" : "text-emerald-400"}`}>
                      {fundingResults.cumulativeFee < 0 ? "+" : ""}{Math.abs(fundingResults.cumulativeFee).toLocaleString()} <span className="text-xs text-slate-400 font-normal">USDT</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-3 space-y-1">
                      <p>• 1일 펀딩: <strong className={fundingResults.fee1Day >= 0 ? "text-slate-200" : "text-emerald-300"}>{fundingResults.fee1Day < 0 ? "+" : ""}{Math.abs(fundingResults.fee1Day).toLocaleString()} USDT {fundingResults.fee1Day < 0 ? "(수수)" : "(지불)"}</strong></p>
                      <p>• 1주일 펀딩: <strong className={fundingResults.fee1Week >= 0 ? "text-slate-200" : "text-emerald-300"}>{fundingResults.fee1Week < 0 ? "+" : ""}{Math.abs(fundingResults.fee1Week).toLocaleString()} USDT {fundingResults.fee1Week < 0 ? "(수수)" : "(지불)"}</strong></p>
                    </div>
                  </Card>

                  {/* 보조 카드 2종 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 카드 1. 본전 및 손익분기 진단 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          {fundingPosLong ? "본전 탈출 요구 변동폭" : "펀딩 수익 완충 비율"}
                        </span>
                        <div className="text-lg font-bold text-slate-200 mt-1 font-mono">
                          +{fundingResults.breakevenMove}%
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {fundingPosLong
                            ? "포지션을 유지하는 것만으로 본전 청산을 위해 지수가 더 움직여야 할 필요 비율입니다."
                            : "펀딩피 수익이 가격 역행 움직임을 이 비율만큼 상쇄합니다."}
                        </p>
                      </div>
                    </Card>

                    {/* 카드 2. 연환산 펀딩피율 */}
                    <Card className="flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">연환산 펀딩 수수료율</span>
                        <div className={`text-lg font-bold mt-1 font-mono ${fundingResults.annualizedRate > 10 ? "text-red-400" : "text-emerald-400"}`}>
                          {fundingResults.annualizedRate}%
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          {fundingResults.annualizedRate > 10 
                            ? "이 수준의 펀딩피가 장기 지속될 경우 포지션 보유 자체가 손해입니다."
                            : "연환산 수수료율이 안정적인 범위 내에 유지되고 있습니다."}
                        </p>
                      </div>
                    </Card>

                  </div>

                  {/* 경고/알림 */}
                  {fundingResults.isHighFee && (
                    <div className={`p-3.5 border rounded-xl flex items-start space-x-2 text-xs ${fundingPosLong ? "bg-red-500/5 border-red-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
                      <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${fundingPosLong ? "text-red-500" : "text-emerald-500"}`} />
                      <div className={`space-y-1 ${fundingPosLong ? "text-red-400" : "text-emerald-400"}`}>
                        {fundingPosLong ? (
                          <>
                            <strong className="font-bold">펀딩피 초고위험 경고</strong>
                            <p className="text-[11px] leading-relaxed">
                              현재 펀딩 비율이 극도로 높습니다. 1일 보유 시마다 원금 증거금 대비 무려 <span className="font-bold">{fundingResults.feePercentOfMargin}%</span>가 수수료로 잠식됩니다. 장기 기획 진입은 중단하십시오.
                            </p>
                          </>
                        ) : (
                          <>
                            <strong className="font-bold">펀딩피 고수익 알림</strong>
                            <p className="text-[11px] leading-relaxed">
                              현재 펀딩 비율이 매우 높습니다. 숏 포지션 1일 보유 시 증거금 대비 <span className="font-bold">{fundingResults.feePercentOfMargin}%</span>에 달하는 펀딩피를 수수할 수 있습니다.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : null}
            </div>

          </div>
        </TabsContent>

      </Tabs>

      {/* 무료 사용 한도 초과 안내 */}
      <Dialog isOpen={limitModalOpen} onClose={() => setLimitModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-red-600/10 border border-red-600/20 rounded-full w-fit mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">이번 달 무료 진단 한도 초과</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            수익률 착시 교정기 무료 사용량(5회)을 초과했습니다. 프로 플랜으로 업그레이드하시면 무제한 계산기 활용이 가능합니다!
          </p>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setLimitModalOpen(false)}>
              닫기
            </Button>
            <Button variant="primary" className="flex-1 font-bold" onClick={() => {
              alert("프로 플랜 모의 결제가 처리되었습니다. 한도가 무제한으로 해제됩니다.");
              const currentMonth = dayjs().format("YYYY-MM");
              localStorage.setItem("tradermirror_illusion_usage", JSON.stringify({ month: currentMonth, count: 0 }));
              setLimitModalOpen(false);
            }}>
              프로 플랜 구독하기 (₩9,900/월)
            </Button>
          </div>
        </div>
      </Dialog>

      {/* 전자책 홍보 모달 */}
      <Dialog isOpen={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)}>
        <div className="space-y-4 text-center">
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-full w-fit mx-auto">
            <Info className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100">주린이를 위한 첫 투자 교과서</h3>
          <p className="text-sm text-slate-400">
            수익률 착시와 세금 영향, 파산 청산을 방지하기 위한 실제 리스크 공식이 알차게 구성되어 있습니다.
          </p>
          <div className="bg-slate-900/60 p-4 rounded-xl text-left border border-slate-800 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>상품가:</span>
              <span className="text-emerald-400 font-bold">₩19,900</span>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setPurchaseModalOpen(false)}>
              취소
            </Button>
            <Button variant="success" className="flex-1 font-bold" onClick={() => {
              alert("모의 결제가 완료되었습니다. 이용해 주셔서 감사합니다!");
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
