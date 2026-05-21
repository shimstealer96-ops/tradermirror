import { LeadSubmission } from '@/types/lead'

export function generateAutoTags(data: Partial<LeadSubmission>): string[] {
  const tags: string[] = []

  if (data.source === 'landing_form') tags.push('랜딩페이지 신청폼')
  if (data.source === 'cta_popup') tags.push('무료분석 버튼 팝업')
  if (data.source === 'onboarding') tags.push('회원가입 직후 온보딩')

  const expMap: Record<string, string> = {
    '아직 시작 전': '시작 전',
    '주식 현물 경험 있음': '주식 경험자',
    '주식 선물 경험 있음': '주식 경험자',
    '코인 현물 경험 있음': '코인 경험자',
    '코인 선물 경험 있음': '선물 경험자',
    '현재 손실 중': '손실 중',
    '꾸준히 매매 중': '꾸준히 매매 중',
  }
  if (data.investment_experience && expMap[data.investment_experience]) {
    tags.push(expMap[data.investment_experience])
  }

  const intMap: Record<string, string> = {
    '주식 현물': '주식 현물 관심',
    '주식 선물': '주식 선물 관심',
    '코인 현물': '코인 현물 관심',
    '코인 선물': '코인 선물 관심',
    '아직 모르겠음': '투자유형 미정',
  }
  if (data.investment_interest && intMap[data.investment_interest]) {
    tags.push(intMap[data.investment_interest])
  }

  const painMap: Record<string, string> = {
    '뭘 사야 할지 모르겠음': '종목선택 고민',
    '손절 기준이 없음': '손절기준 없음',
    '수익은 짧게 먹고 손실은 오래 버팀': '손실 장기보유',
    '장 초반/급등주에 자주 물림': '장초반 물림',
    '코인 선물 청산가·레버리지가 헷갈림': '청산가/레버리지 고민',
    '매매일지를 써도 어떻게 복기할지 모르겠음': '복기 어려움',
    '감정매매/FOMO가 심함': '감정매매',
    '적금만 하다가 투자를 시작하려니 무서움': '투자공포',
  }
  if (data.pain_point && painMap[data.pain_point]) {
    tags.push(painMap[data.pain_point])
  }

  if (data.desired_benefits?.includes('투자상태별 1:1 맞춤 진단')) tags.push('1:1 진단 희망')
  if (data.desired_benefits?.includes('MoneyStep 전자책 50% 할인권')) tags.push('전자책 할인권 희망')
  if (data.desired_benefits?.includes('전부 받고 싶음')) tags.push('전체 혜택 희망')

  return [...new Set(tags)]
}
