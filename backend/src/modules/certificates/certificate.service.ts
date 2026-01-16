import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import path from 'path';
import prisma from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateCertificateId, formatDate } from '../../utils/helpers.util.js';
import { sendCertificateEmail } from '../../utils/email.util.js';

export class CertificateService {
  async generateCertificate(registrationId: number, userId: number) {
    // Check if certificate already exists
    const existingCert = await prisma.certificate.findFirst({
      where: { registrationId },
    });

    if (existingCert) {
      return {
        certificate_id: existingCert.certificateId,
        message: 'Certificate already exists',
      };
    }

    // Get registration details
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        id: registrationId,
        userId,
      },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
            hasCertificate: true,
            startDate: true,
            endDate: true,
            eventStatus: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    // Validate certificate eligibility
    if (!registration.event.hasCertificate) {
      throw new AppError('This event does not offer certificates', 400);
    }

    if (registration.event.eventStatus !== 'completed') {
      throw new AppError('Event has not been completed yet', 400);
    }

    if (registration.status !== 'confirmed' && registration.status !== 'attended') {
      throw new AppError('Your registration is not confirmed', 400);
    }

    if (!['completed', 'not_required'].includes(registration.paymentStatus)) {
      throw new AppError('Payment not completed', 403);
    }

    // Generate certificate ID
    const certificateId = generateCertificateId();
    // Use frontend URL with query param for new verification page structure
    const verificationUrl = `${env.frontendUrl}/verify-certificate?id=${certificateId}`;

    // Save to database (no file stored, just metadata)
    await prisma.certificate.create({
      data: {
        certificateId,
        registrationId,
        userId,
        eventId: registration.eventId,
        qrCodeData: verificationUrl,
      },
    });

    // Send email with verification link
    try {
      await sendCertificateEmail(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        certificateId,
        `${env.frontendUrl}/dashboard/certificates`,
        verificationUrl
      );
    } catch (error) {
      console.log('Email sending failed, but certificate was created');
    }

