import * as XLSX from 'xlsx';
import { createObjectCsvStringifier } from 'csv-writer';
import PDFDocument from 'pdfkit';

export class ExportService {
  static generateExcel(data: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `registrations_${Date.now()}.xlsx`,
    };
  }

  static generateCSV(data: any[]) {
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(data[0] || {}).map((key: string) => ({ id: key, title: key })),
    });

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

    return {
      buffer: Buffer.from(csvString),
      contentType: 'text/csv',
      filename: `registrations_${Date.now()}.csv`,
    };
  }

  static async generatePDF(data: any[], eventTitle: string = 'All Events'): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        layout: 'landscape',
        bufferPages: true
      });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: 'application/pdf',
          filename: `registrations_${Date.now()}.pdf`,
        });
      });
      doc.on('error', reject);

      // Colors
      const headerBg = '#1E40AF';
      const borderColor = '#E5E7EB';
      const alternateRowBg = '#F9FAFB';

      // Title Section
      doc.rect(40, 40, doc.page.width - 80, 80).fill('#F3F4F6');
      doc.fillColor('#111827')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Registration Report', 40, 50, {
          width: doc.page.width - 80,
          align: 'center'
        });

      doc.fontSize(14)
        .fillColor('#3B82F6')
        .font('Helvetica-Bold')
        .text(eventTitle, 40, 75, {
          width: doc.page.width - 80,
          align: 'center'
        });

      doc.fontSize(10)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(`Generated: ${new Date().toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}`, 40, 100, {
          width: doc.page.width - 80,
          align: 'center'
        });

      // Table setup
      const tableTop = 150;
      const headers = ['Reg. No', 'Name', 'Email', 'Status', 'Payment'];
      const colWidths = [140, 150, 240, 100, 100];
      const tableWidth = colWidths.reduce((a, b) => a + b, 0);
      const startX = (doc.page.width - tableWidth) / 2;

      let currentY = tableTop;

      // Draw table header
      doc.rect(startX, currentY, tableWidth, 30).fill(headerBg);
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');

      let currentX = startX;
      headers.forEach((header, i) => {
        doc.text(header, currentX + 8, currentY + 10, {
          width: colWidths[i] - 16,
          align: 'left'
        });
        currentX += colWidths[i];
      });

      currentY += 30;

      // Draw table rows
      doc.font('Helvetica').fontSize(9);
      const limitedData = data.slice(0, 50);

      limitedData.forEach((row, rowIndex) => {
        if (currentY > doc.page.height - 100) {
          doc.addPage({
            margin: 40,
            size: 'A4',
            layout: 'landscape'
          });
          currentY = 40;

          // Redraw header
          doc.rect(startX, currentY, tableWidth, 30).fill(headerBg);
          doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
          currentX = startX;
          headers.forEach((header, i) => {
            doc.text(header, currentX + 8, currentY + 10, {
              width: colWidths[i] - 16,
              align: 'left'
            });
            currentX += colWidths[i];
          });
          currentY += 30;
          doc.font('Helvetica').fontSize(9);
        }

        const rowHeight = 35;

        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.rect(startX, currentY, tableWidth, rowHeight).fill(alternateRowBg);
        } else {
          doc.rect(startX, currentY, tableWidth, rowHeight).fill('#FFFFFF');
        }

        // Draw cell borders
        currentX = startX;
        colWidths.forEach((width) => {
          doc.rect(currentX, currentY, width, rowHeight).stroke(borderColor);
          currentX += width;
        });

        // Draw cell content
        const rowData = [
          row.registration_number || '-',
          row.participant_name || '-',
          row.participant_email || '-',
          row.registration_status || '-',
          row.payment_status || '-',
        ];

        currentX = startX;
        doc.fillColor('#374151');

        rowData.forEach((cell, i) => {
          if (i === 3) { // Status column
            const statusColor = cell === 'confirmed' ? '#10B981' :
              cell === 'pending' ? '#F59E0B' :
                cell === 'cancelled' ? '#EF4444' : '#6B7280';
            doc.fillColor(statusColor)
              .fontSize(8)
              .font('Helvetica-Bold')
              .text(cell.toUpperCase(), currentX + 8, currentY + 12, {
                width: colWidths[i] - 16,
                align: 'left'
              });
          } else if (i === 4) { // Payment column
            const paymentColor = cell === 'completed' || cell === 'paid' ? '#10B981' :
              cell === 'pending' ? '#F59E0B' : '#EF4444';
            doc.fillColor(paymentColor)
              .fontSize(8)
              .font('Helvetica-Bold')
              .text(cell.toUpperCase(), currentX + 8, currentY + 12, {
                width: colWidths[i] - 16,
                align: 'left'
              });
          } else {
            doc.fillColor('#374151')
              .fontSize(9)
              .font('Helvetica')
              .text(cell, currentX + 8, currentY + 12, {
                width: colWidths[i] - 16,
                align: 'left',
                ellipsis: true
              });
          }
          currentX += colWidths[i];
        });

        currentY += rowHeight;
      });

      // Draw outer border
      doc.rect(startX, tableTop, tableWidth, currentY - tableTop).stroke('#D1D5DB');

      // Footer
      const totalRecords = data.length;
      const displayedRecords = limitedData.length;
      doc.fontSize(9)
        .fillColor('#6B7280')
        .font('Helvetica')
        .text(
          `Showing ${displayedRecords} of ${totalRecords} total registrations`,
          40,
          doc.page.height - 60,
          { align: 'center', width: doc.page.width - 80 }
        );

      doc.end();
    });
  }

  static generatePaymentCSV(data: any[]) {
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'invoiceId', title: 'Invoice ID' },
        { id: 'userName', title: 'User Name' },
        { id: 'userEmail', title: 'User Email' },
        { id: 'eventTitle', title: 'Event' },
        { id: 'registrationNumber', title: 'Registration Number' },
        { id: 'amount', title: 'Amount (BDT)' },
        { id: 'status', title: 'Status' },
        { id: 'method', title: 'Payment Method' },
        { id: 'createdAt', title: 'Date' },
      ],
    });

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);
    return csv;
  }
}
