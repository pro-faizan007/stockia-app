import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
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
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import {
  DEFAULT_CROPS,
  INITIAL_PRICE_HISTORY,
  INITIAL_SALES,
  INITIAL_STOCK_BATCHES,
  INITIAL_VISIT_NOTES,
} from './utils/mockData';
import {
  CropConfig,
  MandiRateHistory,
  SaleRecord,
  ShopVisitNote,
  StockBatch,
  AppTheme,
  UserProfile,
} from './types';
import {
  auth,
  testFirestoreConnection,
  logOutUser,
  isUserSuperAdmin,
  SUPER_ADMIN_EMAIL,
} from './lib/firebase';
import {
  fetchUserProfile,
  saveUserProfile,
  fetchUserCrops,
  saveUserCrop,
  saveAllUserCrops,
  deleteUserCrop,
  fetchUserVisits,
  saveUserVisit,
  deleteUserVisit,
  fetchUserBatches,
  saveUserBatch,
  deleteUserBatch,
  fetchUserSales,
  saveUserSale,
  fetchUserRateHistory,
  saveUserRateHistory,
} from './lib/dataService';
import {
  RotateCcw,
  Layers,
  BookOpen,
  Warehouse,
  Calculator,
  TrendingUp,
  Sliders,
  Sparkles,
  ShieldCheck,
  Crown,
} from 'lucide-react';

