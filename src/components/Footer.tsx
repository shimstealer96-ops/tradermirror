import Link from "next/link";
import { TrendingUp, AlertTriangle, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050811] border-t border-slate-900 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-slate-100 font-extrabold text-lg tracking-wider">
              <span className="p-1 bg-blue-600 rounded text-white flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </span>
              <span>
                Trader<span className="text-blue-500">Mirror</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              거래 내역 데이터를 정밀하게 분석하여 무의식적인 투자 실수를 시각화하고 교정하도록 돕는 플랫폼입니다.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">서비스</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/analyze" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  매매 일지 분석기
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  투자 계산기 모음
                </Link>
              </li>
              <li>
                <Link href="/#ebook" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
                  초보 투자 교과서 전자책
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 — 문의 */}
          <div>
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">문의 및 정보</h4>
            <p className="text-sm text-slate-400 mb-4">biinohiiketsu@gmail.com</p>
            <a
              href="mailto:biinohiiketsu@gmail.com?subject=TraderMirror 문의"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
            >
              <Mail className="h-4 w-4" />
              문의하기
            </a>
            <p className="text-xs text-slate-500 mt-6">© 2026 TraderMirror. All rights reserved.</p>
          </div>
        </div>

        {/* Disclaimer Area */}
        <div className="mt-8 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 text-xs text-slate-500 bg-slate-950/40 p-4 rounded-xl border border-slate-900/40">
          <AlertTriangle className="h-5 w-5 text-amber-500/80 shrink-0" />
          <p className="leading-relaxed">
            <strong className="text-slate-400">면책 고지:</strong> 본 서비스에서 제공하는 모든 계산 결과 및 AI 분석 진단 정보는 투자 참고용일 뿐이며 어떠한 경우에도 투자 결과에 대한 법적 책임 소지의 증빙자료로 사용될 수 없습니다. 투자 결과에 대한 최종 책임은 본인에게 있습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
