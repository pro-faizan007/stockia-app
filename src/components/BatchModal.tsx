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
  // Kiraya from mandi to godam (کرایہ منڈی تا گودام)
  const [kirayaCostPkr, setKirayaCostPkr] = useState<number>(
    initialBatch?.kirayaCostPkr || 0
  );
  const [kirayaPerBag, setKirayaPerBag] = useState<string>('');

  // Commission on maal (کمیشن برائے مال)
  const [commissionPkr, setCommissionPkr] = useState<number>(
    initialBatch?.commissionPkr || 0
  );
  const [commissionPercent, setCommissionPercent] = useState<string>('');

  // Broker / Dalali fee on maal laat (بروکر / دلالی فیس برائے مال لاٹ)
  const [brokerFeePkr, setBrokerFeePkr] = useState<number>(
    initialBatch?.brokerFeePkr || 0
  );
  const [brokerFeePerBag, setBrokerFeePerBag] = useState<string>('');

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
    bardanaPerBagPkr: 0,
    laborPerBagPkr: 0,
    kirayaTotalPkr: kirayaCostPkr,
    commissionTotalPkr: commissionPkr,
    brokerFeeTotalPkr: brokerFeePkr,
  });

  const totalInvestedPkr =
    calc.rawGrainAmountPkr +
    Number(bardanaCostPkr || 0) +
    Number(laborCostPkr || 0) +
    Number(kirayaCostPkr || 0) +
    Number(commissionPkr || 0) +
    Number(brokerFeePkr || 0);

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
      kirayaCostPkr: Number(kirayaCostPkr) || 0,
      commissionPkr: Number(commissionPkr) || 0,
      brokerFeePkr: Number(brokerFeePkr) || 0,
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
                    // Do not overwrite bagWeightKg - user selects crop independently
                    setMundWeightKg(c.defaultMundWeightKg || 40);
                    setDeductionBaseKg(c.deductionBaseKg || 50);
                    setDhaltaKg(c.deductionKg ?? 1.0);
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
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setInitialBags(b);
                  if (kirayaPerBag) setKirayaCostPkr(b * Number(kirayaPerBag));
                  if (brokerFeePerBag) setBrokerFeePkr(b * Number(brokerFeePerBag));
                }}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold text-xs">بوری وزن (Kg) *</label>
                <span className="text-[10px] text-amber-400 font-bold">50 / 60 / 70 کلو</span>
              </div>
              <div className="grid grid-cols-3 gap-1 mb-1.5">
                {[50, 60, 70].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setBagWeightKg(w)}
                    className={`py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer font-mono ${
                      bagWeightKg === w
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {w} kg
                  </button>
                ))}
              </div>
              <select
                value={bagWeightKg}
                onChange={(e) => setBagWeightKg(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
              >
                <option value={50}>50 کلو (50 kg)</option>
                <option value={60}>60 کلو (60 kg)</option>
                <option value={70}>70 کلو (70 kg)</option>
                <option value={40}>40 کلو (40 kg)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">خرید ریٹ (PKR / من)</label>
              <input
                type="number"
                min="0"
                value={purchaseRatePerMund}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setPurchaseRatePerMund(r);
                  if (commissionPercent) {
                    const estRaw = calc.netBilledMunds * r;
                    setCommissionPkr(Math.round((estRaw * Number(commissionPercent)) / 100));
                  }
                }}
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

          {/* Prominent Total Mand Weight (کل وزن مَن) Highlight */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-amber-500/10 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-amber-400 block font-bold">
                  کل وزن مَن (Total Mand Weight)
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {calc.physicalMunds.toFixed(2)} مَن{' '}
                  <span className="text-xs text-slate-300 font-medium">
                    ({calc.grossWeightKg.toLocaleString()} کلو کچا)
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">کچا کل وزن:</span>
                <span className="font-bold text-white font-mono">
                  {calc.grossMunds.toFixed(2)} من
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ڈھلتا کٹوتی:</span>
                <span className="font-bold text-purple-400 font-mono">
                  -{calc.totalDhaltaExtraMunds.toFixed(2)} من
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">خالص بل شدہ:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {calc.netBilledMunds.toFixed(2)} من
                </span>
              </div>
            </div>
          </div>

          {/* Mandi to Godam Kiraya, Commission, Broker Fee & Expenses */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>منڈی تا گودام کرایہ و اخراجات لاٹ (Carriage & Expenses)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                کرایہ، کمیشن، اور بروکر فیس
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Kiraya from Mandi to Godam */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-semibold text-[11px] block">
                    کرایہ منڈی تا گودام (Kiraya)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">PKR</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">فی بوری</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={kirayaPerBag}
                      onChange={(e) => {
                        const val = e.target.value;
                        setKirayaPerBag(val);
                        setKirayaCostPkr(Number(val) * initialBags);
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">کل کرایہ</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={kirayaCostPkr || ''}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setKirayaCostPkr(v);
                        if (initialBags > 0) setKirayaPerBag((v / initialBags).toFixed(1));
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Commission on Maal */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-semibold text-[11px] block">
                    کمیشن برائے مال (Commission)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">% یا PKR</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">کمیشن %</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 1%"
                      value={commissionPercent}
                      onChange={(e) => {
                        const p = e.target.value;
                        setCommissionPercent(p);
                        setCommissionPkr(Math.round((calc.rawGrainAmountPkr * Number(p)) / 100));
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">کل کمیشن</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={commissionPkr || ''}
                      onChange={(e) => {
                        setCommissionPkr(Number(e.target.value));
                        setCommissionPercent('');
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-amber-400 font-bold font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Broker Fee on Maal Laat */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-semibold text-[11px] block">
                    بروکر فیس برائے لاٹ (Broker Fee)
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono">دلالی</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">فی بوری</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={brokerFeePerBag}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBrokerFeePerBag(val);
                        setBrokerFeePkr(Number(val) * initialBags);
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">کل دلالی</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={brokerFeePkr || ''}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBrokerFeePkr(v);
                        if (initialBags > 0) setBrokerFeePerBag((v / initialBags).toFixed(1));
                      }}
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-purple-400 font-bold font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bardana and Labor */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">
                  کل باردانہ لاگت (Bardana PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={bardanaCostPkr || ''}
                  onChange={(e) => setBardanaCostPkr(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">
                  کل پلے داری و مزدوری (Labor PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={laborCostPkr || ''}
                  onChange={(e) => setLaborCostPkr(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Live Landed Math Preview */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">گودام فزیکل وزن:</span>
              <span className="font-black text-white text-xs sm:text-sm font-mono">
                {calc.physicalMunds.toFixed(2)} مَن
              </span>
              <span className="text-[10px] text-slate-400 block">({initialBags} بوری)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">بل اناج رقم:</span>
              <span className="font-black text-amber-400 text-xs sm:text-sm font-mono">
                {formatPKR(calc.rawGrainAmountPkr)}
              </span>
              <span className="text-[10px] text-slate-400 block">({calc.netBilledMunds.toFixed(2)} بل من)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">کل لینڈڈ سرمایہ:</span>
              <span className="font-black text-blue-400 text-xs sm:text-sm font-mono">
                {formatPKR(totalInvestedPkr)}
              </span>
              <span className="text-[10px] text-slate-400 block">اناج + کرایہ + جملہ اخراجات</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">کل لاگت فی من (Landed):</span>
              <span className="font-black text-emerald-400 text-xs sm:text-sm font-mono">
                {formatPKR(effectiveCostPerMund)} /من
              </span>
              <span className="text-[10px] text-emerald-300 block font-semibold">گودام فائنل لاگت</span>
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
