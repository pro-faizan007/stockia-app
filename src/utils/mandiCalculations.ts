/**
 * Pakistani Mandi Standards & Calculations Utility
 * 1 Mund (مَن) = 40 Kilograms (Standard, configurable per crop)
 */

export const DEFAULT_MUND_KG = 40;
export const MUND_KG = 40; // Alias for backward compatibility

export interface MandiCalculationInput {
  bags: number;
  bagWeightKg?: number; // e.g. 40, 50, 100
  mundWeightKg?: number; // e.g. 40 or 50
  deductionBaseKg?: number; // e.g. 50 or 100
  deductionKg?: number; // e.g. 1.0 or 2.0
  ratePerMund: number; // PKR per mund
  dhaltaPer50Kg?: number; // backward-compatibility fallback
  bardanaPerBagPkr?: number; // bag packing cost
  laborPerBagPkr?: number; // palladari / loading / unloading per bag
}

export interface MandiCalculationResult {
  bags: number;
  bagWeightKg: number;
  mundWeightKg: number;
  deductionBaseKg: number;
  deductionKg: number;
  grossWeightKg: number;
  grossMunds: number;
  // Dhalta / Katoti
  dhaltaExtraKgPerBag: number;
  totalDhaltaExtraKg: number;
  totalDhaltaExtraMunds: number;
  // Billed vs Physical
  netBilledWeightKg: number;
  netBilledMunds: number;
  physicalWeightKg: number;
  physicalMunds: number;
  // Financials
  ratePerMund: number;
  ratePerKg: number;
  ratePerBori: number;
  rawGrainAmountPkr: number; // netBilledMunds * ratePerMund
  bardanaTotalPkr: number;
  laborTotalPkr: number;
  totalPayablePkr: number;
  effectiveCostPerPhysicalMund: number;
  dhaltaBenefitPkr: number; // Value of extra grain acquired for free
}

export function calculateMandiLot(input: MandiCalculationInput): MandiCalculationResult {
  const {
    bags = 0,
    bagWeightKg = 50,
    mundWeightKg = DEFAULT_MUND_KG,
    deductionBaseKg = 50,
    deductionKg = input.dhaltaPer50Kg ?? 1.0,
    ratePerMund = 0,
    bardanaPerBagPkr = 0,
    laborPerBagPkr = 0,
  } = input;

  const validBags = Math.max(0, Number(bags) || 0);
  const validBagWeight = Math.max(1, Number(bagWeightKg) || 50);
  const validMundWeight = Math.max(1, Number(mundWeightKg) || DEFAULT_MUND_KG);
  const validDeductionBase = Math.max(1, Number(deductionBaseKg) || 50);
  const validDeductionKg = Math.max(0, Number(deductionKg) || 0);
  const validRatePerMund = Math.max(0, Number(ratePerMund) || 0);

  const grossWeightKg = validBags * validBagWeight;
  const grossMunds = grossWeightKg / validMundWeight;

  // Deduction calculation: (grossWeightKg / deductionBaseKg) * deductionKg
  const totalDhaltaExtraKg = (grossWeightKg / validDeductionBase) * validDeductionKg;
  const dhaltaExtraKgPerBag = validBags > 0 ? totalDhaltaExtraKg / validBags : 0;
  const totalDhaltaExtraMunds = totalDhaltaExtraKg / validMundWeight;

  // In Pakistani mandis, the buyer deducts Dhalta from billable weight:
  const netBilledWeightKg = Math.max(0, grossWeightKg - totalDhaltaExtraKg);
  const netBilledMunds = netBilledWeightKg / validMundWeight;

  // Physical bags brought to the godam have full gross weight:
  const physicalWeightKg = grossWeightKg;
  const physicalMunds = grossMunds;

  const ratePerKg = validRatePerMund / validMundWeight;
  const ratePerBori = ratePerKg * validBagWeight;
  const rawGrainAmountPkr = netBilledMunds * validRatePerMund;

  const bardanaTotalPkr = validBags * (Number(bardanaPerBagPkr) || 0);
  const laborTotalPkr = validBags * (Number(laborPerBagPkr) || 0);
  const totalPayablePkr = rawGrainAmountPkr + bardanaTotalPkr + laborTotalPkr;

  const effectiveCostPerPhysicalMund =
    physicalMunds > 0 ? totalPayablePkr / physicalMunds : validRatePerMund;

  // Benefit of dhalta: grain received but not paid for
  const dhaltaBenefitPkr = totalDhaltaExtraMunds * validRatePerMund;

  return {
    bags: validBags,
    bagWeightKg: validBagWeight,
    mundWeightKg: validMundWeight,
    deductionBaseKg: validDeductionBase,
    deductionKg: validDeductionKg,
    grossWeightKg,
    grossMunds,
    dhaltaExtraKgPerBag,
    totalDhaltaExtraKg,
    totalDhaltaExtraMunds,
    netBilledWeightKg,
    netBilledMunds,
    physicalWeightKg,
    physicalMunds,
    ratePerMund: validRatePerMund,
    ratePerKg,
    ratePerBori,
    rawGrainAmountPkr,
    bardanaTotalPkr,
    laborTotalPkr,
    totalPayablePkr,
    effectiveCostPerPhysicalMund,
    dhaltaBenefitPkr,
  };
}

