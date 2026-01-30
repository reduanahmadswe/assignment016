import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateRegistrationNumber, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { sendRegistrationConfirmation, sendEventLink } from '../payments/payment.email.js';
import { lookupService } from '../../services/lookup.service.js';
import { eventTransformer } from './event.transformer.js';

export class RegistrationService {
  /**
   * Register user for free event
   */
  async registerForEvent(eventId: number, userId: number, event: any) {
    // ⭐ SECURITY: Reject paid events - they must use payment flow
    if (!event.isFree) {
      throw new AppError(
        'This is a paid event. Please use the payment endpoint to register.',
        400
      );
    }

    // Check registration status
    if (event.registrationStatus === 'closed') {
      throw new AppError('Registration is closed for this event', 400);
    }
    if (event.registrationStatus === 'full') {
      throw new AppError('This event is full', 400);
    }

    // Check deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      throw new AppError('Registration deadline has passed', 400);
    }

    // Check if already registered (only active registrations)
    const existing = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { code: { in: ['confirmed', 'pending'] } }, // ⭐ Ignore cancelled registrations
      },
    });
    if (existing) {
      throw new AppError('You are already registered for this event', 400);
    }

    const registrationNumber = generateRegistrationNumber();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const confirmedStatusId = await lookupService.getEventRegistrationStatusId('confirmed');
      const notRequiredPaymentId = await lookupService.getPaymentStatusId('not_required');

      await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          registrationNumber,
          statusId: confirmedStatusId, // ⭐ Always confirmed for free events
          paymentStatusId: notRequiredPaymentId, // ⭐ Always not_required for free events
          paymentAmount: 0, // ⭐ Always 0 for free events
        },
      });

      // ⭐ Update participant count (now safe - only free events reach here)
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: { currentParticipants: { increment: 1 } },
      });

      // Check if full
      if (event.maxParticipants && updatedEvent.currentParticipants >= event.maxParticipants) {
        const fullStatusId = await lookupService.getRegistrationStatusId('full');
        await tx.event.update({
          where: { id: eventId },
          data: { registrationStatusId: fullStatusId },
        });
      }
    });

    // Get user info for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user) {
      // Send confirmation email
      await sendRegistrationConfirmation(
        user.email,
        user.name,
        event.title,
        new Date(event.startDate).toLocaleString(),
        registrationNumber
      );

      // Send event link if online (check both onlineLink and meetingLink)
      const eventLink = event.onlineLink || event.meetingLink;
      if (event.eventMode !== 'offline' && eventLink) {
        await sendEventLink(
          user.email,
          user.name,
          event.title,
          new Date(event.startDate).toLocaleString(),
          eventLink,
          event.onlinePlatform || event.meetingPlatform || 'Online'
        );
      }
    }

    return {
      message: 'Registration successful',
      registration_number: registrationNumber,
      requires_payment: false,
      payment_amount: 0,
    };
  }

  /**
   * Cancel event registration
   */
  async cancelRegistration(eventId: number, userId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId },
      include: { status: { select: { code: true } } },
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    if (registration.status.code === 'cancelled') {
      throw new AppError('Registration already cancelled', 400);
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const cancelledStatusId = await lookupService.getEventRegistrationStatusId('cancelled');

      await tx.eventRegistration.update({
        where: { id: registration.id },
        data: { statusId: cancelledStatusId },
      });

      // Update participant count
      await tx.event.update({
        where: { id: eventId },
        data: { currentParticipants: { decrement: 1 } },
      });

      // Update registration status if was full
      const fullStatusId = await lookupService.getRegistrationStatusId('full');
      const openStatusId = await lookupService.getRegistrationStatusId('open');

      await tx.event.updateMany({
        where: {
          id: eventId,
          registrationStatusId: fullStatusId,
        },
        data: { registrationStatusId: openStatusId },
      });
    });

    return { message: 'Registration cancelled successfully' };
  }

  /**
   * Check user's registration status for an event
   */
  async checkRegistrationStatus(eventId: number, userId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { code: { in: ['confirmed', 'pending'] } }, // ⭐ Only show active registrations
      },
      include: {
        event: {
          select: {
            onlineLink: true,
            onlinePlatform: true,
          },
        },
        status: { select: { code: true } },
        paymentStatus: { select: { code: true } },
        certificates: true,
      },
    });

    if (!registration) {
      return { registered: false };
    }

    return {
      registered: true,
      registration_number: registration.registrationNumber,
      status: registration.status.code,
      payment_status: registration.paymentStatus.code,
      online_link: registration.status.code === 'confirmed' ? registration.event.onlineLink : null,
      registration_id: registration.id,
      certificate_id: registration.certificates?.[0]?.certificateId,
    };
  }

  /**
   * Get all registrations for an event (admin)
   */
  async getEventRegistrations(eventId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.eventRegistration.count({ where: { eventId } }),
    ]);

    return {
      registrations,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  /**
   * Get all events user is registered for
   */
  async getUserEvents(userId: number) {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId,
        status: { code: { not: 'cancelled' } },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            eventType: { select: { code: true } },
            eventMode: { select: { code: true } },
            startDate: true,
            endDate: true,
            onlineLink: true,
            venueDetails: true,
            hasCertificate: true,
            eventStatus: { select: { code: true } },
          },
        },
        status: { select: { code: true } },
        paymentStatus: { select: { code: true } },
        certificates: true,
      },
      orderBy: {
        event: {
          startDate: 'asc',
        },
      },
    });

    const now = new Date();

    return {
      upcoming: registrations
        .filter(r => new Date(r.event.endDate) >= now)
        .map(r => eventTransformer.transformUserEvent(r)),
      past: registrations
        .filter(r => new Date(r.event.endDate) < now)
        .sort((a, b) => new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime())
        .map(r => eventTransformer.transformUserEvent(r)),
    };
  }
}

export const registrationService = new RegistrationService();
