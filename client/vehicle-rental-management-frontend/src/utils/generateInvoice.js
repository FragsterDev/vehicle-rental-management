import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format currency in Indian Rupees
const formatINR = (amount) => {
  return 'Rs. ' + Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const generateInvoicePDF = (booking, vehicleOverride = null, userOverride = null) => {
  if (!booking) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const vehicle = booking.vehicle || vehicleOverride || {};

  // Extract Customer Data with robust fallbacks
  let user = null;
  if (booking.user && typeof booking.user === 'object' && (booking.user.email || booking.user.name)) {
    user = booking.user;
  } else if (userOverride && (userOverride.email || userOverride.name)) {
    user = userOverride;
  }

  // If still missing email or phone, check localStorage
  if (!user || !user.email || !user.phone) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        user = {
          name: user?.name || parsed.name || 'Valued Customer',
          email: user?.email || parsed.email || 'N/A',
          phone: user?.phone || parsed.phone || 'N/A',
          address: user?.address || parsed.address || '',
        };
      }
    } catch (e) {}
  }

  user = user || {
    name: 'Valued Customer',
    email: 'N/A',
    phone: 'N/A',
    address: '',
  };

  const deliveryLocation = booking.deliveryAddress || user.address || 'Self Pickup / Counter';

  const invoiceNumber = `INV-${(booking.orderId || booking.paymentId || booking._id || '00000000').toString().slice(-8).toUpperCase()}`;
  const issueDate = new Date(booking.bookingDate || booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const returnDateStr = new Date(booking.returnDate || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const daysCount = Number(booking.days) || 1;
  const totalAmount = Number(booking.totalPrice) || 0;
  const baseAmount = Math.round((totalAmount / 1.18) * 100) / 100;
  const gstAmount = Math.round((totalAmount - baseAmount) * 100) / 100;
  const cgst = Math.round((gstAmount / 2) * 100) / 100;
  const sgst = Math.round((gstAmount / 2) * 100) / 100;
  const dailyRate = Math.round((baseAmount / daysCount) * 100) / 100;

  // --- BRAND & INVOICE HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text('DriveEase', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // #64748b
  doc.text('DriveEase Fleet Services Pvt. Ltd. | GSTIN: 29AABCU9603R1ZM', 14, 25);
  doc.text('Indiranagar, Bengaluru, Karnataka 560038 | support@driveease.in', 14, 29);

  // Right Header: Invoice Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('TAX INVOICE', 196, 20, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Invoice No: ${invoiceNumber}`, 196, 25, { align: 'right' });
  doc.text(`Date: ${issueDate}`, 196, 29, { align: 'right' });

  // Subtle Header Divider
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.3);
  doc.line(14, 34, 196, 34);

  // --- 2-COLUMN MINIMAL METADATA GRID ---
  // Left Column: Customer Details (Explicitly showing Name, Email, Phone, Delivery Address)
  const metaY = 42;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('BILLED TO (CUSTOMER)', 14, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(user.name || 'Valued Customer', 14, metaY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Email ID: ${user.email || 'N/A'}`, 14, metaY + 11);
  doc.text(`Phone: ${user.phone || 'N/A'}`, 14, metaY + 15.5);
  const truncatedAddress = deliveryLocation.length > 45 ? deliveryLocation.substring(0, 42) + '...' : deliveryLocation;
  doc.text(`Delivery: ${truncatedAddress}`, 14, metaY + 20);

  // Right Column: Transaction & Vehicle Identifiers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('RENTAL & PAYMENT DETAILS', 110, metaY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`${vehicle.make || ''} ${vehicle.name || 'Vehicle'} (${vehicle.regNumber || 'N/A'})`, 110, metaY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Period: ${issueDate} to ${returnDateStr} (${daysCount} day(s))`, 110, metaY + 11);
  doc.text(`Payment ID: ${booking.paymentId || 'N/A'}`, 110, metaY + 15.5);
  doc.text(`Order ID: ${booking.orderId || 'N/A'} | Status: PAID (${booking.paymentMethod || 'UPI'})`, 110, metaY + 20);

  // Divider before items table
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, metaY + 26, 196, metaY + 26);

  // Calculate overdue charges if applicable
  const overdueCharge = Number(booking.overdueFee || 0);
  const grandTotal = totalAmount + overdueCharge;

  const tableBody = [
    [
      `Vehicle Rental Service: ${vehicle.make || ''} ${vehicle.name || 'Vehicle'}\nRegistration No: ${vehicle.regNumber || 'N/A'} | Category: ${vehicle.type || 'Car'}`,
      formatINR(dailyRate),
      `${daysCount}`,
      formatINR(baseAmount),
    ],
    ['Central GST (CGST @ 9%)', '-', '-', formatINR(cgst)],
    ['State GST (SGST @ 9%)', '-', '-', formatINR(sgst)],
  ];

  if (overdueCharge > 0) {
    tableBody.push([
      'Overdue Charges (Returned past 24-hour grace period)',
      '-',
      '-',
      formatINR(overdueCharge),
    ]);
  }

  // --- MINIMALIST ITEMIZATION TABLE ---
  autoTable(doc, {
    startY: metaY + 30,
    head: [['Description', 'Rate / Day', 'Days', 'Amount']],
    body: tableBody,
    foot: [
      ['Total Paid in Full', '', '', formatINR(grandTotal)],
    ],
    theme: 'plain',
    headStyles: {
      textColor: [15, 23, 42],
      fontSize: 8.5,
      fontStyle: 'bold',
      cellPadding: { top: 3, bottom: 4, left: 0, right: 0 },
      lineWidth: { bottom: 0.3 },
      lineColor: [15, 23, 42],
    },
    bodyStyles: {
      textColor: [51, 65, 85],
      fontSize: 8.5,
      cellPadding: { top: 4, bottom: 4, left: 0, right: 0 },
      lineWidth: { bottom: 0.1 },
      lineColor: [241, 245, 249],
    },
    footStyles: {
      textColor: [15, 23, 42],
      fontSize: 10,
      fontStyle: 'bold',
      cellPadding: { top: 5, bottom: 5, left: 0, right: 0 },
      lineWidth: { top: 0.3 },
      lineColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 12;

  // --- FOOTER & VERIFICATION ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('PAYMENT RECEIPT CONFIRMATION', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Received payment of ${formatINR(totalAmount)} via ${booking.paymentMethod || 'UPI'}. Transaction Reference: ${booking.paymentId || 'N/A'}.`,
    14,
    finalY + 5
  );

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, finalY + 10, 196, finalY + 10);

  // Footer notes & Computer generated text
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('This is a computer-generated tax invoice and requires no physical signature.', 14, finalY + 16);
  doc.text('DriveEase Fleet & Rental Management Services Pvt. Ltd. | Bengaluru, India', 196, finalY + 16, { align: 'right' });

  // Download PDF
  const filename = `Invoice_${invoiceNumber}.pdf`;
  doc.save(filename);
};
