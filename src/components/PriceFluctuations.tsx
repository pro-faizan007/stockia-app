import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
} from 'lucide-react';
import { CropConfig, MandiRateHistory } from '../types';
import { formatPKR } from '../utils/mandiCalculations';

interface PriceFluctuationsProps {
  crops: CropConfig[];
  selectedCropId: string;
  rateHistory: MandiRateHistory[];
  onAddRateHistory: (entry: MandiRateHistory) => void;
}

export const PriceFluctuations: React.FC<PriceFluctuationsProps> = ({
  crops,
  selectedCropId,
  rateHistory,
  onAddRateHistory,
}) => {
  const [selectedCrop, setSelectedCrop] = useState<string>(
    selectedCropId === 'all' ? crops[0]?.id || 'wheat' : selectedCropId
  );

  const [showAddRate, setShowAddRate] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    mandiName: 'Okara Galla Mandi',
    minRate: 3900,
    maxRate: 3980,
    trend: 'rising' as 'rising' | 'falling' | 'stable',
  });

  const activeCropObj = crops.find((c) => c.id === selectedCrop) || crops[0];

  const filteredHistory = rateHistory
    .filter((h) => h.cropId === selectedCrop)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    const avg = Math.round((Number(newEntry.minRate) + Number(newEntry.maxRate)) / 2);
    const entry: MandiRateHistory = {
      id: 'rate-' + Date.now(),
      cropId: selectedCrop,
      date: newEntry.date,
      mandiName: newEntry.mandiName,
      minRate: Number(newEntry.minRate),
      maxRate: Number(newEntry.maxRate),
      avgRate: avg,
      trend: newEntry.trend,
    };
    onAddRateHistory(entry);
    setShowAddRate(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              منڈی بھاؤ و ریٹ اتار چڑھاؤ (Price Fluctuations)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              Mandi Trends
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            روزانہ کی بنیاد پر غلہ منڈیوں کے تازہ ترین بھاؤ ریکارڈ کریں اور منافع بخش وقت پر مال نکالیں۔
          </p>
        </div>

        <button
          onClick={() => setShowAddRate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>نیا بھاؤ درج کریں (Log Mandi Rate)</span>
        </button>
      </div>

      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCrop(c.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCrop === c.id
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {c.urduName} ({c.name.split(' ')[0]})
          </button>
        ))}
      </div>

      {/* Target & Fluctuation Analysis Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Mandi Rate */}
        <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80">
          <span className="text-xs text-slate-400 block">موجودہ منڈی ریٹ</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {formatPKR(activeCropObj.currentMarketRatePerMund)} <span className="text-xs text-slate-400">/من (40kg)</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            سٹینڈرڈ بوری ({activeCropObj.defaultBoriWeightKg} کلو) پر ریٹ:{' '}
            <strong className="text-slate-200">
              {formatPKR(
                (activeCropObj.currentMarketRatePerMund /
                  (activeCropObj.defaultMundWeightKg || 40)) *
                  activeCropObj.defaultBoriWeightKg
              )}
            </strong>
          </p>
        </div>

        {/* Card 2: Target Sell Rate */}
        <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80">
          <span className="text-xs text-slate-400 block">سٹاکیہ ٹارگٹ ریٹ (ہولڈ ہدف)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {formatPKR(activeCropObj.targetSellRatePerMund)} <span className="text-xs text-slate-400">/من</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            ہدف تک باقی فاصلہ:{' '}
            <strong className="text-amber-300">
              {formatPKR(activeCropObj.targetSellRatePerMund - activeCropObj.currentMarketRatePerMund)}
            </strong>
          </p>
        </div>

        {/* Card 3: Storage Breakeven Formula */}
        <div className="bg-slate-800/90 rounded-xl p-5 border border-slate-700/80">
          <span className="text-xs text-slate-400 block">گودام ہولڈنگ خرچ (ماہانہ)</span>
          <div className="text-2xl font-black text-purple-400 mt-1">
            {formatPKR(activeCropObj.storageCostPerBagMonth)} <span className="text-xs text-slate-400">/بوری ماہانہ</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            3 ماہ ہولڈنگ خرچ: ~₨ {activeCropObj.storageCostPerBagMonth * 3} فی بوری
          </p>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md">
        <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
          <span>منڈی ریٹ ہسٹری ({activeCropObj.urduName})</span>
          <span className="text-xs font-normal text-slate-400">تازہ ترین ریٹس سب سے اوپر</span>
        </h3>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            اس فصل کا کوئی تاریخی ریٹ ریکارڈ نہیں ملا۔ نیا ریٹ درج کریں۔
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">تاریخ</th>
                  <th className="py-2.5 px-3">منڈی نام</th>
                  <th className="py-2.5 px-3">کم از کم بھاؤ</th>
                  <th className="py-2.5 px-3">زیادہ سے زیادہ</th>
                  <th className="py-2.5 px-3">اوسط ریٹ /من</th>
                  <th className="py-2.5 px-3">رجحان (Trend)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-300">{item.date}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.mandiName}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{formatPKR(item.minRate)}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{formatPKR(item.maxRate)}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-400 text-sm">
                      {formatPKR(item.avgRate)}
                    </td>
                    <td className="py-3 px-3">
                      {item.trend === 'rising' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                          <TrendingUp className="w-3.5 h-3.5" />
                          تیز / اوپر (Rising)
                        </span>
                      ) : item.trend === 'falling' ? (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10">
                          <TrendingDown className="w-3.5 h-3.5" />
                          مندا / نیچے (Falling)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-semibold px-2 py-0.5 rounded bg-slate-700/50">
                          <Minus className="w-3.5 h-3.5" />
                          مستحکم (Stable)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Rate Modal */}
      {showAddRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">
              نیا منڈی بھاؤ درج کریں ({activeCropObj.urduName})
            </h3>
            <form onSubmit={handleSaveRate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">تاریخ (Date)</label>
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">منڈی کا نام (Mandi Name)</label>
                <input
                  type="text"
                  value={newEntry.mandiName}
                  onChange={(e) => setNewEntry({ ...newEntry, mandiName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">کم از کم ریٹ (PKR / من)</label>
                  <input
                    type="number"
                    value={newEntry.minRate}
                    onChange={(e) => setNewEntry({ ...newEntry, minRate: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">زیادہ سے زیادہ ریٹ (PKR / من)</label>
                  <input
                    type="number"
                    value={newEntry.maxRate}
                    onChange={(e) => setNewEntry({ ...newEntry, maxRate: Number(e.target.value) })}
                    required
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">مارکیٹ رجحان (Trend)</label>
                <select
                  value={newEntry.trend}
                  onChange={(e) => setNewEntry({ ...newEntry, trend: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="rising">تیز / اوپر (Rising)</option>
                  <option value="stable">مستحکم (Stable)</option>
                  <option value="falling">مندا / نیچے (Falling)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRate(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
