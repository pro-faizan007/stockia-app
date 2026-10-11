import React, { useState } from 'react';
import {
  Warehouse,
  Package,
  TrendingUp,
  Plus,
  Scale,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CropConfig, SaleRecord, StockBatch } from '../types';
import { formatMunds, formatPKR, MUND_KG } from '../utils/mandiCalculations';

type SortField = 'date' | 'price' | 'weight';
type SortOrder = 'desc' | 'asc';

interface GodamInventoryProps {
  batches: StockBatch[];
  crops: CropConfig[];
  selectedCropId: string;
  onOpenNewBatch: (initialCropId?: string) => void;
  onEditBatch: (batch: StockBatch) => void;
  onDeleteBatch: (id: string) => void;
  onRecordSale: (batch: StockBatch) => void;
  sales: SaleRecord[];
}

export const GodamInventory: React.FC<GodamInventoryProps> = ({
  batches,
  crops,
  selectedCropId,
  onOpenNewBatch,
  onEditBatch,
  onDeleteBatch,
  onRecordSale,
  sales,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_stock' | 'sold'>('in_stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState<string>(selectedCropId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Keep cropFilter synced if top selectedCropId changes
  React.useEffect(() => {
    setCropFilter(selectedCropId);
  }, [selectedCropId]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    (cropFilter !== 'all' && cropFilter !== selectedCropId) ||
    startDate ||
    endDate ||
    filterStatus !== 'in_stock' ||
    sortField !== 'date' ||
    sortOrder !== 'desc'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setCropFilter(selectedCropId);
    setStartDate('');
    setEndDate('');
    setFilterStatus('in_stock');
    setSortField('date');
    setSortOrder('desc');
  };

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredBatches = batches.filter((b) => {
    // Crop filter
    const activeCropId = cropFilter !== 'all' ? cropFilter : selectedCropId;
    const matchesCrop = activeCropId === 'all' || b.cropId === activeCropId;

    // Status filter
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'in_stock'
        ? b.remainingBags > 0
        : b.remainingBags === 0;

    // Search query (shop number, seller name, lot number, godam location, crop variety)
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.sellerShopNo.toLowerCase().includes(q) ||
      b.sellerName.toLowerCase().includes(q) ||
      b.lotNumber.toLowerCase().includes(q) ||
      b.godamLocation.toLowerCase().includes(q) ||
      b.cropVariety.toLowerCase().includes(q) ||
      b.notes.toLowerCase().includes(q);

    // Date range filter on purchaseDate
    const matchesStartDate = !startDate || b.purchaseDate >= startDate;
    const matchesEndDate = !endDate || b.purchaseDate <= endDate;

    return matchesCrop && matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Apply quick sorting
  const sortedBatches = [...filteredBatches].sort((a, b) => {
    if (sortField === 'date') {
      const cmp = (a.purchaseDate || '').localeCompare(b.purchaseDate || '');
      return sortOrder === 'desc' ? -cmp : cmp;
    }
    if (sortField === 'price') {
      const priceA = a.purchaseRatePerMund || 0;
      const priceB = b.purchaseRatePerMund || 0;
      return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
    }
    if (sortField === 'weight') {
      const weightA = a.remainingBags * a.bagWeightKg;
      const weightB = b.remainingBags * b.bagWeightKg;
      return sortOrder === 'desc' ? weightB - weightA : weightA - weightB;
    }
    return 0;
  });

  // Calculate live holdings
  const activeBatches = batches.filter((b) => (selectedCropId === 'all' || b.cropId === selectedCropId) && b.remainingBags > 0);
  const totalBagsHolding = activeBatches.reduce((acc, b) => acc + b.remainingBags, 0);
  const totalMundsHolding = activeBatches.reduce((acc, b) => acc + (b.remainingBags * b.bagWeightKg) / MUND_KG, 0);

  const totalCapitalInvested = activeBatches.reduce((acc, b) => {
    return acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags;
  }, 0);

  const totalCurrentMarketValue = activeBatches.reduce((acc, b) => {
    const crop = crops.find((c) => c.id === b.cropId);
    const rate = crop?.currentMarketRatePerMund || b.purchaseRatePerMund;
    const munds = (b.remainingBags * b.bagWeightKg) / MUND_KG;
    return acc + munds * rate;
  }, 0);

  const totalUnrealizedGain = totalCurrentMarketValue - totalCapitalInvested;

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              گودام سٹاک و ہولڈنگ (Warehouse Inventory)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Active Stock
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سٹاک میں موجود اجناس، خرید ریٹ، باردانہ، پلے داری، اور آج کے منڈی ریٹ کے حساب سے لائیو نفع/نقصان۔
          </p>
        </div>

        <button
          onClick={() => onOpenNewBatch(selectedCropId === 'all' ? undefined : selectedCropId)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>نیا مال گودام میں داخل کریں</span>
        </button>
      </div>

      {/* Snapshot Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
        <div>
          <span className="text-slate-400 block">گودام میں کل مال</span>
          <span className="text-lg font-black text-white">
            {totalBagsHolding} بوری <span className="text-amber-400 text-xs font-semibold">({formatMunds(totalMundsHolding)} من)</span>
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">لگا ہوا سرمایہ (Landed Cost)</span>
          <span className="text-lg font-black text-blue-400">
            {formatPKR(totalCapitalInvested)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">آج کی منڈی ویلیو</span>
          <span className="text-lg font-black text-emerald-400">
            {formatPKR(totalCurrentMarketValue)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">متوقع غیر فروخت شدہ نفع</span>
          <span className={`text-lg font-black ${totalUnrealizedGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalUnrealizedGain >= 0 ? `+${formatPKR(totalUnrealizedGain)}` : formatPKR(totalUnrealizedGain)}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar (Shop number, Crop type, Date range) */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* 1. Search Bar (Shop number, seller, lot #) */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="دکان نمبر، بیوپاری نام، لاٹ نمبر، یا گودام تلاش کریں (Search Shop #, Lot, Seller)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Crop Type Filter */}
          <div className="flex items-center gap-2">
            <select
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">تمام فصلیں (All Crops)</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.urduName} ({c.name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Date Range Filter */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-slate-400">از تاریخ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-slate-400">تا تاریخ:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Status Pills & Active Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus('in_stock')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterStatus === 'in_stock'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              موجود مال ({batches.filter((b) => b.remainingBags > 0).length})
            </button>
            <button
              onClick={() => setFilterStatus('sold')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterStatus === 'sold'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              مکمل فروخت شدہ ({batches.filter((b) => b.remainingBags === 0).length})
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                filterStatus === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              تمام لاٹس ({batches.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">
              فلٹر شدہ نتائج: <strong className="text-white">{filteredBatches.length}</strong> لاٹس
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer whitespace-nowrap"
              >
                فلٹرز ری سیٹ کریں (Reset)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Sorting Interface (Mobile-First Thumb-Friendly) */}
      <div className="bg-slate-900/90 p-3 sm:p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <ArrowUpDown className="w-4 h-4 text-amber-400 shrink-0" />
            <span>فوری ترتیب (Quick Sort):</span>
          </div>

          <span className="text-[11px] text-amber-300/90 font-mono font-semibold sm:hidden">
            {sortField === 'date' && (sortOrder === 'desc' ? 'تازہ ترین تاریخ' : 'پرانی تاریخ پہلے')}
            {sortField === 'price' && (sortOrder === 'desc' ? 'زیادہ خرید ریٹ' : 'کم خرید ریٹ')}
            {sortField === 'weight' && (sortOrder === 'desc' ? 'زیادہ باقی وزن' : 'کم باقی وزن')}
          </span>
        </div>

        {/* 3 Quick Sort Buttons */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">
          {/* 1. Date Sort */}
          <button
            onClick={() => handleSortToggle('date')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
              sortField === 'date'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/70 hover:bg-slate-800'
            }`}
            title="تاریخ خرید کے مطابق ترتیب دیں (Click to toggle Newest/Oldest)"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>تاریخ</span>
            {sortField === 'date' ? (
              sortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
            ) : null}
          </button>

          {/* 2. Price Sort */}
          <button
            onClick={() => handleSortToggle('price')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
              sortField === 'price'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/70 hover:bg-slate-800'
            }`}
            title="خرید ریٹ فی من کے مطابق ترتیب دیں (Click to toggle High/Low)"
          >
            <Coins className="w-3.5 h-3.5 shrink-0" />
            <span>خرید ریٹ</span>
            {sortField === 'price' ? (
              sortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
            ) : null}
          </button>

          {/* 3. Weight / Volume Sort */}
          <button
            onClick={() => handleSortToggle('weight')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border active:scale-95 ${
              sortField === 'weight'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700/70 hover:bg-slate-800'
            }`}
            title="باقی وزن / بوری کے مطابق ترتیب دیں (Click to toggle Most/Least)"
          >
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span>باقی وزن</span>
            {sortField === 'weight' ? (
              sortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
            ) : null}
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      {sortedBatches.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl p-12 text-center border border-dashed border-slate-700">
          <Warehouse className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">کوئی سٹاک لاٹ نہیں ملا</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            اس فلٹر کے مطابق کوئی مال موجود نہیں۔ نیا خریدا ہوا مال داخل کریں۔
          </p>
          <button
            onClick={() => onOpenNewBatch(selectedCropId === 'all' ? undefined : selectedCropId)}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg cursor-pointer"
          >
            نیا مال داخل کریں
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedBatches.map((batch) => {
            const crop = crops.find((c) => c.id === batch.cropId);
            const todayMarketRate = crop?.currentMarketRatePerMund || batch.purchaseRatePerMund;

            // Calculations for remaining stock
            const isFullySold = batch.remainingBags === 0;
            const remainingMunds = (batch.remainingBags * batch.bagWeightKg) / MUND_KG;
            const allocatedCostPkr = (batch.totalInvestedPkr / (batch.initialBags || 1)) * batch.remainingBags;
            const currentValPkr = remainingMunds * todayMarketRate;
            const unrealizedPkr = currentValPkr - allocatedCostPkr;
            const gainPerMund = todayMarketRate - batch.effectiveCostPerMund;

            return (
              <div
                key={batch.id}
                className={`bg-slate-800/90 rounded-2xl p-5 border transition-all shadow-md flex flex-col justify-between space-y-4 ${
                  isFullySold
                    ? 'border-slate-800 opacity-60'
                    : 'border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div>
                  {/* Top Bar: Lot #, Crop, Godam location */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-amber-400">
                          {batch.lotNumber}
                        </span>
                        <span className="text-sm font-black text-white">
                          {crop?.urduName || batch.cropId} ({batch.cropVariety})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {batch.godamLocation}
                        </span>
                        <span>•</span>
                        <span>{batch.sellerName} ({batch.sellerShopNo})</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xs flex items-center justify-end gap-1 ${
                          sortField === 'date'
                            ? 'text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30'
                            : 'text-slate-400'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {batch.purchaseDate}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {batch.mandiName}
                      </span>
                    </div>
                  </div>

                  {/* Bags and Weight Progress Bar */}
                  <div
                    className={`mt-4 p-3 rounded-xl bg-slate-950/70 border transition-all ${
                      sortField === 'weight'
                        ? 'border-amber-500/50 ring-1 ring-amber-500/30 shadow-inner'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">
                        موجود بوری:{' '}
                        <strong className="text-white font-bold">{batch.remainingBags}</strong> / {batch.initialBags} بوری
                      </span>
                      <span className={`font-bold ${sortField === 'weight' ? 'text-amber-300 font-mono' : 'text-amber-400'}`}>
                        {formatMunds(remainingMunds)} من باقی ({batch.bagWeightKg}kg بوری)
                      </span>
                    </div>
                    {/* Progress track */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                        style={{
                          width: `${(batch.remainingBags / (batch.initialBags || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Mandi Rates Comparison (Purchase vs Market) */}
                  <div className="grid grid-cols-3 gap-2 mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <div
                      className={`p-1 rounded-lg transition-all ${
                        sortField === 'price'
                          ? 'bg-amber-500/15 border border-amber-500/40'
                          : ''
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 block">خرید ریٹ فی من</span>
                      <span
                        className={`font-extrabold text-sm ${
                          sortField === 'price' ? 'text-amber-300 font-mono' : 'text-slate-200'
                        }`}
                      >
                        {formatPKR(batch.purchaseRatePerMund)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        لاگت: {formatPKR(batch.effectiveCostPerMund)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">آج کا منڈی بھاؤ</span>
                      <span className="font-extrabold text-amber-400 text-sm">
                        {formatPKR(todayMarketRate)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        فرق: {gainPerMund >= 0 ? `+${formatPKR(gainPerMund)}` : formatPKR(gainPerMund)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">لائیو نفع / نقصان</span>
                      <span className={`font-extrabold text-sm ${unrealizedPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {unrealizedPkr >= 0 ? `+${formatPKR(unrealizedPkr)}` : formatPKR(unrealizedPkr)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {isFullySold ? 'مکمل فروخت' : 'غیر فروخت شدہ'}
                      </span>
                    </div>
                  </div>

                  {/* Dhalta and Landed Expense Breakdown */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-2 py-1 rounded bg-slate-900/40">
                    <span className="flex items-center gap-1 text-purple-300">
                      <Scale className="w-3 h-3" />
                      ڈھلتا کٹوتی حاصل: <strong>{batch.dhaltaExtraDeductedKg} کلو</strong> مفت مال
                    </span>
                    <span>
                      باردانہ: {formatPKR(batch.bardanaCostPkr)} • مزدوری: {formatPKR(batch.laborCostPkr)}
                    </span>
                  </div>

                  {batch.notes && (
                    <p className="mt-2 text-xs text-slate-400 italic bg-slate-900/30 p-2 rounded">
                      &ldquo;{batch.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <div>
                    {!isFullySold && (
                      <button
                        onClick={() => onRecordSale(batch)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>مال فروخت کریں (Sell Stock)</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBatch(batch)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="ترمیم کریں"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBatch(batch.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="حذف کریں"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