export default function App() {
  // 1. Authentication & Multi-Tenant State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewingOtherUser, setViewingOtherUser] = useState<UserProfile | null>(null);

  // Modals for Auth and Super Admin
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isSuperAdminModalOpen, setIsSuperAdminModalOpen] = useState(false);

  // Landing Page vs App Workspace View
  // Default to showing Landing Page if not logged in. If user logs in, show app.
  const [showLandingPage, setShowLandingPage] = useState<boolean>(() => {
    try {
      const demoFlag = localStorage.getItem('mandi_in_demo_v1');
      return demoFlag !== 'true';
    } catch {
      return true;
    }
  });

  // 2. Data State
  const [crops, setCrops] = useState<CropConfig[]>(DEFAULT_CROPS);
  const [visits, setVisits] = useState<ShopVisitNote[]>(INITIAL_VISIT_NOTES);
  const [batches, setBatches] = useState<StockBatch[]>(INITIAL_STOCK_BATCHES);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [rateHistory, setRateHistory] = useState<MandiRateHistory[]>(INITIAL_PRICE_HISTORY);

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

  // 3. Navigation State
  const [activeTab, setActiveTab] = useState<
    'combine' | 'visits' | 'godam' | 'calculator' | 'fluctuations' | 'settings'
  >('combine');
  const [selectedCropId, setSelectedCropId] = useState<string>('all');

  // 4. Record Modals State
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<ShopVisitNote | null>(null);
  const [initialCropForVisit, setInitialCropForVisit] = useState<string | undefined>(undefined);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<StockBatch | null>(null);
  const [batchFromVisit, setBatchFromVisit] = useState<ShopVisitNote | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [batchForSale, setBatchForSale] = useState<StockBatch | null>(null);

  // Effective Target User ID: If super admin is inspecting another user, target that user's ID
  const effectiveUserId = viewingOtherUser?.uid || currentUser?.uid;

  // Load User Data from Firestore
  const loadUserData = useCallback(async (targetUid: string) => {
    try {
      // 1. Profile
      const prof = await fetchUserProfile(targetUid);
      if (prof && !viewingOtherUser) {
        setUserProfile(prof);
      }

      // 2. Crops
      const userCrops = await fetchUserCrops(targetUid);
      if (userCrops && userCrops.length > 0) {
        setCrops(userCrops);
      } else {
        // Seed default crops for new users
        setCrops(DEFAULT_CROPS);
        await saveAllUserCrops(targetUid, DEFAULT_CROPS);
      }

      // 3. Visits
      const userVisits = await fetchUserVisits(targetUid);
      setVisits(userVisits || []);

      // 4. Batches
      const userBatches = await fetchUserBatches(targetUid);
      setBatches(userBatches || []);

      // 5. Sales
      const userSales = await fetchUserSales(targetUid);
      setSales(userSales || []);

      // 6. Rate History
      const userRates = await fetchUserRateHistory(targetUid);
      setRateHistory(userRates && userRates.length > 0 ? userRates : INITIAL_PRICE_HISTORY);
    } catch (err) {
      console.error('Failed to load user data from Firestore:', err);
    }
  }, [viewingOtherUser]);

  // Boot connection check & Auth state listener
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const isSuper = isUserSuperAdmin(user);
        setIsSuperAdmin(isSuper);

        // Fetch or create user profile
        let profile = await fetchUserProfile(user.uid);
        if (!profile) {
          profile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'غلہ تاجر',
            role: isSuper ? 'superadmin' : 'user',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          await saveUserProfile(profile);
        }
        setUserProfile(profile);

        // Load data for this user
        await loadUserData(user.uid);

        // Show workspace when logged in
        setShowLandingPage(false);
      } else {
        setIsSuperAdmin(false);
        setUserProfile(null);
        setViewingOtherUser(null);

        // Load cached demo/guest data
        try {
          const savedCrops = localStorage.getItem('mandi_crops_v1');
          if (savedCrops) setCrops(JSON.parse(savedCrops));
          const savedVisits = localStorage.getItem('mandi_visits_v1');
          if (savedVisits) setVisits(JSON.parse(savedVisits));
          const savedBatches = localStorage.getItem('mandi_batches_v1');
          if (savedBatches) setBatches(JSON.parse(savedBatches));
          const savedSales = localStorage.getItem('mandi_sales_v1');
          if (savedSales) setSales(JSON.parse(savedSales));
          const savedRates = localStorage.getItem('mandi_history_v1');
          if (savedRates) setRateHistory(JSON.parse(savedRates));
        } catch (e) {
          console.error(e);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData]);

  // When Super Admin switches to another user
  useEffect(() => {
    if (viewingOtherUser) {
      loadUserData(viewingOtherUser.uid);
    }
  }, [viewingOtherUser, loadUserData]);

  // Local storage sync for guest/demo mode
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem('mandi_crops_v1', JSON.stringify(crops));
        localStorage.setItem('mandi_visits_v1', JSON.stringify(visits));
        localStorage.setItem('mandi_batches_v1', JSON.stringify(batches));
        localStorage.setItem('mandi_sales_v1', JSON.stringify(sales));
        localStorage.setItem('mandi_history_v1', JSON.stringify(rateHistory));
      } catch (e) {
        console.error(e);
      }
    }
  }, [currentUser, crops, visits, batches, sales, rateHistory]);

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

  const handleSaveVisit = async (saved: ShopVisitNote) => {
    setVisits((prev) => {
      const idx = prev.findIndex((v) => v.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    if (effectiveUserId) {
      await saveUserVisit(effectiveUserId, saved);
    }
  };

  const handleDeleteVisit = async (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ دکان وزٹ نوٹ حذف کرنا چاہتے ہیں؟')) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
      if (effectiveUserId) {
        await deleteUserVisit(effectiveUserId, id);
      }
    }
  };

  const handleConvertToBatch = (visit: ShopVisitNote) => {
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

  const handleSaveBatch = async (batch: StockBatch) => {
    setBatches((prev) => {
      const idx = prev.findIndex((b) => b.id === batch.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = batch;
        return next;
      }
      return [batch, ...prev];
    });

    if (effectiveUserId) {
      await saveUserBatch(effectiveUserId, batch);
    }

    if (batchFromVisit) {
      const updatedVisit = { ...batchFromVisit, status: 'purchased' as const };
      setVisits((prev) =>
        prev.map((v) => (v.id === batchFromVisit.id ? updatedVisit : v))
      );
      if (effectiveUserId) {
        await saveUserVisit(effectiveUserId, updatedVisit);
      }
      setBatchFromVisit(null);
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (window.confirm('کیا آپ واقعی یہ گودام لاٹ حذف کرنا چاہتے ہیں؟')) {
      setBatches((prev) => prev.filter((b) => b.id !== id));
      if (effectiveUserId) {
        await deleteUserBatch(effectiveUserId, id);
      }
    }
  };

  // Sale Actions
  const handleRecordSale = (batch: StockBatch) => {
    setBatchForSale(batch);
    setIsSaleModalOpen(true);
  };

  const handleSaveSale = async (sale: SaleRecord, updatedBatch: StockBatch) => {
    setSales((prev) => [sale, ...prev]);
    setBatches((prev) => prev.map((b) => (b.id === updatedBatch.id ? updatedBatch : b)));

    if (effectiveUserId) {
      await saveUserSale(effectiveUserId, sale, updatedBatch);
    }
  };

  // Crop Settings Actions
  const handleUpdateCrop = async (crop: CropConfig) => {
    setCrops((prev) => prev.map((c) => (c.id === crop.id ? crop : c)));
    if (effectiveUserId) {
      await saveUserCrop(effectiveUserId, crop);
    }
  };

  const handleAddCrop = async (crop: CropConfig) => {
    setCrops((prev) => [...prev, crop]);
    if (effectiveUserId) {
      await saveUserCrop(effectiveUserId, crop);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (crops.length <= 1) return;
    if (window.confirm('کیا آپ واقعی یہ فصل حذف کرنا چاہتے ہیں؟')) {
      setCrops((prev) => prev.filter((c) => c.id !== id));
      if (selectedCropId === id) setSelectedCropId('all');
      if (effectiveUserId) {
        await deleteUserCrop(effectiveUserId, id);
      }
    }
  };

  // Rate History
  const handleAddRateHistory = async (entry: MandiRateHistory) => {
    setRateHistory((prev) => [entry, ...prev]);
    const updatedCrops = crops.map((c) =>
      c.id === entry.cropId ? { ...c, currentMarketRatePerMund: entry.avgRate } : c
    );
    setCrops(updatedCrops);

    if (effectiveUserId) {
      await saveUserRateHistory(effectiveUserId, entry);
      const updatedCrop = updatedCrops.find((c) => c.id === entry.cropId);
      if (updatedCrop) {
        await saveUserCrop(effectiveUserId, updatedCrop);
      }
    }
  };

  // Reset to default sample mandi data
  const handleResetData = () => {
    if (window.confirm('کیا آپ تمام ڈیٹا اصلی نمونہ ریکارڈز پر ری سیٹ کرنا چاہتے ہیں؟')) {
      setCrops(DEFAULT_CROPS);
      setVisits(INITIAL_VISIT_NOTES);
      setBatches(INITIAL_STOCK_BATCHES);
      setSales(INITIAL_SALES);
      setRateHistory(INITIAL_PRICE_HISTORY);

      if (effectiveUserId) {
        saveAllUserCrops(effectiveUserId, DEFAULT_CROPS);
      }
    }
  };

  const handleEnterDemo = () => {
    try {
      localStorage.setItem('mandi_in_demo_v1', 'true');
    } catch (e) {
      console.error(e);
    }
    setShowLandingPage(false);
  };

  const handleLogout = async () => {
    await logOutUser();
    try {
      localStorage.removeItem('mandi_in_demo_v1');
    } catch (e) {
      console.error(e);
    }
    setShowLandingPage(true);
  };

  // Render Promotional Landing Page if user selected or not logged in without demo
  if (showLandingPage) {
    return (
      <div
        className={`min-h-screen ${
          theme === 'light' ? 'light-mode bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
        } flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-150`}
      >
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthModalMode(mode);
            setIsAuthModalOpen(true);
          }}
          onEnterDemo={handleEnterDemo}
          isLoggedIn={Boolean(currentUser)}
          onGoToApp={() => setShowLandingPage(false)}
          userEmail={currentUser?.email}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setShowLandingPage(false);
          }}
        />
      </div>
    );
  }

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
        currentUser={currentUser}
        userProfile={userProfile}
        isSuperAdmin={isSuperAdmin}
        viewingOtherUser={viewingOtherUser}
        onOpenSuperAdmin={() => setIsSuperAdminModalOpen(true)}
        onOpenAuth={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onShowLandingPage={() => setShowLandingPage(true)}
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 pt-6 pb-28 sm:pb-8 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-extrabold text-white">MandiStockia</span>
            <span>•</span>
            <span className="text-slate-400">غلہ منڈی سٹاک، دکان وزٹ و ڈھلتا حساب کتاب ایپ (پاکستان)</span>
            {currentUser && (
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                کلاؤڈ سنک فعال
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-[11px] flex-wrap justify-center">
            <button
              onClick={() => setShowLandingPage(true)}
              className="text-amber-400 hover:underline font-bold"
            >
              تعارفی صفحہ دیکھیں
            </button>
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

      {/* Record Modals */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setShowLandingPage(false);
        }}
      />

      {/* Super Admin Modal */}
      <SuperAdminModal
        isOpen={isSuperAdminModalOpen}
        onClose={() => setIsSuperAdminModalOpen(false)}
        currentViewingUserId={effectiveUserId || ''}
        onSelectUserToView={(target) => {
          setViewingOtherUser(target);
          setIsSuperAdminModalOpen(false);
        }}
        onResetToSelf={() => {
          setViewingOtherUser(null);
          if (currentUser) {
            loadUserData(currentUser.uid);
          }
          setIsSuperAdminModalOpen(false);
        }}
        superAdminEmail={SUPER_ADMIN_EMAIL}
      />
    </div>
  );
}
