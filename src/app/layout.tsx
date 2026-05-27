import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrialExpiryBanner from "@/components/TrialExpiryBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "내 매매 패턴 무료 분석 | TraderMirror",
  description: "거래 내역 붙여넣으면 반복 실수를 데이터로 보여드립니다. 수익률 착시 교정, 청산가 계산, 펀딩피 계산 무료 제공",
  verification: {
    google: "mGsTiVx2IjNiICRHU0_Auo19ngqtky2SbMlyivWMQIo",
  },
  openGraph: {
    title: "내 매매 패턴 무료 분석 | TraderMirror",
    description: "투자 분석 종합 플랫폼. 거래 내역 붙여넣으면 반복 실수를 데이터로 보여드립니다.",
    type: "website",
    locale: "ko_KR",
    url: "https://tradermirror.co.kr",
    siteName: "TraderMirror",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} ${outfit.variable} h-full scroll-smooth`}>
      <body className="min-h-full bg-[#090d16] text-slate-100 flex flex-col antialiased">
        <Header />
        <TrialExpiryBanner />
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
