import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calculator,
  ArrowRight,
  Warehouse,
  Phone,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { GodownRentRecord, RentFrequency } from '../types';
import { formatPKR } from '../utils/mandiCalculations';

interface GodownRentManagerProps {
  rents: GodownRentRecord[];
  onSaveRent: (rent: GodownRentRecord) => void;
  onDeleteRent: (id: string) => void;
  totalOccupiedBags?: number;
}

export const GodownRentManager: React.FC<GodownRentManagerProps> = ({
  rents,
  onSaveRent,
  onDeleteRent,
  totalOccupiedBags = 0,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRent, setEditingRent] = useState<GodownRentRecord | null>(null);

  // Quick Rent Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(45000);
  const [calcFrequency, setCalcFrequency] = useState<RentFrequency>('monthly');
  const [calcBags, setCalcBags] = useState<number>(totalOccupiedBags || 1000);

  // Modal form states
  const [godamName, setGodamName] = useState('');
  const [location, setLocation] = useState('');
  const [rentPkr, setRentPkr] = useState<number>(40000);
  const [frequency, setFrequency] = useState<RentFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [status, setStatus] = useState<'paid' | 'due' | 'advance'>('paid');
  const [capacityBags, setCapacityBags] = useState<number>(2000);
  const [landlordName, setLandlordName] = useState('');
  const [landlordPhone, setLandlordPhone] = useState('');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingRent(null);
    setGodamName('مرکزی غلہ گودام');
    setLocation('غلہ منڈی روڈ');
    setRentPkr(40000);
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    // Calculate 1 month ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    setNextDueDate(d.toISOString().split('T')[0]);
    setStatus('paid');
    setCapacityBags(2500);
    setLandlordName('');
    setLandlordPhone('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GodownRentRecord) => {
    setEditingRent(item);
    setGodamName(item.godamName);
    setLocation(item.location || '');
    setRentPkr(item.rentPkr);
    setFrequency(item.frequency);
    setStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setNextDueDate(item.nextDueDate || '');
    setStatus(item.status);
    setCapacityBags(item.capacityBags || 2000);
    setLandlordName(item.landlordName || '');
    setLandlordPhone(item.landlordPhone || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleFrequencyChangeInModal = (f: RentFrequency) => {
    setFrequency(f);
    const d = new Date(startDate || Date.now());
    if (f === 'monthly') d.setMonth(d.getMonth() + 1);
    else if (f === 'quarterly') d.setMonth(d.getMonth() + 3);
    else if (f === 'half_yearly') d.setMonth(d.getMonth() + 6);
    else if (f === 'yearly') d.setFullYear(d.getFullYear() + 1);
    setNextDueDate(d.toISOString().split('T')[0]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!godamName.trim() || rentPkr <= 0) return;

    const record: GodownRentRecord = {
      id: editingRent ? editingRent.id : 'rent-' + Date.now(),
      godamName: godamName.trim(),
      location: location.trim(),
      rentPkr: Number(rentPkr),
      frequency,
      startDate,
      nextDueDate,
      status,
      capacityBags: Number(capacityBags) || undefined,
      landlordName: landlordName.trim() || undefined,
      landlordPhone: landlordPhone.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: editingRent?.createdAt || Date.now(),
    };

    onSaveRent(record);
    setIsModalOpen(false);
  };

  // Aggregated calculations normalized to Monthly PKR
  const normalizedMonthlyTotal = rents.reduce((sum, r) => {
    let monthlyRate = r.rentPkr;
    if (r.frequency === 'quarterly') monthlyRate = r.rentPkr / 3;
    else if (r.frequency === 'half_yearly') monthlyRate = r.rentPkr / 6;
    else if (r.frequency === 'yearly') monthlyRate = r.rentPkr / 12;
    return sum + monthlyRate;
  }, 0);

  const quarterlyTotal = normalizedMonthlyTotal * 3;
  const halfYearlyTotal = normalizedMonthlyTotal * 6;
  const yearlyTotal = normalizedMonthlyTotal * 12;

  // Cost per bag per month based on current storage
  const activeBags = totalOccupiedBags > 0 ? totalOccupiedBags : rents.reduce((s, r) => s + (r.capacityBags || 0), 0) || 1;
  const costPerBagPerMonth = activeBags > 0 ? normalizedMonthlyTotal / activeBags : 0;

  // Interactive Calculator conversions
  let calcMonthly = calcAmount;
  if (calcFrequency === 'quarterly') calcMonthly = calcAmount / 3;
  else if (calcFrequency === 'half_yearly') calcMonthly = calcAmount / 6;
  else if (calcFrequency === 'yearly') calcMonthly = calcAmount / 12;

  const calcQuarterly = calcMonthly * 3;
  const calcHalfYearly = calcMonthly * 6;
  const calcYearly = calcMonthly * 12;
  const calcCostPerBag = calcBags > 0 ? calcMonthly / calcBags : 0;

  const getFrequencyLabel = (f: RentFrequency) => {
    switch (f) {
      case 'monthly':
        return 'ماہانہ (1 ماہ)';
      case 'quarterly':
        return 'سہ ماہی (3 ماہ)';
      case 'half_yearly':
        return 'چھ ماہی (6 ماہ)';
      case 'yearly':
        return 'سالانہ (12 ماہ)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-400 shrink-0" />
              <span>گودام کرایہ و اخراجات (Godown Rent & Kiraya)</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 whitespace-nowrap text-center inline-flex items-center justify-center shrink-0 leading-tight">
              ماہانہ و سہ ماہی
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            گوداموں کے ماہانہ، 3 ماہی (سہ ماہی)، 6 ماہی (چھ ماہی) اور سالانہ کرایہ جات، پیشگی ادائیگی اور فی بوری سٹوریج لاگت کا خودکار حساب۔
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>نیا گودام کرایہ درج کریں (+ Add Rent)</span>
        </button>
      </div>

      {/* 1. Multi-Cycle Rent Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Monthly */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 w-full">
            <span>ماہانہ کرایہ (1 Month)</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
              MONTHLY
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono text-center">
            {formatPKR(Math.round(normalizedMonthlyTotal))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1.5 text-center">
            <span>فی بوری ماہانہ لاگت:</span>
            <span className="font-bold text-amber-400 font-mono">
              ₨ {costPerBagPerMonth.toFixed(1)}/بوری
            </span>
          </div>
        </div>

        {/* 3-Monthly / Quarterly */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 w-full">
            <span>سہ ماہی کرایہ (3 Months)</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              QUARTERLY
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono text-center">
            {formatPKR(Math.round(quarterlyTotal))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 text-center">
            ہر 3 ماہ بعد واجب الادا رقم
          </div>
        </div>

        {/* 6-Monthly / Half-Yearly */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 w-full">
            <span>چھ ماہی کرایہ (6 Months)</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-bold">
              HALF-YEARLY
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono text-center">
            {formatPKR(Math.round(halfYearlyTotal))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 text-center">
            فصل در فصل (6 ماہ) کرایہ لاگت
          </div>
        </div>

        {/* Yearly */}
        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 w-full">
            <span>سالانہ کرایہ (1 Year)</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              ANNUAL
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono text-center">
            {formatPKR(Math.round(yearlyTotal))}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 text-center">
            مکمل سال کا مجموعی گودام خرچ
          </div>
        </div>
      </div>

      {/* 2. Interactive Quick Kiraya Calculator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl p-4 sm:p-5 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                فوری کرایہ کنورٹر و کیلکولیٹر (Multi-Cycle Rent Calculator)
              </h3>
              <p className="text-[11px] text-slate-400">
                کسی بھی کرایہ رقم کو ماہانہ، 3 ماہ، 6 ماہ اور سالانہ پیمانوں میں فوراً تبدیل کریں:
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              کرایہ رقم درج کریں (Rent in PKR)
            </label>
            <input
              type="number"
              min="0"
              value={calcAmount || ''}
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm"
              placeholder="مثلاً 40000"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              کرایہ کی مدت (Billing Cycle)
            </label>
            <select
              value={calcFrequency}
              onChange={(e) => setCalcFrequency(e.target.value as RentFrequency)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
            >
              <option value="monthly">ماہانہ (Monthly - 1 ماہ)</option>
              <option value="quarterly">سہ ماہی (Quarterly - 3 ماہ)</option>
              <option value="half_yearly">چھ ماہی (Half-Yearly - 6 ماہ)</option>
              <option value="yearly">سالانہ (Yearly - 12 ماہ)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-semibold block mb-1">
              کل ذخیرہ شدہ بوریاں (Stored Bags)
            </label>
            <input
              type="number"
              min="1"
              value={calcBags || ''}
              onChange={(e) => setCalcBags(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm"
              placeholder="مثلاً 1000"
            />
          </div>
        </div>

        {/* Calculated breakdown table */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
            <span className="text-[10px] text-blue-300 font-bold block">ماہانہ (1 ماہ)</span>
            <span className="text-sm font-extrabold text-blue-400 font-mono">
              {formatPKR(Math.round(calcMonthly))}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
            <span className="text-[10px] text-amber-300 font-bold block">سہ ماہی (3 ماہ)</span>
            <span className="text-sm font-extrabold text-amber-400 font-mono">
              {formatPKR(Math.round(calcQuarterly))}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-[10px] text-purple-300 font-bold block">چھ ماہی (6 ماہ)</span>
            <span className="text-sm font-extrabold text-purple-400 font-mono">
              {formatPKR(Math.round(calcHalfYearly))}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-[10px] text-emerald-300 font-bold block">سالانہ (12 ماہ)</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {formatPKR(Math.round(calcYearly))}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-center">
            <span className="text-[10px] text-amber-300 block font-bold">فی بوری ماہانہ کرایہ</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              ₨ {calcCostPerBag.toFixed(1)}/بوری
            </span>
          </div>
        </div>
      </div>

      {/* 3. List of Registered Godown Agreements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-emerald-400" />
            <span>گودام معاہدات و کرایہ کھاتہ ({rents.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            تمام گوداموں کا ریکارڈ
          </span>
        </div>

        {rents.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-700/60 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">کوئی گودام کرایہ ریکارڈ موجود نہیں</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              اپنے گودام کا ماہانہ یا سہ ماہی کرایہ ریکارڈ درج کریں تاکہ سٹوریج اخراجات کا درست حساب ہو سکے۔
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>پہلا کرایہ ریکارڈ شامل کریں</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rents.map((r) => {
              // Equivalent monthly
              let mRate = r.rentPkr;
              if (r.frequency === 'quarterly') mRate = r.rentPkr / 3;
              else if (r.frequency === 'half_yearly') mRate = r.rentPkr / 6;
              else if (r.frequency === 'yearly') mRate = r.rentPkr / 12;

              return (
                <div
                  key={r.id}
                  className="bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white">
                          {r.godamName}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {getFrequencyLabel(r.frequency)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'advance'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {r.status === 'paid' ? 'ادا شدہ (Paid)' : r.status === 'advance' ? 'پیشگی ادا شدہ' : 'واجب الادا (Due)'}
                        </span>
                      </div>
                      {r.location && (
                        <p className="text-xs text-slate-400 mt-0.5">{r.location}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(r)}
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="ترمیم کریں"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRent(r.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="حذف کریں"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rent figures */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">طے شدہ کرایہ ({getFrequencyLabel(r.frequency)})</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        {formatPKR(r.rentPkr)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">برابر ماہانہ شرح</span>
                      <span className="text-lg font-bold text-slate-200 font-mono">
                        {formatPKR(Math.round(mRate))}/ماہ
                      </span>
                    </div>
                  </div>

                  {/* Dates & Capacity */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>اگلی ادائیگی: <strong className="text-slate-200 font-mono">{r.nextDueDate || 'طے شدہ نہیں'}</strong></span>
                    </div>
                    {r.capacityBags && (
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>گنجائش: <strong className="text-slate-200 font-mono">{r.capacityBags} بوریاں</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Landlord Contact */}
                  {(r.landlordName || r.landlordPhone) && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      <span>مالک: <strong className="text-slate-200">{r.landlordName || '—'}</strong></span>
                      {r.landlordPhone && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono">
                          <Phone className="w-3 h-3" />
                          {r.landlordPhone}
                        </span>
                      )}
                    </div>
                  )}

                  {r.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-900/40 p-2 rounded">
                      &ldquo;{r.notes}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>{editingRent ? 'گودام کرایہ میں ترمیم کریں' : 'نیا گودام کرایہ ریکارڈ درج کریں'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">گودام کا نام یا شناخت *</label>
                <input
                  type="text"
                  required
                  value={godamName}
                  onChange={(e) => setGodamName(e.target.value)}
                  placeholder="مثلاً گودام نمبر 1 (بائی پاس)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">مقام / پتہ (Location)</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثلاً اوکاڑہ نیو غلہ منڈی روڈ"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">کرایہ کی مدت (Frequency) *</label>
                  <select
                    value={frequency}
                    onChange={(e) => handleFrequencyChangeInModal(e.target.value as RentFrequency)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                  >
                    <option value="monthly">ماہانہ (1 ماہ)</option>
                    <option value="quarterly">سہ ماہی (3 ماہ)</option>
                    <option value="half_yearly">چھ ماہی (6 ماہ)</option>
                    <option value="yearly">سالانہ (12 ماہ)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">کرایہ رقم (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rentPkr || ''}
                    onChange={(e) => setRentPkr(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">آغاز تاریخ</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">اگلی واجب الادا تاریخ</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">ادائیگی کی صورتحال (Status)</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
                  >
                    <option value="paid">ادا شدہ (Paid)</option>
                    <option value="due">واجب الادا (Due)</option>
                    <option value="advance">پیشگی ادا شدہ (Advance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">گنجائش (تعداد بوریاں)</label>
                  <input
                    type="number"
                    min="0"
                    value={capacityBags || ''}
                    onChange={(e) => setCapacityBags(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">مالک مکان / گودام نام</label>
                  <input
                    type="text"
                    value={landlordName}
                    onChange={(e) => setLandlordName(e.target.value)}
                    placeholder="نام درج کریں"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">مالک فون نمبر</label>
                  <input
                    type="text"
                    value={landlordPhone}
                    onChange={(e) => setLandlordPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">اضافی نوٹس</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سیکیورٹی ڈپازٹ، بجلی میٹر یا معاہدہ کی تفصیل..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {editingRent ? 'محفوظ کریں' : 'کرایہ شامل کریں'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
