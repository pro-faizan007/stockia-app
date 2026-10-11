import React from 'react';
import {
  Wheat,
  BookOpen,
  Warehouse,
  Calculator,
  TrendingUp,
  Sliders,
  PlusCircle,
  PackagePlus,
  Layers,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import { CropConfig, AppTheme } from '../types';

interface HeaderProps {
  activeTab: 'combine' | 'visits' | 'godam' | 'calculator' | 'fluctuations' | 'settings';
  setActiveTab: (tab: 'combine' | 'visits' | 'godam' | 'calculator' | 'fluctuations' | 'settings') => void;
  selectedCropId: string; // 'all' or crop id
  setSelectedCropId: (id: string) => void;
  crops: CropConfig[];
  onOpenNewVisit: () => void;
  onOpenNewBatch: () => void;
  theme: AppTheme;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCropId,
  setSelectedCropId,
  crops,
  onOpenNewVisit,
  onOpenNewBatch,
  theme,
  toggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Identity */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 ring-1 ring-amber-400/30 shrink-0">
              <Wheat className="w-4 h-4 sm:w-6 sm:h-6 text-slate-950 font-bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-black text-sm sm:text-xl tracking-tight text-white whitespace-nowrap">
                  Mandi<span className="text-amber-400">Stockia</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 hidden sm:inline-block">
                  PKR / من
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden md:block">
                Grain Stock, Mandi Visits & Dhalta / Bori Price Tracker (Pakistan)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons (Optimized & decreased for small mobile screens - no overflow/side cut) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Global Theme Toggle (Cycles Dark -> Light -> High Contrast for Outdoor Grain Market Glare) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center p-1.5 sm:px-2.5 sm:py-2 text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap border ${
                theme === 'dark'
                  ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700/80 hover:border-amber-400/50'
                  : theme === 'high-contrast'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-slate-950 font-black shadow-md'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
              }`}
              title={
                theme === 'dark'
                  ? 'لائٹ موڈ پر جائیں (Switch to Clean Light Mode)'
                  : theme === 'light'
                  ? 'دھوپ / ہائی کنٹراسٹ موڈ پر جائیں (Switch to High Contrast Glare Mode)'
                  : 'نائٹ / ڈارک موڈ پر جائیں (Switch to Dark Mode)'
              }
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' && (
                <>
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline ml-1">نائٹ</span>
                  <span className="hidden lg:inline text-[10px] opacity-75 font-normal ml-0.5">(Dark)</span>
                </>
              )}
              {theme === 'light' && (
                <>
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                  <span className="hidden sm:inline ml-1">لائٹ</span>
                  <span className="hidden lg:inline text-[10px] opacity-75 font-normal ml-0.5">(Light)</span>
                </>
              )}
              {theme === 'high-contrast' && (
                <>
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0 fill-current" />
                  <span className="hidden sm:inline ml-1">دھوپ</span>
                  <span className="hidden lg:inline text-[10px] font-black ml-0.5">(Hi-Con)</span>
                </>
              )}
            </button>

            {/* Shop Visit Note Button (Compact on mobile) */}
            <button
              onClick={onOpenNewVisit}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
              title="Record shop visit note"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">وزٹ</span>
              <span className="hidden sm:inline">دکان وزٹ</span>
              <span className="hidden lg:inline text-[11px] opacity-80 font-normal">(Note)</span>
            </button>

            {/* Warehouse Stock Batch Button (Compact on mobile) */}
            <button
              onClick={onOpenNewBatch}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap"
              title="Record bought lot into warehouse"
            >
              <PackagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="sm:hidden">خرید</span>
              <span className="hidden sm:inline">خرید مال</span>
              <span className="hidden lg:inline text-[11px] opacity-80 font-normal">(Stock)</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Row: Desktop Tabs + Clean Mobile/Desktop Crop Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 sm:py-2 border-t border-slate-800/80 gap-1.5 sm:gap-3">
          {/* Tab Navigation (DESKTOP ONLY: on mobile, tabs are cleanly placed in sticky bottom bar) */}
          <nav className="hidden sm:flex items-center gap-1 overflow-x-auto pb-0 scrollbar-none text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('combine')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'combine'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>کُل کھاتہ و خلاصہ</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Overview)</span>
            </button>

            <button
              onClick={() => setActiveTab('visits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'visits'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دکان وزٹ ڈائری</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Shop Diary)</span>
            </button>

            <button
              onClick={() => setActiveTab('godam')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'godam'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>گودام سٹاک</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Godam)</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>کاؤنٹر کیلکولیٹر</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Calc)</span>
            </button>

            <button
              onClick={() => setActiveTab('fluctuations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'fluctuations'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>منڈی بھاؤ</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Rates)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>فصلیں و کٹوتی</span>
              <span className="text-[10px] opacity-70 hidden md:inline">(Settings)</span>
            </button>
          </nav>

          {/* Crop Filter Pill Strip (Never mixes up crops, works smoothly on mobile & desktop) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none w-full sm:w-auto">
            <span className="text-[11px] sm:text-xs text-amber-400/90 whitespace-nowrap font-bold flex items-center gap-1 shrink-0">
              فصل فلٹر:
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSelectedCropId('all')}
                className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCropId === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-sm ring-1 ring-amber-300'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                تمام فصلیں (All)
              </button>
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCropId === crop.id
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm ring-1 ring-amber-300'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {crop.urduName} <span className="opacity-75 font-sans">({crop.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
