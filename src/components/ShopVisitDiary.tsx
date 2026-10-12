import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  Share2,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Sparkles,
  Droplet,
  PackagePlus,
  Scale,
  Eye,
  TrendingUp,
  Tag,
  X,
} from 'lucide-react';
import { CropConfig, ShopVisitNote } from '../types';
import {
  formatMunds,
  formatPKR,
  QUALITY_LABELS,
  STATUS_LABELS,
} from '../utils/mandiCalculations';

interface ShopVisitDiaryProps {
  visits: ShopVisitNote[];
  crops: CropConfig[];
  selectedCropId: string;
  onOpenNewVisit: (initialCropId?: string) => void;
  onEditVisit: (visit: ShopVisitNote) => void;
  onDeleteVisit: (id: string) => void;
  onConvertToBatch: (visit: ShopVisitNote) => void;
  onLoadSingleSample?: () => void;
}

export const ShopVisitDiary: React.FC<ShopVisitDiaryProps> = ({
  visits,
  crops,
  selectedCropId,
  onOpenNewVisit,
  onEditVisit,
  onDeleteVisit,
  onConvertToBatch,
  onLoadSingleSample,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cropFilter, setCropFilter] = useState<string>(selectedCropId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reviewVisit, setReviewVisit] = useState<ShopVisitNote | null>(null);

  // Sync crop filter if top selectedCropId changes
  React.useEffect(() => {
    setCropFilter(selectedCropId);
  }, [selectedCropId]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    (cropFilter !== 'all' && cropFilter !== selectedCropId) ||
    startDate ||
    endDate ||
    statusFilter !== 'all' ||
    qualityFilter !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setCropFilter(selectedCropId);
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setQualityFilter('all');
  };

  // Filter notes by shop number, crop type, date range, quality, status
  const filteredVisits = visits.filter((v) => {
    const activeCropId = cropFilter !== 'all' ? cropFilter : selectedCropId;
    const matchesCrop = activeCropId === 'all' || v.cropId === activeCropId;
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    const matchesQuality = qualityFilter === 'all' || v.stockQuality === qualityFilter;
    
    // Date range filter
    const matchesStartDate = !startDate || v.date >= startDate;
    const matchesEndDate = !endDate || v.date <= endDate;

    // Search query (shop number, agent name, mandi, quality description, notes)
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      v.shopNo.toLowerCase().includes(q) ||
      v.agentName.toLowerCase().includes(q) ||
      v.mandiName.toLowerCase().includes(q) ||
      v.cropVariety.toLowerCase().includes(q) ||
      (v.qualityDescription && v.qualityDescription.toLowerCase().includes(q)) ||
      v.notes.toLowerCase().includes(q);

    return matchesCrop && matchesStatus && matchesQuality && matchesStartDate && matchesEndDate && matchesSearch;
  });

  const handleShareWhatsApp = (visit: ShopVisitNote) => {
    const crop = crops.find((c) => c.id === visit.cropId);
    const margin = (visit.sellingPriceInMarketPerMund || 0) - (visit.ratePerMund || 0);

    const pUnit = (visit.purchasePricePerUnit ?? visit.ratePerMund ?? 0).toLocaleString();
    const rMund = (visit.ratePerMund ?? 0).toLocaleString();
    const sMund = (visit.sellingPriceInMarketPerMund ?? 0).toLocaleString();
    const mMargin = (margin ?? 0).toLocaleString();
    const tVal = (visit.totalValuePkr ?? 0).toLocaleString();

    const text = `📝 *منڈی دکان وزٹ نوٹ (Mandi Shop Visit)*
-----------------------------------
🏢 *دکان نمبر:* ${visit.shopNo}
👤 *آڑھتی / بیوپاری:* ${visit.agentName} ${visit.phone ? `(${visit.phone})` : ''}
📍 *منڈی:* ${visit.mandiName}
🌾 *فصل و ورائٹی:* ${crop?.urduName || ''} - ${visit.cropVariety}
⭐ *کوالٹی جائزہ:* ${QUALITY_LABELS[visit.stockQuality]?.ur || visit.stockQuality}
${visit.qualityDescription ? `🔍 *کیفیت:* ${visit.qualityDescription}\n` : ''}${visit.moisturePercent ? `💧 *نمی:* ${visit.moisturePercent}%\n` : ''}💰 *خرید قیمت:* ₨ ${pUnit} (${visit.purchasePriceUnit === 'bori' ? 'فی بوری' : visit.purchasePriceUnit === 'kg' ? 'فی کلو' : 'فی من'})
📊 *مساوی ریٹ فی من:* ₨ ${rMund} /من
📈 *مقامی منڈی فروخت ریٹ:* ₨ ${sMund} /من
🔥 *متوقع منافع فرق:* ₨ ${mMargin} /من
📦 *دستیاب مقدار:* ${visit.quantityBags || 0} بوری (${visit.quantityMunds || 0} من)
⚖️ *اضافی کٹوتی:* ${visit.deductionKg || 1} کلو فی ${visit.deductionBaseKg || 50} کلو (کل کٹوتی: ${visit.totalDeductionKg || 0} کلو)
💵 *کل تخمینہ رقم:* ₨ ${tVal}
📌 *نوٹس:* ${visit.notes || '—'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(visit.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              دکان وزٹ ڈائری (Shop Visit Diary)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Note-Taking
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            دکان نمبر، کوالٹی جائزہ، خرید قیمت فی یونٹ (بوری/کلو/من) اور مقامی منڈی فروخت ریٹ کا مکمل اندراج۔
          </p>
        </div>

        <button
          onClick={() => onOpenNewVisit(selectedCropId === 'all' ? undefined : selectedCropId)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>نیا دکان وزٹ نوٹ لکھیں</span>
        </button>
      </div>

      {/* Sample Entry Guidance Banner (If a sample visit note exists) */}
      {visits.some((v) => v.isSample) && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/30 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  رہنمائی نمونہ دکان وزٹ نوٹ (Sample Visit Note)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  SAMPLE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                یہ دکان وزٹ نوٹ آپ کو فارمیٹ سمجھانے کے لیے نمونہ ہے۔ اپنا اصلی وزٹ لکھنے پر آپ اسے 1 کلک میں صاف کر سکتے ہیں۔
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const sample = visits.find((v) => v.isSample);
              if (sample) onDeleteVisit(sample.id);
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            نمونہ وزٹ صاف کریں (Clear Sample)
          </button>
        </div>
      )}

      {/* Search and Filters Bar (Filter by shop number, crop type, or date range) */}
      <div className="bg-slate-900/80 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input: Shop Number, Agent, Mandi, Variety */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="دکان نمبر، آڑھتی، منڈی، کوالٹی یا ورائٹی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Crop Selector Filter */}
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">تمام فصلیں (All Crops)</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.urduName} ({c.name.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Quick Toggle for Mobile Date & Status Filters */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors cursor-pointer sm:hidden ${
              showAdvancedFilters || startDate || endDate || statusFilter !== 'all' || qualityFilter !== 'all'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>فلٹرز {hasActiveFilters && '•'}</span>
          </button>
        </div>

        {/* Secondary Filter Row: Date Range & Status & Quality */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 ${showAdvancedFilters ? 'grid' : 'hidden sm:grid'}`}>
          {/* Start Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 shrink-0">از:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              title="تاریخ سے شروع"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 shrink-0">تا:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
              title="تاریخ تک"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">تمام سٹیٹس (All Status)</option>
            <option value="visited">ریٹ نوٹ کیا (Visited)</option>
            <option value="bargaining">بات چیت جاری (Bargaining)</option>
            <option value="purchased">خرید لیا (Purchased)</option>
            <option value="skipped">چھوڑ دیا (Skipped)</option>
          </select>

          {/* Quality Filter */}
          <div className="flex items-center gap-2">
            <select
              value={qualityFilter}
              onChange={(e) => setQualityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">تمام کوالٹی (All Quality)</option>
              <option value="super">سپر کوالٹی (A-One)</option>
              <option value="grade_a">گریڈ اے (صاف مال)</option>
              <option value="average">درمیانہ مال</option>
              <option value="high_moisture">زیادہ نمی (گیلا)</option>
              <option value="dusty">کچرا و گرد</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline px-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                ری سیٹ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes List */}
      {filteredVisits.length === 0 ? (
        <div className="bg-slate-800/40 rounded-2xl p-8 sm:p-12 text-center border border-dashed border-slate-700 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            {visits.length === 0 ? 'دکان وزٹ ڈائری فی الوقت خالی ہے (Clean Blank Diary)' : 'کوئی وزٹ نوٹ نہیں ملا'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {visits.length === 0
              ? 'آپ کے اکاؤنٹ میں فی الوقت کوئی وزٹ نوٹ درج نہیں ہے۔ منڈی کی دکان کا نیا وزٹ نوٹ لکھیں یا رہنمائی کے لیے ایک نمونہ انٹری لوڈ کریں۔'
              : 'تلاش کا فلٹر تبدیل کریں یا منڈی کی دکان کا نیا وزٹ نوٹ درج کریں۔'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              onClick={() => onOpenNewVisit(selectedCropId === 'all' ? undefined : selectedCropId)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>نیا وزٹ نوٹ لکھیں (+ New Visit)</span>
            </button>
            {visits.length === 0 && onLoadSingleSample && (
              <button
                type="button"
                onClick={onLoadSingleSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1 نمونہ وزٹ نوٹ دیکھیں (Sample Guide)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredVisits.map((visit) => {
            const crop = crops.find((c) => c.id === visit.cropId);
            const qualityInfo = QUALITY_LABELS[visit.stockQuality] || QUALITY_LABELS.average;
            const statusInfo = STATUS_LABELS[visit.status] || STATUS_LABELS.visited;

            const marginPerMund =
              (visit.sellingPriceInMarketPerMund || 0) - (visit.ratePerMund || 0);

            return (
              <div
                key={visit.id}
                className="bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700/80 hover:border-slate-600 transition-all shadow-md flex flex-col justify-between space-y-3.5"
              >
                <div>
                  {/* Header: Shop No & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-white">
                          {visit.shopNo}
                        </span>
                        <span
                          className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.badge}`}
                        >
                          {statusInfo.ur}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                          {crop?.urduName || visit.cropId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2 flex-wrap">
                        <span>{visit.agentName}</span>
                        {visit.phone && (
                          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {visit.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3" />
                        {visit.date}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {visit.mandiName}
                      </span>
                    </div>
                  </div>

                  {/* Variety & Quality Assessment Badges */}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-200 font-semibold">
                      ورائٹی: {visit.cropVariety}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md border font-medium ${qualityInfo.badge}`}>
                      معیار: {qualityInfo.ur}
                    </span>
                    {visit.moisturePercent && (
                      <span className="px-2.5 py-1 rounded-md bg-cyan-950/40 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                        <Droplet className="w-3 h-3" />
                        نمی: {visit.moisturePercent}%
                      </span>
                    )}
                  </div>

                  {/* Detailed Quality Assessment Text */}
                  {visit.qualityDescription && (
                    <div className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      <strong className="text-amber-400 font-semibold ml-1">کوالٹی تجزیہ:</strong>
                      {visit.qualityDescription}
                    </div>
                  )}

                  {/* Purchase Price vs Local Market Selling Price (The Core Feature) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        خرید قیمت (Purchase Price)
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-amber-400">
                        ₨ {(visit.purchasePricePerUnit ?? visit.ratePerMund ?? 0).toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-300">
                          ({visit.purchasePriceUnit === 'bori' ? 'فی بوری' : visit.purchasePriceUnit === 'kg' ? 'فی کلو' : 'فی من'})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        برابر: {formatPKR(visit.ratePerMund)} /من
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        مقامی منڈی فروخت ریٹ (Market)
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-400">
                        ₨ {(visit.sellingPriceInMarketPerMund || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/من</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        لوکل غلہ منڈی بھاؤ
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        متوقع منافع فرق (Spread)
                      </span>
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          marginPerMund >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {marginPerMund >= 0 ? `+${formatPKR(marginPerMund)}` : formatPKR(marginPerMund)}{' '}
                        <span className="text-[10px] font-normal text-slate-400">/من</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        کل تخمینہ: {formatPKR(visit.totalValuePkr)}
                      </span>
                    </div>
                  </div>

                  {/* Volume & Deductions bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-purple-950/20 border border-purple-900/40 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-300">
                      <Scale className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        مقدار: <strong>{visit.quantityBags} بوری</strong> ({visit.quantityMunds} من)
                      </span>
                    </div>
                    <span className="text-purple-200 font-medium">
                      کٹوتی: {visit.deductionKg || 1} کلو فی {visit.deductionBaseKg || 50} کلو (کل: {visit.totalDeductionKg || 0} کلو)
                    </span>
                  </div>

                  {/* Notes text */}
                  {visit.notes && (
                    <div className="mt-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 italic">
                      &ldquo;{visit.notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Convert / Move to Godam Stock button */}
                    <button
                      onClick={() => onConvertToBatch(visit)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                      title="سودا پکا کر کے گودام کے سٹاک میں داخل کریں"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      <span>گودام میں شامل کریں (Buy Stock)</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setReviewVisit(visit)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="مکمل تفصیل کا جائزہ لیں (Review Transaction)"
                    >
                      <Eye className="w-4 h-4 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(visit)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="واٹس ایپ پر شیئر کریں"
                    >
                      {copiedId === visit.id ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => onEditVisit(visit)}
                      className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="ترمیم کریں"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteVisit(visit.id)}
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

      {/* Review Transaction Detail Modal */}
      {reviewVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-auto text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>دکان وزٹ جائزہ (Transaction Review)</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {reviewVisit.shopNo}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {reviewVisit.agentName} • {reviewVisit.mandiName}
                </p>
              </div>
              <button
                onClick={() => setReviewVisit(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 font-semibold block text-[11px]">معیار و کیفیت جائزہ:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-xs font-bold ${QUALITY_LABELS[reviewVisit.stockQuality]?.badge}`}>
                    {QUALITY_LABELS[reviewVisit.stockQuality]?.ur}
                  </span>
                  {reviewVisit.moisturePercent && (
                    <span className="text-cyan-300 font-mono">نمی: {reviewVisit.moisturePercent}%</span>
                  )}
                </div>
                {reviewVisit.qualityDescription && (
                  <p className="text-slate-300 italic pt-1">{reviewVisit.qualityDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">خرید قیمت درج شدہ</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">
                    ₨ {(reviewVisit.purchasePricePerUnit ?? reviewVisit.ratePerMund ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {reviewVisit.purchasePriceUnit === 'bori' ? 'فی بوری' : reviewVisit.purchasePriceUnit === 'kg' ? 'فی کلو' : 'فی من'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">مقامی منڈی فروخت ریٹ</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₨ {(reviewVisit.sellingPriceInMarketPerMund || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">فی من (40 کلو)</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>تعداد و وزن:</span>
                  <span className="font-bold text-white font-mono">
                    {reviewVisit.quantityBags} بوری ({reviewVisit.quantityMunds} من)
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>اضافی کٹوتی:</span>
                  <span className="font-bold font-mono">
                    {reviewVisit.totalDeductionKg || 0} کلو ({reviewVisit.deductionKg}kg / {reviewVisit.deductionBaseKg}kg)
                  </span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                  <span>کل تخمینہ رقم:</span>
                  <span className="font-mono text-sm">{formatPKR(reviewVisit.totalValuePkr)}</span>
                </div>
              </div>

              {reviewVisit.notes && (
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-slate-300 italic">
                  &ldquo;{reviewVisit.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setReviewVisit(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