    return {
      certificate_id: certificateId,
      verification_url: verificationUrl,
      message: 'Certificate generated successfully',
    };
  }

  // Generate PDF on-the-fly (returns a stream, not a file)
  async downloadCertificate(certificateId: string): Promise<{ stream: PDFKit.PDFDocument; fileName: string }> {
    const cert = await prisma.certificate.findFirst({
      where: { certificateId },
      include: {
        user: {
          select: { name: true },
        },
        event: {
          select: {
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
            // Certificate Signature Fields
            signature1Name: true,
            signature1Title: true,
            signature1Image: true,
            signature2Name: true,
            signature2Title: true,
            signature2Image: true,
          },
        },
      },
    });

    if (!cert) {
      throw new AppError('Certificate not found', 404);
    }

    // Update download count
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { verificationCount: { increment: 1 } },
    });

    // Generate QR code
    const verificationUrl = `${env.frontendUrl}/verify-certificate?id=${certificateId}`;
    const qrCodeData = await QRCode.toDataURL(verificationUrl, { color: { dark: '#581c87', light: '#ffffff' } });

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0, // Manual margin handling
    });

    const width = doc.page.width;
    const height = doc.page.height;
    const centerX = width / 2;

    // --- 1. Borders ---
    // Outer Purple Border (20px)
    doc.lineWidth(20)
      .strokeColor('#581c87')
      .rect(0, 0, width, height)
      .stroke();

    // Inner Gold Border (4px) - Inset by 20px
    doc.lineWidth(4)
      .strokeColor('#d4af37')
      .rect(20, 20, width - 40, height - 40)
      .stroke();

    // --- 2. Styles Helper ---
    // Register Custom Script Font
    const fontPath = path.resolve(process.cwd(), 'assets/fonts/GreatVibes-Regular.ttf');
    doc.registerFont('GreatVibes', fontPath);

    // Fonts:
    // Header -> 'Times-Bold'
    // Name/Signatures -> 'GreatVibes'
    // Body -> 'Helvetica'

    // --- 2.5. Corner Ornaments ---
    const drawOrnament = (x: number, y: number, scaleX: number, scaleY: number) => {
      doc.save();
      doc.translate(x, y);
      doc.scale(scaleX, scaleY);
      doc.lineWidth(1.5);
      doc.strokeColor('#6b21a8');
      doc.opacity(0.25); // Light opacity as per frontend

      // Inner Petal
      doc.path('M10,10 Q50,10 50,50 Q10,50 10,10 M10,10 L30,30').stroke();
      // Top Curve
      doc.path('M20,5 Q90,5 90,40 Q90,10 60,10').stroke();
      // Side Curve
      doc.path('M5,20 Q5,90 40,90 Q10,90 10,60').stroke();

      doc.restore();
    };

    // Draw in 4 corners (adjusted for margin)
    // Top Left
    drawOrnament(40, 40, 1, 1);
    // Top Right
    drawOrnament(width - 40, 40, -1, 1);
    // Bottom Left
    drawOrnament(40, height - 40, 1, -1);
    // Bottom Right
    drawOrnament(width - 40, height - 40, -1, -1);

    // Reset opacity
    doc.opacity(1);

    // --- 3. Header ---

    // Logo
    try {
      // Resolve path relative to backend root
      const logoPath = path.resolve(process.cwd(), '../frontend/public/images/oriyetlogo.png');
      doc.image(logoPath, centerX - 40, 50, { width: 80 });
    } catch (e) {
      console.log('Logo not found, skipping', e);
    }

    // "Certificate" Title
    doc.moveDown();
    doc.font('Times-Bold')
      .fontSize(60)
      .fillColor('#581c87')
      .text('Certificate', 0, 130, { align: 'center' });

    // "OF APPRECIATION"
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#d4af37')
      .text('OF APPRECIATION', 0, 190, { align: 'center', characterSpacing: 5 });

    // --- 4. Ribbon ---
    // Purple Ribbon Background
    const ribbonY = 220;
    const ribbonWidth = 260;
    const ribbonHeight = 25;

    doc.rect(centerX - (ribbonWidth / 2), ribbonY, ribbonWidth, ribbonHeight)
      .fillColor('#6b21a8')
      .fill();

    // Ribbon Text
    doc.font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text('PROUDLY PRESENTED TO', 0, ribbonY + 8, { align: 'center', characterSpacing: 2 });

    // --- 5. Recipient Name ---
    doc.font('GreatVibes') // Custom Script Font
      .fontSize(40)
      .fillColor('#1a1a1a')
      .text(cert.user.name.toUpperCase(), 0, 270, { align: 'center' });

    // Golden underline
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .moveTo(centerX - 150, 315)
      .lineTo(centerX + 150, 315)
      .stroke();

    // --- 6. Body Text ---
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor('#666666')
      .text('In recognition of outstanding participation and successful completion of the', 0, 330, { align: 'center' });

    // Event Title
    doc.font('Times-Bold')
      .fontSize(24)
      .fillColor('#581c87')
      .text(cert.event.title, 0, 355, { align: 'center' });

    // Description text
    doc.font('Helvetica')
      .fontSize(10)
      .fillColor('#666666')
      .text(
        'This certificate acknowledges the dedication, hard work, and commitment to excellence demonstrated throughout the course of the event.',
        centerX - 250,
        390,
        { align: 'center', width: 500 }
      );

    // --- 7. Footer ---
    const footerY = height - 120;
    const signatureY = footerY;

    // Get signature data from event or use defaults
    const sig1Name: string = cert.event.signature1Name || 'Reduan Ahmad';
    const sig1Title: string = cert.event.signature1Title || 'DIRECTOR';
    const sig1Image: string | null = cert.event.signature1Image || null;
    const sig2Name: string = cert.event.signature2Name || 'Orijeet Admin';
    const sig2Title: string = cert.event.signature2Title || 'SECRETARY';
    const sig2Image: string | null = cert.event.signature2Image || null;

    // LEFT: First Signatory
    // If signature image exists, show image above the name
    if (sig1Image) {
      try {
        // Fetch image from URL
        const response = await fetch(sig1Image);
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        doc.image(imageBuffer, 125, signatureY - 35, { width: 100, height: 30, fit: [100, 30], align: 'center' });
      } catch (e) {
        console.log('Failed to load signature 1 image:', e);
      }
    }
    
    doc.font('GreatVibes')
      .fontSize(24)
      .fillColor('#1a1a1a')
      .text(sig1Name, 100, signatureY, { align: 'center', width: 150 });

    // Line
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .moveTo(100, signatureY + 25)
      .lineTo(250, signatureY + 25)
      .stroke();

    // Title
    doc.font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#888888')
      .text(sig1Title.toUpperCase(), 100, signatureY + 30, { align: 'center', width: 150, characterSpacing: 1 });

    // RIGHT: Second Signatory
    // If signature image exists, show image above the name
    if (sig2Image) {
      try {
        const response = await fetch(sig2Image);
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);
        doc.image(imageBuffer, width - 225, signatureY - 35, { width: 100, height: 30, fit: [100, 30], align: 'center' });
      } catch (e) {
        console.log('Failed to load signature 2 image:', e);
      }
    }
    
    doc.font('GreatVibes')
      .fontSize(24)
      .fillColor('#1a1a1a')
      .text(sig2Name, width - 250, signatureY, { align: 'center', width: 150 });

    // Line
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .moveTo(width - 250, signatureY + 25)
      .lineTo(width - 100, signatureY + 25)
      .stroke();

    // Title
    doc.font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#888888')
      .text(sig2Title.toUpperCase(), width - 250, signatureY + 30, { align: 'center', width: 150, characterSpacing: 1 });


    // CENTER: QR Code
    const qrSize = 70;
    const qrY = height - 130;

    // QR Border (Gold, simulated with rect)
    doc.lineWidth(1)
      .strokeColor('#d4af37')
      .rect(centerX - (qrSize / 2) - 4, qrY - 4, qrSize + 8, qrSize + 8)
      .stroke();

    // QR Image
    const qrImage = qrCodeData.split(',')[1];
    const qrBuffer = Buffer.from(qrImage, 'base64');
    doc.image(qrBuffer, centerX - (qrSize / 2), qrY, { width: qrSize, height: qrSize });

    // QR Text
    doc.font('Helvetica-Bold')
      .fontSize(7)
      .fillColor('#581c87')
      .text('SCAN TO VERIFY', 0, qrY + qrSize + 8, { align: 'center', characterSpacing: 1 });

    doc.font('Helvetica')
      .fontSize(6)
      .fillColor('#888888')
      .text(certificateId, 0, qrY + qrSize + 18, { align: 'center' });

    return {
      stream: doc,
      fileName: `certificate-${certificateId}.pdf`,
    };
  }

  async verifyCertificate(certificateId: string, ipAddress?: string, userAgent?: string) {
    // 1. Logging and trimming
    console.log(`[VERIFY] Checking Certificate ID: '${certificateId}'`);
    const cleanId = certificateId.trim();

    let certificate = await prisma.certificate.findFirst({
      where: { certificateId: cleanId },
      include: {
        user: { select: { name: true } },
        event: {
          select: {
            title: true,
            eventType: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (certificate) {
      console.log(`[VERIFY] Exact match found for '${cleanId}'`);
    }

    // 2. Fuzzy Matching & Deep Search
    if (!certificate) {
      console.log(`[VERIFY] Exact match failed for '${cleanId}'. Starting Deep Search...`);

      const variants = [
        cleanId.replace(/-/g, ' '),            // All dashes to spaces
        cleanId.replace(/ /g, '-'),            // All spaces to dashes
        cleanId.replace(/[ -]/g, ''),          // Remove all separators
        cleanId.replace(/^CERT[-]/i, 'CERT '), // Force 'CERT-' to 'CERT '
        cleanId.replace(/^CERT /i, 'CERT-'),   // Force 'CERT ' to 'CERT-'
      ];

      const uniqueVariants = [...new Set(variants)].filter(v => v !== cleanId);

      // Strategy B: Substring Search (The key part)
      // Extract main parts "MKCYSV4Q"
      const parts = cleanId.split(/[- ]/);
      const uniquePart = parts.length > 1 ? parts[1] : null;
      const fallbackPart = parts.length > 2 ? parts[2] : null;

      console.log(`[VERIFY] Deep Search | Variants: ${uniqueVariants.length} | Unique Part: '${uniquePart}'`);

      // Try fetching candidates that might match
      let candidates = await prisma.certificate.findMany({
        where: {
          OR: [
            { certificateId: { in: uniqueVariants } },
            uniquePart ? { certificateId: { contains: uniquePart } } : {},
            fallbackPart ? { certificateId: { contains: fallbackPart } } : {}
          ]
        },
        include: {
          user: { select: { name: true } },
          event: { select: { title: true, eventType: true, startDate: true, endDate: true } },
        },
        take: 5
      });

      console.log(`[VERIFY] Deep Search | Candidates found: ${candidates.length}`);

      // Filter candidates using aggressive normalization (remove ALL non-alphanumeric)
      const normalizedInput = cleanId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

      for (const cand of candidates) {
        const normalizedCand = cand.certificateId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        console.log(`   > Comparing: Input(${normalizedInput}) vs Cand(${normalizedCand}) [Orig: ${cand.certificateId}]`);

        if (normalizedInput === normalizedCand) {
          certificate = cand;
          console.log(`[VERIFY] MATCH FOUND via Normalization!`);

          // Self-Healing
          if (cand.certificateId !== cleanId) {
            console.log(`[VERIFY] Self-Healing: Updating DB ID from '${cand.certificateId}' to '${cleanId}'`);
            try {
              await prisma.certificate.update({
                where: { id: cand.id },
                data: { certificateId: cleanId }
              });
              // Update local object
              certificate.certificateId = cleanId;
            } catch (e) {
              console.error('[VERIFY] Self-Healing Failed:', e);
            }
          }
          break; // Stop after first match
        }
      }

      if (!certificate) {
        console.warn(`[VERIFY] Deep Search failed. No matching certificate found for '${cleanId}'`);
      }
    }

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    // Log verification
    await prisma.certificateVerification.create({
      data: {
        certificateId: certificate.id,
        ipAddress,
        userAgent,
      },
    });

    // Update verification count
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    });

    return {
      valid: true,
      certificate: {
        certificate_id: certificate.certificateId,
        user_name: certificate.user.name,
        event_title: certificate.event.title,
        event_type: certificate.event.eventType,
        issued_at: certificate.issuedAt,
        event_date: certificate.event.startDate,
      },
    };
  }

  async getUserCertificates(userId: number) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            title: true,
            eventType: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certificates.map((cert: any) => ({
      ...cert,
      event_title: cert.event.title,
      event_type: cert.event.eventType,
    }));
  }

  async getCertificateById(certificateId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: { certificateId },
      include: {
        user: {
          select: { name: true },
        },
        event: {
          select: {
            title: true,
            eventType: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    return {
      ...certificate,
      user_name: certificate.user.name,
      event_title: certificate.event.title,
      event_type: certificate.event.eventType,
    };
  }
}

export const certificateService = new CertificateService();
