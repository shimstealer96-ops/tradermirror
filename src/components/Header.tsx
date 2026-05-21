"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "매매분석", href: "/analyze" },
    { name: "계산기", href: "/tools" },
    { name: "전자책", href: "/#ebook" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-slate-100 font-extrabold text-xl tracking-wider hover:opacity-90">
              <span className="p-1.5 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-500/35 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </span>
              <span>
                Trader<span className="text-blue-500">Mirror</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-slate-100 ${
                    isActive ? "text-blue-500" : "text-slate-400"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Ebook CTA Button (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/#ebook">
              <Button variant="primary" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                전자책 보러가기
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-slate-200 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#090d16] border-b border-slate-800 animate-fadeIn">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "bg-slate-900 text-blue-500"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="px-3 py-2">
              <Link href="/#ebook" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full gap-2">
                  <BookOpen className="h-4 w-4" />
                  전자책 보러가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
