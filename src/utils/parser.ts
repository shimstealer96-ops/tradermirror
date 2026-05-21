export interface Transaction {
  id: string;
  date: string;         // YYYY-MM-DD
  time?: string;        // HH:mm:ss
  ticker: string;       // 종목명
  type: "BUY" | "SELL"; // 매수/매도
  price: number;        // 가격
  quantity: number;     // 수량
  profitRate?: number;  // 수익률 (%)
  amount: number;       // 거래 금액 (가격 * 수량)
}

/**
 * 텍스트에서 특수문자 제거 및 토큰화
 */
function cleanNumber(str: string): number {
  return parseFloat(str.replace(/[^\d.-]/g, ""));
}

/**
 * 거래 일지 텍스트 파싱 로직
 */
/**
 * 거래 리스트를 받아서 수익률이 없는 SELL 거래의 수익률을 FIFO 매칭으로 계산하고 채워 넣음
 */
export function fillMissingProfitRates(txs: Transaction[]): Transaction[] {
  const sorted = [...txs].sort((a, b) => {
    const aDateTime = `${a.date} ${a.time || "00:00:00"}`;
    const bDateTime = `${b.date} ${b.time || "00:00:00"}`;
    return aDateTime.localeCompare(bDateTime);
  });

  const buyPool: Record<string, { qty: number; price: number }[]> = {};

  return sorted.map(tx => {
    if (tx.type === "BUY") {
      if (!buyPool[tx.ticker]) buyPool[tx.ticker] = [];
      buyPool[tx.ticker].push({ qty: tx.quantity, price: tx.price });
      return tx;
    } else {
      let profitRate = tx.profitRate;

      if (profitRate === undefined) {
        const pool = buyPool[tx.ticker];
        if (pool && pool.length > 0) {
          let remainingSellQty = tx.quantity;
          let totalBuyCost = 0;
          let matchedQty = 0;

          while (remainingSellQty > 0 && pool.length > 0) {
            const firstBuy = pool[0];
            const takeQty = Math.min(remainingSellQty, firstBuy.qty);
            totalBuyCost += takeQty * firstBuy.price;
            matchedQty += takeQty;
            remainingSellQty -= takeQty;

            firstBuy.qty -= takeQty;
            if (firstBuy.qty <= 0) {
              pool.shift();
            }
          }

          if (matchedQty > 0) {
            const avgBuyPrice = totalBuyCost / matchedQty;
            profitRate = parseFloat((((tx.price - avgBuyPrice) / avgBuyPrice) * 100).toFixed(2));
          }
        }
      } else {
        const pool = buyPool[tx.ticker];
        if (pool && pool.length > 0) {
          let remainingSellQty = tx.quantity;
          while (remainingSellQty > 0 && pool.length > 0) {
            const firstBuy = pool[0];
            const takeQty = Math.min(remainingSellQty, firstBuy.qty);
            remainingSellQty -= takeQty;
            firstBuy.qty -= takeQty;
            if (firstBuy.qty <= 0) {
              pool.shift();
            }
          }
        }
      }

      return {
        ...tx,
        profitRate
      };
    }
  });
}

/**
 * 거래 일지 텍스트 파싱 로직
 */
