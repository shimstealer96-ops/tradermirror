'use client'
import { X } from 'lucide-react'
import Link from 'next/link'

interface LimitModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'journal' | 'analysis'
}

export default function LimitModal({ isOpen, onClose, type }: LimitModalProps) {
  if (!isOpen) return null
  const isJournal = type === 'journal'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1421] border border-slate-700 rounded-2xl max-w-md w-full p-8 text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="text-4xl mb-4">{isJournal ? '📒' : '📊'}</div>
        <h2 className="text-xl font-black text-slate-100 mb-3">
          {isJournal
            ? '오늘 무료 등록 가능 개수를 모두 사용했습니다'
            : '오늘 무료 분석 1회를 모두 사용했습니다'}
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-8 whitespace-pre-line">
          {isJournal
            ? 'Free 플랜에서는 하루 5개까지 매매일지를 등록할 수 있습니다.\n더 많은 거래를 기록하고 싶다면 Pro로 업그레이드하세요.'
            : 'Free 플랜에서는 하루 1회 매매패턴 분석이 가능합니다.\n무제한 분석과 AI 리포트 전체 기능을 사용하려면 Pro로 업그레이드하세요.'}
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/pricing" onClick={onClose}>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
              {isJournal ? 'Pro로 무제한 기록하기' : 'Pro로 무제한 분석하기'}
            </button>
          </Link>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-400 text-sm py-2 transition-colors">
            {isJournal ? '내일 다시 기록하기' : '내일 다시 분석하기'}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-6 leading-relaxed">
          본 서비스는 사용자의 매매기록을 바탕으로 한 복기 도구입니다. 특정 종목 추천, 매수·매도 지시, 수익 보장을 제공하지 않습니다.
        </p>
      </div>
    </div>
  )
}
