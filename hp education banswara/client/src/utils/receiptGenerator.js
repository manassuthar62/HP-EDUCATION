import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generateReceipt = (data) => {
  const doc = new jsPDF();
  const redColor = [190, 30, 45]; // Dark red like the photo
  
  // Outer Border
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 200, 140); // Receipt Frame
  
  // Header (Text-based for stability, logo can be added once stable)
  doc.setTextColor(redColor[0], redColor[1], redColor[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("HP EDUCATION", 105, 20, { align: 'center' });
  
  // Try to add logo using a pre-loaded image approach
  try {
     const img = new Image();
     img.src = '/hp logo.png';
     doc.addImage(img, 'PNG', 15, 8, 25, 25);
  } catch (e) {
     console.log("Logo load error:", e);
  }
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subhash Nagar, College Road, Banswara (Raj.)", 105, 26, { align: 'center' });
  doc.text("Mo. 9414401524, 9414401525", 105, 31, { align: 'center' });
  
  // Horizontal Line
  doc.setLineWidth(0.5);
  doc.line(10, 35, 200, 35);
  
  // Receipt Details
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  doc.text(`S.No. ${data.receiptId || 'N/A'}`, 15, 42);
  doc.text(`Date: ${new Date(data.paymentDate).toLocaleDateString()}`, 150, 42);
  
  doc.text(`Received From: ${data.studentName}`, 15, 50);
  doc.line(45, 51, 195, 51); // Underline for name
  
  doc.text(`Course: ${data.courseName}`, 15, 58);
  doc.line(30, 59, 90, 59);
  
  doc.text(`Batch: ${data.batchName || 'N/A'}`, 100, 58);
  doc.line(115, 59, 195, 59);
  
  doc.text(`Mobile: ${data.studentContact}`, 15, 66);
  doc.line(30, 67, 100, 67);
  
  // Detailed Payment Ledger
  const payments = Array.isArray(data.allPayments) ? data.allPayments : [];
  const historyData = [];
  
  // 1. Show all ACTUAL payments made
  let totalPaid = 0;
  payments.forEach((p, index) => {
    totalPaid += (p.amount || 0);
    historyData.push([
      index + 1,
      `${p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : 'N/A'} - ${p.remarks || 'Fee Payment'} (PAID)`,
      `Rs. ${(p.amount || 0).toLocaleString()}/-`
    ]);
  });

  // 2. Calculate and Show FUTURE (UNPAID) Installments
  const remainingToPlan = data.totalFee - totalPaid;
  const instCount = data.installmentsCount || 1;
  
  // Only show future installments if it's an installment plan and there's a balance
  if (remainingToPlan > 0 && instCount > 0) {
    // Check how many installments are already "covered" by existing payments
    // (Assuming first payment was downpayment, and others were installments)
    const paidInstCount = Math.max(0, payments.length - 1); 
    const remainingInstCount = Math.max(0, instCount - paidInstCount);
    
    if (remainingInstCount > 0) {
      const emiAmount = Math.ceil(remainingToPlan / remainingInstCount);
      for (let i = 1; i <= remainingInstCount; i++) {
        historyData.push([
          historyData.length + 1,
          `Upcoming Installment #${paidInstCount + i} (UNPAID)`,
          `Rs. ${emiAmount.toLocaleString()}/-`
        ]);
      }
    }
  }

  // Add Summary Rows
  historyData.push(['', 'TOTAL COURSE FEE', `Rs. ${(data.totalFee || 0).toLocaleString()}/-`]);
  historyData.push(['', 'TOTAL PAID TILL DATE', `Rs. ${totalPaid.toLocaleString()}/-`]);
  historyData.push(['', 'REMAINING BALANCE', `Rs. ${(data.totalFee - totalPaid).toLocaleString()}/-`]);

  if (data.nextDueDate && (data.totalFee - totalPaid) > 0) {
    historyData.push(['', 'NEXT DUE DATE', new Date(data.nextDueDate).toLocaleDateString()]);
  }

  doc.autoTable({
    startY: 72,
    head: [['S.No', "Payment Description (Installments/Down Payment)", 'Amount']],
    body: historyData,
    theme: 'grid',
    headStyles: { 
      fillColor: redColor, 
      textColor: [255, 255, 255],
      halign: 'center'
    },
    styles: { 
      lineColor: redColor, 
      lineWidth: 0.1,
      fontSize: 9,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 120 },
      2: { cellWidth: 55, halign: 'right', fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Bold the summary rows (last 3 or 4 rows depending on Due Date)
      const summaryRowsCount = historyData.length > 3 ? (data.nextDueDate ? 4 : 3) : 0;
      if (data.row.index >= historyData.length - summaryRowsCount) {
        data.cell.styles.fontStyle = 'bold';
        if (data.row.index === historyData.length - 2) data.cell.styles.textColor = redColor; // Balance row in red
      }
    }
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Amount in words placeholder
  doc.text(`Amount in word: ........................................................................................................`, 15, finalY);
  
  // Terms and Conditions (Hindi)
  doc.setFontSize(8);
  doc.setTextColor(redColor[0], redColor[1], redColor[2]);
  doc.text("Nirdesh (Terms):-", 15, finalY + 10);
  doc.text("1. Jama fees wapas nahi hogi.", 15, finalY + 15);
  doc.text("2. Fees ki likhi gai tareekh tak jama karwana aniwarya hai.", 15, finalY + 20);
  doc.text("3. Tareekh nikalne ke 10 din adhik hone par sanstha dwara admission nirast kar diya jayega.", 15, finalY + 25);
  
  // Signature
  doc.setFontSize(11);
  doc.text("Autho. Sign.", 160, finalY + 25);
  
  // Save
  doc.save(`Receipt_${data.receiptId}.pdf`);
};
