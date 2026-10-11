import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CombineOverview } from './components/CombineOverview';
import { ShopVisitDiary } from './components/ShopVisitDiary';
import { GodamInventory } from './components/GodamInventory';
import { MandiCalculator } from './components/MandiCalculator';
import { CropSeasonSettings } from './components/CropSeasonSettings';
import { PriceFluctuations } from './components/PriceFluctuations';
import { VisitNoteModal } from './components/VisitNoteModal';
import { BatchModal } from './components/BatchModal';
import { SaleModal } from './components/SaleModal';
import {
  DEFAULT_CROPS,
  INITIAL_PRICE_HISTORY,
  INITIAL_SALES,
  INITIAL_STOCK_BATCHES,
  INITIAL_VISIT_NOTES,
} from './utils/mockData';
import { CropConfig, MandiRateHistory, SaleRecord, ShopVisitNote, StockBatch, AppTheme } from './types';
import {
  RotateCcw,
  Layers,
  BookOpen,
  Warehouse,
  Calculator,
  TrendingUp,
  Sliders,
} from 'lucide-react';

export default function App() {
  // 1. Persistent State with localStorage
  const [crops, setCrops] = useState<CropConfig[]>(() => {
    try {
      const saved = localStorage.getItem('mandi_crops_v1');
      return saved ? JSON.parse(saved) : DEFAULT_CROPS;
    } catch {
      return DEFAULT_CROPS;
    }
  });

  const [visits, setVisits] = useState<ShopVisitNote[]>(() => {
    try {
      const saved = localStorage.getItem('mandi_visits_v1');
      return saved ? JSON.parse(saved) : INITIAL_VISIT_NOTES;
    } catch {
      return INITIAL_VISIT_NOTES;
    }
  });

  const [batches, setBatches] = useState<StockBatch[]>(() => {
    try {
      const saved = localStorage.getItem('mandi_batches_v1');
      return saved ? JSON.parse(saved) : INITIAL_STOCK_BATCHES;
    } catch {
      return INITIAL_STOCK_BATCHES;
    }
  });

  const [sales, setSales] = useState<SaleRecord[]>(() => {
    try {
      const saved = localStorage.getItem('mandi_sales_v1');
      return saved ? JSON.parse(saved) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  const [rateHistory, setRateHistory] = useState<MandiRateHistory[]>(() => {
    try {
      const saved = localStorage.getItem('mandi_history_v1');
      return saved ? JSON.parse(saved) : INITIAL_PRICE_HISTORY;
    } catch {
      return INITIAL_PRICE_HISTORY;
    }
  });

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem('mandi_crops_v1', JSON.stringify(crops));
  }, [crops]);

  useEffect(() => {
    localStorage.setItem('mandi_visits_v1', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('mandi_batches_v1', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('mandi_sales_v1', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('mandi_history_v1', JSON.stringify(rateHistory));
  }, [rateHistory]);

  // Global Theme: 'dark' (Default), 'light' (Day), 'high-contrast' (Outdoor Mandi Glare)
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('mandi_theme_v1') as AppTheme | null;
      if (saved === 'light' || saved === 'high-contrast') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mandi_theme_v1', theme);
      document.documentElement.classList.remove('dark', 'light-mode', 'high-contrast-mode');
      if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
      } else if (theme === 'high-contrast') {
        document.documentElement.classList.add('light-mode', 'high-contrast-mode');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'high-contrast';
      return 'dark';
    });
  };

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<
    'combine' | 'visits' | 'godam' | 'calculator' | 'fluctuations' | 'settings'
  >('combine');
  const [selectedCropId, setSelectedCropId] = useState<string>('all');

  // 3. Modals State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<ShopVisitNote | null>(null);
  const [initialCropForVisit, setInitialCropForVisit] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null);
  const [batchFromVisit, setBatchFromVisit] = useState<ShopVisitNote | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [batchForSale, setBatchForSale] = useState<StockBatch | null>(null);

  // Visit Note Actions
  const handleOpenNewVisit = (cropId?: string) => {
    setEditingVisit(null);
    setInitialCropForVisit(cropId || (selectedCropId === 'all' ? undefined : selectedCropId));
    setIsVisitModalOpen(true);
  };

  const handleEditVisit = (visit: ShopVisitNote) => {
    setEditingVisit(visit);
    setIsVisitModalOpen(true);
  };

  const handleSaveVisit = (saved: ShopVisitNote) => {
    setVisits((prev) => {
      const idx = prev.findIndex((v) => v.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteVisit = (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ دکان وزٹ نوٹ حذف کرنا چاہتے ہیں؟')) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleConvertToBatch = (visit: ShopVisitNote) => {
    // Open Batch Modal prefilled with this visit note!
    setEditingBatch(null);
    setBatchFromVisit(visit);
    setIsBatchModalOpen(true);
  };

  // Batch / Godam Actions
  const handleOpenNewBatch = (cropId?: string) => {
    setEditingBatch(null);
    setBatchFromVisit(null);
    setIsBatchModalOpen(true);
  };

  const handleEditBatch = (batch: StockBatch) => {
    setEditingBatch(batch);
    setBatchFromVisit(null);
    setIsBatchModalOpen(true);
  };

  const handleSaveBatch = (batch: StockBatch) => {
    setBatches((prev) => {
      const idx = prev.findIndex((b) => b.id === batch.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = batch;
        return next;
      }
      return [batch, ...prev];
    });

    // If converted from a visit note, mark the visit as purchased
    if (batchFromVisit) {
      setVisits((prev) =>
        prev.map((v) => (v.id === batchFromVisit.id ? { ...v, status: 'purchased' } : v))
      );
      setBatchFromVisit(null);
    }
  };

  const handleDeleteBatch = (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ گودام لاٹ حذف کرنا چاہتے ہیں؟')) {
      setBatches((prev) => prev.filter((b) => b.id !== id));
    }
  };

  // Sale Actions
  const handleRecordSale = (batch: StockBatch) => {
    setBatchForSale(batch);
    setIsSaleModalOpen(true);
  };

  const handleSaveSale = (sale: SaleRecord, updatedBatch: StockBatch) => {
    setSales((prev) => [sale, ...prev]);
    setBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));
  };

  // Crop Settings Actions
  const handleUpdateCrop = (crop: CropConfig) => {
    setCrops((prev) => prev.map((c) => (c.id === crop.id ? crop : c)));
  };

  const handleAddCrop = (crop: CropConfig) => {
    setCrops((prev) => [...prev, crop]);
  };

  const handleDeleteCrop = (id: string) => {
    if (crops.length <= 1) return;
    if (window.confirm('کیا آپ واقعی یہ فصل حذف کرنا چاہتے ہیں؟')) {
      setCrops((prev) => prev.filter((c) => c.id !== id));
      if (selectedCropId === id) setSelectedCropId('all');
    }
  };

  // Rate History
  const handleAddRateHistory = (entry: MandiRateHistory) => {
    setRateHistory((prev) => [entry, ...prev]);
    // Also update crop's current rate
    setCrops((prev) =>
      prev.map((c) => (c.id === entry.cropId ? { ...c, currentMarketRatePerMund: entry.avgRate } : c))
    );
  };

  // Reset to default sample mandi data
  const handleResetData = () => {
    if (window.confirm('کیا آپ تمام ڈیٹا اصلی نمونہ ریکارڈز پر ری سیٹ کرنا چاہتے ہیں؟')) {
      localStorage.removeItem('mandi_crops_v1');
      localStorage.removeItem('mandi_visits_v1');
      localStorage.removeItem('mandi_batches_v1');
      localStorage.removeItem('mandi_sales_v1');
      localStorage.removeItem('mandi_history_v1');
      setCrops(DEFAULT_CROPS);
      setVisits(INITIAL_VISIT_NOTES);
      setBatches(INITIAL_STOCK_BATCHES);
      setSales(INITIAL_SALES);
      setRateHistory(INITIAL_PRICE_HISTORY);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'light-mode bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      } flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-150`}
    >
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCropId={selectedCropId}
        setSelectedCropId={setSelectedCropId}
        crops={crops}
        onOpenNewVisit={() => handleOpenNewVisit()}
        onOpenNewBatch={() => handleOpenNewBatch()}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 sm:pb-10">
        {activeTab === 'combine' && (
          <CombineOverview
            crops={crops}
            batches={batches}
            sales={sales}
            visits={visits}
            selectedCropId={selectedCropId}
            onNavigateTab={setActiveTab}
            onSelectCrop={(cropId) => {
              setSelectedCropId(cropId);
              setActiveTab('godam');
            }}
          />
        )}

        {activeTab === 'visits' && (
          <ShopVisitDiary
            visits={visits}
            crops={crops}
            selectedCropId={selectedCropId}
            onOpenNewVisit={handleOpenNewVisit}
            onEditVisit={handleEditVisit}
            onDeleteVisit={handleDeleteVisit}
            onConvertToBatch={handleConvertToBatch}
          />
        )}

        {activeTab === 'godam' && (
          <GodamInventory
            batches={batches}
            crops={crops}
            selectedCropId={selectedCropId}
            onOpenNewBatch={handleOpenNewBatch}
            onEditBatch={handleEditBatch}
            onDeleteBatch={handleDeleteBatch}
            onRecordSale={handleRecordSale}
            sales={sales}
          />
        )}

        {activeTab === 'calculator' && (
          <MandiCalculator
            crops={crops}
            selectedCropId={selectedCropId}
          />
        )}

        {activeTab === 'fluctuations' && (
          <PriceFluctuations
            crops={crops}
            selectedCropId={selectedCropId}
            rateHistory={rateHistory}
            onAddRateHistory={handleAddRateHistory}
          />
        )}

        {activeTab === 'settings' && (
          <CropSeasonSettings
            crops={crops}
            onUpdateCrop={handleUpdateCrop}
            onAddCrop={handleAddCrop}
            onDeleteCrop={handleDeleteCrop}
            theme={theme}
            setTheme={setTheme}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Navigation Bar (Thumb-friendly & high-contrast) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/98 backdrop-blur-lg border-t border-slate-800/90 px-1 py-1.5 flex justify-around items-center shadow-2xl safe-bottom">
        <button
          onClick={() => setActiveTab('combine')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'combine'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">کھاتہ</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'visits'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">وزٹ نوٹ</span>
        </button>

        <button
          onClick={() => setActiveTab('godam')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'godam'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Warehouse className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">گودام</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'calculator'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">کیلکولیٹر</span>
        </button>

        <button
          onClick={() => setActiveTab('fluctuations')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'fluctuations'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">بھاؤ</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl text-[10px] font-bold cursor-pointer transition-all active:scale-95 ${
            activeTab === 'settings'
              ? 'text-amber-400 bg-amber-500/15 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          <span className="truncate w-full text-center">سیٹنگز</span>
        </button>
      </nav>

      {/* Footer (Full clearance above fixed mobile bottom menu) */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 pt-6 pb-28 sm:pb-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-extrabold text-white">MandiStockia</span>
            <span>•</span>
            <span className="text-slate-400">غلہ منڈی سٹاک، دکان وزٹ و ڈھلتا حساب کتاب ایپ (پاکستان)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <span className="font-mono text-slate-400">1 من = 40 کلو • PKR (₨)</span>
            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer active:scale-95 shadow-sm"
              title="نمونہ منڈی ڈیٹا دوبارہ لوڈ کریں"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>ری سیٹ سیمپل ڈیٹا</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VisitNoteModal
        isOpen={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setEditingVisit(null);
        }}
        onSave={handleSaveVisit}
        crops={crops}
        initialCropId={initialCropForVisit}
        initialVisit={editingVisit}
      />

      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setEditingBatch(null);
          setBatchFromVisit(null);
        }}
        onSave={handleSaveBatch}
        crops={crops}
        initialBatch={editingBatch}
        fromVisitNote={batchFromVisit}
      />

      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setBatchForSale(null);
        }}
        onSaveSale={handleSaveSale}
        batch={batchForSale}
        crop={crops.find((c) => c.id === batchForSale?.cropId)}
      />
    </div>
  );
}
