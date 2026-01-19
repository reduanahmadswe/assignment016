import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { lookupService } from '../../services/lookup.service.js';

/**
 * Payment Validation Helper
 * Validates event availability, pricing, and user eligibility
 */
export class PaymentValidator {
  /**
   * Validate event for payment
   */
  async validateEvent(eventId: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        maxParticipants: true,
        currentParticipants: true,
        registrationStatus: { select: { code: true } },
        eventStatus: { select: { code: true } },
        startDate: true,
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Validate event price (must be paid event)
    const eventPrice = Number(event.price) || 0;
    if (eventPrice <= 0) {
      throw new AppError(
        'This is a free event. Please use the free registration endpoint.',
        400
      );
    }

    // Validate event is open for registration
    if (event.registrationStatus.code !== 'open') {
      throw new AppError('Registration is closed for this event', 400);
    }

    if (event.eventStatus.code === 'completed' || event.eventStatus.code === 'cancelled') {
      throw new AppError(`This event has been ${event.eventStatus.code}`, 400);
    }

    // Check capacity
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new AppError('Event is full. Registration capacity reached.', 400);
    }

    return event;
  }

  /**
   * Check existing registrations and clean up
   */
  async checkExistingRegistrations(eventId: number, userId: number) {
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { code: { in: ['confirmed', 'pending'] } },
      },
      include: {
        status: { select: { code: true } },
        paymentTransactions: {
          where: { status: { code: 'pending' } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // User already confirmed - reject
    if (existingRegistration && existingRegistration.status?.code === 'confirmed') {
      throw new AppError('You are already registered for this event', 400);
    }

    // User has pending payment - auto-expire it
    if (existingRegistration?.paymentTransactions && existingRegistration.paymentTransactions.length > 0) {
      const pendingPayment = existingRegistration.paymentTransactions[0];
      const expiredStatusId = await lookupService.getPaymentStatusId('expired');
      
      await prisma.paymentTransaction.update({
        where: { id: pendingPayment.id },
        data: { statusId: expiredStatusId },
      });
    }

    // Clean up cancelled registration
    const cancelledRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { code: 'cancelled' },
      },
    });

    if (cancelledRegistration) {
      await prisma.eventRegistration.delete({
        where: { id: cancelledRegistration.id },
      });
    }
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number, eventPrice: number) {
    if (Math.abs(amount - eventPrice) > 0.01) {
      throw new AppError('Invalid payment amount', 400);
    }
  }

  /**
   * Validate metadata from gateway
   */
  validateMetadata(metadata: any, userId?: number) {
    if (!metadata || !metadata.transaction_id || !metadata.event_id) {
      throw new AppError('Invalid payment metadata', 400);
    }

    // Security check - ensure payment belongs to user
    if (userId && metadata.user_id !== userId.toString()) {
      throw new AppError('Payment verification failed: User mismatch', 403);
    }
  }
}

export const paymentValidator = new PaymentValidator();
