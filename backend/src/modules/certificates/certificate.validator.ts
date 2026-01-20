import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class CertificateValidator {
  static async validateRegistrationEligibility(registrationId: number, userId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        id: registrationId,
        userId,
      },
      include: {
        event: {
          select: {
            title: true,
            eventType: { select: { code: true } },
            hasCertificate: true,
            startDate: true,
            endDate: true,
            eventStatus: { select: { code: true } },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        status: { select: { code: true } },
        paymentStatus: { select: { code: true } },
      },
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    if (!registration.event.hasCertificate) {
      throw new AppError('This event does not offer certificates', 400);
    }

    if (registration.event.eventStatus.code !== 'completed') {
      throw new AppError('Event has not been completed yet', 400);
    }

    if (registration.status.code !== 'confirmed' && registration.status.code !== 'attended') {
      throw new AppError('Your registration is not confirmed', 400);
    }

    if (!['completed', 'not_required'].includes(registration.paymentStatus.code)) {
      throw new AppError('Payment not completed', 403);
    }

    return registration;
  }

  static normalizeCertificateId(certificateId: string): string {
    return certificateId.trim();
  }

  static generateIdVariants(cleanId: string): string[] {
    const variants = [
      cleanId.replace(/-/g, ' '),
      cleanId.replace(/ /g, '-'),
      cleanId.replace(/[ -]/g, ''),
      cleanId.replace(/^CERT[-]/i, 'CERT '),
      cleanId.replace(/^CERT /i, 'CERT-'),
    ];

    return [...new Set(variants)].filter(v => v !== cleanId);
  }

  static extractUniqueParts(cleanId: string): { uniquePart: string | null; fallbackPart: string | null } {
    const parts = cleanId.split(/[- ]/);
    const uniquePart = parts.length > 1 ? parts[1] : null;
    const fallbackPart = parts.length > 2 ? parts[2] : null;

    return { uniquePart, fallbackPart };
  }

  static normalizeForComparison(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }
}
