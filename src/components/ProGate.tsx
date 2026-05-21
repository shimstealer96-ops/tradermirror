import { Lock } from 'lucide-react'
import Link from 'next/link'

interface ProGateProps {
  title?: string
  description?: string
  children?: React.ReactNode
}

export default function ProGate({
  title = 'Pro에서 확인할 수 있는 상세 분석입니다',
  description = '내가 어떤 감정, 진입 근거, 손절 습관에서 손실을 반복하는지 확인하려면 Pro 분석이 필요합니다.',
  children,
}: ProGateProps) {
  return (
    <div className="relative rounded-xl overflow-hidden">
      {children && (
        <div className="pointer-events-none select-none blur-sm opacity-30">
          {children}
        </div>
      )}
      <div className={`${children ? 'absolute inset-0' : ''} flex flex-col items-center justify-center bg-slate-900/90 border border-slate-700 rounded-xl p-8 text-center`}>
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
          <Lock className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="text-slate-100 font-bold mb-2 text-sm">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed mb-5 max-w-xs">{description}</p>
        <Link href="/pricing">
          <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm">
            7일 무료로 Pro 시작하기
          </button>
        </Link>
      </div>
    </div>
  )
}
