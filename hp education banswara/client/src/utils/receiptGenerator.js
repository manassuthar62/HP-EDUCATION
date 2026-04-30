import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'Overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
  return str;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generateReceipt = (data) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const redColor = [190, 30, 45]; // Dark red
  
  const drawSingleReceipt = (startY) => {
    // Outer Border (Drawn at the end for dynamic height)
    
    // Header
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.text("HP GROUP OF EDUCATION", 105, startY + 12, { align: 'center' });
    
    // Logos
    try {
       // Left Logo (HP Education)
       const leftImg = new Image();
       leftImg.src = '/hp logo.png';
       doc.addImage(leftImg, 'PNG', -3, startY + 2, 64, 25);

       // Right Logo (Saraswati Maa)
       const rightImg = new Image();
       rightImg.src = '/sarasvatima.png';
       doc.addImage(rightImg, 'PNG', 168, startY + 2, 25, 25);
    } catch (e) {
       console.log("Header Logo load error:", e);
    }
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("H.O.: Subhash Nagar, Gali No. 4, College Road, Banswara (Raj.)", 105, startY + 17, { align: 'center' });
    doc.text("C.O.: Gayatri Garden, College Road, Banswara (Raj.)", 105, startY + 21, { align: 'center' });
    doc.text("Mo. 9414401524, 9414401525", 105, startY + 25, { align: 'center' });
    
    // Horizontal Line
    doc.setLineWidth(0.3);
    doc.line(10, startY + 27, 200, startY + 27);
    
    // Receipt Details
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`S.No. ${data.receiptId || 'N/A'}`, 15, startY + 33);
    doc.text(`Date: ${formatDate(data.paymentDate)}`, 155, startY + 33);
    
    doc.text("Received From:", 15, startY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.studentName}`, 45, startY + 40, { maxWidth: 50 });
    doc.setFont("helvetica", "normal");
    doc.line(45, startY + 41, 95, startY + 41);
    
    doc.text("Father's Name:", 100, startY + 40);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.fatherName || 'N/A'}`, 125, startY + 40, { maxWidth: 70 });
    doc.setFont("helvetica", "normal");
    doc.line(125, startY + 41, 195, startY + 41);

    doc.text("Course:", 15, startY + 47);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.courseName}`, 30, startY + 47, { maxWidth: 60 });
    doc.setFont("helvetica", "normal");
    doc.line(30, startY + 48, 90, startY + 48);
    
    doc.text("Batch:", 100, startY + 47);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.batchName || 'N/A'}`, 115, startY + 47, { maxWidth: 80 });
    doc.setFont("helvetica", "normal");
    doc.line(115, startY + 48, 195, startY + 48);
    
    doc.text("Mobile:", 15, startY + 54);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.studentContact}`, 30, startY + 54, { maxWidth: 60 });
    doc.setFont("helvetica", "normal");
    doc.line(30, startY + 55, 90, startY + 55);

    doc.text("Payment Mode:", 100, startY + 54);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.paymentMethod || 'N/A'}`, 130, startY + 54, { maxWidth: 65 });
    doc.setFont("helvetica", "normal");
    doc.line(130, startY + 55, 195, startY + 55);

    if (data.utrNumber) {
      doc.setFontSize(10);
      doc.text("Ref ID / UTR:", 15, startY + 61);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.utrNumber}`, 40, startY + 61, { maxWidth: 150 });
      doc.setFont("helvetica", "normal");
      doc.line(40, startY + 62, 195, startY + 62);
    }
    
    // Table Data
    const payments = Array.isArray(data.allPayments) ? data.allPayments : [];
    const historyData = [];
    let totalPaid = 0;
    
    payments.forEach((p, index) => {
      totalPaid += (p.amount || 0);
      historyData.push([
        index + 1,
        `${formatDate(p.paymentDate)} - ${p.remarks || 'Fee Payment'} (PAID)`,
        `Rs. ${(p.amount || 0).toLocaleString()}/-`
      ]);
    });

    const remainingToPlan = data.totalFee - totalPaid;
    const instCount = data.installmentsCount || 1;
    if (remainingToPlan > 0 && instCount > 0) {
      const paidInstCount = Math.max(0, payments.length - 1); 
      const remainingInstCount = Math.max(0, instCount - paidInstCount);
      if (remainingInstCount > 0) {
        const emiAmount = Math.ceil(remainingToPlan / remainingInstCount);
        for (let i = 1; i <= Math.min(remainingInstCount, 3); i++) {
          historyData.push([
            historyData.length + 1,
            `Upcoming Installment #${paidInstCount + i} (UNPAID)`,
            `Rs. ${emiAmount.toLocaleString()}/-`
          ]);
        }
      }
    }

    if (data.discount > 0) {
      historyData.push(['', 'BASE COURSE FEE', `Rs. ${(data.baseFee || 0).toLocaleString()}/-`]);
      historyData.push(['', `DISCOUNT APPLIED (${data.discountRemark || 'N/A'})`, `- Rs. ${(data.discount || 0).toLocaleString()}/-`]);
    }
    historyData.push(['', 'TOTAL COURSE FEE', `Rs. ${(data.totalFee || 0).toLocaleString()}/-`]);
    historyData.push(['', 'TOTAL PAID TILL DATE', `Rs. ${totalPaid.toLocaleString()}/-`]);
    historyData.push(['', 'REMAINING BALANCE', `Rs. ${(data.totalFee - totalPaid).toLocaleString()}/-`]);
    if (data.nextDueDate && (data.totalFee - totalPaid) > 0) {
      historyData.push(['', 'NEXT DUE DATE', formatDate(data.nextDueDate)]);
    }

    doc.autoTable({
      startY: startY + 68,
      head: [['S.No', "Payment Description", 'Amount']],
      body: historyData,
      theme: 'grid',
      headStyles: { fillColor: redColor, textColor: [255, 255, 255], halign: 'center' },
      styles: { lineColor: redColor, lineWidth: 0.1, fontSize: 8, cellPadding: 1.5 },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' }, 1: { cellWidth: 130 }, 2: { cellWidth: 43, halign: 'right', fontStyle: 'bold' } },
      margin: { left: 10, right: 10 },
      didParseCell: (cellData) => {
        // Highlight TOTAL COURSE FEE row
        if (cellData.row.raw && cellData.row.raw[1] === 'TOTAL COURSE FEE') {
          cellData.cell.styles.fillColor = redColor;
          cellData.cell.styles.textColor = [255, 255, 255];
          cellData.cell.styles.fontStyle = 'bold';
        }
        
        // Highlight REMAINING BALANCE row
        if (cellData.row.raw && cellData.row.raw[1] === 'REMAINING BALANCE') {
           cellData.cell.styles.textColor = redColor;
           cellData.cell.styles.fontStyle = 'bold';
        }

        // Bold for all summary rows
        const label = cellData.row.raw ? cellData.row.raw[1] : '';
        const summaryLabels = ['BASE COURSE FEE', 'DISCOUNT APPLIED', 'TOTAL COURSE FEE', 'TOTAL PAID TILL DATE', 'REMAINING BALANCE', 'NEXT DUE DATE'];
        if (summaryLabels.some(s => label.startsWith(s))) {
          cellData.cell.styles.fontStyle = 'bold';
        }
      }
    });
    
    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(9);
    doc.text(`Amount in word: ${numberToWords(data.amount || 0)}`, 15, finalY);
    doc.line(40, finalY + 1, 150, finalY + 1); // Underline for words
    
    // Terms
    doc.setFontSize(7);
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.text("Terms & Conditions:-", 15, finalY + 8);
    doc.text("1. Fees once paid will not be refunded under any circumstances. 2. Fees must be deposited by the scheduled date.", 15, finalY + 12);
    doc.text("3. Admission may be cancelled if fees are not deposited within 10 days after the due date.", 15, finalY + 16);
    
    // Sign & Seal
    // Sign text (moved up to stay within box)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Autho. Sign.", 172, finalY + 12, { align: 'center' });

    // Official Seal (moved up to stay within box)
    try {
       const sealImg = new Image();
       sealImg.src = '/hp-seal.png';
       doc.addImage(sealImg, 'PNG', 145, finalY - 15, 50, 50);
    } catch (e) {
       console.log("Seal load error:", e);
    }

    // Draw the outer border rectangle dynamically based on content height
    const finalContentY = Math.max(finalY + 38, doc.lastAutoTable.finalY + 12);
    const boxHeight = Math.max(140, finalContentY - startY + 5);
    
    doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(5, startY, 200, boxHeight);
  };

  // Draw only one receipt at the top
  drawSingleReceipt(5);
  
  doc.save(`Receipt_${data.receiptId}.pdf`);
};
