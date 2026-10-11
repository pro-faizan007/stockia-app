import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Save,
  CheckCircle,
  Wheat,
  Scale,
  Trash2,
  HelpCircle,
  PackageCheck,
  Sun,
  Moon,
  Zap,
  Check,
} from 'lucide-react';
import { CropConfig, AppTheme } from '../types';
import { formatPKR } from '../utils/mandiCalculations';

interface CropSeasonSettingsProps {
  crops: CropConfig[];
  onUpdateCrop: (crop: CropConfig) => void;
  onAddCrop: (crop: CropConfig) => void;
  onDeleteCrop: (id: string) => void;
  theme?: AppTheme;
  setTheme?: (theme: AppTheme) => void;
}

export const CropSeasonSettings: React.FC<CropSeasonSettingsProps> = ({
  crops,
  onUpdateCrop,
  onAddCrop,
  onDeleteCrop,
  theme = 'dark',
  setTheme,
}) => {
  const [editingCrops, setEditingCrops] = useState<Record<string, CropConfig>>(() => {
    const map: Record<string, CropConfig> = {};
    crops.forEach((c) => {
      map[c.id] = { ...c };
    });
    return map;
  });

  const [savedId, setSavedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New crop template
  const [newCrop, setNewCrop] = useState<Partial<CropConfig>>({
    id: '',
    name: '',
    urduName: '',
    season: 'Rabi / Kharif 2026',
    defaultBoriWeightKg: 50,
    defaultMundWeightKg: 40,
    deductionBaseKg: 50,
    deductionKg: 1.0,
    currentMarketRatePerMund: 4000,
    targetSellRatePerMund: 4500,
    storageCostPerBagMonth: 15,
  });

  const handleFieldChange = (id: string, field: keyof CropConfig, value: any) => {
    setEditingCrops((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveCrop = (id: string) => {
    const updated = editingCrops[id];
    if (updated) {
      // update dhaltaNote dynamically
      updated.dhaltaNote = `${updated.deductionKg} kg extra deduction per ${updated.deductionBaseKg} kg`;
      onUpdateCrop(updated);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2500);
    }
  };

  const handleCreateNewCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.name || !newCrop.urduName) return;

    const id = newCrop.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    const created: CropConfig = {
      id,
      name: newCrop.name,
      urduName: newCrop.urduName,
      season: newCrop.season || 'Current Season',
      defaultBoriWeightKg: Number(newCrop.defaultBoriWeightKg) || 50,
      defaultMundWeightKg: Number(newCrop.defaultMundWeightKg) || 40,
      deductionBaseKg: Number(newCrop.deductionBaseKg) || 50,
      deductionKg: Number(newCrop.deductionKg) || 1.0,
      dhaltaNote: `${newCrop.deductionKg || 1.0} kg extra per ${newCrop.deductionBaseKg || 50} kg`,
      currentMarketRatePerMund: Number(newCrop.currentMarketRatePerMund) || 4000,
      targetSellRatePerMund: Number(newCrop.targetSellRatePerMund) || 4500,
      storageCostPerBagMonth: Number(newCrop.storageCostPerBagMonth) || 15,
      accentColor: 'amber',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      iconName: 'wheat',
    };

    onAddCrop(created);
    setEditingCrops((prev) => ({ ...prev, [created.id]: created }));
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              فصلیں، سیزن و کٹوتی سیٹنگز (Crop-Specific Settings)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              No Mix-up Guarantee
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ہر فصل کے لیے بوری کا وزن (40kg یا 50kg)، من کا وزن، اور خریداروں سے لی جانے والی اضافی کٹوتی (فی 50kg یا فی 100kg) الگ الگ طے کریں۔
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>نئی فصل شامل کریں (Add Crop)</span>
        </button>
      </div>

      {/* Explanatory Notice */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <Scale className="w-4 h-4" />
          <span>الگ الگ فصل سیٹنگز کا اصول (Separated Weights & Deductions):</span>
        </div>
        <p className="text-slate-400 leading-relaxed">
          پاکستان کی غلہ منڈیوں میں گندم کی بوری عموماً <strong>40 کلو</strong> یا 100 کلو ہوتی ہے اور کٹوتی <strong>فی 50 کلو پر 1 کلو</strong> لی جاتی ہے، جبکہ چاول (دھان) کی بوری <strong>50 کلو</strong> ہوتی ہے اور کٹوتی <strong>فی 100 کلو پر 1.5 کلو</strong> تک ہوتی ہے۔ یہاں ہر فصل کی سیٹنگ مکمل آزاد ہے، تاکہ کھاتہ اور سٹاک بالکل درست رہے۔
        </p>
      </div>

      {/* Theme & Outdoor Visibility Display Selector */}
      {setTheme && (
        <div className="bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm sm:text-base font-bold text-white">
                  تھیم و ڈسپلے موڈ (App Theme & Outdoor Visibility)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                کھلی غلہ منڈی کی تیز دھوپ اور چکاچوند (Glare) یا رات کے وقت کے لیے پسندیدہ تھیم منتخب کریں۔
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 w-fit">
              فعال: {theme === 'dark' ? 'نائٹ موڈ' : theme === 'light' ? 'لائٹ موڈ' : 'ہائی کنٹراسٹ موڈ'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Dark Mode */}
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                theme === 'dark'
                  ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">نائٹ / ڈارک موڈ</span>
                </div>
                {theme === 'dark' && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">
                گہرا سلیٹ پس منظر، بیوپاریوں کے لیے شام اور انڈور دکان میں آنکھوں پر ہلکا۔
              </p>
              <span className="text-[10px] text-amber-300 font-mono font-semibold">Dark Slate (Default)</span>
            </button>

            {/* 2. Light Mode */}
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                theme === 'light'
                  ? 'bg-amber-50/20 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white">ڈے / لائٹ موڈ</span>
                </div>
                {theme === 'light' && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">
                صاف ستھرا سفید کارڈز اور ٹیکسٹ، دن کے وقت شفاف اور خوبصورت ڈیزائن۔
              </p>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">Clean Day Light</span>
            </button>

            {/* 3. High Contrast Mode */}
            <button
              type="button"
              onClick={() => setTheme('high-contrast')}
              className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer relative flex flex-col justify-between gap-2 ${
                theme === 'high-contrast'
                  ? 'bg-yellow-400/10 border-yellow-400 ring-2 ring-yellow-400 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center text-black">
                    <Zap className="w-4 h-4 fill-black" />
                  </div>
                  <span className="text-xs font-bold text-white">دھوپ و قوی کنٹراسٹ</span>
                </div>
                {theme === 'high-contrast' && <Check className="w-4 h-4 text-yellow-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">
                کھلی منڈی میں براہ راست تیز دھوپ (Outdoor Glare) کے لیے بولڈ بارڈرز اور گہرا کالا فونٹ۔
              </p>
              <span className="text-[10px] text-yellow-400 font-mono font-bold">Ultra High-Contrast</span>
            </button>
          </div>
        </div>
      )}

      {/* Crop Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {crops.map((crop) => {
          const form = editingCrops[crop.id] || crop;
          const isSaved = savedId === crop.id;

          return (
            <div
              key={crop.id}
              className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-amber-400 shrink-0">
                      <Wheat className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base">
                        {form.urduName} ({form.name})
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        سیزن: {form.season}
                      </span>
                    </div>
                  </div>

                  {crops.length > 2 && (
                    <button
                      onClick={() => onDeleteCrop(crop.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="حذف کریں"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Editable Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
                  {/* 1. Season Name */}
                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>سیزن نام</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">Season</span>
                    </label>
                    <input
                      type="text"
                      value={form.season}
                      onChange={(e) => handleFieldChange(crop.id, 'season', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* 2. Default Bori Weight */}
                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>بوری کا وزن</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">Bag Weight (kg)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={form.defaultBoriWeightKg}
                        onChange={(e) =>
                          handleFieldChange(crop.id, 'defaultBoriWeightKg', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400 text-xs shrink-0">کلو</span>
                    </div>
                  </div>

                  {/* 3. Default Mund Weight */}
                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>من کا وزن</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">Mund Weight (kg)</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={form.defaultMundWeightKg}
                        onChange={(e) =>
                          handleFieldChange(crop.id, 'defaultMundWeightKg', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-slate-400 text-xs shrink-0">کلو</span>
                    </div>
                  </div>

                  {/* 4. Current Market Rate */}
                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>آج کا منڈی ریٹ</span>
                      <span className="text-[10px] text-amber-400 font-mono font-bold" dir="ltr">PKR / Mund</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.currentMarketRatePerMund}
                      onChange={(e) =>
                        handleFieldChange(crop.id, 'currentMarketRatePerMund', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  {/* 5. Deductions Section (Basis & Weight) - Mobile-friendly & non-clipping */}
                  <div className="sm:col-span-2 p-3 rounded-xl bg-purple-950/30 border border-purple-850/60 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-purple-900/40">
                      <label className="text-purple-300 font-bold text-xs flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-purple-400" />
                        <span>اضافی کٹوتی و ڈھلتا رول</span>
                      </label>
                      <span className="text-[11px] font-mono text-purple-200 font-semibold bg-purple-900/40 px-2 py-0.5 rounded border border-purple-700/40 w-fit">
                        {form.deductionKg} کلو اضافی فی {form.deductionBaseKg} کلو
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[11px] text-slate-300 block mb-1">
                          کتنے وزن پر کٹوتی لگے؟ (بیس)
                        </span>
                        <select
                          value={form.deductionBaseKg}
                          onChange={(e) =>
                            handleFieldChange(crop.id, 'deductionBaseKg', Number(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-slate-900 border border-purple-700/70 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                        >
                          <option value={50}>50 کلو پر (Per 50 kg)</option>
                          <option value={100}>100 کلو پر (Per 100 kg)</option>
                          <option value={40}>40 کلو / من پر (Per 40 kg)</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-300 block mb-1">
                          کتنے کلو اضافی کٹوتی لیں؟
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="0.1"
                            inputMode="decimal"
                            value={form.deductionKg}
                            onChange={(e) =>
                              handleFieldChange(crop.id, 'deductionKg', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-slate-900 border border-purple-700/70 rounded-lg text-white text-xs font-mono font-bold focus:outline-none focus:border-purple-400"
                          />
                          <span className="text-slate-400 text-xs shrink-0">کلو</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Preset Buttons for Common Mandi Rules */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-purple-300/80">فوری سیٹ:</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange(crop.id, 'deductionBaseKg', 50);
                          handleFieldChange(crop.id, 'deductionKg', 1.0);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 cursor-pointer transition-colors"
                      >
                        50kg پر 1.0kg
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange(crop.id, 'deductionBaseKg', 50);
                          handleFieldChange(crop.id, 'deductionKg', 0.5);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 cursor-pointer transition-colors"
                      >
                        50kg پر 0.5kg
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange(crop.id, 'deductionBaseKg', 100);
                          handleFieldChange(crop.id, 'deductionKg', 1.5);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 cursor-pointer transition-colors"
                      >
                        100kg پر 1.5kg
                      </button>
                    </div>
                  </div>

                  {/* 6. Target Sell Rate & Storage Cost */}
                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>ٹارگٹ فروخت ریٹ</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold" dir="ltr">Target PKR / Mund</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.targetSellRatePerMund}
                      onChange={(e) =>
                        handleFieldChange(crop.id, 'targetSellRatePerMund', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-bold text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium flex items-center justify-between mb-1">
                      <span>گودام کرایہ فی بوری</span>
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">PKR / Month</span>
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.storageCostPerBagMonth}
                      onChange={(e) =>
                        handleFieldChange(crop.id, 'storageCostPerBagMonth', Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 text-center sm:text-right">
                  بوری: <strong>{form.defaultBoriWeightKg}kg</strong> • من:{' '}
                  <strong>{form.defaultMundWeightKg}kg</strong> • کٹوتی:{' '}
                  <strong>{form.deductionKg}kg / {form.deductionBaseKg}kg</strong>
                </span>

                <button
                  onClick={() => handleSaveCrop(crop.id)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>سیو ہو گیا!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>سیٹنگز محفوظ کریں</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Crop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl my-auto">
            <h3 className="text-lg font-bold text-white mb-3">
              نئی فصل شامل کریں (Add New Crop)
            </h3>
            <form onSubmit={handleCreateNewCrop} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">انگریزی نام (English Name) *</label>
                <input
                  type="text"
                  placeholder="e.g. Cotton, Sesame, Gram"
                  value={newCrop.name}
                  onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">اردو نام (Urdu Name) *</label>
                <input
                  type="text"
                  placeholder="مثال: کپاس، چنا، تلی"
                  value={newCrop.urduName}
                  onChange={(e) => setNewCrop({ ...newCrop, urduName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">بوری وزن (Bori Kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newCrop.defaultBoriWeightKg}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, defaultBoriWeightKg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">من وزن (Mund Kg)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newCrop.defaultMundWeightKg}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, defaultMundWeightKg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">کٹوتی بیس (Deduction Base)</label>
                  <select
                    value={newCrop.deductionBaseKg}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, deductionBaseKg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  >
                    <option value={50}>50 کلو پر (Per 50 kg)</option>
                    <option value={100}>100 کلو پر (Per 100 kg)</option>
                    <option value={40}>40 کلو / من پر (Per 40 kg)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">کٹوتی وزن (Deduction Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={newCrop.deductionKg}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, deductionKg: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">منڈی ریٹ (PKR/من)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newCrop.currentMarketRatePerMund}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, currentMarketRatePerMund: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">ٹارگٹ ریٹ (PKR/من)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newCrop.targetSellRatePerMund}
                    onChange={(e) =>
                      setNewCrop({ ...newCrop, targetSellRatePerMund: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  فصل محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
