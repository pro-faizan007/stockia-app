import React, { useState, useEffect } from 'react';
import { X, Warehouse, Scale, DollarSign, Plus } from 'lucide-react';
import { CropConfig, ShopVisitNote, StockBatch } from '../types';
import { calculateMandiLot, formatPKR, MUND_KG } from '../utils/mandiCalculations';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (batch: StockBatch) => void;
  crops: CropConfig[];
  initialCropId?: string;
  initialBatch?: StockBatch | null;
  fromVisitNote?: ShopVisitNote | null;
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSave,
  crops,
  initialCropId,
  initialBatch,
  fromVisitNote,
}) => {
  if (!isOpen) return null;

  const initialCrop =
    fromVisitNote?.cropId || initialBatch?.cropId || initialCropId || crops[0]?.id || 'wheat';
  const cropObj = crops.find((c) => c.id === initialCrop) || crops[0];

  const [cropId, setCropId] = useState<string>(initialCrop);
  const [cropVariety, setCropVariety] = useState<string>(
    fromVisitNote?.cropVariety || initialBatch?.cropVariety || 'اکبر-2019 اے ون'
  );
  const [lotNumber, setLotNumber] = useState<string>(
    initialBatch?.lotNumber || `LOT-${initialCrop.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-3)}`
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    initialBatch?.purchaseDate || fromVisitNote?.date || new Date().toISOString().split('T')[0]
  );
  const [sellerShopNo, setSellerShopNo] = useState<string>(
    fromVisitNote?.shopNo || initialBatch?.sellerShopNo || ''
  );
  const [sellerName, setSellerName] = useState<string>(
    fromVisitNote?.agentName || initialBatch?.sellerName || ''
  );
  const [mandiName, setMandiName] = useState<string>(
    fromVisitNote?.mandiName || initialBatch?.mandiName || 'غلہ منڈی (Grain Market)'
  );
  const [godamLocation, setGodamLocation] = useState<string>(
    initialBatch?.godamLocation || 'گودام نمبر 1 (Main Warehouse)'
  );
  const [initialBags, setInitialBags] = useState<number>(
    fromVisitNote?.quantityBags || initialBatch?.initialBags || 200
  );
  const [bagWeightKg, setBagWeightKg] = useState<number>(
    fromVisitNote?.boriWeightKg || initialBatch?.bagWeightKg || cropObj.defaultBoriWeightKg || 50
  );
  const [mundWeightKg, setMundWeightKg] = useState<number>(
    fromVisitNote?.mundWeightKg || cropObj.defaultMundWeightKg || 40
  );
  const [deductionBaseKg, setDeductionBaseKg] = useState<number>(
    fromVisitNote?.deductionBaseKg || cropObj.deductionBaseKg || 50
  );
  const [purchaseRatePerMund, setPurchaseRatePerMund] = useState<number>(
    fromVisitNote?.ratePerMund || initialBatch?.purchaseRatePerMund || cropObj.currentMarketRatePerMund || 3950
  );
  const [dhaltaKg, setDhaltaKg] = useState<number>(
    fromVisitNote?.deductionKg ?? cropObj.deductionKg ?? 1.0
  );
  const [bardanaCostPkr, setBardanaCostPkr] = useState<number>(
    initialBatch?.bardanaCostPkr || 0
  );
  const [laborCostPkr, setLaborCostPkr] = useState<number>(
    initialBatch?.laborCostPkr || 0
  );
  const [notes, setNotes] = useState<string>(
    initialBatch?.notes || fromVisitNote?.notes || ''
  );

  // Calculations
  const calc = calculateMandiLot({
    bags: initialBags,
    bagWeightKg,
    mundWeightKg,
    deductionBaseKg,
    deductionKg: dhaltaKg,
    ratePerMund: purchaseRatePerMund,
  });

  const totalInvestedPkr = calc.rawGrainAmountPkr + Number(bardanaCostPkr || 0) + Number(laborCostPkr || 0);
  const effectiveCostPerMund = calc.physicalMunds > 0 ? totalInvestedPkr / calc.physicalMunds : purchaseRatePerMund;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerName || !sellerShopNo || initialBags <= 0) return;

    const remainingBags = initialBatch ? initialBatch.remainingBags : initialBags;

    const batch: StockBatch = {
      id: initialBatch ? initialBatch.id : 'batch-' + Date.now(),
      lotNumber,
      cropId,
      cropVariety,
      purchaseDate,
      sellerShopNo,
      sellerName,
      mandiName,
      godamLocation,
      initialBags: Number(initialBags),
      remainingBags,
      bagWeightKg: Number(bagWeightKg),
      grossWeightKg: calc.grossWeightKg,
      dhaltaExtraDeductedKg: calc.totalDhaltaExtraKg,
      netBilledMunds: calc.netBilledMunds,
      physicalMunds: calc.physicalMunds,
      purchaseRatePerMund: Number(purchaseRatePerMund),
      totalBilledPurchasePkr: calc.rawGrainAmountPkr,
      bardanaCostPkr: Number(bardanaCostPkr) || 0,
      laborCostPkr: Number(laborCostPkr) || 0,
      totalInvestedPkr,
      effectiveCostPerMund: Math.round(effectiveCostPerMund),
      notes,
      createdAt: initialBatch?.createdAt || Date.now(),
    };

    onSave(batch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-emerald-400" />
              <span>{initialBatch ? 'گودام لاٹ میں ترمیم کریں' : 'گودام میں نیا مال داخل کریں'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {fromVisitNote ? 'دکان وزٹ نوٹ سے خریدا گیا مال گودام میں شامل کیا جا رہا ہے' : 'خرید شدہ اناج لاٹ کا مکمل اندراج'}
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
          {/* Crop & Lot No */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">فصل (Crop)</label>
              <select
                value={cropId}
                onChange={(e) => {
                  setCropId(e.target.value);
                  const c = crops.find((x) => x.id === e.target.value);
                  if (c) {
                    setBagWeightKg(c.defaultBoriWeightKg);
                    setMundWeightKg(c.defaultMundWeightKg);
                    setDeductionBaseKg(c.deductionBaseKg);
                    setDhaltaKg(c.deductionKg);
                    setPurchaseRatePerMund(c.currentMarketRatePerMund);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.urduName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">لاٹ نمبر (Lot #)</label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">ورائٹی (Variety)</label>
              <input
                type="text"
                value={cropVariety}
                onChange={(e) => setCropVariety(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Seller, Shop, Mandi, Godam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">بیوپاری / آڑھتی نام</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">دکان نمبر (Shop No)</label>
              <input
                type="text"
                value={sellerShopNo}
                onChange={(e) => setSellerShopNo(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">گودام لوکیشن (Storage Site)</label>
              <input
                type="text"
                value={godamLocation}
                onChange={(e) => setGodamLocation(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">خریداری تاریخ (Date)</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Quantity, Bag Weight, Purchase Rate, Dhalta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">تعداد بوری (Bags)</label>
              <input
                type="number"
                min="1"
                value={initialBags}
                onChange={(e) => setInitialBags(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">بوری وزن (Kg)</label>
              <select
                value={bagWeightKg}
                onChange={(e) => setBagWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              >
                <option value={50}>50 کلو بوری</option>
                <option value={100}>100 کلو بوری</option>
                <option value={40}>40 کلو (1 من)</option>
                <option value={84}>84 کلو بوری</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">خرید ریٹ (PKR / من)</label>
              <input
                type="number"
                min="0"
                value={purchaseRatePerMund}
                onChange={(e) => setPurchaseRatePerMund(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">ڈھلتا کٹوتی (کلو)</label>
              <input
                type="number"
                step="0.1"
                value={dhaltaKg}
                onChange={(e) => setDhaltaKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-purple-300 font-bold font-mono"
              />
            </div>
          </div>

          {/* Landed Expenses (Bardana & Labor) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                کل باردانہ لاگت (Total Bardana PKR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={bardanaCostPkr || ''}
                onChange={(e) => setBardanaCostPkr(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                کل پلے داری و مزدوری (Total Labor PKR)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={laborCostPkr || ''}
                onChange={(e) => setLaborCostPkr(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Live Landed Math Preview */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">گودام فزیکل وزن:</span>
              <span className="font-black text-white">
                {calc.physicalMunds.toFixed(2)} من ({initialBags} بوری)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">بل شدہ اناج رقم:</span>
              <span className="font-black text-amber-400">
                {formatPKR(calc.rawGrainAmountPkr)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">کل لاگت فی من (Landed):</span>
              <span className="font-black text-emerald-400">
                {formatPKR(effectiveCostPerMund)} /من
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">نوٹس (Notes)</label>
            <input
              type="text"
              placeholder="گودام میں رکھنے کی تفصیل، لکڑی کے تختے، گولیاں وغیرہ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              منسوخ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 cursor-pointer"
            >
              گودام میں شامل کریں (Save Batch)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
