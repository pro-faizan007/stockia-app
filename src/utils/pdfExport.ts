import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CropConfig, SaleRecord, StockBatch } from '../types';
import { formatPKR, formatMunds, DEFAULT_MUND_KG } from './mandiCalculations';

interface GeneratePdfReportParams {
  crops: CropConfig[];
  batches: StockBatch[];
  sales: SaleRecord[];
  selectedCropId?: string;
}

export function generateFinancialAndInventoryPdf({
  crops,
  batches,
  sales,
  selectedCropId = 'all',
}: GeneratePdfReportParams) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const reportDate = new Date().toISOString().split('T')[0];
  const filterCropName =
    selectedCropId === 'all'
      ? 'All Crops (Combine Report)'
      : crops.find((c) => c.id === selectedCropId)?.name || selectedCropId;

  // Filter records
  const filteredBatches =
    selectedCropId === 'all'
      ? batches
      : batches.filter((b) => b.cropId === selectedCropId);

  const filteredSales =
    selectedCropId === 'all'
      ? sales
      : sales.filter((s) => s.cropId === selectedCropId);

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

      const investedForRemaining = (batch.totalInvestedPkr / (batch.initialBags || 1)) * activeBags;
      totalInvestedPkr += investedForRemaining;

      const marketRate = crop?.currentMarketRatePerMund || batch.purchaseRatePerMund;
      totalMarketValuePkr += physicalMunds * marketRate;

      const dhaltaShareKg = (batch.dhaltaExtraDeductedKg / (batch.initialBags || 1)) * activeBags;
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

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('MandiStockia - Pakistan Grain Market', 14, 13);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Financial Summary & Inventory Report (All Figures in PKR)', 14, 20);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Generated Date: ${reportDate}  |  Crop Filter: ${filterCropName}`, 14, 26);

  // Section 1: Executive KPI Summary Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Financial & Stock KPI Summary', 14, 40);

  const kpiData = [
    [
      'Total Sales Revenue (PKR):',
      formatPKR(totalSalesPkr),
      'Total Stored Inventory:',
      `${totalStoredBags} Bags (${formatMunds(totalStoredMunds)} Munds)`,
    ],
    [
      'Realized Net Profit (PKR):',
      `+${formatPKR(totalRealizedProfitPkr)}`,
      'Total Metric Tonnes:',
      `${(totalStoredKg / 1000).toFixed(2)} Tonnes (${totalStoredKg.toLocaleString()} kg)`,
    ],
    [
      'Total Deductions Applied:',
      `${formatPKR(totalDeductionsPkr)} (${totalDeductionsKg.toFixed(0)} kg)`,
      'Total Landed Capital Invested:',
      formatPKR(totalInvestedPkr),
    ],
    [
      'Liquidated Sales Volume:',
      `${totalSoldBags} Bags sold`,
      'Current Stock Market Value:',
      formatPKR(totalMarketValuePkr),
    ],
    [
      'Unrealized Stock Holding Gain:',
      unrealizedProfitPkr >= 0
        ? `+${formatPKR(unrealizedProfitPkr)}`
        : formatPKR(unrealizedProfitPkr),
      'Mandi Standard:',
      '1 Mund = 40 kg (Configurable)',
    ],
  ];

  autoTable(doc, {
    startY: 44,
    head: [],
    body: kpiData,
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
      1: { fontStyle: 'bold', textColor: [16, 185, 129], cellWidth: 45 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 45 },
      3: { fontStyle: 'bold', cellWidth: 42 },
    },
  });

  // Section 2: Crop Inventory Breakdown Table
  const finalY1 = (doc as any).lastAutoTable?.finalY || 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Current Stock Inventory for All Crops', 14, finalY1 + 10);

  const displayCrops =
    selectedCropId === 'all'
      ? crops
      : crops.filter((c) => c.id === selectedCropId);

  const cropTableRows = displayCrops.map((crop) => {
    const cropBatches = batches.filter((b) => b.cropId === crop.id && b.remainingBags > 0);
    const cropHoldingBags = cropBatches.reduce((acc, b) => acc + b.remainingBags, 0);
    const cropHoldingKg = cropBatches.reduce((acc, b) => acc + b.remainingBags * b.bagWeightKg, 0);
    const mundWeight = crop.defaultMundWeightKg || DEFAULT_MUND_KG;
    const cropHoldingMunds = cropHoldingKg / mundWeight;

    const cropInvestedPkr = cropBatches.reduce((acc, b) => {
      return acc + (b.totalInvestedPkr / (b.initialBags || 1)) * b.remainingBags;
    }, 0);

    const cropMarketValPkr = cropHoldingMunds * crop.currentMarketRatePerMund;
    const cropProfitPkr = cropMarketValPkr - cropInvestedPkr;

    return [
      `${crop.name} (${crop.urduName})`,
      crop.season,
      `${cropHoldingBags} Bags (${crop.defaultBoriWeightKg}kg)`,
      `${formatMunds(cropHoldingMunds)} Munds`,
      formatPKR(cropInvestedPkr),
      formatPKR(crop.currentMarketRatePerMund),
      formatPKR(cropMarketValPkr),
      cropProfitPkr >= 0 ? `+${formatPKR(cropProfitPkr)}` : formatPKR(cropProfitPkr),
    ];
  });

  autoTable(doc, {
    startY: finalY1 + 14,
    head: [
      [
        'Crop & Urdu Name',
        'Season',
        'Bags In Stock',
        'Munds',
        'Invested (PKR)',
        'Rate/Mund',
        'Market Val (PKR)',
        'Unrealized Gain',
      ],
    ],
    body: cropTableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
      7: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Section 3: Active Warehouse Batches Details
  const finalY2 = (doc as any).lastAutoTable?.finalY || 140;

  // Check if we need a new page for active batches
  if (finalY2 > 210) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Active Warehouse Batches (Godam Inventory)', 14, 18);
    autoTable(doc, {
      startY: 22,
      head: [
        ['Lot #', 'Crop Variety', 'Seller / Shop #', 'Purchase Date', 'Warehouse Site', 'Bags Remaining', 'Buy Rate/Mund', 'Invested Landed Cost'],
      ],
      body: buildBatchRows(filteredBatches, crops),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Active Warehouse Batches (Godam Inventory)', 14, finalY2 + 10);
    autoTable(doc, {
      startY: finalY2 + 14,
      head: [
        ['Lot #', 'Crop Variety', 'Seller / Shop #', 'Purchase Date', 'Warehouse Site', 'Bags Remaining', 'Buy Rate/Mund', 'Invested Landed Cost'],
      ],
      body: buildBatchRows(filteredBatches, crops),
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2 },
    });
  }

  // Footer notes
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `MandiStockia Pakistan  |  Page ${i} of ${pageCount}  |  Official Record Slip`,
      14,
      290
    );
  }

  doc.save(`MandiStockia_Report_${reportDate}.pdf`);
}

function buildBatchRows(batches: StockBatch[], crops: CropConfig[]) {
  const activeBatches = batches.filter((b) => b.remainingBags > 0);
  if (activeBatches.length === 0) {
    return [['No active stored batches found in warehouse inventory.', '', '', '', '', '', '', '']];
  }

  return activeBatches.map((b) => {
    const crop = crops.find((c) => c.id === b.cropId);
    return [
      b.lotNumber,
      `${crop?.name || b.cropId} (${b.cropVariety})`,
      `${b.sellerName} (${b.sellerShopNo})`,
      b.purchaseDate,
      b.godamLocation,
      `${b.remainingBags} / ${b.initialBags} Bags`,
      formatPKR(b.purchaseRatePerMund),
      formatPKR(b.totalInvestedPkr),
    ];
  });
}
