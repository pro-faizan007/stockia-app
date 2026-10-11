import React, { useState } from 'react';
import { X, ShoppingBag, ArrowUpRight, Scale } from 'lucide-react';
import { CropConfig, SaleRecord, StockBatch } from '../types';
import { formatPKR, MUND_KG } from '../utils/mandiCalculations';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSale: (sale: SaleRecord, updatedBatch: StockBatch) => void;
  batch: StockBatch | null;
  crop?: CropConfig;
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSaveSale,
  batch,
  crop,
}) => {
  if (!isOpen || !batch) return null;

  const [buyerName, setBuyerName] = useState('');
  const [buyerShopNo, setBuyerShopNo] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [bagsSold, setBagsSold] = useState<number>(Math.min(100, batch.remainingBags));
  const [saleRatePerMund, setSaleRatePerMund] = useState<number>(
    crop?.currentMarketRatePerMund || batch.purchaseRatePerMund + 200
  );
  const [dhaltaExtraGivenKg, setDhaltaExtraGivenKg] = useState<number>(0.5); // 0.5kg given to buyer
  const [notes, setNotes] = useState('');

  // Calculations
  const validBags = Math.min(Math.max(1, Number(bagsSold) || 0), batch.remainingBags);
  const grossWeightKg = validBags * batch.bagWeightKg;
  const totalExtraGivenKg = validBags * (batch.bagWeightKg / 50) * dhaltaExtraGivenKg;
  const netBilledWeightKg = Math.max(0, grossWeightKg - totalExtraGivenKg);
  const netBilledMunds = netBilledWeightKg / MUND_KG;
  const totalSalePkr = netBilledMunds * (Number(saleRatePerMund) || 0);

  // Cost allocated to these bags from landed cost
  const costPerBag = batch.totalInvestedPkr / (batch.initialBags || 1);
  const costAllocatedPkr = costPerBag * validBags;
  const netProfitPkr = totalSalePkr - costAllocatedPkr;
  const profitMarginPercent = costAllocatedPkr > 0 ? (netProfitPkr / costAllocatedPkr) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || validBags <= 0) return;

    const saleRecord: SaleRecord = {
      id: 'sale-' + Date.now(),
      batchId: batch.id,
      cropId: batch.cropId,
      saleDate,
      buyerName,
      buyerShopNo,
      bagsSold: validBags,
      bagWeightKg: batch.bagWeightKg,
      grossWeightKg,
      dhaltaExtraGivenKg: totalExtraGivenKg,
      netBilledMunds,
      saleRatePerMund: Number(saleRatePerMund),
      totalSalePkr,
      costAllocatedPkr,
      netProfitPkr,
      notes,
      createdAt: Date.now(),
    };

    const updatedBatch: StockBatch = {
      ...batch,
      remainingBags: batch.remainingBags - validBags,
    };

    onSaveSale(saleRecord, updatedBatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>مال فروخت کریں (Record Grain Sale)</span>
            </h2>
            <p className="text-xs text-slate-400">
              لاٹ: <strong className="text-amber-400 font-mono">{batch.lotNumber}</strong> • باقی بوری: <strong className="text-white">{batch.remainingBags}</strong>
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
          {/* Buyer & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                خریدار / مل کا نام (Buyer / Flour Mill Name) *
              </label>
              <input
                type="text"
                placeholder="مثال: مدینہ فلور ملز، لاہور"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                فروخت تاریخ (Sale Date)
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          {/* Bags sold and Sale rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">فروخت شدہ بوری</label>
                <button
                  type="button"
                  onClick={() => setBagsSold(batch.remainingBags)}
                  className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                >
                  ساری ({batch.remainingBags})
                </button>
              </div>
              <input
                type="number"
                min="1"
                max={batch.remainingBags}
                value={bagsSold}
                onChange={(e) => setBagsSold(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                فروخت ریٹ (PKR / من)
              </label>
              <input
                type="number"
                min="0"
                value={saleRatePerMund}
                onChange={(e) => setSaleRatePerMund(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                خریدار کو ڈھلتا (Kg/50kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={dhaltaExtraGivenKg}
                onChange={(e) => setDhaltaExtraGivenKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-purple-300 font-mono"
              />
            </div>
          </div>

          {/* Real-time Profit Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>کل بل والا وزن:</span>
              <span className="font-mono text-white font-bold">
                {netBilledMunds.toFixed(2)} من ({validBags} بوری)
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>کل حاصل ہونے والی رقم (Sale Revenue):</span>
              <span className="font-mono text-white font-bold">
                {formatPKR(totalSalePkr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>اصل لاگت رقم (Cost of Goods):</span>
              <span className="font-mono">
                {formatPKR(costAllocatedPkr)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="font-extrabold text-sm text-white">صاف نفع (Net Profit):</span>
              <span className={`text-base font-black font-mono ${netProfitPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfitPkr >= 0 ? `+${formatPKR(netProfitPkr)}` : formatPKR(netProfitPkr)}{' '}
                <span className="text-xs font-normal">({profitMarginPercent.toFixed(1)}%)</span>
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-300 font-semibold block mb-1">نوٹس (Notes)</label>
            <input
              type="text"
              placeholder="پیمنٹ کی شرائط، چیک یا نقد وغیرہ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          {/* Buttons */}
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
              فروخت کا اندراج مکمل کریں
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