export function parseTradingJournal(text: string): Transaction[] {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const parsedTransactions: Transaction[] = [];

  // 날짜 정규식 패턴 (YYYY.MM.DD, YYYY-MM-DD, YYYY/MM/DD, YY/MM/DD)
  const dateRegex = /\b(20\d{2}|19\d{2}|\d{2})[-./](0[1-9]|1[0-2]|[\d])[-./](0[1-9]|[12]\d|3[01]|[\d])\b/;
  
  // 시간 정규식 패턴 (HH:mm:ss 또는 HH:mm)
  const timeRegex = /\b(0\d|1\d|2[0-3]|\d):(0\d|[1-5]\d|\d)(?::(0\d|[1-5]\d|\d))?\b/;

  lines.forEach((line, index) => {
    // 천 단위 쉼표를 제거한 상태에서 CSV 구분자 쉼표가 있는지 판단
    let parts: string[] = [];
    const cleanLineForCsv = line.replace(/(\d),(\d{3})/g, "$1$2");
    if (cleanLineForCsv.includes(",")) {
      parts = cleanLineForCsv.split(",").map(p => p.trim());
      // 헤더 라인은 스킵
      if (parts.some(p => p.includes("날짜") || p.includes("date") || p.includes("종목"))) {
        return;
      }
    } else {
      // 여러 공백으로 나눔
      parts = line.split(/\s+/).map(p => p.trim());
    }

    // 날짜 매칭
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) return; // 날짜가 없으면 파싱 불가

    let dateStr = dateMatch[0].replace(/\./g, "-").replace(/\//g, "-");
    // YY-MM-DD 형태면 20YY-MM-DD로 복구
    if (dateStr.split("-")[0].length === 2) {
      dateStr = "20" + dateStr;
    }
    // 날짜 포맷 표준화 (YYYY-MM-DD)
    const dateParts = dateStr.split("-");
    if (dateParts[1].length === 1) dateParts[1] = "0" + dateParts[1];
    if (dateParts[2].length === 1) dateParts[2] = "0" + dateParts[2];
    dateStr = dateParts.join("-");

    // 시간 매칭
    const timeMatch = line.match(timeRegex);
    const timeStr = timeMatch ? timeMatch[0] : undefined;

    // 매수 / 매도 판단
    let type: "BUY" | "SELL" | null = null;
    if (line.includes("매수") || line.toLowerCase().includes("buy") || line.includes("체결(수신)") || line.includes("입고")) {
      type = "BUY";
    } else if (line.includes("매도") || line.toLowerCase().includes("sell") || line.includes("출고") || line.includes("상환")) {
      type = "SELL";
    }

    if (!type) {
      // 텍스트 매칭이 모호할 때 토큰 중 매수/매도와 유사한 것 찾기
      const foundBuy = parts.some(p => p === "수" || p.includes("매수"));
      const foundSell = parts.some(p => p === "도" || p.includes("매도"));
      if (foundBuy) type = "BUY";
      else if (foundSell) type = "SELL";
      else return; // 거래타입 모르면 스킵
    }

    // 가격, 수량, 종목명 추출
    // 토큰 리스트에서 숫자, 날짜, 시간, 타입을 제외하고 종목명을 식별
    const numericTokens: { val: number; raw: string; index: number }[] = [];
    const textTokens: string[] = [];

    parts.forEach((part, partIdx) => {
      // 날짜/시간 토큰 스킵
      if (part.match(dateRegex) || part.match(timeRegex)) return;
      if (part === "매수" || part === "매도" || part.toLowerCase() === "buy" || part.toLowerCase() === "sell") return;

      // 퍼센트 수익률 토큰이 있으면 기입
      if (part.includes("%")) {
        return; 
      }

      const num = cleanNumber(part);
      if (!isNaN(num) && num !== 0) {
        numericTokens.push({ val: num, raw: part, index: partIdx });
      } else if (part.length > 0 && !["원", "주", "개", "USD", "USDT"].includes(part)) {
        textTokens.push(part);
      }
    });

    // 종목명 결정 (남은 텍스트 토큰 중 첫 번째 또는 여러 개 조합)
    let ticker = textTokens.join(" ") || "알수없음";

    // 가격과 수량 매칭
    // 보통 거래 내역에서 가격이 수량보다 현저히 큼 (예: 삼성전자 78,500원 10주)
    // 혹은 가격이 먼저 나오고 수량이 뒤에 나옴
    let price = 0;
    let quantity = 0;

    if (numericTokens.length >= 2) {
      // 수량과 단가를 추측: 보통 단가가 수량보다 큼
      const val1 = Math.abs(numericTokens[0].val);
      const val2 = Math.abs(numericTokens[1].val);

      if (val1 > val2) {
        price = val1;
        quantity = val2;
      } else {
        // 단가가 수량보다 작을 수 있는 경우 (동전주, 코인 소수점 거래)
        // 이때는 토큰 문자열에 '주', '개' 등이 붙어있는지 확인
        const isQty1 = numericTokens[0].raw.includes("주") || numericTokens[0].raw.includes("개");
        const isQty2 = numericTokens[1].raw.includes("주") || numericTokens[1].raw.includes("개");
        const isPrice1 = numericTokens[0].raw.includes("원") || numericTokens[0].raw.includes("$");
        const isPrice2 = numericTokens[1].raw.includes("원") || numericTokens[1].raw.includes("$");

        if (isQty1 || isPrice2) {
          quantity = val1;
          price = val2;
        } else if (isQty2 || isPrice1) {
          price = val1;
          quantity = val2;
        } else {
          // 기본적으로 첫 번째가 가격, 두 번째가 수량이라고 가정하거나 큰 값을 가격으로
          if (val1 > 500) {
            price = val1;
            quantity = val2;
          } else {
            price = val1;
            quantity = val2;
          }
        }
      }
    } else if (numericTokens.length === 1) {
      // 숫자 토큰이 하나만 있는 경우 가격으로 잡고 수량은 1로 기본값 설정
      price = Math.abs(numericTokens[0].val);
      quantity = 1;
    }

    // 수익률 파싱 (매도 시 % 기호가 있는 값)
    let profitRate: number | undefined = undefined;
    const percentMatch = line.match(/[-+]?\d+(?:\.\d+)?%/);
    if (percentMatch) {
      profitRate = parseFloat(percentMatch[0].replace("%", ""));
    }

    if (price > 0 && quantity > 0) {
      parsedTransactions.push({
        id: `tx-${index}-${Date.now()}`,
        date: dateStr,
        time: timeStr,
        ticker,
        type,
        price,
        quantity,
        profitRate,
        amount: price * quantity,
      });
    }
  });

  // 날짜 순 정렬 (오래된 순) 후 누락된 수익률을 FIFO 매칭으로 자동 보정
  const sorted = parsedTransactions.sort((a, b) => a.date.localeCompare(b.date));
  return fillMissingProfitRates(sorted);
}
