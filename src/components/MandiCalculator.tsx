import React, { useState } from 'react';
import {
  Calculator,
  Scale,
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle,
  CheckCircle2,
  HelpCircle,
  DollarSign,
  Layers,
  Building2,
  Calendar,
} from 'lucide-react';
import { CropConfig, RentFrequency } from '../types';
import { calculateMandiLot, formatMunds, formatPKR, MUND_KG } from '../utils/mandiCalculations';

interface MandiCalculatorProps {
  crops: CropConfig[];
  selectedCropId: string;
}

export const MandiCalculator: React.FC<MandiCalculatorProps> = ({ crops, selectedCropId }) => {
  // Active Crop Preset
  const activeCrop = crops.find((c) => c.id === selectedCropId) || crops[0];

  // Inputs
  const [bags, setBags] = useState<number>(100);
  const [bagWeightKg, setBagWeightKg] = useState<number>(50);
  const [mundWeightKg, setMundWeightKg] = useState<number>(activeCrop.defaultMundWeightKg || 40);
  const [deductionBaseKg, setDeductionBaseKg] = useState<number>(activeCrop.deductionBaseKg || 50);
  const [deductionKg, setDeductionKg] = useState<number>(activeCrop.deductionKg ?? 1.0);
  const [ratePerMund, setRatePerMund] = useState<number>(activeCrop.currentMarketRatePerMund || 3950);
  const [bardanaPerBag, setBardanaPerBag] = useState<number>(0);
  const [laborPerBag, setLaborPerBag] = useState<number>(0);

  // Mandi to Godam Kiraya, Commission, Broker Fee
  const [kirayaPerBag, setKirayaPerBag] = useState<number>(0);
  const [kirayaTotal, setKirayaTotal] = useState<number>(0);
  const [commissionPercent, setCommissionPercent] = useState<number>(0);
  const [commissionTotal, setCommissionTotal] = useState<number>(0);
  const [brokerFeePerBag, setBrokerFeePerBag] = useState<number>(0);
  const [brokerFeeTotal, setBrokerFeeTotal] = useState<number>(0);

  // Godown Rent & Kiraya Multi-Cycle Calculator State
  const [rentAmount, setRentAmount] = useState<number>(35000);
  const [rentFrequency, setRentFrequency] = useState<RentFrequency>('monthly');
  const [rentBags, setRentBags] = useState<number>(1000);
  const [copiedRentSlip, setCopiedRentSlip] = useState(false);

  // Quick switch crop preset (Does NOT force change bori weight - user selects crop independently)
  const handleSelectCropPreset = (crop: CropConfig) => {
    setMundWeightKg(crop.defaultMundWeightKg || 40);
    setDeductionBaseKg(crop.deductionBaseKg || 50);
    setDeductionKg(crop.deductionKg ?? 1.0);
    setRatePerMund(crop.currentMarketRatePerMund || 3950);
  };

  // Perform calculation
  const result = calculateMandiLot({
    bags,
    bagWeightKg,
    mundWeightKg,
    deductionBaseKg,
    deductionKg,
    ratePerMund,
    bardanaPerBagPkr: bardanaPerBag,
    laborPerBagPkr: laborPerBag,
    kirayaPerBagPkr: kirayaPerBag,
    kirayaTotalPkr: kirayaTotal,
    commissionPercent,
    commissionTotalPkr: commissionTotal,
    brokerFeePerBagPkr: brokerFeePerBag,
    brokerFeeTotalPkr: brokerFeeTotal,
  });

  // Copy result slip
  const [copied, setCopied] = useState(false);
  const handleCopySlip = () => {
    const text = `🧮 *منڈی کاؤنٹر پرچی (Mandi Counter Calculation)*
-----------------------------------
🌾 *تعداد بوری:* ${bags} بوری (${bagWeightKg} کلو فی بوری)
⚖️ *کل وزن مَن (Total Mand Weight):* ${formatMunds(result.physicalMunds)} من (${result.grossWeightKg.toLocaleString()} کلو کچا)
✂️ *ڈھلتا کٹوتی:* ${deductionKg} کلو فی ${deductionBaseKg} کلو (کل کٹوتی: ${result.totalDhaltaExtraKg.toFixed(1)} کلو / ${formatMunds(result.totalDhaltaExtraMunds)} من)
📦 *بل والا خالص وزن (Net Billed):* ${result.netBilledWeightKg.toLocaleString()} کلو (${formatMunds(result.netBilledMunds)} من)
💰 *ریٹ فی من (40kg):* ₨ ${ratePerMund.toLocaleString()}
🎒 *ریٹ فی بوری:* ₨ ${Math.round(result.ratePerBori).toLocaleString()}
-----------------------------------
💵 *خام اناج کی رقم:* ₨ ${Math.round(result.rawGrainAmountPkr).toLocaleString()}
${result.kirayaTotalPkr > 0 ? `🚛 *کرایہ منڈی تا گودام:* ₨ ${Math.round(result.kirayaTotalPkr).toLocaleString()}\n` : ''}${result.commissionTotalPkr > 0 ? `🤝 *کمیشن برائے مال:* ₨ ${Math.round(result.commissionTotalPkr).toLocaleString()}\n` : ''}${result.brokerFeeTotalPkr > 0 ? `🧑‍💼 *بروکر / دلالی فیس:* ₨ ${Math.round(result.brokerFeeTotalPkr).toLocaleString()}\n` : ''}${bardanaPerBag > 0 ? `📦 *باردانہ:* ₨ ${Math.round(result.bardanaTotalPkr).toLocaleString()}\n` : ''}${laborPerBag > 0 ? `👷 *پلے داری و مزدوری:* ₨ ${Math.round(result.laborTotalPkr).toLocaleString()}\n` : ''}✅ *کل قابل ادائیگی رقم (Total Bill):* ₨ ${Math.round(result.totalPayablePkr).toLocaleString()}
🎁 *ڈھلتا کی مفت مالیت:* ₨ ${Math.round(result.dhaltaBenefitPkr).toLocaleString()}
🎯 *لاگت فی من (گودام مال پر Landed):* ₨ ${Math.round(result.effectiveCostPerPhysicalMund).toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              منڈی کاؤنٹر کیلکولیٹر (Mandi Rate & Unit Calculator)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Live Mandi Math
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            من، بوری، 50 کلو، 100 کلو اور ڈھلتا کٹوتی کے فوری اور درست حساب کتاب کے لیے۔
          </p>
        </div>

        <button
          onClick={handleCopySlip}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>پرچی کاپی ہو گئی!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>کیلکولیشن پرچی کاپی کریں</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Crop Quick Load Bar */}
      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          فصل کے حساب سے سیٹنگز لوڈ کریں:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {crops.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCropPreset(c)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors font-medium cursor-pointer"
            >
              {c.urduName} ({c.name.split(' ')[0]})
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>مال کی تفصیل و ریٹ درج کریں</span>
            </h2>

            {/* 1. Bags Count */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  تعداد بوری / توڑے (Number of Bags)
                </label>
                <div className="flex items-center gap-1">
                  {[50, 100, 200, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setBags(num)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono cursor-pointer ${
                        bags === num ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="1"
                value={bags || ''}
                onChange={(e) => setBags(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 2. Bag Weight Preset (50kg, 60kg, 70kg only - without crop names) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  فی بوری وزن (Bag Weight in Kg) *
                </label>
                <span className="text-[11px] text-amber-400 font-bold">50 / 60 / 70 کلو وزن</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {[50, 60, 70].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setBagWeightKg(w)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                      bagWeightKg === w
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block text-sm font-mono font-black">{w} kg</span>
                    <span className="block text-[10px] opacity-85">{w} کلو بوری</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">یا کسٹم وزن:</span>
                <input
                  type="number"
                  min="1"
                  value={bagWeightKg || ''}
                  onChange={(e) => setBagWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 3. Rate per Mund */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  ریٹ فی من (Rate in PKR per 40kg)
                </label>
                <span className="text-[11px] text-amber-300 font-mono">
                  = ₨ {(ratePerMund / MUND_KG).toFixed(2)} فی کلو
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                  PKR
                </span>
                <input
                  type="number"
                  min="0"
                  value={ratePerMund || ''}
                  onChange={(e) => setRatePerMund(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 4. Dhalta / Katoti Deduction rule */}
            <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/50 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-purple-400" />
                  <span>ڈھلتا کٹوتی / زائد وزن (Crop Extra Deduction)</span>
                </label>
                <span className="text-[11px] text-purple-300">
                  {deductionKg} کلو فی {deductionBaseKg} کلو
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                خریدار سے لی جانے والی اضافی کٹوتی (مثلاً گندم کے لیے فی 50 کلو، چاول کے لیے فی 100 کلو)۔
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-purple-300 block mb-1">کٹوتی بنیاد (Base)</span>
                  <select
                    value={deductionBaseKg}
                    onChange={(e) => setDeductionBaseKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-purple-800 rounded-lg text-white font-mono text-xs"
                  >
                    <option value={50}>فی 50 کلو</option>
                    <option value={100}>فی 100 کلو</option>
                    <option value={40}>فی 40 کلو / من</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 block mb-1">کٹوتی وزن (Extra Kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={deductionKg}
                    onChange={(e) => setDeductionKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-purple-800 rounded-lg text-white font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 5. Kiraya, Commission, Broker Fee & Mandi Expenses */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <span>منڈی تا گودام کرایہ، کمیشن و بروکر فیس</span>
                </span>
                <span className="text-[10px] text-slate-400">لاگت میں شامل کریں</span>
              </div>

              {/* Kiraya from Mandi to Godam */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    کرایہ منڈی تا گودام (فی بوری)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={kirayaPerBag || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setKirayaPerBag(v);
                      setKirayaTotal(v * bags);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    کل کرایہ (Total Kiraya PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={kirayaTotal || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setKirayaTotal(v);
                      if (bags > 0) setKirayaPerBag(Math.round(v / bags));
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Commission on Maal */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    کمیشن برائے مال (Commission %)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="مثلاً 1%"
                    value={commissionPercent || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCommissionPercent(v);
                      setCommissionTotal(Math.round((result.rawGrainAmountPkr * v) / 100));
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    کل کمیشن (Total Commission PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={commissionTotal || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setCommissionTotal(v);
                      setCommissionPercent(0);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Broker Fee on Maal Laat */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    بروکر فیس برائے لاٹ (فی بوری)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={brokerFeePerBag || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBrokerFeePerBag(v);
                      setBrokerFeeTotal(v * bags);
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    کل بروکر فیس (Broker Fee PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={brokerFeeTotal || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBrokerFeeTotal(v);
                      if (bags > 0) setBrokerFeePerBag(Math.round(v / bags));
                    }}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-purple-400 font-bold font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Bardana and Labor */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    باردانہ فی بوری (PKR / Bag)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={bardanaPerBag || ''}
                    onChange={(e) => setBardanaPerBag(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">
                    پلے داری و مزدوری (PKR / Bag)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={laborPerBag || ''}
                    onChange={(e) => setLaborPerBag(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Bill Receipt (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 border border-amber-500/30 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <h3 className="font-extrabold text-white text-base">
                  صاف حساب کتاب (Mandi Slip)
                </h3>
                <span className="text-[11px] text-amber-400">
                  1 من = 40 کلو • 100 کلو = 2.5 من
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                صاف پرچی
              </span>
            </div>

            {/* Prominent Total Mand Weight Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>کل وزن مَن (Total Mand Weight)</span>
                </span>
                <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black">
                  {formatMunds(result.physicalMunds)} مَن
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex justify-between pt-1 border-t border-amber-500/20">
                <span>گودام فزیکل کچا وزن:</span>
                <span className="font-mono font-bold text-white">
                  {formatMunds(result.physicalMunds)} من ({result.grossWeightKg.toLocaleString()} کلو)
                </span>
              </div>
            </div>

            {/* Weights Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>کل کچا وزن (Gross Weight):</span>
                <span className="font-mono font-bold text-white">
                  {result.grossWeightKg.toLocaleString()} کلو ({formatMunds(result.grossMunds)} من)
                </span>
              </div>

              <div className="flex justify-between items-center text-purple-400 bg-purple-950/30 p-2 rounded-lg border border-purple-900/40">
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" />
                  ڈھلتا کٹوتی ({result.dhaltaExtraKgPerBag.toFixed(2)}kg فی بوری):
                </span>
                <span className="font-mono font-bold">
                  -{result.totalDhaltaExtraKg.toFixed(1)} کلو (-{formatMunds(result.totalDhaltaExtraMunds)} من)
                </span>
              </div>

              <div className="flex justify-between items-center text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
                <span className="font-bold">بل والا خالص وزن (Net Billable):</span>
                <span className="font-mono font-extrabold text-white text-sm">
                  {result.netBilledWeightKg.toLocaleString()} کلو ({formatMunds(result.netBilledMunds)} من)
                </span>
              </div>
            </div>

            {/* Rates Conversion */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">ریٹ فی بوری ({bagWeightKg}kg)</span>
                <span className="font-black text-white text-sm">
                  {formatPKR(result.ratePerBori)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ریٹ فی کلو</span>
                <span className="font-black text-amber-400 text-sm">
                  {formatPKR(result.ratePerKg)} <span className="text-[10px] text-slate-400">/kg</span>
                </span>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="space-y-2 pt-2 border-t border-slate-700/80 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>اناج کی رقم ({formatMunds(result.netBilledMunds)} من @ {ratePerMund}):</span>
                <span className="font-mono font-semibold text-slate-200">
                  {formatPKR(result.rawGrainAmountPkr)}
                </span>
              </div>

              {result.kirayaTotalPkr > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>کرایہ منڈی تا گودام ({bags} بوری):</span>
                  <span className="font-mono font-bold">
                    +{formatPKR(result.kirayaTotalPkr)}
                  </span>
                </div>
              )}

              {result.commissionTotalPkr > 0 && (
                <div className="flex justify-between text-amber-400 font-medium">
                  <span>کمیشن برائے مال:</span>
                  <span className="font-mono font-bold">
                    +{formatPKR(result.commissionTotalPkr)}
                  </span>
                </div>
              )}

              {result.brokerFeeTotalPkr > 0 && (
                <div className="flex justify-between text-purple-400 font-medium">
                  <span>بروکر / دلالی فیس برائے لاٹ:</span>
                  <span className="font-mono font-bold">
                    +{formatPKR(result.brokerFeeTotalPkr)}
                  </span>
                </div>
              )}

              {result.bardanaTotalPkr > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>باردانہ لاگت ({bags} بوری):</span>
                  <span className="font-mono text-slate-200">
                    +{formatPKR(result.bardanaTotalPkr)}
                  </span>
                </div>
              )}

              {result.laborTotalPkr > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>پلے داری و مزدوری:</span>
                  <span className="font-mono text-slate-200">
                    +{formatPKR(result.laborTotalPkr)}
                  </span>
                </div>
              )}

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm font-extrabold text-white">کل قابل ادائیگی (Total Bill):</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatPKR(result.totalPayablePkr)}
                </span>
              </div>
            </div>

            {/* Stockia Advantage Box (The Hoarder's Math) */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>سٹاکیہ فائدہ (Stockia Cushion):</span>
              </div>
              <p className="text-[11px] text-slate-300">
                گودام میں پورے <strong className="text-white">{formatMunds(result.physicalMunds)} من</strong> مال داخل ہوگا۔ ڈھلتا کی بچت سے آپ کو <strong className="text-emerald-300">{formatPKR(result.dhaltaBenefitPkr)}</strong> کا مفت اناج ملا، جس سے فی من لاگت گر کر <strong className="text-amber-300">{formatPKR(result.effectiveCostPerPhysicalMund)}</strong> ہو گئی۔
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Godown Rent & Kiraya Multi-Cycle Calculator (Monthly, 3-Monthly, 6-Monthly, Yearly) */}
      {(() => {
        let monthlyEquivalent = Number(rentAmount) || 0;
        if (rentFrequency === 'quarterly') monthlyEquivalent = (Number(rentAmount) || 0) / 3;
        else if (rentFrequency === 'half_yearly') monthlyEquivalent = (Number(rentAmount) || 0) / 6;
        else if (rentFrequency === 'yearly') monthlyEquivalent = (Number(rentAmount) || 0) / 12;

        const rent1Month = Math.round(monthlyEquivalent);
        const rent3Months = Math.round(monthlyEquivalent * 3);
        const rent6Months = Math.round(monthlyEquivalent * 6);
        const rent12Months = Math.round(monthlyEquivalent * 12);
        const costPerBagPerMonth = rentBags && rentBags > 0 ? monthlyEquivalent / rentBags : 0;

        const handleCopyRentSlip = () => {
          const slip = `🏛️ *گودام کرایہ و فئیر پرچی (Godown Rent Calculation)*
-----------------------------------
🏢 *درج کردہ کرایہ:* ₨ ${rentAmount.toLocaleString()} (${rentFrequency === 'monthly' ? 'ماہانہ' : rentFrequency === 'quarterly' ? 'سہ ماہی (3 ماہ)' : rentFrequency === 'half_yearly' ? 'چھ ماہی (6 ماہ)' : 'سالانہ (12 ماہ)'})
📦 *گودام میں بوریاں:* ${rentBags.toLocaleString()} بوری
-----------------------------------
📅 *ماہانہ کرایہ (1 Month):* ₨ ${rent1Month.toLocaleString()}
📅 *سہ ماہی کرایہ (3 Months):* ₨ ${rent3Months.toLocaleString()}
📅 *چھ ماہی کرایہ (6 Months):* ₨ ${rent6Months.toLocaleString()}
📅 *سالانہ کرایہ (1 Year):* ₨ ${rent12Months.toLocaleString()}
💰 *فی بوری ماہانہ کرایہ خرچ:* ₨ ${costPerBagPerMonth.toFixed(1)} / بوری`;

          navigator.clipboard.writeText(slip);
          setCopiedRentSlip(true);
          setTimeout(() => setCopiedRentSlip(false), 2500);
        };

        return (
          <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-5 border border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white">
                      گودام کرایہ و فئیر کیلکولیٹر (Godown Rent & Kiraya)
                    </h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ماہانہ و سہ ماہی
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    گودام کا کرایہ ماہانہ، 3 ماہ (سہ ماہی)، 6 ماہ (چھ ماہی) یا سالانہ بنیاد پر خودکار تبدیل کریں اور فی بوری خرچ نکالیں۔
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRentSlip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                {copiedRentSlip ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کرایہ پرچی کاپی ہو گئی!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کرایہ پرچی کاپی کریں</span>
                  </>
                )}
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  کرایہ رقم (Rent Amount in PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₨</span>
                  <input
                    type="number"
                    min="0"
                    value={rentAmount || ''}
                    onChange={(e) => setRentAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                    placeholder="مثال: 35000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  کرایہ کی بنیاد / مدت (Billing Basis) *
                </label>
                <select
                  value={rentFrequency}
                  onChange={(e) => setRentFrequency(e.target.value as RentFrequency)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="monthly">ماہانہ بنیاد (Monthly - 1 Month)</option>
                  <option value="quarterly">3 ماہ / سہ ماہی بنیاد (Quarterly - 3 Months)</option>
                  <option value="half_yearly">6 ماہ / چھ ماہی بنیاد (Half-Yearly - 6 Months)</option>
                  <option value="yearly">سالانہ بنیاد (Yearly - 12 Months)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  گودام میں کل بوریاں (Total Bags Stored)
                </label>
                <input
                  type="number"
                  min="1"
                  value={rentBags || ''}
                  onChange={(e) => setRentBags(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  placeholder="مثال: 1000"
                />
              </div>
            </div>

            {/* Calculated Breakdown Across All 4 Periods */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Monthly */}
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] text-blue-300 block font-bold uppercase text-center">ماہانہ کرایہ (1 Month)</span>
                <span className="text-base sm:text-lg font-black text-blue-400 font-mono text-center">
                  {formatPKR(rent1Month)}
                </span>
                <span className="text-[10px] text-amber-400 block mt-0.5 text-center">
                  ₨ {costPerBagPerMonth.toFixed(1)} فی بوری / ماہ
                </span>
              </div>

              {/* Quarterly (3 Months) */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] text-amber-300 block font-bold uppercase text-center">سہ ماہی کرایہ (3 Months)</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-mono text-center">
                  {formatPKR(rent3Months)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                  ہر 3 ماہ کی مجموعی رقم
                </span>
              </div>

              {/* Half-Yearly (6 Months) */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] text-purple-300 block font-bold uppercase text-center">چھ ماہی کرایہ (6 Months)</span>
                <span className="text-base sm:text-lg font-black text-purple-400 font-mono text-center">
                  {formatPKR(rent6Months)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                  ایک سیزن (6 ماہ) کی لاگت
                </span>
              </div>

              {/* Yearly (12 Months) */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center justify-center">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase text-center">سالانہ کرایہ (12 Months)</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono text-center">
                  {formatPKR(rent12Months)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 text-center">
                  مکمل سال کا گودام خرچ
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
