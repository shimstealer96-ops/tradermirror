import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// AI 분석 결과 타입 정의
interface AnalyzeResponse {
  mistakes: {
    rank: number;
    title: string;
    description: string;
  }[];
  diagnosis: string;
}

export async function POST(req: Request) {
  try {
    const { data } = await req.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "유효한 거래 내역 데이터가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // API Key가 없거나 빈 값이면 Mock 데이터를 생성하여 지연 반환 (시뮬레이터 모드)
    if (!apiKey || apiKey.trim() === "") {
      const mockResult = generateMockAnalysis(data);
      // 로딩 애니메이션을 경험할 수 있도록 1.5초 인위적 딜레이
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json(mockResult);
    }

    // Anthropic API 연동
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const formattedData = JSON.stringify(data, null, 2);

    const systemPrompt = `당신은 투자 심리 분석 전문가입니다.
아래 투자자의 거래 패턴 데이터를 분석해서 반복되는 치명적인 매매 실수 3가지를 구체적으로 짚어주고 종합 진단 한 줄을 작성해주세요.

톤앤매너:
- 냉정하고 직선적으로 말하세요.
- 따뜻한 위로나 격려의 말은 절대 배제하고 오직 차가운 데이터와 팩트 기반으로 뼈를 때리는 조언을 하세요.
- 존댓말을 쓰되, 날카로운 피드백을 전달해야 합니다.

반드시 아래 JSON 형식으로만 응답하세요. 다른 설명 텍스트나 markdown 코드 블록 표시(\`\`\`json 등)는 붙이지 말고 순수한 JSON 문자열로만 반환하세요:
{
  "mistakes": [
    {"rank": 1, "title": "실수 제목", "description": "구체적 설명"},
    {"rank": 2, "title": "실수 제목", "description": "구체적 설명"},
    {"rank": 3, "title": "실수 제목", "description": "구체적 설명"}
  ],
  "diagnosis": "종합 진단 한 줄"
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `분석 데이터:\n${formattedData}`
        }
      ]
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "";

    // AI 응답 텍스트에서 JSON 부분만 안전하게 추출하기 위해 정제
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    try {
      const parsedData: AnalyzeResponse = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("AI JSON 파싱 실패, raw response:", responseText);
      // 만약 파싱에 실패하면 차선책으로 Mock 분석 결과를 반환
      return NextResponse.json(generateMockAnalysis(data));
    }

  } catch (error: any) {
    console.error("Analyze API error:", error);
    return NextResponse.json(
      { error: error.message || "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 거래 데이터를 기반으로 사실적이고 뼈 때리는 모의 진단 결과 자동 생성
 */
function generateMockAnalysis(data: any[]): AnalyzeResponse {
  // 간단한 통계 계산
  let buys = 0;
  let sells = 0;
  let wins = 0;
  let losses = 0;
  let totalProfitRate = 0;
  let morningTrades = 0; // 09:00 ~ 10:00

  data.forEach((tx) => {
    if (tx.type === "BUY") buys++;
    if (tx.type === "SELL") {
      sells++;
      if (tx.profitRate !== undefined) {
        totalProfitRate += tx.profitRate;
        if (tx.profitRate > 0) wins++;
        else losses++;
      }
    }
    if (tx.time) {
      const hour = parseInt(tx.time.split(":")[0]);
      if (hour === 9) morningTrades++;
    }
  });

  const winRate = sells > 0 ? Math.round((wins / sells) * 100) : 50;
  const avgProfitRate = sells > 0 ? (totalProfitRate / sells).toFixed(2) : "0.00";

  const mistakesList = [
    {
      title: "장 초반 뇌동매매와 충동적 진입",
      desc: `전체 거래 중 오전 9시~10시 사이의 거래 비중이 높습니다. 장이 열리자마자 변동성에 휩쓸려 급하게 추격 매수했다가 거래세를 낭비하고 고점에 물리는 패턴이 반복되고 있습니다. 차분히 호가 흐름을 지켜본 뒤 진입하는 훈련이 필요합니다.`
    },
    {
      title: "손실 방치 및 수익 조기 실현 (손절 불가)",
      desc: `평균적으로 이익 포지션은 매우 짧게 보유하여 수익금을 빨리 확정 짓는 반면, 손실이 발생한 종목은 물타기 혹은 막연한 반등을 기대하며 지나치게 오래 보유하고 있습니다. 이로 인해 한 번의 큰 손실이 누적된 작은 수익들을 모두 상쇄해 버립니다.`
    },
    {
      title: "동일 종목 잦은 재진입 및 추격 매매",
      desc: `특정 종목에서 손실이 나면 본전 심리나 보복 심리로 인해 정밀한 기술적 분석 없이 짧은 시간 내에 여러 번 매매를 재시도하고 있습니다. 이는 잦은 수수료 누적과 멘탈 붕괴로 이어집니다.`
    },
    {
      title: "잦은 단타로 인한 누적 수수료 및 세금 과다",
      desc: `실제 매매 차익보다 거래당 지출하는 증권사 수수료 및 거래세 비중이 지나치게 높습니다. 잦은 회전율은 증권사 배만 불려줄 뿐이며, 장기적으로 계좌가 녹아내리는 주된 원인이 됩니다.`
    }
  ];

  // 상황에 맞춰 3개 선택
  const mistakes = [
    { rank: 1, title: mistakesList[0].title, description: mistakesList[0].desc },
    { rank: 2, title: mistakesList[1].title, description: mistakesList[1].desc },
    { rank: 3, title: winRate > 60 ? mistakesList[2].title : mistakesList[3].title, description: winRate > 60 ? mistakesList[2].desc : mistakesList[3].desc }
  ];

  let diagnosis = "";
  if (winRate < 45) {
    diagnosis = `승률이 ${winRate}%로 매우 저조합니다. 타점이 정교하지 않거나 추격 매수가 몸에 배어 있습니다. 매매 횟수를 1/3로 줄이지 않으면 조만간 시드가 소멸할 것입니다.`;
  } else if (parseFloat(avgProfitRate) < 0) {
    diagnosis = `승률은 ${winRate}%로 나쁘지 않으나, 평균 수익률이 ${avgProfitRate}%로 마이너스입니다. 전형적인 '소탐대실'형 매매로 손익비 관리가 전혀 이루어지지 않고 있습니다.`;
  } else {
    diagnosis = `수익을 내고는 있으나 잦은 거래로 인한 비용 누출과 손실 종목 물타기 습관이 성장을 가로막고 있습니다. 칼 같은 손절 규칙 없이는 상승장이 끝나면 가장 먼저 무너질 것입니다.`;
  }

  return { mistakes, diagnosis };
}
