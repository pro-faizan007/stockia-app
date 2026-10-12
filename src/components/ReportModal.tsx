import React, { useRef, useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  Wheat,
  Building2,
  Warehouse,
  ShoppingBag,
  Scale,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  Coins,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  CropConfig,
  SaleRecord,
  StockBatch,
  ShopVisitNote,
  GodownRentRecord,
  UserProfile,
} from '../types';
import { formatPKR, formatMunds, DEFAULT_MUND_KG } from '../utils/mandiCalculations';
import { generateFinancialAndInventoryPdf } from '../utils/pdfExport';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropConfig[];
  batches: StockBatch[];
  sales: SaleRecord[];
  visits: ShopVisitNote[];
  rents?: GodownRentRecord[];
  selectedCropId?: string;
  userProfile?: UserProfile | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  crops,
  batches,
  sales,
  visits,
  rents = [],
  selectedCropId = 'all',
  userProfile,
}) => {
  const [activeCropFilter, setActiveCropFilter] = useState<string>(selectedCropId);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const page3Ref = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const reportDate = new Date().toISOString().split('T')[0];
  const reportTime = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
  const reportId = `MS-${reportDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Filter records by crop
  const filteredBatches =
    activeCropFilter === 'all'
      ? batches
      : batches.filter((b) => b.cropId === activeCropFilter);

  const filteredSales =
    activeCropFilter === 'all'
      ? sales
      : sales.filter((s) => s.cropId === activeCropFilter);

  const filteredVisits =
    activeCropFilter === 'all'
      ? visits
      : visits.filter((v) => v.cropId === activeCropFilter);

  const displayCrops =
    activeCropFilter === 'all'
      ? crops
      : crops.filter((c) => c.id === activeCropFilter);

  // Financial aggregates
  const totalSalesPkr = filteredSales.reduce((sum, s) => sum + s.totalSalePkr, 0);
  const totalRealizedProfitPkr = filteredSales.reduce((sum, s) => sum + s.netProfitPkr, 0);
  const totalSoldBags = filteredSales.reduce((sum, s) => sum + s.bagsSold, 0);

  let totalStoredBags = 0;
  let totalStoredKg = 0;
  let totalStoredMunds = 0;
  let totalInvestedPkr = 0;
  let totalMarketValuePkr = 0;
  let totalDeductionsKg = 0;
  let totalDeductionsPkr = 0;

  filteredBatches.forEach((batch) => {
    const crop = crops.find((c) => c.id === batch.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    const activeBags = batch.remainingBags;

    if (activeBags > 0) {
      totalStoredBags += activeBags;
      const physicalKg = activeBags * batch.bagWeightKg;
      totalStoredKg += physicalKg;
      const physicalMunds = physicalKg / mundWeight;
      totalStoredMunds += physicalMunds;

      const investedForRemaining = (batch.totalInvestedPkr / (batch.initialBags || 1)) * activeBags;
      totalInvestedPkr += investedForRemaining;

      const marketRate = crop?.currentMarketRatePerMund || batch.purchaseRatePerMund;
      totalMarketValuePkr += physicalMunds * marketRate;

      const dhaltaShareKg = (batch.dhaltaExtraDeductedKg / (batch.initialBags || 1)) * activeBags;
      totalDeductionsKg += dhaltaShareKg;
      totalDeductionsPkr += (dhaltaShareKg / mundWeight) * marketRate;
    }
  });

  filteredSales.forEach((sale) => {
    const crop = crops.find((c) => c.id === sale.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    totalDeductionsKg += sale.dhaltaExtraGivenKg || 0;
    totalDeductionsPkr +=
      ((sale.dhaltaExtraGivenKg || 0) / mundWeight) * (sale.saleRatePerMund || 0);
  });

  const unrealizedProfitPkr = totalMarketValuePkr - totalInvestedPkr;
  const unrealizedProfitPercent =
    totalInvestedPkr > 0 ? (unrealizedProfitPkr / totalInvestedPkr) * 100 : 0;

  // Rent aggregates
  const totalMonthlyRentPkr = rents.reduce((sum, r) => {
    let m = r.rentPkr;
    if (r.frequency === 'quarterly') m = r.rentPkr / 3;
    else if (r.frequency === 'half_yearly') m = r.rentPkr / 6;
    else if (r.frequency === 'yearly') m = r.rentPkr / 12;
    return sum + m;
  }, 0);
  const costPerBagPerMonth = totalStoredBags > 0 ? totalMonthlyRentPkr / totalStoredBags : 0;

  // Handle PDF Generation via enhanced high-res generator
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      await generateFinancialAndInventoryPdf({
        crops,
        batches,
        sales,
        visits,
        rents,
        selectedCropId: activeCropFilter,
        userProfile,
      });

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Modal Controls Header */}
        <div className="p-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  جامع منڈی رپورٹ و مالیاتی پرچی (Official PDF Statement)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  A4 Print Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                مکمل کُل کھاتہ، گودام سٹاک لاٹس، فروخت ریکارڈ اور گودام کرایہ جات کا خوبصورت پی ڈی ایف۔
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Crop Filter Selector */}
            <select
              value={activeCropFilter}
              onChange={(e) => setActiveCropFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">تمام فصلیں (All Crops)</option>
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.urduName} ({c.name})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="پرنٹر پر پرنٹ کریں"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>پرنٹ کریں</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>پی ڈی ایف تیار ہو رہی ہے...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>ڈاؤن لوڈ مکمل!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>پی ڈی ایف ڈاؤن لوڈ کریں</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="بند کریں"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Workspace */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 space-y-6">
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              یہ مکمل رپورٹ 3 صفحات پر مشتمل باقاعدہ غلہ منڈی فارمیٹ میں تیار کی گئی ہے۔ نیچے اسکرول کر کے تمام صفحات ملاحظہ کریں۔
            </span>
          </div>

          {/* ========================================================
              PAGE 1: Executive KPI & Commodity Stock Summary
             ======================================================== */}
          <div
            ref={page1Ref}
            className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 space-y-5 border border-slate-300 print:border-none print:shadow-none print:m-0 print:p-8"
            style={{ minHeight: '297mm' }}
          >
            {/* Top Mandi Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-500 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-md">
                  🌾
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none">
                    Mandi<span className="text-amber-600">Stockia</span>
                    <span className="text-xs ml-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                      غلہ منڈی پورٹل
                    </span>
                  </h1>
                  <p className="text-xs text-slate-600 mt-1 font-semibold">
                    پاکستان غلہ منڈی جامع انوینٹری، آڑھتی کھاتہ و ڈھلتا کٹوتی رپورٹ
                  </p>
                </div>
              </div>

              {/* Merchant / Mandi Details Box */}
              <div className="text-right text-xs space-y-0.5">
                <div className="font-extrabold text-slate-950 text-sm">
                  {userProfile?.displayName || 'چوہدری غلہ کمیشن ایجنٹ'}
                </div>
                <div className="text-slate-600 font-medium">
                  {userProfile?.businessName || 'المصطفیٰ ٹریڈرز اینڈ سپلائرز'}
                </div>
                <div className="text-amber-700 font-bold">
                  {userProfile?.mandiName || 'نیو غلہ منڈی، اوکاڑہ / فیصل آباد'}
                </div>
                {userProfile?.phone && (
                  <div className="text-slate-500 font-mono text-[11px]">
                    رابطہ: {userProfile.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Sub-Header Metadata Bar */}
            <div className="flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono">
              <div>
                <span className="text-slate-500">رپورٹ نمبر: </span>
                <span className="font-bold text-slate-900">{reportId}</span>
              </div>
              <div>
                <span className="text-slate-500">تاریخ و وقت: </span>
                <span className="font-bold text-slate-900">{reportDate} • {reportTime}</span>
              </div>
              <div>
                <span className="text-slate-500">فصل انتخاب: </span>
                <span className="font-bold text-amber-700">
                  {activeCropFilter === 'all' ? 'تمام اجناس (All Crops)' : activeCropFilter}
                </span>
              </div>
            </div>

            {/* Section 1: Executive KPI Summary Cards */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2.5">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  1. ایگزیکٹو فنانشل و سٹاک سمری (Executive Financial & Inventory KPIs)
                </h3>
                <span className="text-[11px] font-mono font-bold text-slate-500">All Figures in PKR (₨)</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-xs">
                {/* KPI 1 */}
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-center">
                  <span className="text-[10px] text-emerald-800 font-bold block">کُل نقد فروخت (Total Sales)</span>
                  <span className="text-base font-black text-emerald-700 font-mono block mt-0.5">
                    {formatPKR(totalSalesPkr)}
                  </span>
                  <span className="text-[10px] text-emerald-800 block mt-0.5">
                    {totalSoldBags} بوری فروخت شدہ
                  </span>
                </div>

                {/* KPI 2 */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-300 text-center">
                  <span className="text-[10px] text-blue-800 font-bold block">حاصل شدہ خالص نفع (Realized)</span>
                  <span className="text-base font-black text-blue-700 font-mono block mt-0.5">
                    +{formatPKR(totalRealizedProfitPkr)}
                  </span>
                  <span className="text-[10px] text-blue-800 block mt-0.5">
                    نقد منافع برائے فروخت
                  </span>
                </div>

                {/* KPI 3 */}
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-center">
                  <span className="text-[10px] text-amber-800 font-bold block">گودام سٹاک (Total Stored)</span>
                  <span className="text-base font-black text-amber-900 font-mono block mt-0.5">
                    {totalStoredBags} <span className="text-xs">بوری</span>
                  </span>
                  <span className="text-[10px] text-amber-800 block mt-0.5">
                    {formatMunds(totalStoredMunds)} من ({(totalStoredKg / 1000).toFixed(1)} ٹن)
                  </span>
                </div>

                {/* KPI 4 */}
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-300 text-center">
                  <span className="text-[10px] text-purple-800 font-bold block">ڈھلتا کٹوتی بچت (Dhalta Extra)</span>
                  <span className="text-base font-black text-purple-700 font-mono block mt-0.5">
                    {formatPKR(totalDeductionsPkr)}
                  </span>
                  <span className="text-[10px] text-purple-800 block mt-0.5">
                    +{totalDeductionsKg.toFixed(0)} کلو اضافی اناج
                  </span>
                </div>
              </div>

              {/* Second row of KPIs */}
              <div className="grid grid-cols-3 gap-2.5 text-xs mt-2.5">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-center">
                  <span className="text-[10px] text-slate-600 font-bold block">لگایا گیا اصل سرمایہ (Landed Capital)</span>
                  <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                    {formatPKR(totalInvestedPkr)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">شامل باردانہ، کرایہ، مزدوری</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-center">
                  <span className="text-[10px] text-slate-600 font-bold block">موجودہ منڈی ویلیو (Market Valuation)</span>
                  <span className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                    {formatPKR(totalMarketValuePkr)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">آج کے تازہ منڈی ریٹ پر</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-center">
                  <span className="text-[10px] text-slate-600 font-bold block">تخمینہ سٹاک منافع (Holding Cushion)</span>
                  <span className={`text-sm font-black font-mono block mt-0.5 ${unrealizedProfitPkr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {unrealizedProfitPkr >= 0 ? `+${formatPKR(unrealizedProfitPkr)}` : formatPKR(unrealizedProfitPkr)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ({unrealizedProfitPercent.toFixed(1)}% متوقع منافع)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Commodity & Crop Stock Summary Table */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  2. فصل و اجناس سٹاک لیجر (Crop Inventory & Valuation Summary)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">1 Mund = 40 kg Standard</span>
              </div>

              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold">
                    <th className="p-2 text-left border border-slate-800">فصل و ورائٹی (Crop)</th>
                    <th className="p-2 text-center border border-slate-800">سیزن</th>
                    <th className="p-2 text-center border border-slate-800">بوری وزن</th>
                    <th className="p-2 text-center border border-slate-800">موجود بوریاں</th>
                    <th className="p-2 text-center border border-slate-800">کل وزن (مَن)</th>
                    <th className="p-2 text-right border border-slate-800">لاگت لاٹ (PKR)</th>
                    <th className="p-2 text-right border border-slate-800">مارکیٹ ریٹ/من</th>
                    <th className="p-2 text-right border border-slate-800">موجودہ مالیت (PKR)</th>
                    <th className="p-2 text-right border border-slate-800">تخمینہ منافع</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCrops.map((crop, idx) => {
                    const cropBatches = batches.filter((b) => b.cropId === crop.id && b.remainingBags > 0);
                    const cropBags = cropBatches.reduce((acc, b) => acc + b.remainingBags, 0);
                    const cropKg = cropBatches.reduce((acc, b) => acc + b.remainingBags * b.bagWeightKg, 0);
                    const mundWeight = crop.defaultMundWeightKg || DEFAULT_MUND_KG;
                    const cropMunds = cropKg / mundWeight;

                    const cropInvested = cropBatches.reduce((acc, b) => {
                      return acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags;
                    }, 0);

                    const cropMarketVal = cropMunds * crop.currentMarketRatePerMund;
                    const cropProfit = cropMarketVal - cropInvested;

                    return (
                      <tr key={crop.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 font-bold text-slate-900 border border-slate-300">
                          {crop.urduName} ({crop.name})
                        </td>
                        <td className="p-2 text-center text-slate-600 border border-slate-300 font-mono text-[11px]">
                          {crop.season}
                        </td>
                        <td className="p-2 text-center text-slate-700 border border-slate-300 font-mono font-bold">
                          {crop.defaultBoriWeightKg} کلو
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900 border border-slate-300 font-mono">
                          {cropBags} بوری
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900 border border-slate-300 font-mono">
                          {formatMunds(cropMunds)} من
                        </td>
                        <td className="p-2 text-right font-mono border border-slate-300">
                          {formatPKR(cropInvested)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-amber-700 border border-slate-300">
                          {formatPKR(crop.currentMarketRatePerMund)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                          {formatPKR(cropMarketVal)}
                        </td>
                        <td className={`p-2 text-right font-mono font-bold border border-slate-300 ${cropProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {cropProfit >= 0 ? `+${formatPKR(cropProfit)}` : formatPKR(cropProfit)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-2 text-left border border-slate-300 font-black">
                      میزان کُل (Grand Total)
                    </td>
                    <td className="p-2 text-center font-mono border border-slate-300">
                      {totalStoredBags}
                    </td>
                    <td className="p-2 text-center font-mono border border-slate-300">
                      {formatMunds(totalStoredMunds)}
                    </td>
                    <td className="p-2 text-right font-mono border border-slate-300">
                      {formatPKR(totalInvestedPkr)}
                    </td>
                    <td className="p-2 text-right text-[10px] text-slate-500 border border-slate-300">
                      —
                    </td>
                    <td className="p-2 text-right font-mono border border-slate-300">
                      {formatPKR(totalMarketValuePkr)}
                    </td>
                    <td className={`p-2 text-right font-mono font-black border border-slate-300 ${unrealizedProfitPkr >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {unrealizedProfitPkr >= 0 ? `+${formatPKR(unrealizedProfitPkr)}` : formatPKR(unrealizedProfitPkr)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Page 1 Verification Bar */}
            <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>صفحہ 1 از 3 • MandiStockia Official Statement</span>
              <span>تصدیق شدہ کمپیوٹرائزڈ خلاصہ • دستخط غیر ضروری</span>
            </div>
          </div>

          {/* ========================================================
              PAGE 2: Active Warehouse Stock Batches & Sales Ledger
             ======================================================== */}
          <div
            ref={page2Ref}
            className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 space-y-5 border border-slate-300 print:border-none print:shadow-none print:m-0 print:p-8"
            style={{ minHeight: '297mm' }}
          >
            {/* Page 2 Mini Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">MandiStockia</span>
                <span className="text-xs text-slate-500 font-mono">| صفحہ 2 • گودام سٹاک لاٹس و فروخت کھاتہ</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                تاریخ: {reportDate} | Ref: {reportId}
              </div>
            </div>

            {/* Section 3: Active Warehouse Batches */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  3. گودام انوینٹری لاٹس تفصیل (Active Warehouse Stock Batches)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {filteredBatches.filter((b) => b.remainingBags > 0).length} فعال لاٹس
                </span>
              </div>

              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold">
                    <th className="p-2 text-left border border-slate-800">لاٹ نمبر</th>
                    <th className="p-2 text-left border border-slate-800">جنس و ورائٹی</th>
                    <th className="p-2 text-left border border-slate-800">آڑھتی / دکان دار</th>
                    <th className="p-2 text-center border border-slate-800">خرید تاریخ</th>
                    <th className="p-2 text-center border border-slate-800">گودام لوکیشن</th>
                    <th className="p-2 text-center border border-slate-800">باقی / کل بوریاں</th>
                    <th className="p-2 text-right border border-slate-800">خرید ریٹ/من</th>
                    <th className="p-2 text-right border border-slate-800">کل لاگت لاٹ (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBatches.filter((b) => b.remainingBags > 0).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500 italic border border-slate-300">
                        کوئی فعال گودام لاٹ موجود نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    filteredBatches
                      .filter((b) => b.remainingBags > 0)
                      .map((b, idx) => {
                        const crop = crops.find((c) => c.id === b.cropId);
                        return (
                          <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-2 font-mono font-bold text-slate-900 border border-slate-300">
                              {b.lotNumber}
                            </td>
                            <td className="p-2 font-semibold text-slate-800 border border-slate-300">
                              {crop?.urduName || b.cropId} ({b.cropVariety})
                            </td>
                            <td className="p-2 text-slate-700 border border-slate-300">
                              {b.sellerName} <span className="text-[10px] text-slate-500 font-mono">({b.sellerShopNo})</span>
                            </td>
                            <td className="p-2 text-center text-slate-600 font-mono text-[11px] border border-slate-300">
                              {b.purchaseDate}
                            </td>
                            <td className="p-2 text-center text-slate-700 border border-slate-300">
                              {b.godamLocation}
                            </td>
                            <td className="p-2 text-center font-bold text-slate-900 font-mono border border-slate-300">
                              {b.remainingBags} / {b.initialBags}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-amber-700 border border-slate-300">
                              {formatPKR(b.purchaseRatePerMund)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                              {formatPKR(b.totalInvestedPkr)}
                            </td>
                          </tr>
                        );
                      })
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={5} className="p-2 text-left border border-slate-300 font-black">
                      میزان کُل فعال لاٹس (Total Active Lots)
                    </td>
                    <td className="p-2 text-center font-mono border border-slate-300">
                      {totalStoredBags} بوری
                    </td>
                    <td className="p-2 text-right border border-slate-300">
                      —
                    </td>
                    <td className="p-2 text-right font-mono font-black border border-slate-300">
                      {formatPKR(totalInvestedPkr)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 4: Sales & Dispatches Ledger */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                  4. فروخت ریکارڈ و ملز سپلائی کھاتہ (Sales & Dispatches Ledger)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {filteredSales.length} فروخت ریکارڈز
                </span>
              </div>

              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold">
                    <th className="p-2 text-center border border-slate-800">فروخت تاریخ</th>
                    <th className="p-2 text-left border border-slate-800">خریدار / فلور مل</th>
                    <th className="p-2 text-left border border-slate-800">فصل</th>
                    <th className="p-2 text-center border border-slate-800">فروخت بوریاں</th>
                    <th className="p-2 text-right border border-slate-800">فروخت ریٹ/من</th>
                    <th className="p-2 text-right border border-slate-800">کل بل رقم (PKR)</th>
                    <th className="p-2 text-right border border-slate-800">خالص نفع (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic border border-slate-300">
                        کوئی فروخت ریکارڈ موجود نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((s, idx) => {
                      const crop = crops.find((c) => c.id === s.cropId);
                      return (
                        <tr key={s.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 text-center font-mono text-slate-600 text-[11px] border border-slate-300">
                            {s.saleDate}
                          </td>
                          <td className="p-2 font-bold text-slate-900 border border-slate-300">
                            {s.buyerName} {s.buyerShopNo && <span className="text-[10px] text-slate-500">({s.buyerShopNo})</span>}
                          </td>
                          <td className="p-2 font-semibold text-slate-800 border border-slate-300">
                            {crop?.urduName || s.cropId}
                          </td>
                          <td className="p-2 text-center font-mono font-bold text-slate-900 border border-slate-300">
                            {s.bagsSold} بوری
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                            {formatPKR(s.saleRatePerMund)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                            {formatPKR(s.totalSalePkr)}
                          </td>
                          <td className="p-2 text-right font-mono font-black text-emerald-700 border border-slate-300">
                            +{formatPKR(s.netProfitPkr)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-2 text-left border border-slate-300 font-black">
                      میزان کُل فروخت (Total Sales Summary)
                    </td>
                    <td className="p-2 text-center font-mono border border-slate-300">
                      {totalSoldBags} بوری
                    </td>
                    <td className="p-2 text-right border border-slate-300">
                      —
                    </td>
                    <td className="p-2 text-right font-mono font-black border border-slate-300">
                      {formatPKR(totalSalesPkr)}
                    </td>
                    <td className="p-2 text-right font-mono font-black text-emerald-700 border border-slate-300">
                      +{formatPKR(totalRealizedProfitPkr)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Page 2 Verification Bar */}
            <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>صفحہ 2 از 3 • MandiStockia Official Statement</span>
              <span>لاٹس و سیلز تصدیق شدہ کھاتہ</span>
            </div>
          </div>

          {/* ========================================================
              PAGE 3: Godown Rent, Shop Visits & Official Stamp
             ======================================================== */}
          <div
            ref={page3Ref}
            className="w-full max-w-[210mm] mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-10 space-y-5 border border-slate-300 print:border-none print:shadow-none print:m-0 print:p-8"
            style={{ minHeight: '297mm' }}
          >
            {/* Page 3 Mini Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">MandiStockia</span>
                <span className="text-xs text-slate-500 font-mono">| صفحہ 3 • گودام کرایہ جات، دکان وزٹ و تصدیقی مہر</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                تاریخ: {reportDate} | Ref: {reportId}
              </div>
            </div>

            {/* Section 5: Godown Rent & Kiraya Multi-Cycle Ledger */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  5. گودام کرایہ و سٹوریج اخراجات (Godown Rent & Kiraya Multi-Cycle Ledger)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  ماہانہ لاگت: ₨ {costPerBagPerMonth.toFixed(1)} فی بوری
                </span>
              </div>

              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold">
                    <th className="p-2 text-left border border-slate-800">گودام نام</th>
                    <th className="p-2 text-left border border-slate-800">مقام / منڈی</th>
                    <th className="p-2 text-center border border-slate-800">گنجائش (بوریاں)</th>
                    <th className="p-2 text-center border border-slate-800">کرایہ مدت / فریکوئنسی</th>
                    <th className="p-2 text-right border border-slate-800">درج شدہ کرایہ رقم</th>
                    <th className="p-2 text-right border border-slate-800">ماہانہ مساوی خرچ</th>
                    <th className="p-2 text-center border border-slate-800">حیثیت</th>
                  </tr>
                </thead>
                <tbody>
                  {rents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic border border-slate-300">
                        کوئی گودام کرایہ درج نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    rents.map((r, idx) => {
                      let monthlyEq = r.rentPkr;
                      if (r.frequency === 'quarterly') monthlyEq = r.rentPkr / 3;
                      else if (r.frequency === 'half_yearly') monthlyEq = r.rentPkr / 6;
                      else if (r.frequency === 'yearly') monthlyEq = r.rentPkr / 12;

                      const freqLabel =
                        r.frequency === 'monthly'
                          ? 'ماہانہ (1 ماہ)'
                          : r.frequency === 'quarterly'
                          ? 'سہ ماہی (3 ماہ)'
                          : r.frequency === 'half_yearly'
                          ? 'چھ ماہی (6 ماہ)'
                          : 'سالانہ (12 ماہ)';

                      return (
                        <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 font-bold text-slate-900 border border-slate-300">
                            {r.godamName}
                          </td>
                          <td className="p-2 text-slate-700 border border-slate-300">
                            {r.location || 'مرکزی غلہ منڈی'}
                          </td>
                          <td className="p-2 text-center font-mono border border-slate-300">
                            {r.capacityBags ? `${r.capacityBags} بوری` : '—'}
                          </td>
                          <td className="p-2 text-center font-bold text-amber-800 border border-slate-300">
                            {freqLabel}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                            {formatPKR(r.rentPkr)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-blue-700 border border-slate-300">
                            {formatPKR(Math.round(monthlyEq))}
                          </td>
                          <td className="p-2 text-center border border-slate-300">
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                              {r.status === 'paid' ? 'ادا شدہ' : r.status === 'due' ? 'واجب الادا' : 'پیشگی'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Section 6: Shop Visit Diary & Market Survey */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-300 mb-2">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  6. دکان وزٹ ڈائری و منڈی بھاؤ سروے (Shop Visits & Rate Intelligence)
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {filteredVisits.length} وزٹ نوٹس
                </span>
              </div>

              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-bold">
                    <th className="p-2 text-center border border-slate-800">وزٹ تاریخ</th>
                    <th className="p-2 text-left border border-slate-800">دکان # و آڑھتی نام</th>
                    <th className="p-2 text-left border border-slate-800">فصل و ورائٹی</th>
                    <th className="p-2 text-center border border-slate-800">کوالٹی و نمی %</th>
                    <th className="p-2 text-right border border-slate-800">خرید پیشکش/من</th>
                    <th className="p-2 text-right border border-slate-800">منڈی ریٹ/من</th>
                    <th className="p-2 text-right border border-slate-800">متوقع منافع فرق</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 italic border border-slate-300">
                        کوئی دکان وزٹ نوٹ موجود نہیں ہے۔
                      </td>
                    </tr>
                  ) : (
                    filteredVisits.slice(0, 5).map((v, idx) => {
                      const crop = crops.find((c) => c.id === v.cropId);
                      const margin = (v.sellingPriceInMarketPerMund || 0) - (v.ratePerMund || 0);
                      return (
                        <tr key={v.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 text-center font-mono text-slate-600 text-[11px] border border-slate-300">
                            {v.date}
                          </td>
                          <td className="p-2 font-bold text-slate-900 border border-slate-300">
                            {v.shopNo} • {v.agentName}
                          </td>
                          <td className="p-2 text-slate-800 font-semibold border border-slate-300">
                            {crop?.urduName || v.cropId} ({v.cropVariety})
                          </td>
                          <td className="p-2 text-center border border-slate-300">
                            <span className="font-bold text-amber-800">{v.stockQuality}</span>
                            {v.moisturePercent && <span className="font-mono text-[10px] text-slate-500 ml-1">({v.moisturePercent}%)</span>}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900 border border-slate-300">
                            {formatPKR(v.ratePerMund)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-blue-700 border border-slate-300">
                            {formatPKR(v.sellingPriceInMarketPerMund || 0)}
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700 border border-slate-300">
                            +{formatPKR(margin)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Section 7: Official Mandi Signatures, Verification & Stamp */}
            <div className="pt-3">
              <div className="border-2 border-slate-800 rounded-xl p-4 bg-slate-50 grid grid-cols-3 gap-4 text-xs">
                {/* Prepared By */}
                <div className="space-y-6 text-center border-r border-slate-300 pr-3">
                  <div className="font-bold text-slate-700">تیار کنندہ (Prepared By)</div>
                  <div className="font-mono text-slate-400 italic text-[11px]">کمپیوٹرائزڈ منڈی سسٹم</div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-300 pt-1">
                    ڈیجیٹل آٹو جنریٹڈ پرچی
                  </div>
                </div>

                {/* Verified By Trader */}
                <div className="space-y-6 text-center border-r border-slate-300 pr-3">
                  <div className="font-bold text-slate-700">دستخط تاجر / آڑھتی (Authorized Sign)</div>
                  <div className="h-6 flex items-center justify-center font-serif text-slate-900 font-bold italic text-base">
                    {userProfile?.displayName || 'تصدیق شدہ'}
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-300 pt-1">
                    تصدیق شدہ برائے کھاتہ و گودام
                  </div>
                </div>

                {/* Official Stamp */}
                <div className="space-y-4 text-center">
                  <div className="font-bold text-slate-700">سرکاری مہر (Mandi Association Stamp)</div>
                  <div className="w-20 h-16 rounded-full border-2 border-dashed border-amber-600 mx-auto flex items-center justify-center text-[9px] text-amber-800 font-bold p-1">
                    غلہ منڈی تصدیقی مہر
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-300 pt-1">
                    آفیشل ریکارڈ برائے قانونی و آڈٹ
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Page 3 Footer */}
            <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>صفحہ 3 از 3 • MandiStockia Official Statement</span>
              <span>تمام حقوق بحق غلہ منڈی پورٹل محفوظ ہیں • 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