/**
 * Normalizes price entered in any unit (bori, kg, mund) to all three units
 */
export function normalizePrices(
  price: number,
  unit: 'bori' | 'kg' | 'mund',
  boriWeightKg = 50,
  mundWeightKg = 40
): { ratePerBori: number; ratePerKg: number; ratePerMund: number } {
  const p = Number(price) || 0;
  const bKg = Math.max(1, Number(boriWeightKg) || 50);
  const mKg = Math.max(1, Number(mundWeightKg) || 40);

  let ratePerKg = 0;
  if (unit === 'kg') {
    ratePerKg = p;
  } else if (unit === 'bori') {
    ratePerKg = p / bKg;
  } else {
    // mund
    ratePerKg = p / mKg;
  }

  return {
    ratePerKg,
    ratePerBori: ratePerKg * bKg,
    ratePerMund: ratePerKg * mKg,
  };
}

/**
 * Format PKR currency with comma separators
 */
export function formatPKR(val: number, includeSign = true): string {
  if (isNaN(val) || val === null || val === undefined) return includeSign ? '₨ 0' : '0';
  const rounded = Math.round(val);
  const formatted = new Intl.NumberFormat('en-PK').format(rounded);
  return includeSign ? `₨ ${formatted}` : formatted;
}

/**
 * Format Munds (e.g., "150.5 مَن")
 */
export function formatMunds(val: number, decimals = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0.00';
  return Number(val).toFixed(decimals);
}

/**
 * Convert Kg to Munds
 */
export function kgToMunds(kg: number, mundWeightKg = DEFAULT_MUND_KG): number {
  return (kg || 0) / (mundWeightKg || DEFAULT_MUND_KG);
}

/**
 * Convert Munds to Kg
 */
export function mundsToKg(munds: number, mundWeightKg = DEFAULT_MUND_KG): number {
  return (munds || 0) * (mundWeightKg || DEFAULT_MUND_KG);
}

export const QUALITY_LABELS: Record<string, { en: string; ur: string; color: string; badge: string }> = {
  super: {
    en: 'Super Premium (A-One)',
    ur: 'سپر کوالٹی / اے ون',
    color: 'emerald',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  grade_a: {
    en: 'Grade A (Saaf / Clean)',
    ur: 'گریڈ اے / صاف ستھرا',
    color: 'blue',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  average: {
    en: 'Average Mandi Mix',
    ur: 'درمیانہ مال / مکس',
    color: 'amber',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  high_moisture: {
    en: 'High Moisture (Geela / Nami)',
    ur: 'زیادہ نمی / گیلا مال',
    color: 'rose',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  dusty: {
    en: 'Dusty / Kachra (Dirt)',
    ur: 'کچرا و گرد والا',
    color: 'zinc',
    badge: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  },
};

export const STATUS_LABELS: Record<string, { en: string; ur: string; badge: string }> = {
  visited: {
    en: 'Rate Recorded',
    ur: 'ریٹ نوٹ کیا',
    badge: 'bg-slate-700 text-slate-300 border-slate-600',
  },
  bargaining: {
    en: 'Bargaining / Sauda in Talk',
    ur: 'بات چیت جاری',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  purchased: {
    en: 'Purchased (Sauda Pakka)',
    ur: 'خرید لیا (سودا پکا)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  skipped: {
    en: 'Skipped / Rate High',
    ur: 'چھوڑ دیا / ریٹ تیز',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
};
