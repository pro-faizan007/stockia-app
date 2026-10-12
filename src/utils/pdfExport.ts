import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
  CropConfig,
  SaleRecord,
  StockBatch,
  ShopVisitNote,
  GodownRentRecord,
  UserProfile,
} from '../types';
import { formatPKR, formatMunds, DEFAULT_MUND_KG } from './mandiCalculations';

export interface GeneratePdfReportParams {
  crops: CropConfig[];
  batches: StockBatch[];
  sales: SaleRecord[];
  visits?: ShopVisitNote[];
  rents?: GodownRentRecord[];
  selectedCropId?: string;
  userProfile?: UserProfile | null;
}

export async function generateFinancialAndInventoryPdf({
  crops,
  batches,
  sales,
  visits = [],
  rents = [],
  selectedCropId = 'all',
  userProfile,
}: GeneratePdfReportParams): Promise<void> {
  const reportDate = new Date().toISOString().split('T')[0];
  const reportTime = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const reportId = `MS-${reportDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Filter records by selected crop
  const filteredBatches =
    selectedCropId === 'all'
      ? batches
      : batches.filter((b) => b.cropId === selectedCropId);

  const filteredSales =
    selectedCropId === 'all'
      ? sales
      : sales.filter((s) => s.cropId === selectedCropId);

  const filteredVisits =
    selectedCropId === 'all'
      ? visits
      : visits.filter((v) => v.cropId === selectedCropId);

  const displayCrops =
    selectedCropId === 'all'
      ? crops
      : crops.filter((c) => c.id === selectedCropId);

  // Financial aggregates
  const totalSalesPkr = filteredSales.reduce((sum, s) => sum + s.totalSalePkr, 0);
  const totalRealizedProfitPkr = filteredSales.reduce((sum, s) => sum + s.netProfitPkr, 0);
  const totalSoldBags = filteredSales.reduce((sum, s) => sum + s.bagsSold, 0);

  let totalStoredBags = 0;
  let totalStoredKg = 0;
  let totalStoredMunds = 0;
  let totalInvestedPkr = 0;
  let totalMarketValuePkr = 0;
  let totalDeductionsKg = 0;
  let totalDeductionsPkr = 0;

  filteredBatches.forEach((batch) => {
    const crop = crops.find((c) => c.id === batch.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    const activeBags = batch.remainingBags;

    if (activeBags > 0) {
      totalStoredBags += activeBags;
      const physicalKg = activeBags * batch.bagWeightKg;
      totalStoredKg += physicalKg;
      const physicalMunds = physicalKg / mundWeight;
      totalStoredMunds += physicalMunds;

      const investedForRemaining =
        (batch.totalInvestedPkr / (batch.initialBags || 1)) * activeBags;
      totalInvestedPkr += investedForRemaining;

      const marketRate =
        crop?.currentMarketRatePerMund || batch.purchaseRatePerMund;
      totalMarketValuePkr += physicalMunds * marketRate;

      const dhaltaShareKg =
        (batch.dhaltaExtraDeductedKg / (batch.initialBags || 1)) * activeBags;
      totalDeductionsKg += dhaltaShareKg;
      totalDeductionsPkr += (dhaltaShareKg / mundWeight) * marketRate;
    }
  });

  filteredSales.forEach((sale) => {
    const crop = crops.find((c) => c.id === sale.cropId);
    const mundWeight = crop?.defaultMundWeightKg || DEFAULT_MUND_KG;
    totalDeductionsKg += sale.dhaltaExtraGivenKg || 0;
    totalDeductionsPkr +=
      ((sale.dhaltaExtraGivenKg || 0) / mundWeight) * (sale.saleRatePerMund || 0);
  });

  const unrealizedProfitPkr = totalMarketValuePkr - totalInvestedPkr;
  const unrealizedProfitPercent =
    totalInvestedPkr > 0 ? (unrealizedProfitPkr / totalInvestedPkr) * 100 : 0;

  // Rent aggregates
  const totalMonthlyRentPkr = rents.reduce((sum, r) => {
    let m = r.rentPkr;
    if (r.frequency === 'quarterly') m = r.rentPkr / 3;
    else if (r.frequency === 'half_yearly') m = r.rentPkr / 6;
    else if (r.frequency === 'yearly') m = r.rentPkr / 12;
    return sum + m;
  }, 0);
  const costPerBagPerMonth =
    totalStoredBags > 0 ? totalMonthlyRentPkr / totalStoredBags : 0;

  // Active batches list
  const activeBatches = filteredBatches.filter((b) => b.remainingBags > 0);

  // Common typography and reset styles for canvas DOM nodes
  const pageSharedStyle = `
    width: 794px;
    height: 1123px;
    max-height: 1123px;
    box-sizing: border-box;
    padding: 28px 32px;
    background: #ffffff;
    color: #0f172a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  `;

  // Hidden container placed in DOM flow with non-negative coordinates for 100% canvas fidelity
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '794px';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  container.style.background = '#ffffff';

  // ---------------------------------------------------------------------------
  // PAGE 1: Brand Header, Executive Financial KPIs & Crops Stock Ledger
  // ---------------------------------------------------------------------------
  const page1 = document.createElement('div');
  page1.style.cssText = pageSharedStyle;
  page1.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Header Banner -->
      <div style="border-bottom: 3px solid #f59e0b; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; background: #0f172a; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid #f59e0b;">
            🌾
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
                Mandi<span style="color: #d97706;">Stockia</span>
              </h1>
              <span style="font-size: 10px; padding: 2px 8px; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; border-radius: 9999px; font-weight: 800;">
                غلہ منڈی پورٹل
              </span>
            </div>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #475569; font-weight: 700;">
              پاکستان غلہ منڈی جامع انوینٹری، آڑھتی کھاتہ و ڈھلتا کٹوتی رپورٹ
            </p>
          </div>
        </div>

        <div style="text-align: right; font-size: 11px; line-height: 1.35;">
          <div style="font-weight: 900; font-size: 14px; color: #0f172a;">${userProfile?.displayName || 'چوہدری غلہ کمیشن ایجنٹ'}</div>
          <div style="color: #475569; font-weight: 600;">${userProfile?.businessName || 'المصطفیٰ ٹریڈرز اینڈ کمیشن شاپ'}</div>
          <div style="color: #b45309; font-weight: 800;">${userProfile?.mandiName || 'نیو غلہ منڈی، فیصل آباد / اوکاڑہ'}</div>
          ${userProfile?.phone ? `<div style="color: #64748b; font-family: monospace; font-size: 10px;">فون: ${userProfile.phone}</div>` : ''}
        </div>
      </div>

      <!-- Metadata Strip -->
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; background: #f8fafc; padding: 7px 12px; border-radius: 8px; border: 1px solid #e2e8f0; margin-top: 10px; font-family: monospace;">
        <div><span style="color: #64748b;">ریفرنس نمبر:</span> <strong style="color: #0f172a;">${reportId}</strong></div>
        <div><span style="color: #64748b;">تاریخ و وقت:</span> <strong>${reportDate} • ${reportTime}</strong></div>
        <div><span style="color: #64748b;">منتخب جنس:</span> <strong style="color: #b45309;">${selectedCropId === 'all' ? 'تمام اجناس (All Crops)' : selectedCropId}</strong></div>
        <div><span style="color: #64748b;">سٹیٹس:</span> <strong style="color: #059669;">آفیشل تصدیق شدہ</strong></div>
      </div>

      <!-- Section 1: Executive KPI Summary -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            1. ایگزیکٹو فنانشل و سٹاک سمری (Executive Financial & Stock KPIs)
          </h3>
          <span style="font-size: 9px; font-weight: bold; color: #64748b; font-family: monospace;">Amounts in PKR (₨)</span>
        </div>

        <!-- 4 Highlights Cards -->
        <div style="display: flex; gap: 8px;">
          <div style="flex: 1; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #065f46; font-weight: bold;">کُل نقد فروخت (Total Sales)</div>
            <div style="font-size: 15px; font-weight: 900; color: #047857; font-family: monospace; margin-top: 2px;">${formatPKR(totalSalesPkr)}</div>
            <div style="font-size: 9px; color: #065f46; margin-top: 2px;">${totalSoldBags} بوری فروخت ریکارڈ</div>
          </div>

          <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #1e40af; font-weight: bold;">خالص حاصل شدہ نفع (Net Profit)</div>
            <div style="font-size: 15px; font-weight: 900; color: #1d4ed8; font-family: monospace; margin-top: 2px;">+${formatPKR(totalRealizedProfitPkr)}</div>
            <div style="font-size: 9px; color: #1e40af; margin-top: 2px;">نقد منافع وصولی</div>
          </div>

          <div style="flex: 1; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #92400e; font-weight: bold;">گودام سٹاک (Stored Stock)</div>
            <div style="font-size: 15px; font-weight: 900; color: #78350f; font-family: monospace; margin-top: 2px;">${totalStoredBags} بوری</div>
            <div style="font-size: 9px; color: #92400e; margin-top: 2px;">${formatMunds(totalStoredMunds)} من (${(totalStoredKg / 1000).toFixed(1)} ٹن)</div>
          </div>

          <div style="flex: 1; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 9px; color: #6b21a8; font-weight: bold;">ڈھلتا کٹوتی بچت (Dhalta Benefit)</div>
            <div style="font-size: 15px; font-weight: 900; color: #7e22ce; font-family: monospace; margin-top: 2px;">${formatPKR(totalDeductionsPkr)}</div>
            <div style="font-size: 9px; color: #6b21a8; margin-top: 2px;">+${totalDeductionsKg.toFixed(0)} کلو اضافی اناج</div>
          </div>
        </div>

        <!-- 3 Capital Cards -->
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; font-weight: bold;">لگایا گیا سرمایہ (Landed Capital)</div>
            <div style="font-size: 13px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 2px;">${formatPKR(totalInvestedPkr)}</div>
            <div style="font-size: 8px; color: #64748b;">شامل باردانہ، مزدوری، کرایہ منڈی</div>
          </div>

          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; font-weight: bold;">موجودہ منڈی ویلیو (Market Valuation)</div>
            <div style="font-size: 13px; font-weight: 900; color: #0f172a; font-family: monospace; margin-top: 2px;">${formatPKR(totalMarketValuePkr)}</div>
            <div style="font-size: 8px; color: #64748b;">تازہ ترین ریٹ فی من کے مطابق</div>
          </div>

          <div style="flex: 1; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px; text-align: center;">
            <div style="font-size: 9px; color: #64748b; font-weight: bold;">تخمینہ ہولڈنگ منافع (Unrealized Gain)</div>
            <div style="font-size: 13px; font-weight: 900; color: ${unrealizedProfitPkr >= 0 ? '#047857' : '#b91c1c'}; font-family: monospace; margin-top: 2px;">
              ${unrealizedProfitPkr >= 0 ? `+${formatPKR(unrealizedProfitPkr)}` : formatPKR(unrealizedProfitPkr)}
            </div>
            <div style="font-size: 8px; color: #64748b;">(${unrealizedProfitPercent.toFixed(1)}% متوقع منافع تناسب)</div>
          </div>
        </div>
      </div>

      <!-- Section 2: Commodity & Crop Stock Summary Ledger Table -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            2. فصل و اجناس سٹاک لیجر (Crop Inventory & Valuation Summary)
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #64748b;">1 Mund = 40 kg Standard</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold;">
              <th style="padding: 6px 8px; text-align: left; border: 1px solid #1e293b;">جنس و فصل (Crop)</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #1e293b;">سیزن</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #1e293b;">بوری وزن</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #1e293b;">بوریاں</th>
              <th style="padding: 6px 8px; text-align: center; border: 1px solid #1e293b;">کُل من</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #1e293b;">لاگت لاٹ (PKR)</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #1e293b;">منڈی ریٹ/من</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #1e293b;">مارکیٹ ویلیو</th>
              <th style="padding: 6px 8px; text-align: right; border: 1px solid #1e293b;">متوقع منافع</th>
            </tr>
          </thead>
          <tbody>
            ${displayCrops
              .map((crop, idx) => {
                const cropBatches = batches.filter(
                  (b) => b.cropId === crop.id && b.remainingBags > 0
                );
                const cropBags = cropBatches.reduce(
                  (acc, b) => acc + b.remainingBags,
                  0
                );
                const cropKg = cropBatches.reduce(
                  (acc, b) => acc + b.remainingBags * b.bagWeightKg,
                  0
                );
                const mundWeight = crop.defaultMundWeightKg || DEFAULT_MUND_KG;
                const cropMunds = cropKg / mundWeight;

                const cropInvested = cropBatches.reduce((acc, b) => {
                  return (
                    acc +
                    (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags
                  );
                }, 0);

                const cropMarketVal =
                  cropMunds * crop.currentMarketRatePerMund;
                const cropProfit = cropMarketVal - cropInvested;

                return `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 6px 8px; text-align: left; font-weight: bold; border: 1px solid #cbd5e1; color: #0f172a;">
                    ${crop.urduName} <span style="font-weight: normal; color: #475569;">(${crop.name})</span>
                  </td>
                  <td style="padding: 6px 8px; text-align: center; border: 1px solid #cbd5e1; font-family: monospace; font-size: 9px; color: #475569;">
                    ${crop.season}
                  </td>
                  <td style="padding: 6px 8px; text-align: center; border: 1px solid #cbd5e1; font-weight: 600;">
                    ${crop.defaultBoriWeightKg} کلو
                  </td>
                  <td style="padding: 6px 8px; text-align: center; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace;">
                    ${cropBags}
                  </td>
                  <td style="padding: 6px 8px; text-align: center; border: 1px solid #cbd5e1; font-weight: bold; font-family: monospace;">
                    ${formatMunds(cropMunds)}
                  </td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace;">
                    ${formatPKR(cropInvested)}
                  </td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #b45309;">
                    ${formatPKR(crop.currentMarketRatePerMund)}
                  </td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: #0f172a;">
                    ${formatPKR(cropMarketVal)}
                  </td>
                  <td style="padding: 6px 8px; text-align: right; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold; color: ${
                    cropProfit >= 0 ? '#047857' : '#b91c1c'
                  };">
                    ${cropProfit >= 0 ? `+${formatPKR(cropProfit)}` : formatPKR(cropProfit)}
                  </td>
                </tr>
              `;
              })
              .join('')}

            <!-- Summary Total Row -->
            <tr style="background: #e2e8f0; font-weight: 900; font-size: 10px; color: #0f172a;">
              <td colspan="3" style="padding: 6px 8px; text-align: left; border: 1px solid #cbd5e1;">
                میزان کُل (Grand Total Summary)
              </td>
              <td style="padding: 6px 8px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">
                ${totalStoredBags}
              </td>
              <td style="padding: 6px 8px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">
                ${formatMunds(totalStoredMunds)}
              </td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace; border: 1px solid #cbd5e1;">
                ${formatPKR(totalInvestedPkr)}
              </td>
              <td style="padding: 6px 8px; text-align: right; border: 1px solid #cbd5e1; font-size: 8px; color: #475569;">
                اوسط ریٹ
              </td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace; border: 1px solid #cbd5e1;">
                ${formatPKR(totalMarketValuePkr)}
              </td>
              <td style="padding: 6px 8px; text-align: right; font-family: monospace; color: ${
                unrealizedProfitPkr >= 0 ? '#047857' : '#b91c1c'
              }; border: 1px solid #cbd5e1;">
                ${unrealizedProfitPkr >= 0 ? `+${formatPKR(unrealizedProfitPkr)}` : formatPKR(unrealizedProfitPkr)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Page 1 Footer -->
    <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-family: monospace;">
      <span>صفحہ 1 از 3 • MandiStockia Official Statement • Ref: ${reportId}</span>
      <span>کمپیوٹرائزڈ منڈی سسٹم • آٹو تصدیق شدہ مالیاتی کھاتہ</span>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // PAGE 2: Warehouse Batches Inventory & Sales Dispatches Ledger
  // ---------------------------------------------------------------------------
  const page2 = document.createElement('div');
  page2.style.cssText = pageSharedStyle;
  page2.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Page 2 Mini Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 900; font-size: 16px; color: #0f172a;">MandiStockia</span>
          <span style="font-size: 11px; font-weight: normal; color: #64748b;">| صفحہ 2 • گودام انوینٹری لاٹس و فروخت کھاتہ</span>
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #64748b;">
          Ref: ${reportId} • ${reportDate}
        </div>
      </div>

      <!-- Section 3: Active Warehouse Batches -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            3. گودام انوینٹری لاٹس تفصیل (Active Warehouse Stock Batches)
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #64748b;">${activeBatches.length} فعال گودام لاٹس</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold;">
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">لاٹ نمبر</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">جنس و ورائٹی</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">آڑھتی / دکان دار</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">خرید تاریخ</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">گودام مقام</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">باقی/کل</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">خرید ریٹ/من</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">کل لاگت (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${
              activeBatches.length === 0
                ? `<tr><td colspan="8" style="padding: 12px; text-align: center; color: #64748b; font-style: italic;">کوئی فعال گودام لاٹ موجود نہیں ہے۔</td></tr>`
                : activeBatches
                    .slice(0, 10)
                    .map((b, idx) => {
                      const crop = crops.find((c) => c.id === b.cropId);
                      return `
                      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="padding: 5px 6px; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${b.lotNumber}</td>
                        <td style="padding: 5px 6px; font-weight: bold; border: 1px solid #cbd5e1;">${crop?.urduName || b.cropId} <span style="font-weight: normal; color: #64748b;">(${b.cropVariety})</span></td>
                        <td style="padding: 5px 6px; border: 1px solid #cbd5e1;">${b.sellerName} <span style="color: #64748b; font-size: 8px;">(${b.sellerShopNo})</span></td>
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${b.purchaseDate}</td>
                        <td style="padding: 5px 6px; text-align: center; border: 1px solid #cbd5e1;">${b.godamLocation}</td>
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${b.remainingBags}/${b.initialBags}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; color: #b45309; border: 1px solid #cbd5e1;">${formatPKR(b.purchaseRatePerMund)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${formatPKR(b.totalInvestedPkr)}</td>
                      </tr>
                    `;
                    })
                    .join('')
            }
            <tr style="background: #e2e8f0; font-weight: bold; font-size: 9.5px;">
              <td colspan="5" style="padding: 5px 6px; text-align: left; border: 1px solid #cbd5e1;">میزان کُل فعال گودام لاٹس</td>
              <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${totalStoredBags} بوری</td>
              <td style="padding: 5px 6px; text-align: right; border: 1px solid #cbd5e1;">—</td>
              <td style="padding: 5px 6px; text-align: right; font-family: monospace; border: 1px solid #cbd5e1;">${formatPKR(totalInvestedPkr)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 4: Sales Ledger -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            4. فروخت ریکارڈ و ملز سپلائی کھاتہ (Sales & Dispatches Ledger)
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #64748b;">${filteredSales.length} فروخت ریکارڈز</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold;">
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">فروخت تاریخ</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">خریدار / مل نام</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">فصل</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">فروخت بوریاں</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">فروخت ریٹ/من</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">کل بل رقم</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">خالص منافع</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredSales.length === 0
                ? `<tr><td colspan="7" style="padding: 12px; text-align: center; color: #64748b; font-style: italic;">کوئی فروخت ریکارڈ موجود نہیں ہے۔</td></tr>`
                : filteredSales
                    .slice(0, 9)
                    .map((s, idx) => {
                      const crop = crops.find((c) => c.id === s.cropId);
                      return `
                      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${s.saleDate}</td>
                        <td style="padding: 5px 6px; font-weight: bold; border: 1px solid #cbd5e1;">${s.buyerName}</td>
                        <td style="padding: 5px 6px; border: 1px solid #cbd5e1;">${crop?.urduName || s.cropId}</td>
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${s.bagsSold} بوری</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${formatPKR(s.saleRatePerMund)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${formatPKR(s.totalSalePkr)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: 900; color: #047857; border: 1px solid #cbd5e1;">+${formatPKR(s.netProfitPkr)}</td>
                      </tr>
                    `;
                    })
                    .join('')
            }
            <tr style="background: #e2e8f0; font-weight: bold; font-size: 9.5px;">
              <td colspan="3" style="padding: 5px 6px; text-align: left; border: 1px solid #cbd5e1;">میزان کُل فروخت ریکارڈز</td>
              <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${totalSoldBags} بوری</td>
              <td style="padding: 5px 6px; text-align: right; border: 1px solid #cbd5e1;">—</td>
              <td style="padding: 5px 6px; text-align: right; font-family: monospace; border: 1px solid #cbd5e1;">${formatPKR(totalSalesPkr)}</td>
              <td style="padding: 5px 6px; text-align: right; font-family: monospace; color: #047857; border: 1px solid #cbd5e1;">+${formatPKR(totalRealizedProfitPkr)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Page 2 Footer -->
    <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-family: monospace;">
      <span>صفحہ 2 از 3 • MandiStockia Official Statement • Ref: ${reportId}</span>
      <span>لاٹس و سیلز تصدیق شدہ کھاتہ • تمام تفصیلات درست ہیں</span>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // PAGE 3: Godown Rents, Shop Visits Diary & Official Signatures & Stamp
  // ---------------------------------------------------------------------------
  const page3 = document.createElement('div');
  page3.style.cssText = pageSharedStyle;
  page3.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column;">
      <!-- Page 3 Mini Header -->
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-weight: 900; font-size: 16px; color: #0f172a;">MandiStockia</span>
          <span style="font-size: 11px; font-weight: normal; color: #64748b;">| صفحہ 3 • گودام کرایہ جات، دکان وزٹ ڈائری و تصدیقی مہر</span>
        </div>
        <div style="font-size: 10px; font-family: monospace; color: #64748b;">
          Ref: ${reportId} • ${reportDate}
        </div>
      </div>

      <!-- Section 5: Godown Rent Multi-Cycle Ledger -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            5. گودام کرایہ و سٹوریج اخراجات (Godown Rent & Kiraya Multi-Cycle Ledger)
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #64748b;">
            ماہانہ اوسط لاگت: ₨ ${costPerBagPerMonth.toFixed(1)} فی بوری
          </span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold;">
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">گودام نام</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">مقام / منڈی</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">گنجائش</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">کرایہ مدت / بنیاد</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">رقم کرایہ</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">ماہانہ مساوی</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">حیثیت</th>
            </tr>
          </thead>
          <tbody>
            ${
              rents.length === 0
                ? `<tr><td colspan="7" style="padding: 12px; text-align: center; color: #64748b; font-style: italic;">کوئی گودام کرایہ ریکارڈ درج نہیں ہے۔</td></tr>`
                : rents
                    .slice(0, 6)
                    .map((r, idx) => {
                      let monthlyEq = r.rentPkr;
                      if (r.frequency === 'quarterly') monthlyEq = r.rentPkr / 3;
                      else if (r.frequency === 'half_yearly') monthlyEq = r.rentPkr / 6;
                      else if (r.frequency === 'yearly') monthlyEq = r.rentPkr / 12;

                      const freqLabel =
                        r.frequency === 'monthly'
                          ? 'ماہانہ (1 ماہ)'
                          : r.frequency === 'quarterly'
                          ? 'سہ ماہی (3 ماہ)'
                          : r.frequency === 'half_yearly'
                          ? 'چھ ماہی (6 ماہ)'
                          : 'سالانہ (12 ماہ)';

                      return `
                      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="padding: 5px 6px; font-weight: bold; border: 1px solid #cbd5e1;">${r.godamName}</td>
                        <td style="padding: 5px 6px; border: 1px solid #cbd5e1;">${r.location || 'مرکزی منڈی'}</td>
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${r.capacityBags ? `${r.capacityBags} بوری` : '—'}</td>
                        <td style="padding: 5px 6px; text-align: center; font-weight: bold; color: #92400e; border: 1px solid #cbd5e1;">${freqLabel}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${formatPKR(r.rentPkr)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; color: #1d4ed8; border: 1px solid #cbd5e1;">${formatPKR(Math.round(monthlyEq))}</td>
                        <td style="padding: 5px 6px; text-align: center; border: 1px solid #cbd5e1;">
                          <span style="background: #ecfdf5; color: #065f46; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 8.5px;">${r.status === 'paid' ? 'ادا شدہ' : 'واجب الادا'}</span>
                        </td>
                      </tr>
                    `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>

      <!-- Section 6: Shop Visit Diary -->
      <div style="margin-top: 14px;">
        <div style="border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 12px; font-weight: 900; color: #0f172a;">
            6. دکان وزٹ ڈائری و منڈی بھاؤ سروے (Shop Visits & Rate Intelligence)
          </h3>
          <span style="font-size: 9px; font-family: monospace; color: #64748b;">${filteredVisits.length} وزٹ نوٹس</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold;">
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">تاریخ</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">دکان # و آڑھتی نام</th>
              <th style="padding: 5px 6px; text-align: left; border: 1px solid #1e293b;">فصل</th>
              <th style="padding: 5px 6px; text-align: center; border: 1px solid #1e293b;">کوالٹی جائزہ</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">خرید پیشکش</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">منڈی ریٹ/من</th>
              <th style="padding: 5px 6px; text-align: right; border: 1px solid #1e293b;">متوقع منافع فرق</th>
            </tr>
          </thead>
          <tbody>
            ${
              filteredVisits.length === 0
                ? `<tr><td colspan="7" style="padding: 12px; text-align: center; color: #64748b; font-style: italic;">کوئی دکان وزٹ نوٹ موجود نہیں ہے۔</td></tr>`
                : filteredVisits
                    .slice(0, 5)
                    .map((v, idx) => {
                      const crop = crops.find((c) => c.id === v.cropId);
                      const margin = (v.sellingPriceInMarketPerMund || 0) - (v.ratePerMund || 0);
                      return `
                      <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                        <td style="padding: 5px 6px; text-align: center; font-family: monospace; border: 1px solid #cbd5e1;">${v.date}</td>
                        <td style="padding: 5px 6px; font-weight: bold; border: 1px solid #cbd5e1;">${v.shopNo} • ${v.agentName}</td>
                        <td style="padding: 5px 6px; border: 1px solid #cbd5e1;">${crop?.urduName || v.cropId}</td>
                        <td style="padding: 5px 6px; text-align: center; font-weight: bold; color: #92400e; border: 1px solid #cbd5e1;">${v.stockQuality}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; border: 1px solid #cbd5e1;">${formatPKR(v.ratePerMund)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: bold; color: #1d4ed8; border: 1px solid #cbd5e1;">${formatPKR(v.sellingPriceInMarketPerMund || 0)}</td>
                        <td style="padding: 5px 6px; text-align: right; font-family: monospace; font-weight: 900; color: #047857; border: 1px solid #cbd5e1;">+${formatPKR(margin)}</td>
                      </tr>
                    `;
                    })
                    .join('')
            }
          </tbody>
        </table>
      </div>

      <!-- Section 7: Official Signatures, Verification & Stamp -->
      <div style="margin-top: 18px; border: 2px solid #0f172a; border-radius: 10px; padding: 12px; background: #f8fafc; display: flex; justify-content: space-between; gap: 12px; font-size: 11px;">
        <!-- Column 1: Prepared By -->
        <div style="flex: 1; text-align: center; border-right: 1px solid #cbd5e1; padding-right: 10px;">
          <div style="font-weight: 900; color: #334155; font-size: 11px;">تیار کنندہ (Prepared By)</div>
          <div style="font-family: monospace; color: #64748b; font-style: italic; margin: 16px 0 6px 0; font-size: 11px;">کمپیوٹرائزڈ منڈی سسٹم</div>
          <div style="font-size: 9px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 4px;">ڈیجیٹل آٹو جنریٹڈ پرچی</div>
        </div>

        <!-- Column 2: Authorized Sign -->
        <div style="flex: 1; text-align: center; border-right: 1px solid #cbd5e1; padding-right: 10px;">
          <div style="font-weight: 900; color: #334155; font-size: 11px;">دستخط تاجر / آڑھتی (Authorized Sign)</div>
          <div style="font-family: serif; font-weight: bold; font-style: italic; font-size: 15px; color: #0f172a; margin: 14px 0 6px 0;">
            ${userProfile?.displayName || 'تصدیق شدہ'}
          </div>
          <div style="font-size: 9px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 4px;">تصدیق شدہ برائے کھاتہ و گودام</div>
        </div>

        <!-- Column 3: Stamp -->
        <div style="flex: 1; text-align: center;">
          <div style="font-weight: 900; color: #334155; font-size: 11px;">سرکاری مہر (Mandi Association Stamp)</div>
          <div style="width: 74px; height: 50px; border: 2px dashed #d97706; border-radius: 50%; margin: 4px auto; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #92400e; font-weight: 900; line-height: 1.1;">
            غلہ منڈی<br/>تصدیقی مہر
          </div>
          <div style="font-size: 9px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 4px;">آفیشل ریکارڈ برائے قانونی و آڈٹ</div>
        </div>
      </div>
    </div>

    <!-- Page 3 Footer -->
    <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-family: monospace;">
      <span>صفحہ 3 از 3 • MandiStockia Official Statement • Ref: ${reportId}</span>
      <span>تمام حقوق بحق غلہ منڈی پورٹل محفوظ ہیں • 2026</span>
    </div>
  `;

  container.appendChild(page1);
  container.appendChild(page2);
  container.appendChild(page3);
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const renderedPages = [page1, page2, page3];

    for (let i = 0; i < renderedPages.length; i++) {
      const p = renderedPages[i];
      const canvas = await html2canvas(p, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        x: 0,
        y: 0,
        width: 794,
        height: 1123,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) pdf.addPage('a4', 'portrait');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(`MandiStockia_Comprehensive_Report_${reportDate}.pdf`);
  } catch (err) {
    console.error('Failed to generate high-resolution canvas PDF, generating complete vector PDF:', err);

    // Bulletproof complete vector PDF fallback with all tables and sections
    const fallbackDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Page 1 Header
    fallbackDoc.setFillColor(15, 23, 42);
    fallbackDoc.rect(0, 0, 210, 26, 'F');
    fallbackDoc.setFont('helvetica', 'bold');
    fallbackDoc.setFontSize(16);
    fallbackDoc.setTextColor(245, 158, 11);
    fallbackDoc.text('MandiStockia - Pakistan Grain Market Official Statement', 14, 12);
    fallbackDoc.setFontSize(9);
    fallbackDoc.setTextColor(203, 213, 225);
    fallbackDoc.text(
      `Date: ${reportDate} ${reportTime} | Ref: ${reportId} | Trader: ${userProfile?.displayName || 'Chaudhry Trader'} (${userProfile?.mandiName || 'Galla Mandi'})`,
      14,
      20
    );

    // Page 1: Executive KPI Table
    autoTable(fallbackDoc, {
      startY: 32,
      head: [['Executive Metric', 'Value', 'Stock & Capital Metric', 'Value']],
      body: [
        ['Total Cash Sales', formatPKR(totalSalesPkr), 'Stored Inventory', `${totalStoredBags} Bags (${formatMunds(totalStoredMunds)} Munds)`],
        ['Realized Profit', `+${formatPKR(totalRealizedProfitPkr)}`, 'Landed Investment Capital', formatPKR(totalInvestedPkr)],
        ['Dhalta Extra Saved', `${formatPKR(totalDeductionsPkr)} (${totalDeductionsKg.toFixed(0)} kg)`, 'Current Market Valuation', formatPKR(totalMarketValuePkr)],
        ['Holding Expected Margin', `${unrealizedProfitPkr >= 0 ? '+' : ''}${formatPKR(unrealizedProfitPkr)} (${unrealizedProfitPercent.toFixed(1)}%)`, 'Total Sold Bags', `${totalSoldBags} Bags`],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      theme: 'grid',
    });

    // Page 1: Crop Stock Summary Table
    autoTable(fallbackDoc, {
      startY: (fallbackDoc as any).lastAutoTable.finalY + 8,
      head: [['Crop Name', 'Season', 'Bag (kg)', 'Bags', 'Munds', 'Cost (PKR)', 'Mandi Rate', 'Market Value', 'Expected Gain']],
      body: [
        ...displayCrops.map((c) => {
          const cropBatches = batches.filter((b) => b.cropId === c.id && b.remainingBags > 0);
          const cBags = cropBatches.reduce((acc, b) => acc + b.remainingBags, 0);
          const cKg = cropBatches.reduce((acc, b) => acc + b.remainingBags * b.bagWeightKg, 0);
          const cMunds = cKg / (c.defaultMundWeightKg || DEFAULT_MUND_KG);
          const cInvested = cropBatches.reduce((acc, b) => acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags, 0);
          const cMarket = cMunds * c.currentMarketRatePerMund;
          const cProfit = cMarket - cInvested;
          return [
            `${c.name} (${c.urduName})`,
            c.season,
            `${c.defaultBoriWeightKg} kg`,
            cBags.toString(),
            formatMunds(cMunds),
            formatPKR(cInvested),
            formatPKR(c.currentMarketRatePerMund),
            formatPKR(cMarket),
            `${cProfit >= 0 ? '+' : ''}${formatPKR(cProfit)}`,
          ];
        }),
        [
          'Grand Total',
          '—',
          '—',
          totalStoredBags.toString(),
          formatMunds(totalStoredMunds),
          formatPKR(totalInvestedPkr),
          '—',
          formatPKR(totalMarketValuePkr),
          `${unrealizedProfitPkr >= 0 ? '+' : ''}${formatPKR(unrealizedProfitPkr)}`,
        ],
      ],
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      theme: 'striped',
    });

    // Page 2: Batches & Sales
    fallbackDoc.addPage('a4', 'portrait');
    fallbackDoc.setFillColor(15, 23, 42);
    fallbackDoc.rect(0, 0, 210, 16, 'F');
    fallbackDoc.setFontSize(11);
    fallbackDoc.setTextColor(245, 158, 11);
    fallbackDoc.text(`MandiStockia | Page 2 - Warehouse Lots & Sales Dispatches (${reportId})`, 14, 11);

    autoTable(fallbackDoc, {
      startY: 22,
      head: [['Lot #', 'Crop & Variety', 'Seller / Arthi', 'Date', 'Location', 'Bags', 'Rate/Mund', 'Invested (PKR)']],
      body: activeBatches.slice(0, 15).map((b) => [
        b.lotNumber,
        `${b.cropId} (${b.cropVariety})`,
        `${b.sellerName} (${b.sellerShopNo})`,
        b.purchaseDate,
        b.godamLocation,
        `${b.remainingBags}/${b.initialBags}`,
        formatPKR(b.purchaseRatePerMund),
        formatPKR(b.totalInvestedPkr),
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      theme: 'grid',
    });

    autoTable(fallbackDoc, {
      startY: (fallbackDoc as any).lastAutoTable.finalY + 8,
      head: [['Sale Date', 'Buyer / Flour Mill', 'Crop', 'Bags', 'Rate/Mund', 'Bill (PKR)', 'Net Profit']],
      body: filteredSales.slice(0, 12).map((s) => [
        s.saleDate,
        s.buyerName,
        s.cropId,
        s.bagsSold.toString(),
        formatPKR(s.saleRatePerMund),
        formatPKR(s.totalSalePkr),
        `+${formatPKR(s.netProfitPkr)}`,
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      theme: 'grid',
    });

    // Page 3: Godown Rents, Visits & Verification
    fallbackDoc.addPage('a4', 'portrait');
    fallbackDoc.setFillColor(15, 23, 42);
    fallbackDoc.rect(0, 0, 210, 16, 'F');
    fallbackDoc.setFontSize(11);
    fallbackDoc.setTextColor(245, 158, 11);
    fallbackDoc.text(`MandiStockia | Page 3 - Godown Rents, Shop Visits & Certification (${reportId})`, 14, 11);

    autoTable(fallbackDoc, {
      startY: 22,
      head: [['Godown Name', 'Location', 'Capacity', 'Cycle', 'Rent (PKR)', 'Monthly Eq.', 'Status']],
      body: rents.map((r) => [
        r.godamName,
        r.location || 'Mandi',
        r.capacityBags ? `${r.capacityBags} Bags` : '—',
        r.frequency,
        formatPKR(r.rentPkr),
        formatPKR(r.frequency === 'monthly' ? r.rentPkr : r.frequency === 'quarterly' ? r.rentPkr / 3 : r.frequency === 'half_yearly' ? r.rentPkr / 6 : r.rentPkr / 12),
        r.status === 'paid' ? 'Paid' : 'Due',
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      theme: 'grid',
    });

    autoTable(fallbackDoc, {
      startY: (fallbackDoc as any).lastAutoTable.finalY + 8,
      head: [['Date', 'Shop & Arthi', 'Crop', 'Quality', 'Offer Rate', 'Mandi Rate', 'Margin']],
      body: filteredVisits.slice(0, 8).map((v) => [
        v.date,
        `${v.shopNo} - ${v.agentName}`,
        v.cropId,
        v.stockQuality,
        formatPKR(v.ratePerMund),
        formatPKR(v.sellingPriceInMarketPerMund || 0),
        `+${formatPKR((v.sellingPriceInMarketPerMund || 0) - (v.ratePerMund || 0))}`,
      ]),
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      theme: 'grid',
    });

    // Verification Box
    autoTable(fallbackDoc, {
      startY: (fallbackDoc as any).lastAutoTable.finalY + 8,
      head: [['Prepared By', 'Authorized Merchant Signature', 'Official Mandi Seal']],
      body: [
        [
          'Computerized Mandi System\nDigitally Certified Khata',
          `${userProfile?.displayName || 'Authorized Stockist'}\nCertified for Grain & Godam`,
          'Official Mandi Association Stamp\nVerified Audit Record 2026',
        ],
      ],
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      theme: 'plain',
    });

    fallbackDoc.save(`MandiStockia_Report_${reportDate}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
