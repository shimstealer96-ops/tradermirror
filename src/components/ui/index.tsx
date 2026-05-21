"use client";

import React, { createContext, useContext, useState } from "react";

// ==========================================
// BUTTON COMPONENT
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
      secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
      outline: "border border-slate-700 hover:bg-slate-800 text-slate-300",
      danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
      success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
      ghost: "hover:bg-slate-800 text-slate-400 hover:text-slate-200",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// ==========================================
// CARD COMPONENTS
// ==========================================
export function Card({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass-panel rounded-xl border border-slate-800 p-6 shadow-xl ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col space-y-1.5 mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-xl font-bold text-slate-100 tracking-tight leading-none ${className}`} {...props}>{children}</h3>;
}

export function CardDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-slate-400 mt-1 ${className}`} {...props}>{children}</p>;
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>;
}

// ==========================================
// TABS COMPONENTS
// ==========================================
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className = "",
}: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [localTab, setLocalTab] = useState(defaultValue || "");
  const activeTab = value !== undefined ? value : localTab;
  const setActiveTab = (val: string) => {
    if (value === undefined) setLocalTab(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex space-x-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-lg backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used inside Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={`flex-1 text-center py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used inside Tabs");

  if (context.activeTab !== value) return null;

  return <div className={`mt-4 focus:outline-none animate-fadeIn ${className}`}>{children}</div>;
}

// ==========================================
// SLIDER COMPONENT
// ==========================================
interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ min, max, step = 1, value, onChange, className = "" }: SliderProps) {
  return (
    <div className={`flex items-center space-x-4 w-full ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
      />
      <span className="text-sm font-bold text-blue-400 w-12 text-right">{value}x</span>
    </div>
  );
}

// ==========================================
// DIALOG / MODAL COMPONENTS
// ==========================================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="relative glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl text-slate-100 z-10 scale-in">
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// SKELETON LOADER
// ==========================================
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-800/80 ${className}`} />
  );
}

// ==========================================
// SWITCH / TOGGLE BUTTONS
// ==========================================
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelLeft: string;
  labelRight: string;
  className?: string;
}

export function Toggle({ checked, onChange, labelLeft, labelRight, className = "" }: ToggleProps) {
  return (
    <div className={`inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
          !checked
            ? "bg-slate-800 text-slate-100"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        {labelLeft}
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
          checked
            ? "bg-slate-800 text-slate-100"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        {labelRight}
      </button>
    </div>
  );
}
