// Uses the same jsPDF/jspdf-autotable template as the Invoice Listing download.
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;

const PDF_MARGIN = 40;
const BRAND_COLOR = [37, 99, 235];
const BORDER = [226, 232, 240];
const money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const roundMoney = (value) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
const formatMoney = (value) => money.format(roundMoney(value));
const safePdfText = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};
const createLogoFallback = (companyName) => companyName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';

const resolveImageDataUrl = async (src) => {
  if (!src || typeof src !== 'string') return undefined;
  if (src.startsWith('data:')) return src;
  if (!/^https?:\/\//i.test(src)) return undefined;
  try {
    const response = await fetch(src);
    if (!response.ok) return undefined;
    const contentType = response.headers.get('content-type') || 'image/png';
    const image = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:${contentType};base64,${image}`;
  } catch {
    return undefined;
  }
};

async function generateDocumentPdfBuffer(payload, { title, numberLabel, noteKey, invoiceMeta = false }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = PDF_MARGIN;
  const contentWidth = pageWidth - margin * 2;
  const dark = [0, 0, 0];
  const companyName = payload.companyName?.trim() || 'Company';
  const companyInitials = createLogoFallback(companyName);
  const logoDataUrl = await resolveImageDataUrl(payload.companyLogoUrl);
  let y = margin;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...dark);
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', margin, y, 60, 60, undefined, 'FAST');
  } else {
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(1); doc.circle(margin + 30, y + 30, 28, 'S');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text(companyInitials, margin + 30, y + 36, { align: 'center' });
  }

  const textStartX = margin + 78;
  doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text(companyName, textStartX, y + 20);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  [
    `Email: ${safePdfText(payload.companyEmail)}  |  Phone: ${safePdfText(payload.companyPhone)}`,
    `Address: ${safePdfText(payload.companyAddress)}  |  Reg No: ${safePdfText(payload.companyRegNo)}`,
  ].forEach((line, index) => doc.text(line, textStartX, y + 38 + index * 13));

  const metaX = pageWidth - margin - 180;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(24); doc.setCharSpace(1.4); doc.text(title, metaX + 180, y + 18, { align: 'right' });
  doc.setCharSpace(0); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
  doc.text(`${numberLabel} # ${safePdfText(payload.documentNumber)}`, metaX + 180, y + 38, { align: 'right' });
  doc.text(`Date: ${safePdfText(payload.creationDate)}`, metaX + 180, y + 54, { align: 'right' });
  if (invoiceMeta) {
    doc.text(`Due Date: ${safePdfText(payload.dueDate)}`, metaX + 180, y + 70, { align: 'right' });
    doc.text(`Payment: ${safePdfText(payload.paymentStatus)}`, metaX + 180, y + 86, { align: 'right' });
  }
  const metaHeight = invoiceMeta ? 104 : 72;
  doc.setDrawColor(0, 0, 0); doc.setLineWidth(1); doc.line(margin, y + metaHeight, pageWidth - margin, y + metaHeight); y += invoiceMeta ? 124 : 92;

  const leftColX = margin; const rightColX = margin + contentWidth / 2 + 10; const colWidth = contentWidth / 2 - 10;
  const drawSection = (x, title, lines) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setCharSpace(1.2); doc.text(title.toUpperCase(), x, y); doc.setCharSpace(0);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    lines.forEach((line, index) => doc.text(doc.splitTextToSize(safePdfText(line), colWidth), x, y + 18 + index * 15));
  };
  drawSection(leftColX, 'Customer Detail', [`Name: ${safePdfText(payload.customerName)}`, `Email: ${safePdfText(payload.customerEmail)}`, `Phone: ${safePdfText(payload.customerPhone)}`, `Address: ${safePdfText(payload.customerAddress)}`]);
  drawSection(rightColX, 'Vehicle Detail', [`Make: ${safePdfText(payload.vehicleMake)}`, `Model: ${safePdfText(payload.vehicleModel)}`, `Year: ${safePdfText(payload.vehicleYear)}`, `VIN: ${safePdfText(payload.vin)}`, `License Plate: ${safePdfText(payload.licensePlate)}`]);
  y += 18 + 5 * 15 + 10; doc.setLineWidth(0.8); doc.line(margin, y, pageWidth - margin, y); y += 18;

  if (payload.towingDetails) {
    const towingLines = [
      `Pick Up Address: ${safePdfText(payload.towingDetails.pickUpAddress)}`,
      `Drop Off Address: ${safePdfText(payload.towingDetails.dropOffAddress)}`,
    ];
    drawSection(leftColX, 'Towing Detail', towingLines);
    y += 18 + towingLines.length * 15 + 10; doc.setLineWidth(0.8); doc.line(margin, y, pageWidth - margin, y); y += 18;
  }

  const isEnabled = payload.includeLineItems !== false;
  const pdfItems = payload.lineItems.length ? payload.lineItems : [{ type: 'service', description: '—', qty: 0, unitPrice: 0 }];
  const columnStyles = payload.towingDetails
    ? { 0: { cellWidth: 70 }, 1: { cellWidth: 219 }, 2: { halign: 'right', cellWidth: 55 }, 3: { halign: 'right', cellWidth: 95 }, 4: { halign: 'right', cellWidth: 75 } }
    : { 0: { cellWidth: 72 }, 1: { cellWidth: 250 }, 2: { halign: 'right', cellWidth: 42 }, 3: { halign: 'right', cellWidth: 82 }, 4: { halign: 'right', cellWidth: 82 } };
  autoTable(doc, {
    startY: y, head: [['Type', 'Description', payload.quantityLabel ?? 'Qty', payload.unitPriceLabel ?? 'Unit Price', 'Amount']],
    body: pdfItems.map((item) => [item.type === 'service' ? 'Service' : 'Parts', safePdfText(item.description, '—'), isEnabled ? String(Number(item.qty || 0)) : '0', formatMoney(isEnabled ? item.unitPrice : 0), formatMoney(isEnabled ? Number(item.qty || 0) * Number(item.unitPrice || 0) : 0)]),
    margin: { left: margin, right: margin }, theme: 'grid',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 7, textColor: dark, lineColor: BORDER, lineWidth: 0.5, valign: 'middle' },
    headStyles: { fillColor: BRAND_COLOR, textColor: 255, fontStyle: 'bold', halign: 'center' }, alternateRowStyles: { fillColor: [250, 251, 253] },
    columnStyles,
  });
  y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 18 : y + 18;
  if (y + 172 > pageHeight - margin) { doc.addPage(); y = margin; }
  const summaryWidth = 270; const summaryX = pageWidth - margin - summaryWidth;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setCharSpace(1.1); doc.setTextColor(0, 0, 0); doc.text('SUMMARY', summaryX, y); doc.setCharSpace(0); doc.setLineWidth(1); doc.line(summaryX, y + 6, summaryX + summaryWidth, y + 6);
  let rowY = y + 24; doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  [['Subtotal', formatMoney(isEnabled ? payload.subtotal : 0)], [`Tax (${isEnabled ? payload.taxPercentage : 0}%)`, formatMoney(isEnabled ? payload.taxAmount : 0)], [`Discount (${isEnabled ? payload.discountPercentage : 0}%)`, formatMoney(isEnabled ? payload.discountAmount : 0)]].forEach(([label, value]) => { doc.text(label, summaryX, rowY); doc.text(value, summaryX + summaryWidth, rowY, { align: 'right' }); rowY += 20; });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setDrawColor(0, 0, 0); doc.line(summaryX, rowY - 2, summaryX + summaryWidth, rowY - 2); doc.text('Total', summaryX, rowY + 16); doc.text(`$${formatMoney(isEnabled ? payload.total : 0)}`, summaryX + summaryWidth, rowY + 16, { align: 'right' });
  y = rowY + 30;
  if (!payload.towingDetails && payload[noteKey]?.trim()) { if (y + 52 > pageHeight - margin) { doc.addPage(); y = margin; } doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setCharSpace(1.1); doc.text('NOTE', margin, y); doc.setCharSpace(0); doc.setFont('helvetica', 'normal'); doc.setFontSize(10); const noteLines = doc.splitTextToSize(safePdfText(payload[noteKey]), contentWidth); doc.text(noteLines, margin, y + 14); }
  return Buffer.from(doc.output('arraybuffer'));
}

const generateInvoicePdfBuffer = (payload) => generateDocumentPdfBuffer(
  { ...payload, documentNumber: payload.invoiceNumber },
  { title: payload.documentTitle ?? 'INVOICE', numberLabel: 'Invoice', noteKey: 'notes', invoiceMeta: true },
);

const generateQuotationPdfBuffer = (payload) => generateDocumentPdfBuffer(
  { ...payload, documentNumber: payload.quotationNumber },
  { title: 'QUOTATION', numberLabel: 'Quotation', noteKey: 'note' },
);

module.exports = { generateInvoicePdfBuffer, generateQuotationPdfBuffer };
