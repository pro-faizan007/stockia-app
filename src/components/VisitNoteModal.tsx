import React, { useState, useEffect } from 'react';
import { X, Scale, Droplet, Plus, Check, ArrowRight, DollarSign, Sparkles } from 'lucide-react';
import { CropConfig, PriceUnit, ShopVisitNote, StockQuality, VisitStatus } from '../types';
import { formatPKR, normalizePrices, QUALITY_LABELS } from '../utils/mandiCalculations';

interface VisitNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: ShopVisitNote) => void;
  crops: CropConfig[];
  initialCropId?: string;
  initialVisit?: ShopVisitNote | null;
}

export const VisitNoteModal: React.FC<VisitNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  crops,
  initialCropId,
  initialVisit,
}) => {
  if (!isOpen) return null;

  const defaultCropId = initialVisit?.cropId || initialCropId || crops[0]?.id || 'wheat';
  const selectedCropObj = crops.find((c) => c.id === defaultCropId) || crops[0];

  const [cropId, setCropId] = useState<string>(defaultCropId);
  const [shopNo, setShopNo] = useState<string>(initialVisit?.shopNo || '');
  const [agentName, setAgentName] = useState<string>(initialVisit?.agentName || '');
  const [phone, setPhone] = useState<string>(initialVisit?.phone || '');
  const [mandiName, setMandiName] = useState<string>(initialVisit?.mandiName || 'غلہ منڈی (Grain Market)');
  const [cropVariety, setCropVariety] = useState<string>(initialVisit?.cropVariety || '');
  const [stockQuality, setStockQuality] = useState<StockQuality>(initialVisit?.stockQuality || 'grade_a');
  const [qualityDescription, setQualityDescription] = useState<string>(
    initialVisit?.qualityDescription || ''
  );
  const [moisturePercent, setMoisturePercent] = useState<string>(
    initialVisit?.moisturePercent ? String(initialVisit.moisturePercent) : ''
  );

  // Unit Pricing
  const [purchasePriceUnit, setPurchasePriceUnit] = useState<PriceUnit>(
    initialVisit?.purchasePriceUnit || 'mund'
  );
  const [purchasePricePerUnit, setPurchasePricePerUnit] = useState<number>(
    initialVisit?.purchasePricePerUnit || selectedCropObj.currentMarketRatePerMund || 3950
  );
  const [sellingPriceInMarketPerMund, setSellingPriceInMarketPerMund] = useState<number>(
    initialVisit?.sellingPriceInMarketPerMund || selectedCropObj.targetSellRatePerMund || 4200
  );

  // Volume & Bag Settings (from crop)
  const [quantityBags, setQuantityBags] = useState<number>(initialVisit?.quantityBags || 100);
  const [boriWeightKg, setBoriWeightKg] = useState<number>(
    initialVisit?.boriWeightKg || selectedCropObj.defaultBoriWeightKg || 50
  );
  const [mundWeightKg, setMundWeightKg] = useState<number>(
    initialVisit?.mundWeightKg || selectedCropObj.defaultMundWeightKg || 40
  );
  const [deductionBaseKg, setDeductionBaseKg] = useState<number>(
    initialVisit?.deductionBaseKg || selectedCropObj.deductionBaseKg || 50
  );
  const [deductionKg, setDeductionKg] = useState<number>(
    initialVisit?.deductionKg ?? selectedCropObj.deductionKg ?? 1.0
  );

  const [status, setStatus] = useState<VisitStatus>(initialVisit?.status || 'visited');
  const [notes, setNotes] = useState<string>(initialVisit?.notes || '');

  // When crop changes, update defaults
  const handleCropChange = (newId: string) => {
    setCropId(newId);
    const c = crops.find((x) => x.id === newId);
    if (c && !initialVisit) {
      setBoriWeightKg(c.defaultBoriWeightKg);
      setMundWeightKg(c.defaultMundWeightKg);
      setDeductionBaseKg(c.deductionBaseKg);
      setDeductionKg(c.deductionKg);
      setPurchasePricePerUnit(c.currentMarketRatePerMund);
      setSellingPriceInMarketPerMund(c.targetSellRatePerMund);
    }
  };

  // Normalized Rates in all units
  const normalized = normalizePrices(
    purchasePricePerUnit,
    purchasePriceUnit,
    boriWeightKg,
    mundWeightKg
  );

  // Weight and Deductions calculation
  const grossKg = quantityBags * boriWeightKg;
  const quantityMunds = grossKg / mundWeightKg;
  const totalDeductionKg = (grossKg / deductionBaseKg) * deductionKg;
  const netBilledWeightKg = Math.max(0, grossKg - totalDeductionKg);
  const netBilledMunds = netBilledWeightKg / mundWeightKg;
  const totalEstPkr = netBilledMunds * normalized.ratePerMund;

  // Expected Margin per Mund
  const marginPerMund = sellingPriceInMarketPerMund - normalized.ratePerMund;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopNo || !agentName) return;

    const saved: ShopVisitNote = {
      id: initialVisit ? initialVisit.id : 'visit-' + Date.now(),
      date: initialVisit?.date || new Date().toISOString().split('T')[0],
      shopNo,
      agentName,
      phone,
      mandiName,
      cropId,
      cropVariety: cropVariety || 'سٹینڈرڈ منڈی لاٹ',
      stockQuality,
      qualityDescription,
      moisturePercent: moisturePercent ? Number(moisturePercent) : undefined,
      purchasePriceUnit,
      purchasePricePerUnit: Number(purchasePricePerUnit) || 0,
      ratePerMund: Math.round(normalized.ratePerMund),
      ratePerBori: Math.round(normalized.ratePerBori),
      ratePerKg: Number(normalized.ratePerKg.toFixed(2)),
      sellingPriceInMarketPerMund: Number(sellingPriceInMarketPerMund) || 0,
      quantityBags: Number(quantityBags) || 0,
      boriWeightKg: Number(boriWeightKg) || 50,
      mundWeightKg: Number(mundWeightKg) || 40,
      deductionBaseKg: Number(deductionBaseKg) || 50,
      deductionKg: Number(deductionKg) || 0,
      quantityMunds: Number(quantityMunds.toFixed(2)),
      totalDeductionKg: Number(totalDeductionKg.toFixed(1)),
      totalValuePkr: Math.round(totalEstPkr),
      status,
      notes,
      createdAt: initialVisit?.createdAt || Date.now(),
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {initialVisit ? 'دکان وزٹ نوٹ میں ترمیم کریں' : 'نیا دکان وزٹ نوٹ درج کریں (New Visit Note)'}
            </h2>
            <p className="text-xs text-slate-400">
              دکان نمبر، کوالٹی، خرید ریٹ، اور مقامی منڈی فروخت ریٹ نوٹ کریں
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* 1. Crop Selection (Touch-friendly buttons) */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">فصل منتخب کریں (Select Crop)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {crops.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleCropChange(c.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    cropId === c.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {c.urduName} ({c.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* 2. Shop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                دکان نمبر (Shop No) *
              </label>
              <input
                type="text"
                placeholder="Shop # 24-B"
                value={shopNo}
                onChange={(e) => setShopNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                آڑھتی / دکاندار نام (Agent) *
              </label>
              <input
                type="text"
                placeholder="حاجی رفیق اینڈ برادرز"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                فون نمبر (Phone)
              </label>
              <input
                type="text"
                placeholder="0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 3. Mandi Location & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                غلہ منڈی کا نام (Mandi Location)
              </label>
              <input
                type="text"
                value={mandiName}
                onChange={(e) => setMandiName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                ورائٹی / قسم (Crop Variety)
              </label>
              <input
                type="text"
                placeholder="مثال: اکبر 2019 / سپر کائنات 1121"
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* 4. Quality Assessment */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  کوالٹی جائزہ (Stock Quality Assessment)
                </label>
                <select
                  value={stockQuality}
                  onChange={(e) => setStockQuality(e.target.value as StockQuality)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="super">سپر کوالٹی / اے ون (Super Premium)</option>
                  <option value="grade_a">گریڈ اے / صاف ستھرا (Clean)</option>
                  <option value="average">درمیانہ مال / مکس (Average)</option>
                  <option value="high_moisture">زیادہ نمی / گیلا مال (Wet)</option>
                  <option value="dusty">کچرا و گرد والا (Dusty/Dirty)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  نمی فیصد (Moisture % - اختیاری)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="e.g. 11.5"
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">
                کوالٹی تفصیل (Quality Notes & Appearance)
              </label>
              <input
                type="text"
                placeholder="دانے کی چمک، موٹائی، صافی، یا کٹائی کیسی ہے..."
                value={qualityDescription}
                onChange={(e) => setQualityDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
          </div>

          {/* 5. Purchase Price per Unit & Selling Price in Market (Mund) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">
                قیمت خرید و مقامی منڈی فروخت ریٹ
              </span>
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
                <span className="text-[11px] text-slate-400 px-1">خرید یونٹ:</span>
                {(['bori', 'kg', 'mund'] as PriceUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setPurchasePriceUnit(unit)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      purchasePriceUnit === unit
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {unit === 'bori' ? 'فی بوری' : unit === 'kg' ? 'فی کلو' : 'فی من'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  خرید قیمت ({purchasePriceUnit === 'bori' ? `فی بوری (${boriWeightKg}kg)` : purchasePriceUnit === 'kg' ? 'فی کلو' : `فی من (${mundWeightKg}kg)`}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₨</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={purchasePricePerUnit || ''}
                    onChange={(e) => setPurchasePricePerUnit(Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-black text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  مقامی منڈی فروخت بھاؤ (Selling Price in Market per Mund) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₨</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={sellingPriceInMarketPerMund || ''}
                    onChange={(e) => setSellingPriceInMarketPerMund(Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-black text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Instant conversion helper bar */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block">برابر فی من:</span>
                <span className="font-bold text-amber-400 font-mono">{formatPKR(normalized.ratePerMund)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">برابر فی بوری:</span>
                <span className="font-bold text-white font-mono">{formatPKR(normalized.ratePerBori)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">برابر فی کلو:</span>
                <span className="font-bold text-slate-200 font-mono">₨ {normalized.ratePerKg.toFixed(2)}/kg</span>
              </div>
            </div>

            {/* Expected Profit Spread */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                متوقع منڈی مارجن (Spread):
              </span>
              <span className={`font-mono font-black ${marginPerMund >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {marginPerMund >= 0 ? `+${formatPKR(marginPerMund)} /من منافع` : `${formatPKR(marginPerMund)} /من`}
              </span>
            </div>
          </div>

          {/* 6. Volume & Crop-Specific Deductions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">تعداد بوری (Bags)</label>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={quantityBags}
                onChange={(e) => setQuantityBags(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">بوری وزن (Kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={boriWeightKg}
                onChange={(e) => setBoriWeightKg(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">کٹوتی بیس (Base)</label>
              <select
                value={deductionBaseKg}
                onChange={(e) => setDeductionBaseKg(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              >
                <option value={50}>فی 50 کلو</option>
                <option value={100}>فی 100 کلو</option>
                <option value={40}>فی 40 کلو</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">کٹوتی وزن (Kg)</label>
              <input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={deductionKg}
                onChange={(e) => setDeductionKg(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-purple-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* 7. Deal Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">وزٹ سٹیٹس</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VisitStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white cursor-pointer"
              >
                <option value="visited">ریٹ نوٹ کیا (Visited)</option>
                <option value="bargaining">بات چیت جاری (Bargaining)</option>
                <option value="purchased">خرید لیا (Purchased)</option>
                <option value="skipped">چھوڑ دیا (Skipped)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">کل تخمینہ رقم (Net Total)</label>
              <div className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-400 font-mono font-extrabold text-sm">
                {formatPKR(totalEstPkr)}
                <span className="text-slate-400 text-xs font-normal mr-2">
                  ({netBilledMunds.toFixed(1)} من بل)
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">تفصیلی نوٹس</label>
            <textarea
              rows={2}
              placeholder="مال کا دانہ کیسا ہے؟ آڑھتی کیا کہہ رہا ہے؟ کوئی مخصوص بات..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
            >
              {initialVisit ? 'نوٹ اپڈیٹ کریں' : 'وزٹ نوٹ محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
