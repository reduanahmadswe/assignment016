import prisma from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateCertificateId } from '../../utils/helpers.util.js';
import { sendCertificateEmail } from '../../utils/email.util.js';
import { CertificateValidator } from './certificate.validator.js';
import { CertificatePDFGenerator } from './certificate.pdf.js';
import type { PDFDownloadResult, VerificationResult } from './certificate.types.js';

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

    // Validate eligibility
    const registration = await CertificateValidator.validateRegistrationEligibility(registrationId, userId);

    // Generate certificate
    const certificateId = generateCertificateId();
    const verificationUrl = `${env.frontendUrl}/verify-certificate?id=${certificateId}`;

    // Save to database
    await prisma.certificate.create({
      data: {
        certificateId,
        registrationId,
        userId,
        eventId: registration.eventId,
        qrCodeData: verificationUrl,
      },
    });

    // Send email
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
      }

    return {
      certificate_id: certificateId,
      verification_url: verificationUrl,
      message: 'Certificate generated successfully',
    };
  }

  async downloadCertificate(certificateId: string): Promise<PDFDownloadResult> {
    const cert = await prisma.certificate.findFirst({
      where: { certificateId },
      include: {
        user: { select: { name: true } },
        event: {
          select: {
            id: true,
            title: true,
            eventType: { select: { code: true } },
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!cert) {
      throw new AppError('Certificate not found', 404);
    }

    // Fetch event signatures
    const eventSignatures = await prisma.eventSignature.findMany({
      where: { eventId: cert.event.id },
      include: { signature: true },
    });

    const sig1 = eventSignatures.find(s => s.position === 1)?.signature;
    const sig2 = eventSignatures.find(s => s.position === 2)?.signature;

    const eventWithSignatures = {
      ...cert.event,
      eventType: cert.event.eventType.code,
      signature1Name: sig1?.name || null,
      signature1Title: sig1?.title || null,
      signature1Image: sig1?.image || null,
      signature2Name: sig2?.name || null,
      signature2Title: sig2?.title || null,
      signature2Image: sig2?.image || null,
    };

    // Update download count
    await prisma.certificate.update({
      where: { id: cert.id },
      data: { verificationCount: { increment: 1 } },
    });

    // Generate PDF
    const doc = await CertificatePDFGenerator.generatePDF(
      certificateId,
      cert.user.name,
      eventWithSignatures
    );

    return {
      stream: doc,
      fileName: `certificate-${certificateId}.pdf`,
    };
  }

  async verifyCertificate(certificateId: string, ipAddress?: string, userAgent?: string): Promise<VerificationResult> {
    const cleanId = CertificateValidator.normalizeCertificateId(certificateId);

    // Try exact match first
    let certificate = await this.findCertificateExact(cleanId);

    if (certificate) {
      }

    // Fuzzy matching if exact match fails
    if (!certificate) {
      certificate = await this.findCertificateFuzzy(cleanId);
    }

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    // Log verification
    await this.logVerification(certificate.id, ipAddress, userAgent);

    // Fetch event signatures
    const eventSignatures = await prisma.eventSignature.findMany({
      where: { eventId: certificate.event.id },
      include: { signature: true },
    });

    const sig1 = eventSignatures.find(s => s.position === 1)?.signature;
    const sig2 = eventSignatures.find(s => s.position === 2)?.signature;

    return {
      valid: true,
      certificate: {
        certificate_id: certificate.certificateId,
        user_name: certificate.user.name,
        event_title: certificate.event.title,
        event_type: certificate.event.eventType.code,
        issued_at: certificate.issuedAt,
        event_date: certificate.event.startDate,
        event: {
          signature1Name: sig1?.name || null,
          signature1Title: sig1?.title || null,
          signature1Image: sig1?.image || null,
          signature2Name: sig2?.name || null,
          signature2Title: sig2?.title || null,
          signature2Image: sig2?.image || null,
        },
      },
    };
  }

  private async findCertificateExact(certificateId: string) {
    return prisma.certificate.findFirst({
      where: { certificateId },
      include: {
        user: { select: { name: true } },
        event: {
          select: {
            id: true,
            title: true,
            eventType: { select: { code: true } },
            startDate: true,
            endDate: true,
          },
        },
      },
    });
  }

  private async findCertificateFuzzy(cleanId: string) {
    const variants = CertificateValidator.generateIdVariants(cleanId);
    const { uniquePart, fallbackPart } = CertificateValidator.extractUniqueParts(cleanId);

    const candidates = await prisma.certificate.findMany({
      where: {
        OR: [
          { certificateId: { in: variants } },
          uniquePart ? { certificateId: { contains: uniquePart } } : {},
          fallbackPart ? { certificateId: { contains: fallbackPart } } : {}
        ]
      },
      include: {
        user: { select: { name: true } },
        event: {
          select: {
            id: true,
            title: true,
            eventType: { select: { code: true } },
            startDate: true,
            endDate: true,
          }
        },
      },
      take: 5
    });

    const normalizedInput = CertificateValidator.normalizeForComparison(cleanId);

    for (const cand of candidates) {
      const normalizedCand = CertificateValidator.normalizeForComparison(cand.certificateId);

      vs Cand(${normalizedCand}) [Orig: ${cand.certificateId}]`);

      if (normalizedInput === normalizedCand) {
        // Self-healing
        if (cand.certificateId !== cleanId) {
          await this.selfHealCertificateId(cand.id, cand.certificateId, cleanId);
          cand.certificateId = cleanId;
        }
        
        return cand;
      }
    }

    console.warn(`[VERIFY] Deep Search failed. No matching certificate found for '${cleanId}'`);
    return null;
  }

  private async selfHealCertificateId(id: number, oldId: string, newId: string) {
    try {
      await prisma.certificate.update({
        where: { id },
        data: { certificateId: newId }
      });
    } catch (e) {
      console.error('[VERIFY] Self-Healing Failed:', e);
    }
  }

  private async logVerification(certificateId: number, ipAddress?: string, userAgent?: string) {
    await prisma.certificateVerification.create({
      data: {
        certificateId,
        ipAddress,
        userAgent,
      },
    });

    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    });
  }

  async getUserCertificates(userId: number) {
    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            title: true,
            eventType: { select: { code: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return certificates.map((cert: any) => ({
      ...cert,
      event_title: cert.event.title,
      event_type: cert.event.eventType.code,
    }));
  }

  async getCertificateById(certificateId: string) {
    const certificate = await prisma.certificate.findFirst({
      where: { certificateId },
      include: {
        user: { select: { name: true } },
        event: {
          select: {
            id: true,
            title: true,
            eventType: { select: { code: true } },
            endDate: true,
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
      event_type: certificate.event.eventType.code,
    };
  }
}

export const certificateService = new CertificateService();
