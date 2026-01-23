import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import { env } from '../../config/env.js';
import type { EventWithSignatures } from './certificate.types.js';

export class CertificatePDFGenerator {
  static async generateQRCode(certificateId: string): Promise<string> {
    const verificationUrl = `${env.frontendUrl}/verify-certificate?id=${certificateId}`;
    return QRCode.toDataURL(verificationUrl, { color: { dark: '#581c87', light: '#ffffff' } });
  }

  static async generatePDF(
    certificateId: string,
    userName: string,
    eventWithSignatures: EventWithSignatures
  ): Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0,
    });

    const width = doc.page.width;
    const height = doc.page.height;
    const centerX = width / 2;

    // Generate QR code
    const qrCodeData = await this.generateQRCode(certificateId);

    // Draw borders
    this.drawBorders(doc, width, height);

    // Register custom font
    const fontPath = path.resolve(process.cwd(), 'assets/fonts/GreatVibes-Regular.ttf');
    doc.registerFont('GreatVibes', fontPath);

    // Draw ornaments
    this.drawOrnaments(doc, width, height);

    // Draw header
    await this.drawHeader(doc, centerX);

    // Draw ribbon
    this.drawRibbon(doc, centerX);

    // Draw recipient name
    this.drawRecipientName(doc, centerX, userName);

    // Draw body text
    this.drawBodyText(doc, centerX, eventWithSignatures.title);

    // Draw footer (signatures and QR)
    await this.drawFooter(doc, width, height, centerX, eventWithSignatures, certificateId, qrCodeData);

    return doc;
  }

  private static drawBorders(doc: PDFKit.PDFDocument, width: number, height: number) {
    // Outer purple border
    doc.lineWidth(20)
      .strokeColor('#581c87')
      .rect(0, 0, width, height)
      .stroke();

    // Inner gold border
    doc.lineWidth(4)
      .strokeColor('#d4af37')
      .rect(20, 20, width - 40, height - 40)
      .stroke();
  }

  private static drawOrnaments(doc: PDFKit.PDFDocument, width: number, height: number) {
    const drawOrnament = (x: number, y: number, scaleX: number, scaleY: number) => {
      doc.save();
      doc.translate(x, y);
      doc.scale(scaleX, scaleY);
      doc.lineWidth(1.5);
      doc.strokeColor('#6b21a8');
      doc.opacity(0.25);

      doc.path('M10,10 Q50,10 50,50 Q10,50 10,10 M10,10 L30,30').stroke();
      doc.path('M20,5 Q90,5 90,40 Q90,10 60,10').stroke();
      doc.path('M5,20 Q5,90 40,90 Q10,90 10,60').stroke();

      doc.restore();
    };

    drawOrnament(40, 40, 1, 1);
    drawOrnament(width - 40, 40, -1, 1);
    drawOrnament(40, height - 40, 1, -1);
    drawOrnament(width - 40, height - 40, -1, -1);

    doc.opacity(1);
  }

  private static async drawHeader(doc: PDFKit.PDFDocument, centerX: number) {
    // Logo
    try {
      const logoPath = path.resolve(process.cwd(), '../frontend/public/images/oriyetlogo.png');
      doc.image(logoPath, centerX - 40, 50, { width: 80 });
    } catch (e) {
      }

    // Certificate title
    doc.font('Times-Bold')
      .fontSize(60)
      .fillColor('#581c87')
      .text('Certificate', 0, 130, { align: 'center' });

    // Subtitle
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#d4af37')
      .text('OF APPRECIATION', 0, 190, { align: 'center', characterSpacing: 5 });
  }

  private static drawRibbon(doc: PDFKit.PDFDocument, centerX: number) {
    const ribbonY = 220;
    const ribbonWidth = 260;
    const ribbonHeight = 25;

    doc.rect(centerX - (ribbonWidth / 2), ribbonY, ribbonWidth, ribbonHeight)
      .fillColor('#6b21a8')
      .fill();

    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('PROUDLY PRESENTED TO', 0, ribbonY + 8, { align: 'center', characterSpacing: 2 });
  }

  private static drawRecipientName(doc: PDFKit.PDFDocument, centerX: number, userName: string) {
    doc.font('GreatVibes')
      .fontSize(40)
      .fillColor('#1a1a1a')
      .text(userName.toUpperCase(), 0, 270, { align: 'center' });

    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .moveTo(centerX - 150, 315)
      .lineTo(centerX + 150, 315)
      .stroke();
  }

  private static drawBodyText(doc: PDFKit.PDFDocument, centerX: number, eventTitle: string) {
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#666666')
      .text('In recognition of outstanding participation and successful completion of the', 0, 330, { align: 'center' });

    doc.font('Times-Bold')
      .fontSize(24)
      .fillColor('#581c87')
      .text(eventTitle, 0, 355, { align: 'center' });

    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#666666')
      .text(
        'This certificate acknowledges the dedication, hard work, and commitment to excellence demonstrated throughout the course of the event.',
        centerX - 250,
        390,
        { align: 'center', width: 500 }
      );
  }

  private static async drawFooter(
    doc: PDFKit.PDFDocument,
    width: number,
    height: number,
    centerX: number,
    eventWithSignatures: EventWithSignatures,
    certificateId: string,
    qrCodeData: string
  ) {
    const footerY = height - 120;
    const signatureY = footerY;

    // Draw signatures
    await this.drawSignature(doc, eventWithSignatures.signature1Name, eventWithSignatures.signature1Title, eventWithSignatures.signature1Image, 100, signatureY, 150);
    await this.drawSignature(doc, eventWithSignatures.signature2Name, eventWithSignatures.signature2Title, eventWithSignatures.signature2Image, width - 250, signatureY, 150);

    // Draw QR code
    await this.drawQRCode(doc, centerX, height, certificateId, qrCodeData);
  }

  private static async drawSignature(
    doc: PDFKit.PDFDocument,
    name: string | null,
    title: string | null,
    imageUrl: string | null,
    x: number,
    y: number,
    width: number
  ) {
    if (!name) return;

    // Signature image
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        doc.image(imageBuffer, x + 25, y - 35, { width: 100, height: 30, fit: [100, 30], align: 'center' });
      } catch (e) {
        }
    }

    // Signature name
    doc.font('GreatVibes')
      .fontSize(24)
      .fillColor('#1a1a1a')
      .text(name, x, y, { align: 'center', width });

    // Line
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .moveTo(x, y + 25)
      .lineTo(x + width, y + 25)
      .stroke();

    // Title
    if (title) {
      doc.font('Helvetica-Bold')
        .fontSize(8)
        .fillColor('#888888')
        .text(String(title).toUpperCase(), x, y + 30, { align: 'center', width, characterSpacing: 1 });
    }
  }

  private static async drawQRCode(
    doc: PDFKit.PDFDocument,
    centerX: number,
    height: number,
    certificateId: string,
    qrCodeData: string
  ) {
    const qrSize = 70;
    const qrY = height - 130;

    // QR border
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .rect(centerX - (qrSize / 2) - 4, qrY - 4, qrSize + 8, qrSize + 8)
      .stroke();

    // QR image
    const qrImage = qrCodeData.split(',')[1];
    const qrBuffer = Buffer.from(qrImage, 'base64');
    doc.image(qrBuffer, centerX - (qrSize / 2), qrY, { width: qrSize, height: qrSize });

    // QR text
    doc.font('Helvetica-Bold')
      .fontSize(7)
      .fillColor('#581c87')
      .text('SCAN TO VERIFY', 0, qrY + qrSize + 8, { align: 'center', characterSpacing: 1 });

    doc.font('Helvetica')
      .fontSize(6)
      .fillColor('#888888')
      .text(certificateId, 0, qrY + qrSize + 18, { align: 'center' });
  }
}
