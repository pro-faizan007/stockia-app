import React from 'react';
import {
  TrendingUp,
  Warehouse,
  Coins,
  Scale,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  CheckCircle2,
  ShoppingBag,
  Layers,
  BarChart3,
  Package,
  FileDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { CropConfig, SaleRecord, ShopVisitNote, StockBatch } from '../types';
import { formatMunds, formatPKR, DEFAULT_MUND_KG } from '../utils/mandiCalculations';
import { generateFinancialAndInventoryPdf } from '../utils/pdfExport';

interface CombineOverviewProps {
  crops: CropConfig[];
  batches: StockBatch[];
  sales: SaleRecord[];
  visits: ShopVisitNote[];
  selectedCropId: string;
  onNavigateTab: (tab: 'combine' | 'visits' | 'godam' | 'calculator' | 'fluctuations' | 'settings') => void;
  onSelectCrop: (cropId: string) => void;
}

export const CombineOverview: React.FC<CombineOverviewProps> = ({
  crops,
  batches,
  sales,
  visits,
  selectedCropId,
  onNavigateTab,
  onSelectCrop,
}) => {
  // Filter by selectedCropId if not 'all'
  const filteredBatches = selectedCropId === 'all'
    ? batches
    : batches.filter((b) => b.cropId === selectedCropId);

  const filteredSales = selectedCropId === 'all'
    ? sales
    : sales.filter((s) => s.cropId === selectedCropId);

  const filteredVisits = selectedCropId === 'all'
    ? visits
    : visits.filter((v) => v.cropId === selectedCropId);

  const displayCrops = selectedCropId === 'all'
    ? crops
    : crops.filter((c) => c.id === selectedCropId);

  // 1. Dynamic Stock Aggregations
  let totalStoredBags = 0;
  let totalPhysicalKg = 0;
  let totalPhysicalMunds = 0;
  let totalCapitalInvestedPkr = 0;
  let totalCurrentMarketValuePkr = 0;
  let totalPurchaseDeductionsKg = 0;
  let totalPurchaseDeductionsPkr = 0;

  filteredBatches.forEach((batch) => {
    const crop = crops.find((c) => c.id === batch.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    const activeBags = batch.remainingBags;

    if (activeBags > 0) {
      totalStoredBags += activeBags;
      const physicalKg = activeBags * batch.bagWeightKg;
      totalPhysicalKg += physicalKg;
      const physicalMunds = physicalKg / mundWeight;
      totalPhysicalMunds += physicalMunds;

      // Allocated invested capital for remaining bags
      const investedForRemaining = (batch.totalInvestedPkr / (batch.initialBags || 1)) * activeBags;
      totalCapitalInvestedPkr += investedForRemaining;

      // Current market value if sold today at Mandi rate
      const marketRate = crop?.currentMarketRatePerMund || batch.purchaseRatePerMund;
      totalCurrentMarketValuePkr += physicalMunds * marketRate;

      // Extra deduction share
      const dhaltaShareKg = (batch.dhaltaExtraDeductedKg / (batch.initialBags || 1)) * activeBags;
      totalPurchaseDeductionsKg += dhaltaShareKg;
      totalPurchaseDeductionsPkr += (dhaltaShareKg / mundWeight) * marketRate;
    }
  });

  const unrealizedProfitPkr = totalCurrentMarketValuePkr - totalCapitalInvestedPkr;
  const unrealizedProfitPercent =
    totalCapitalInvestedPkr > 0 ? (unrealizedProfitPkr / totalCapitalInvestedPkr) * 100 : 0;

  // 2. Dynamic Realized Sales Totals (Total Sales in PKR)
  const totalSalesPkr = filteredSales.reduce((acc, s) => acc + s.totalSalePkr, 0);
  const totalRealizedProfitPkr = filteredSales.reduce((acc, s) => acc + s.netProfitPkr, 0);
  const totalSoldBags = filteredSales.reduce((acc, s) => acc + s.bagsSold, 0);

  // 3. Dynamic Total Deductions in PKR
  let totalSalesDeductionsKg = 0;
  let totalSalesDeductionsPkr = 0;

  filteredSales.forEach((sale) => {
    const crop = crops.find((c) => c.id === sale.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    totalSalesDeductionsKg += sale.dhaltaExtraGivenKg || 0;
    totalSalesDeductionsPkr +=
      ((sale.dhaltaExtraGivenKg || 0) / mundWeight) * (sale.saleRatePerMund || 0);
  });

  // Combined Total Deductions across inventory & transactions in PKR
  const totalDeductionsPkr = totalPurchaseDeductionsPkr + totalSalesDeductionsPkr;
  const totalDeductionsKg = totalPurchaseDeductionsKg + totalSalesDeductionsKg;

  // 4. Monthly Chart Data
  const monthlyDataMap: Record<
    string,
    { monthKey: string; monthLabel: string; revenue: number; expenses: number; profit: number }
  > = {};

  filteredBatches.forEach((batch) => {
    if (!batch.purchaseDate) return;
    const monthKey = batch.purchaseDate.slice(0, 7);
    if (!monthlyDataMap[monthKey]) {
      const dateObj = new Date(batch.purchaseDate + 'T00:00:00');
      const monthLabel = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : monthKey;
      monthlyDataMap[monthKey] = {
        monthKey,
        monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
    }
    monthlyDataMap[monthKey].expenses += batch.totalInvestedPkr || 0;
  });

  filteredSales.forEach((sale) => {
    if (!sale.saleDate) return;
    const monthKey = sale.saleDate.slice(0, 7);
    if (!monthlyDataMap[monthKey]) {
      const dateObj = new Date(sale.saleDate + 'T00:00:00');
      const monthLabel = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : monthKey;
      monthlyDataMap[monthKey] = {
        monthKey,
        monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
    }
    monthlyDataMap[monthKey].revenue += sale.totalSalePkr || 0;
    monthlyDataMap[monthKey].profit += sale.netProfitPkr || 0;
  });

  const monthlyChartData = Object.values(monthlyDataMap).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );

  const formatYAxisPKR = (val: number) => {
    if (val >= 1_000_000) return `₨ ${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₨ ${(val / 1_000).toFixed(0)}k`;
    return `₨ ${val}`;
  };

  // Copy WhatsApp Summary
  const [copied, setCopied] = React.useState(false);
  const handleCopyWhatsApp = () => {
    const activeCropName =
      selectedCropId === 'all'
        ? 'تمام فصلیں (All Crops)'
        : crops.find((c) => c.id === selectedCropId)?.name || 'فصل';

    const text = `📊 *منڈی سٹاک رپورٹ (Mandi Stockia Report)*
-----------------------------------
🌾 *فصل:* ${activeCropName}
💰 *کل فروخت (Total Sales):* ${formatPKR(totalSalesPkr)}
✂️ *کل کٹوتیاں (Total Deductions):* ${formatPKR(totalDeductionsPkr)} (${totalDeductionsKg.toFixed(0)} کلو)
🏢 *گودام میں کل سٹاک:* ${totalStoredBags} بوری (${formatMunds(totalPhysicalMunds)} من / ${(totalPhysicalKg / 1000).toFixed(1)} ٹن)
💵 *لگایا گیا سرمایہ:* ${formatPKR(totalCapitalInvestedPkr)}
📈 *آج کی منڈی ویلیو:* ${formatPKR(totalCurrentMarketValuePkr)}
🔥 *تخمینہ منافع (Unrealized):* ${formatPKR(unrealizedProfitPkr)} (${unrealizedProfitPercent.toFixed(1)}%)
✅ *فروخت شدہ نقد منافع (Realized):* ${formatPKR(totalRealizedProfitPkr)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportPdf = () => {
    generateFinancialAndInventoryPdf({
      crops,
      batches,
      sales,
      selectedCropId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with WhatsApp Share & PDF Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              کُل کھاتہ و گودام فنانشیلز (Financial Dashboard)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of total sales, total deductions in PKR (₨), and comprehensive inventory for all crops.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportPdf}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer active:scale-95 shadow-sm"
            title="Download PDF document of financial summary & inventory report"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>PDF رپورٹ ڈاؤن لوڈ (Export PDF)</span>
          </button>

          <button
            onClick={handleCopyWhatsApp}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>کاپی ہو گیا!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>واٹس ایپ خلاصہ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CORE KPI CARDS GRID (Requested by user) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL SALES IN PKR */}
        <div className="bg-slate-800/95 rounded-2xl p-5 border border-emerald-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              کل فروخت (Total Sales in PKR)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              فروخت شدہ
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
              {formatPKR(totalSalesPkr)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 mt-2">
              <span>
                تعداد: <strong className="text-white font-bold">{totalSoldBags}</strong> بوری فروخت
              </span>
              <span className="text-emerald-300 font-semibold">
                نفع: +{formatPKR(totalRealizedProfitPkr)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: TOTAL DEDUCTIONS IN PKR */}
        <div className="bg-slate-800/95 rounded-2xl p-5 border border-purple-500/40 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              کل کٹوتیاں (Total Deductions in PKR)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-mono">
              ڈھلتا بچت
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight font-mono">
              {formatPKR(totalDeductionsPkr)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 mt-2">
              <span>
                کل وزن: <strong className="text-white font-bold">{totalDeductionsKg.toFixed(0)}</strong> کلو
              </span>
              <span className="text-purple-200 font-medium">
                ({formatMunds(totalDeductionsKg / DEFAULT_MUND_KG)} من کٹوتی)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: TOTAL INVENTORY HOLDING */}
        <div className="bg-slate-800/95 rounded-2xl p-5 border border-slate-700/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4" />
              موجودہ گودام سٹاک (Total Inventory)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
              گودام
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatMunds(totalPhysicalMunds)}{' '}
              <span className="text-sm font-semibold text-amber-400">من</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
              <span>
                <strong className="text-white font-bold">{totalStoredBags}</strong> بوری
              </span>
              <span>
                <strong className="text-white font-bold">{(totalPhysicalKg / 1000).toFixed(1)}</strong> میٹرک ٹن
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: CURRENT STOCK VALUE & UNREALIZED GAIN */}
        <div className="bg-slate-800/95 rounded-2xl p-5 border border-slate-700/80 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              سٹاک مارکیٹ ویلیو (Current Market Value)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
              مارکیٹ بھاؤ
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              {formatPKR(totalCurrentMarketValuePkr)}
            </div>
            <div className="flex items-center justify-between text-xs mt-2">
              <span className="text-slate-400">
                لاگت: {formatPKR(totalCapitalInvestedPkr)}
              </span>
              <span
                className={`font-bold ${
                  unrealizedProfitPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {unrealizedProfitPkr >= 0 ? `+${formatPKR(unrealizedProfitPkr)}` : formatPKR(unrealizedProfitPkr)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SECTION: SUMMARY OF CURRENT STOCK INVENTORY FOR ALL CROPS */}
      <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>تمام فصلوں کا موجودہ سٹاک خلاصہ (Summary of Current Stock for All Crops)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dynamic real-time summary of inventory, bag weights, mund volume, deductions, and invested capital per crop.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>کل فعال فصلیں:</span>
            <span className="font-bold text-white font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
              {displayCrops.length}
            </span>
          </div>
        </div>

        {/* Mobile View: High-Density Responsive Crop Stock Cards (< sm) */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {displayCrops.map((crop) => {
            const cropBatches = batches.filter(
              (b) => b.cropId === crop.id && b.remainingBags > 0
            );
            const cropHoldingBags = cropBatches.reduce((acc, b) => acc + b.remainingBags, 0);
            const cropHoldingKg = cropBatches.reduce(
              (acc, b) => acc + b.remainingBags * b.bagWeightKg,
              0
            );
            const mundWeight = crop.defaultMundWeightKg || DEFAULT_MUND_KG;
            const cropHoldingMunds = cropHoldingKg / mundWeight;

            const cropInvestedPkr = cropBatches.reduce((acc, b) => {
              return acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags;
            }, 0);

            const cropMarketValPkr = cropHoldingMunds * crop.currentMarketRatePerMund;
            const cropProfitPkr = cropMarketValPkr - cropInvestedPkr;

            const cropDeductionsKg = cropBatches.reduce((acc, b) => {
              return acc + (b.dhaltaExtraDeductedKg / (b.initialBags || 1)) * b.remainingBags;
            }, 0);
            const cropDeductionsPkr =
              (cropDeductionsKg / mundWeight) * crop.currentMarketRatePerMund;

            return (
              <div
                key={crop.id}
                onClick={() => onSelectCrop(crop.id)}
                className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/80 space-y-2.5 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-white text-sm">
                      {crop.urduName} <span className="text-slate-400 font-sans font-normal">({crop.name.split(' ')[0]})</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">{crop.season}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block font-mono">
                      {cropHoldingBags} بوری
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatMunds(cropHoldingMunds)} من
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">لگایا گیا سرمایہ</span>
                    <span className="font-bold text-slate-200 font-mono">{formatPKR(cropInvestedPkr)}</span>
                  </div>
                  <div className="bg-slate-800/60 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">آج کی مارکیٹ ویلیو</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatPKR(cropMarketValPkr)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-300">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-purple-300">ڈھلتا:</span>
                    <span className="font-mono text-purple-200 font-semibold">{formatPKR(cropDeductionsPkr)}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({cropDeductionsKg.toFixed(0)}kg)</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">منافع:</span>
                    <span
                      className={`font-bold font-mono ${
                        cropProfitPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {cropHoldingBags > 0
                        ? cropProfitPkr >= 0
                          ? `+${formatPKR(cropProfitPkr)}`
                          : formatPKR(cropProfitPkr)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop & Tablet Table View (hidden on mobile, shown on sm+) */}
        <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="min-w-full text-xs text-right divide-y divide-slate-800">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] bg-slate-900/60">
                  <th className="py-2.5 px-3 font-semibold">فصل و سیزن</th>
                  <th className="py-2.5 px-3 font-semibold">موجود بوری</th>
                  <th className="py-2.5 px-3 font-semibold">کل وزن (من)</th>
                  <th className="py-2.5 px-3 font-semibold">کل کلو (Kg)</th>
                  <th className="py-2.5 px-3 font-semibold">لگایا گیا سرمایہ (PKR)</th>
                  <th className="py-2.5 px-3 font-semibold">منڈی ریٹ /من</th>
                  <th className="py-2.5 px-3 font-semibold">آج کی مارکیٹ ویلیو</th>
                  <th className="py-2.5 px-3 font-semibold">کٹوتی (PKR)</th>
                  <th className="py-2.5 px-3 font-semibold">غیر فروخت نفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayCrops.map((crop) => {
                  const cropBatches = batches.filter(
                    (b) => b.cropId === crop.id && b.remainingBags > 0
                  );
                  const cropHoldingBags = cropBatches.reduce((acc, b) => acc + b.remainingBags, 0);
                  const cropHoldingKg = cropBatches.reduce(
                    (acc, b) => acc + b.remainingBags * b.bagWeightKg,
                    0
                  );
                  const mundWeight = crop.defaultMundWeightKg || DEFAULT_MUND_KG;
                  const cropHoldingMunds = cropHoldingKg / mundWeight;

                  const cropInvestedPkr = cropBatches.reduce((acc, b) => {
                    return acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags;
                  }, 0);

                  const cropMarketValPkr = cropHoldingMunds * crop.currentMarketRatePerMund;
                  const cropProfitPkr = cropMarketValPkr - cropInvestedPkr;

                  // Crop deduction benefit
                  const cropDeductionsKg = cropBatches.reduce((acc, b) => {
                    return acc + (b.dhaltaExtraDeductedKg / (b.initialBags || 1)) * b.remainingBags;
                  }, 0);
                  const cropDeductionsPkr =
                    (cropDeductionsKg / mundWeight) * crop.currentMarketRatePerMund;

                  return (
                    <tr
                      key={crop.id}
                      className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                      onClick={() => onSelectCrop(crop.id)}
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">
                          {crop.urduName} ({crop.name.split(' ')[0]})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{crop.season}</span>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-white text-sm">{cropHoldingBags}</span>{' '}
                        <span className="text-slate-400 text-[10px]">بوری ({crop.defaultBoriWeightKg}kg)</span>
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {formatMunds(cropHoldingMunds)}{' '}
                        <span className="text-slate-400 text-[10px]">({mundWeight}kg/من)</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {(cropHoldingKg || 0).toLocaleString()} kg
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-200">
                        {formatPKR(cropInvestedPkr)}
                      </td>

                      <td className="py-3 px-3 font-mono text-amber-300 font-semibold">
                        {formatPKR(crop.currentMarketRatePerMund)}
                      </td>

                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                        {formatPKR(cropMarketValPkr)}
                      </td>

                      <td className="py-3 px-3 font-mono text-purple-300">
                        {formatPKR(cropDeductionsPkr)}{' '}
                        <span className="text-[10px] text-purple-400">({cropDeductionsKg.toFixed(0)}kg)</span>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span
                          className={`font-bold ${
                            cropProfitPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {cropHoldingBags > 0
                            ? cropProfitPkr >= 0
                              ? `+${formatPKR(cropProfitPkr)}`
                              : formatPKR(cropProfitPkr)
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE VS EXPENSES BAR CHART */}
      <div className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/70">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                ماہانہ فروخت آمدن بمقابلہ خرید لاگت (Monthly Revenue vs. Expenses)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison of grain sales revenue and inventory purchase costs (including Bardana & Labor) in PKR (₨).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold font-mono">
              آمدن: {formatPKR(totalSalesPkr)}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold font-mono">
              خرید لاگت: {formatPKR(totalCapitalInvestedPkr)}
            </span>
          </div>
        </div>

        {monthlyChartData.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            کوئی مالیاتی ڈیٹا موجود نہیں۔ مال خریدیں یا فروخت کا اندراج کریں۔
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickFormatter={formatYAxisPKR}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as {
                        monthLabel: string;
                        revenue: number;
                        expenses: number;
                        profit: number;
                      };
                      return (
                        <div className="bg-slate-900/95 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md min-w-[200px]">
                          <p className="font-extrabold text-white border-b border-slate-800 pb-1.5">
                            {data.monthLabel}
                          </p>
                          <div className="flex items-center justify-between gap-3 text-emerald-400">
                            <span>فروخت آمدن:</span>
                            <span className="font-bold font-mono">{formatPKR(data.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-amber-400">
                            <span>خرید لاگت:</span>
                            <span className="font-bold font-mono">{formatPKR(data.expenses)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-slate-200 pt-1.5 border-t border-slate-800">
                            <span>فروخت نفع:</span>
                            <span className="font-bold font-mono text-emerald-300">
                              +{formatPKR(data.profit)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                  formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
                />
                <Bar
                  dataKey="revenue"
                  name="فروخت آمدن (Sales Revenue PKR)"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
                <Bar
                  dataKey="expenses"
                  name="خرید لاگت (Purchase Costs PKR)"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* RECENT SHOP VISITS MVP SPOTLIGHT */}
      <div className="bg-slate-800/80 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>حالیہ دکان وزٹ و ریٹ ڈائری (Recent Shop Visits)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                MVP Notes
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              دکان نمبر، کوالٹی جائزہ، خرید قیمت، اور منڈی فروخت ریٹ
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('visits')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-500/40 cursor-pointer"
          >
            تمام وزٹ نوٹس دیکھیں ({visits.length}) →
          </button>
        </div>

        {filteredVisits.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            کوئی دکان وزٹ نوٹس موجود نہیں۔ نیا نوٹ درج کریں۔
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVisits.slice(0, 3).map((visit) => {
              const crop = crops.find((c) => c.id === visit.cropId);
              const margin =
                (visit.sellingPriceInMarketPerMund || 0) - (visit.ratePerMund || 0);

              return (
                <div
                  key={visit.id}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/60 text-xs space-y-2 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-white block text-sm">{visit.shopNo}</span>
                      <span className="text-slate-400 text-[11px]">{visit.agentName}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {visit.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-amber-400 font-semibold">{crop?.urduName || visit.cropId}</span>
                    <span className="text-white font-extrabold">
                      خرید: {formatPKR(visit.ratePerMund)} /من
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>
                      مقامی منڈی بھاؤ: <strong className="text-emerald-400">{formatPKR(visit.sellingPriceInMarketPerMund || 0)}</strong>
                    </span>
                    <span className={margin >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                      فرق: {margin >= 0 ? `+${formatPKR(margin)}` : formatPKR(margin)}
                    </span>
                  </div>

                  {visit.qualityDescription && (
                    <p className="text-[11px] text-slate-300 italic bg-slate-800/40 p-1.5 rounded">
                      &ldquo;{visit.qualityDescription}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
