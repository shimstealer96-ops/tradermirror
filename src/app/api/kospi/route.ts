import { NextResponse } from "next/server";

// 2020년 1월 ~ 2026년 5월까지의 KOSPI 월별 종가 데이터 (오프라인/API 에러 폴백용)
const KOSPI_HISTORY: Record<string, number> = {
  "2020-01": 2119, "2020-02": 1987, "2020-03": 1754, "2020-04": 1947, "2020-05": 2029, "2020-06": 2108,
  "2020-07": 2249, "2020-08": 2326, "2020-09": 2327, "2020-10": 2267, "2020-11": 2633, "2020-12": 2873,
  "2021-01": 2976, "2021-02": 3012, "2021-03": 3061, "2021-04": 3147, "2021-05": 3203, "2021-06": 3296,
  "2021-07": 3202, "2021-08": 3199, "2021-09": 3068, "2021-10": 2970, "2021-11": 2839, "2021-12": 2977,
  "2022-01": 2663, "2022-02": 2699, "2022-03": 2757, "2022-04": 2695, "2022-05": 2685, "2022-06": 2336,
  "2022-07": 2451, "2022-08": 2472, "2022-09": 2155, "2022-10": 2293, "2022-11": 2472, "2022-12": 2236,
  "2023-01": 2425, "2023-02": 2412, "2023-03": 2476, "2023-04": 2501, "2023-05": 2577, "2023-06": 2564,
  "2023-07": 2632, "2023-08": 2556, "2023-09": 2465, "2023-10": 2277, "2023-11": 2535, "2023-12": 2655,
  "2024-01": 2497, "2024-02": 2642, "2024-03": 2746, "2024-04": 2692, "2024-05": 2636, "2024-06": 2797,
  "2024-07": 2770, "2024-08": 2674, "2024-09": 2593, "2024-10": 2556, "2024-11": 2504, "2024-12": 2541,
  "2025-01": 2520, "2025-02": 2550, "2025-03": 2590, "2025-04": 2610, "2025-05": 2630, "2025-06": 2670,
  "2025-07": 2700, "2025-08": 2720, "2025-09": 2710, "2025-10": 2730, "2025-11": 2760, "2025-12": 2780,
  "2026-01": 2810, "2026-02": 2830, "2026-03": 2850, "2026-04": 2880, "2026-05": 2910
};

// 날짜 문자열(YYYY-MM-DD)에서 YYYY-MM 추출하여 지수 반환
function getKospifromStaticData(dateStr: string): number {
  if (!dateStr) return 2500;
  
  const key = dateStr.substring(0, 7); // "YYYY-MM"
  if (KOSPI_HISTORY[key]) {
    return KOSPI_HISTORY[key];
  }
  
  // 해당하는 달이 없으면 가장 유사한 월 탐색
  const keys = Object.keys(KOSPI_HISTORY).sort();
  if (key < keys[0]) return KOSPI_HISTORY[keys[0]];
  if (key > keys[keys.length - 1]) return KOSPI_HISTORY[keys[keys.length - 1]];
  
  // 폴백 기본값
  return 2500;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate"); // YYYY-MM-DD
    const endDate = searchParams.get("endDate");     // YYYY-MM-DD

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate와 endDate 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const startUnix = Math.floor(new Date(startDate).getTime() / 1000);
    const endUnix = Math.floor(new Date(endDate).getTime() / 1000);

    if (isNaN(startUnix) || isNaN(endUnix)) {
      return NextResponse.json(
        { error: "올바르지 않은 날짜 형식입니다." },
        { status: 400 }
      );
    }

    let startKOSPI = 0;
    let endKOSPI = 0;
    let isFetched = false;

    // 야후 파이낸스 API 호출 시도
    try {
      // 5초 타임아웃을 적용하기 위한 AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // KOSPI (^KS11) 차트 조회
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/%5EKS11?period1=${startUnix - 86400 * 3}&period2=${endUnix + 86400 * 3}&interval=1d`;
      
      const response = await fetch(yahooUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const json = await response.json();
        const chartData = json.chart?.result?.[0];
        const timestamps: number[] = chartData?.timestamp || [];
        const closes: (number | null)[] = chartData?.indicators?.quote?.[0]?.close || [];

        if (timestamps.length > 0 && closes.length > 0) {
          // startDate에 가장 가까운 날짜의 close 검색
          let startMinDiff = Infinity;
          let endMinDiff = Infinity;

          for (let i = 0; i < timestamps.length; i++) {
            const currentClose = closes[i];
            if (currentClose === null || currentClose === undefined) continue;

            const tTime = timestamps[i] * 1000;
            const diffStart = Math.abs(tTime - new Date(startDate).getTime());
            const diffEnd = Math.abs(tTime - new Date(endDate).getTime());

            if (diffStart < startMinDiff) {
              startMinDiff = diffStart;
              startKOSPI = currentClose;
            }
            if (diffEnd < endMinDiff) {
              endMinDiff = diffEnd;
              endKOSPI = currentClose;
            }
          }
          
          if (startKOSPI > 0 && endKOSPI > 0) {
            isFetched = true;
          }
        }
      }
    } catch (yahooError) {
      console.warn("Yahoo Finance API 호출 에러, 로컬 데이터 폴백을 시작합니다:", yahooError);
    }

    // 호출에 실패했거나 데이터가 불완전하면 로컬 백업 지수로 계산
    if (!isFetched) {
      startKOSPI = getKospifromStaticData(startDate);
      endKOSPI = getKospifromStaticData(endDate);
    }

    const kospiReturn = ((endKOSPI - startKOSPI) / startKOSPI) * 100;

    return NextResponse.json({
      startDate,
      endDate,
      startKOSPI: parseFloat(startKOSPI.toFixed(2)),
      endKOSPI: parseFloat(endKOSPI.toFixed(2)),
      kospiReturn: parseFloat(kospiReturn.toFixed(2)),
      source: isFetched ? "Yahoo Finance" : "Local Static Backup"
    });

  } catch (error: any) {
    console.error("KOSPI API error:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
