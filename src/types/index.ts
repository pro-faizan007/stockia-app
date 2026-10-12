export type CropId = 'wheat' | 'rice' | 'maize' | 'mustard' | string;

export interface CropConfig {
  id: CropId;
  name: string; // e.g. "Wheat"
  urduName: string; // "گندم"
  season: string; // "Rabi 2026" or "Kharif 2026"
  defaultBoriWeightKg: number; // e.g. 40 kg for wheat, 50 kg for rice
  defaultMundWeightKg: number; // e.g. 40 kg (standard mund) or custom local mandi weight
  deductionBaseKg: number; // basis weight for extra deduction (e.g. 50 kg for wheat, 100 kg for rice)
  deductionKg: number; // extra deduction kg taken (e.g. 1.0 kg per 50kg, 2.0 kg per 100kg)
  dhaltaNote: string; // descriptive explanation
  currentMarketRatePerMund: number; // PKR per mund
  targetSellRatePerMund: number; // Stockia target rate in PKR
  storageCostPerBagMonth: number; // PKR per bag per month
  accentColor: string; // tailwind color class
  badgeBg: string;
  iconName: string;
}

export type StockQuality = 'super' | 'grade_a' | 'average' | 'high_moisture' | 'dusty';

export type VisitStatus = 'visited' | 'bargaining' | 'purchased' | 'skipped';

export type PriceUnit = 'bori' | 'kg' | 'mund';

export type AppTheme = 'dark' | 'light' | 'high-contrast';

export interface ShopVisitNote {
  id: string;
  date: string; // YYYY-MM-DD
  shopNo: string; // e.g. "Shop # 34-A"
  agentName: string; // e.g. "Arthi Ch. Tauseef & Sons"
  phone?: string;
  mandiName: string; // e.g. "Okara New Galla Mandi"
  cropId: CropId;
  cropVariety: string; // e.g. "Akbar 2019 Clean", "Super Kainat 1121", "White Maize"
  stockQuality: StockQuality;
  qualityDescription?: string; // detailed qualitative assessment
  moisturePercent?: number; // e.g. 11.2%
  // Unit Pricing
  purchasePriceUnit: PriceUnit; // entered as 'bori', 'kg', or 'mund'
  purchasePricePerUnit: number; // price in the selected unit
  ratePerMund: number; // normalized PKR per mund
  ratePerBori: number; // normalized PKR per bori
  ratePerKg: number; // normalized PKR per kg
  sellingPriceInMarketPerMund: number; // prevailing selling price in local market (mund)
  // Volume & Deductions
  quantityBags: number; // Number of bori
  boriWeightKg: number; // Weight of 1 bori in kg
  mundWeightKg: number; // Weight of 1 mund in kg
  deductionBaseKg: number; // e.g. 50 or 100
  deductionKg: number; // e.g. 1.0 or 2.0
  quantityMunds: number; // calculated munds
  totalDeductionKg: number; // calculated extra deduction weight
  totalValuePkr: number; // total estimated transaction value
  status: VisitStatus;
  notes: string;
  isSample?: boolean;
  createdAt: number;
}

export interface StockBatch {
  id: string;
  lotNumber: string; // "LOT-WHT-101"
  cropId: CropId;
  cropVariety: string;
  purchaseDate: string;
  sellerShopNo: string;
  sellerName: string;
  mandiName: string;
  godamLocation: string; // "Godam # 2, Gate 4"
  initialBags: number;
  remainingBags: number;
  bagWeightKg: number;
  // Calculations
  grossWeightKg: number;
  dhaltaExtraDeductedKg: number; // Extra physical grain gained or deducted from bill
  netBilledMunds: number; // Weight paid for (in Munds)
  physicalMunds: number; // Actual physical grain in godam (in Munds)
  purchaseRatePerMund: number; // PKR
  totalBilledPurchasePkr: number; // Net paid to seller
  bardanaCostPkr: number; // Bags cost
  laborCostPkr: number; // Palladari / Tulai / Mazdoori
  totalInvestedPkr: number; // Total landed cost
  effectiveCostPerMund: number; // Landed cost / physical munds
  notes: string;
  isSample?: boolean;
  createdAt: number;
}

export interface SaleRecord {
  id: string;
  batchId: string;
  cropId: CropId;
  saleDate: string;
  buyerName: string; // e.g. "Ittefaq Flour Mills"
  buyerShopNo?: string;
  bagsSold: number;
  bagWeightKg: number;
  grossWeightKg: number;
  dhaltaExtraGivenKg: number; // Extra weight given to buyer
  netBilledMunds: number;
  saleRatePerMund: number; // PKR per 40kg
  totalSalePkr: number;
  costAllocatedPkr: number;
  netProfitPkr: number;
  notes: string;
  createdAt: number;
}

export interface MandiRateHistory {
  id: string;
  cropId: CropId;
  date: string;
  mandiName: string;
  minRate: number;
  maxRate: number;
  avgRate: number;
  trend: 'rising' | 'falling' | 'stable';
  recordedBy?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'superadmin';
  businessName?: string;
  mandiName?: string;
  city?: string;
  phone?: string;
  createdAt: string;
  lastLoginAt: string;
  batchCount?: number;
  visitCount?: number;
  saleCount?: number;
}

export type RentFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export interface GodownRentRecord {
  id: string;
  godamName: string; // e.g. "گودام نمبر 2 (مرکزی غلہ منڈی)"
  location?: string;
  rentPkr: number; // Rent per period
  frequency: RentFrequency; // 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  startDate?: string;
  nextDueDate?: string;
  status: 'paid' | 'due' | 'advance';
  capacityBags?: number; // total capacity in bags
  landlordName?: string;
  landlordPhone?: string;
  notes?: string;
  createdAt: number;
}

