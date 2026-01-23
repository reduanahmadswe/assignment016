/**
 * ORIYET Payment Service - Enterprise Grade
 * Secure, production-ready payment and enrollment system
 * 
 * Architecture:
 * 1. Never trust frontend - always verify with gateway
 * 2. Use database transactions for atomicity
 * 3. Implement idempotency for all payment operations
 * 4. Strict validation and fraud prevention
 * 5. Comprehensive audit logging
 */

import axios from 'axios';
import prisma from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateTransactionId } from '../../utils/helpers.util.js';
import { lookupService } from '../../services/lookup.service.js';
import {
  UddoktaPayCreateResponse,
  UddoktaPayVerifyResponse,
  InitiatePaymentInput,
  VerifyPaymentResult,
  PaymentFilters,
  PaymentConfig,
} from './payment.types.js';
import { paymentValidator } from './payment.validator.js';
import { paymentEmailService, sendRefundNotification } from './payment.email.js';

// ============================================================================
// PAYMENT SERVICE CLASS
// ============================================================================

export class PaymentService {
  private readonly PAYMENT_TIMEOUT_MINUTES = 30;
  private readonly MAX_VERIFICATION_ATTEMPTS = 5;

  /**
   * Helper to get dynamic payment configuration
   */
  private async _getPaymentConfig(): Promise<PaymentConfig> {
    // --------------------------------------------------------------------------
    // DYNAMIC CONFIG FROM DB (DISABLED FOR NOW)
    // --------------------------------------------------------------------------
    /*
    // Try to get from database first
    const setting = await (prisma as any).systemSetting.findUnique({
      where: { key: 'payment' },
    });

    if (setting && setting.value) {
      try {
        const dbConfig = JSON.parse(setting.value);
        if (dbConfig.uddoktapayEnabled) {
          const apiUrl = dbConfig.uddoktapayApiUrl || env.uddoktapay.apiUrl;
          let verifyUrl = env.uddoktapay.verifyUrl;

          // Auto-derive verify URL from API URL to ensure environment match (Sandbox vs Live)
          if (apiUrl && apiUrl.includes('checkout-v2')) {
            verifyUrl = apiUrl.replace('checkout-v2', 'verify-payment');
          }

          return {
            apiKey: (dbConfig.uddoktapayApiKey || env.uddoktapay.apiKey).trim(),
            apiUrl,
            verifyUrl,
          };
        }
      } catch (error) {
        console.error('Failed to parse payment settings from DB', error);
      }
    }
    */

    // Fallback to env (ACTIVE)
    return env.uddoktapay;
  }

  /**
   * ========================================================================
   * STEP 1: INITIATE PAYMENT
   * ========================================================================
   * Creates a pending registration and payment transaction
   * - Validates event availability and pricing
   * - Prevents duplicate pending payments
   * - Creates payment request with UddoktaPay
   * - Sets automatic expiration timeout
   */
  async initiatePayment(userId: number, data: InitiatePaymentInput) {
    // -------------------------------------------------------------------------
    // 1.1 VALIDATE EVENT
    // -------------------------------------------------------------------------
    const event = await paymentValidator.validateEvent(data.event_id);
    const eventPrice = Number(event.price) || 0;

    // -------------------------------------------------------------------------
    // 1.2 CHECK EXISTING REGISTRATIONS
    // -------------------------------------------------------------------------
    await paymentValidator.checkExistingRegistrations(data.event_id, userId);

    // -------------------------------------------------------------------------
    // 1.3 GET USER DETAILS
    // -------------------------------------------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // -------------------------------------------------------------------------
    // 1.4 CREATE ONLY PAYMENT TRANSACTION (NO REGISTRATION YET)
    // -------------------------------------------------------------------------
    // Registration will be created ONLY after successful payment verification
    const transactionId = generateTransactionId();
    const amount = data.amount || eventPrice;

    // Amount validation - prevent price tampering
    paymentValidator.validateAmount(amount, eventPrice);

    const expiresAt = new Date(Date.now() + this.PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    // ⭐ NEW APPROACH: Create only payment transaction, NOT registration
    const gatewayId = await lookupService.getPaymentGatewayId('uddoktapay');
    const pendingStatusId = await lookupService.getPaymentStatusId('pending');

    const payment = await prisma.paymentTransaction.create({
      data: {
        registrationId: null, // Will be set after successful verification
        userId,
        transactionId,
        amount,
        currency: event.currency,
        gatewayId,
        statusId: pendingStatusId,
        expiresAt,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
      },
    });

    // -------------------------------------------------------------------------
    // 1.5 CREATE PAYMENT WITH UDDOKTAPAY
    // -------------------------------------------------------------------------
    const paymentData = {
      full_name: user.name,
      email: user.email,
      amount: amount.toFixed(2),
      metadata: {
        user_id: userId.toString(),
        event_id: data.event_id.toString(),
        transaction_id: transactionId,
      },
      redirect_url: `${env.frontendUrl}/payment/success`,
      return_type: 'GET',
      cancel_url: `${env.frontendUrl}/payment/cancel?transaction_id=${transactionId}`,
      webhook_url: `${env.backendUrl}/api/payments/webhook`,
    };

    const config = await this._getPaymentConfig();

    try {
      const response = await axios.post<UddoktaPayCreateResponse>(
        config.apiUrl,
        paymentData,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'RT-UDDOKTAPAY-API-KEY': config.apiKey,
          },
          timeout: 30000,
        }
      );

      if (!response.data.status || !response.data.payment_url) {
        throw new Error(response.data.message || 'Payment URL not received');
      }

      return {
        success: true,
        payment_url: response.data.payment_url,
        transaction_id: transactionId,
        expires_at: expiresAt.toISOString(),
        invoice_id: null, // Will be set after payment completion
      };
    } catch (error: any) {
      console.error('[PAYMENT] Gateway error:', error.response?.data || error.message);

      // Delete failed payment transaction immediately
      await prisma.paymentTransaction.delete({
        where: { id: payment.id },
      });

      throw new AppError(
        error.response?.data?.message || 'Payment gateway is currently unavailable. Please try again later.',
        503
      );
    }
  }

  /**
   * ========================================================================
   * STEP 2: VERIFY PAYMENT (CRITICAL - SINGLE SOURCE OF TRUTH)
   * ========================================================================
   * Verifies payment with UddoktaPay and confirms enrollment
   * - NEVER trust frontend success callback
   * - Always verify with gateway API
   * - Idempotent - safe to call multiple times
   * - Updates registration and increments participant count atomically
   */
  async verifyPayment(invoiceId: string, userId?: number): Promise<VerifyPaymentResult> {
    if (!invoiceId || invoiceId.trim() === '') {
      throw new AppError('Invoice ID is required for payment verification', 400);
    }

    // -------------------------------------------------------------------------
    // 2.1 CALL UDDOKTAPAY VERIFY API
    // -------------------------------------------------------------------------
    let verifyData: UddoktaPayVerifyResponse;
    const config = await this._getPaymentConfig();

    try {
      const response = await axios.post<UddoktaPayVerifyResponse>(
        config.verifyUrl,
        { invoice_id: invoiceId },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'RT-UDDOKTAPAY-API-KEY': config.apiKey,
          },
          timeout: 30000,
        }
      );

      verifyData = response.data;

    } catch (error: any) {
      console.error('[VERIFY] Gateway FAILED:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Handle specific gateway errors
      if (error.response?.status === 404) {
        throw new AppError('Transaction ID not found - This payment does not exist or matches no records.', 404);
      }

      if (error.response?.status === 400) {
        throw new AppError('Invalid payment request parameters.', 400);
      }

      throw new AppError('Payment gateway temporarily unavailable. Please try again.', 502);
    }

    // -------------------------------------------------------------------------
    // 2.2 CHECK PAYMENT STATUS
    // -------------------------------------------------------------------------

    // ⭐ STRICT VALIDATION: Ensure metadata exists
    // If the gateway returns a response without metadata (even if 200 OK), it's invalid for us
    if (!verifyData.metadata || !verifyData.metadata.transaction_id) {
      console.error('[VERIFY] Invalid gateway response - missing metadata:', verifyData);
      throw new AppError('Transaction ID not found - Invalid response from gateway.', 404);
    }

    if (verifyData.status === 'PENDING') {
      return {
        success: false,
        status: 'PENDING',
        message: 'Payment is still being processed. Please wait a few moments...',
      };
    }

    // ⭐ NEW: Handle Failed/Cancelled Payments & Retry Limits
    if (verifyData.status === 'ERROR' || verifyData.status !== 'COMPLETED') {
      const { metadata } = verifyData;

      if (metadata?.transaction_id) {
        try {
          const transaction = await prisma.paymentTransaction.findFirst({
            where: { transactionId: metadata.transaction_id }
          });

          if (transaction) {
            // Increment attempt count
            const updatedTx = await prisma.paymentTransaction.update({
              where: { id: transaction.id },
              data: { verificationAttempts: { increment: 1 } }
            });

            // Check retry limit (5 attempts)
            if (updatedTx.verificationAttempts > this.MAX_VERIFICATION_ATTEMPTS) {
              // Delete explicitly if max retries exceeded to cleanup
              await prisma.paymentTransaction.delete({ where: { id: transaction.id } });

              return {
                success: false,
                status: 'FAILED',
                message: 'Max verification attempts exceeded. Transaction cancelled.',
              };
            }
          } else {
            // Transaction likely already cleaned up
            throw new AppError('Transaction expired or cleaned up.', 404);
          }
        } catch (cleanupError) {
          console.error('[VERIFY] Error updating transaction stats:', cleanupError);
        }
      }

      return {
        success: false,
        status: 'FAILED',
        message: 'Payment failed or was cancelled.',
      };
    }

    // -------------------------------------------------------------------------
    // 2.3 VALIDATE METADATA
    // -------------------------------------------------------------------------
    const { metadata } = verifyData;
    paymentValidator.validateMetadata(metadata, userId);

    // -------------------------------------------------------------------------
    // 2.4 CREATE REGISTRATION & UPDATE PAYMENT (ATOMIC & IDEMPOTENT)
    // -------------------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // Find transaction by transaction_id
      const transaction = await tx.paymentTransaction.findFirst({
        where: { transactionId: metadata.transaction_id },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // ⭐ RACE CONDITION PROTECTION: Check if this transaction was already used
      const completedStatusId = await lookupService.getPaymentStatusId('completed');
      if (transaction.statusId === completedStatusId && transaction.registrationId) {
        const existingReg = await tx.eventRegistration.findUnique({
          where: { id: transaction.registrationId },
          include: {
            event: { select: { id: true, title: true, slug: true } }
          }
        });

        if (existingReg) {
          return {
            success: true,
            status: 'COMPLETED',
            message: 'Payment already verified. This transaction was already used for enrollment.',
            registration_number: existingReg.registrationNumber,
            event_title: existingReg.event.title,
            already_processed: true,
          };
        }
      }

      // Fetch event details
      const eventId = parseInt(metadata.event_id);
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          startDate: true,
          endDate: true,
          onlineLink: true,
          onlinePlatform: true,
          eventMode: true,
          maxParticipants: true,
          currentParticipants: true,
        },
      });

      if (!event) {
        throw new AppError('Event not found', 404);
      }

      // Validate amount matches
      const expectedAmount = Number(transaction.amount);
      const receivedAmount = Number(verifyData.amount);

      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error('[VERIFY] Amount mismatch:', { expected: expectedAmount, received: receivedAmount });
        throw new AppError('Payment amount mismatch', 400);
      }

      // ⭐ Check if user already registered (prevent duplicate enrollment)
      const confirmedStatusId = await lookupService.getEventRegistrationStatusId('confirmed');
      const existingUserReg = await tx.eventRegistration.findFirst({
        where: {
          eventId: event.id,
          userId: transaction.userId,
          statusId: confirmedStatusId,
        }
      });

      if (existingUserReg) {
        throw new AppError('You are already registered for this event with another payment', 400);
      }

      // Check event capacity (race condition protection)
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        // Payment succeeded but event is full - mark for refund
        const refundedStatusId = await lookupService.getPaymentStatusId('refunded');
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            statusId: refundedStatusId,
            refundReason: 'Event capacity reached after payment',
            refundedAt: new Date(),
          },
        });

        throw new AppError('Event is full. Your payment will be refunded within 7 business days.', 409);
      }

      // ⭐ CREATE EVENT REGISTRATION (FIRST TIME - ONLY ON SUCCESS)
      const regNumber = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const confirmedRegStatusId = await lookupService.getEventRegistrationStatusId('confirmed');
      const completedPaymentStatusId = await lookupService.getPaymentStatusId('completed');

      const registration = await tx.eventRegistration.create({
        data: {
          eventId: event.id,
          userId: transaction.userId,
          registrationNumber: regNumber,
          statusId: confirmedRegStatusId,
          paymentStatusId: completedPaymentStatusId,
          paymentAmount: transaction.amount,
          confirmedAt: new Date(),
        },
      });

      // Update payment transaction with registration link and completion
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          registrationId: registration.id,
          statusId: completedPaymentStatusId,
          invoiceId: verifyData.invoice_id,
          paymentMethod: verifyData.payment_method,
          senderNumber: verifyData.sender_number,
          gatewayTransactionId: verifyData.transaction_id,
          gatewayResponse: JSON.stringify(verifyData),
          paidAt: new Date(),
          verificationAttempts: { increment: 1 },
          lastVerifiedAt: new Date(),
        },
      });

      // Increment participant count
      await tx.event.update({
        where: { id: event.id },
        data: { currentParticipants: { increment: 1 } },
      });

      // Fetch user details for email
      const user = await tx.user.findUnique({
        where: { id: transaction.userId },
        select: { id: true, name: true, email: true },
      });

      return {
        success: true,
        status: 'COMPLETED',
        message: 'Payment verified and enrollment confirmed successfully',
        registration_number: registration.registrationNumber,
        event_title: event.title,
        registration: {
          ...registration,
          event,
          user,
        },
        transaction,
      };
    });

    // -------------------------------------------------------------------------
    // 2.5 SEND EMAIL NOTIFICATIONS
    // -------------------------------------------------------------------------
    if (result.success && !result.already_processed && result.registration) {
      const { registration } = result;
      paymentEmailService.sendSuccessEmails(registration, verifyData).catch((error) => {
        console.error('[VERIFY] Email error:', error);
      });
    }

    return result;
  }

  /**
   * ========================================================================
   * STEP 3: HANDLE WEBHOOK (ASYNC VERIFICATION)
   * ========================================================================
   * Processes webhook notifications from UddoktaPay
   * - Validates webhook authenticity
   * - Idempotent processing
   * - Creates registration on success, deletes transaction on failure
   */
  async handleWebhook(payload: any, apiKey: string, ipAddress?: string) {
    const config = await this._getPaymentConfig();

    // Validate webhook authenticity
    if (apiKey !== config.apiKey) {
      console.error('[WEBHOOK] Unauthorized request from IP:', ipAddress);
      throw new AppError('Unauthorized webhook request', 401);
    }

    const { metadata, status, invoice_id, payment_method, sender_number, transaction_id, amount } = payload;

    if (!metadata || !metadata.transaction_id) {
      throw new AppError('Invalid webhook payload - missing metadata', 400);
    }

    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.paymentTransaction.findFirst({
        where: { transactionId: metadata.transaction_id },
      });

      if (!transaction) {
        return { message: 'Transaction not found', processed: false };
      }

      // Idempotency - already processed
      const completedStatusId = await lookupService.getPaymentStatusId('completed');
      if (transaction.statusId === completedStatusId && transaction.registrationId) {
        return { message: 'Already processed', processed: false };
      }

      // Check for COMPLETED status strictly
      const paymentStatus = status === 'COMPLETED' ? 'completed' : 'failed';

      // ⭐ If failed, delete transaction immediately
      if (paymentStatus === 'failed') {
        await tx.paymentTransaction.delete({
          where: { id: transaction.id },
        });
        return { message: 'Payment failed - transaction deleted', processed: true, status: 'failed' };
      }

      // ⭐ If completed, create registration
      const eventId = parseInt(metadata.event_id);
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          title: true,
          slug: true,
          maxParticipants: true,
          currentParticipants: true,
        },
      });

      if (!event) {
        console.error('[WEBHOOK] Event not found:', eventId);
        return { message: 'Event not found', processed: false };
      }

      // Check capacity
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        const refundedStatusId = await lookupService.getPaymentStatusId('refunded');
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            statusId: refundedStatusId,
            refundReason: 'Event full after payment',
            refundedAt: new Date(),
          },
        });
        return { message: 'Event full - marked for refund', processed: true, status: 'refunded' };
      }

      // Create registration
      const regNumber = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      const confirmedRegStatusId = await lookupService.getEventRegistrationStatusId('confirmed');
      const completedPaymentStatusId = await lookupService.getPaymentStatusId('completed');

      const registration = await tx.eventRegistration.create({
        data: {
          eventId: event.id,
          userId: transaction.userId,
          registrationNumber: regNumber,
          statusId: confirmedRegStatusId,
          paymentStatusId: completedPaymentStatusId,
          paymentAmount: transaction.amount,
          confirmedAt: new Date(),
        },
      });

      // Update payment with registration
      const completedPaymentStatusId2 = await lookupService.getPaymentStatusId('completed');
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          registrationId: registration.id,
          statusId: completedPaymentStatusId2,
          invoiceId: invoice_id,
          paymentMethod: payment_method,
          senderNumber: sender_number,
          gatewayTransactionId: transaction_id,
          gatewayResponse: JSON.stringify(payload),
          paidAt: new Date(),
        },
      });

      // Increment participants
      await tx.event.update({
        where: { id: event.id },
        data: { currentParticipants: { increment: 1 } },
      });

      // Send Email Notification (Async)
      const user = await tx.user.findUnique({
        where: { id: transaction.userId },
        select: { id: true, name: true, email: true },
      });

      if (user) {
        const fullEvent = await tx.event.findUnique({
          where: { id: event.id },
          select: {
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            onlineLink: true,
            onlinePlatform: true,
            eventMode: true,
          },
        });

        paymentEmailService.sendSuccessEmails(
          { ...registration, event: fullEvent, user },
          payload
        ).catch((error) => {
          console.error('[WEBHOOK] Failed to send success email:', error);
        });
      }

      return { message: 'Webhook processed successfully', processed: true, status: 'completed' };
    });
  }

  /**
   * ========================================================================
   * STEP 4: CANCEL PAYMENT
   * ========================================================================
   * Deletes pending payment transaction (no record kept)
   */
  async cancelPayment(transactionId: string, userId: number) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId, userId },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const pendingStatusId = await lookupService.getPaymentStatusId('pending');
    if (transaction.statusId !== pendingStatusId) {
      const status = await prisma.paymentStatus.findUnique({ where: { id: transaction.statusId } });
      throw new AppError(`Cannot cancel payment with status: ${status?.code || 'unknown'}`, 400);
    }

    // ⭐ Delete transaction immediately (no record kept)
    await prisma.paymentTransaction.delete({
      where: { id: transaction.id },
    });

    return { message: 'Payment cancelled successfully. No record has been kept.' };
  }

  /**
   * ========================================================================
   * STEP 5: REFUND PAYMENT (ADMIN ACTION)
   * ========================================================================
   */
  async refundPayment(transactionId: string, adminId: number, reason: string) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId },
      include: {
        registration: {
          include: {
            event: { select: { id: true, title: true } },
            user: { select: { id: true, name: true, email: true } },
            certificates: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const completedStatusId = await lookupService.getPaymentStatusId('completed');
    if (transaction.statusId !== completedStatusId) {
      throw new AppError('Can only refund completed payments', 400);
    }

    if (!transaction.registrationId) {
      throw new AppError('Transaction is completed but missing registration ID', 500);
    }

    // Capture registrationId as a non-null number for use in the transaction block
    const registrationId = transaction.registrationId;

    await prisma.$transaction(async (tx) => {
      // Update payment
      const refundedStatusId = await lookupService.getPaymentStatusId('refunded');
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          statusId: refundedStatusId,
          refundedAt: new Date(),
          refundReason: reason,
          refundedBy: adminId,
        },
      });

      // Unenroll user
      const refundedRegStatusId = await lookupService.getEventRegistrationStatusId('refunded');
      const refundedPaymentStatusId = await lookupService.getPaymentStatusId('refunded');
      await tx.eventRegistration.update({
        where: { id: registrationId },
        data: {
          statusId: refundedRegStatusId,
          paymentStatusId: refundedPaymentStatusId,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      // Decrement participant count
      if (transaction.registration?.event?.id) {
        await tx.event.update({
          where: { id: transaction.registration.event.id },
          data: { currentParticipants: { decrement: 1 } },
        });
      }

      // Revoke certificates
      if (transaction.registration?.certificates && transaction.registration.certificates.length > 0) {
        await tx.certificate.deleteMany({
          where: { registrationId },
        });
      }
    });

    // Send refund notification
    if (transaction.registration?.user?.email && transaction.registration?.event?.title) {
      try {
        await sendRefundNotification(
          transaction.registration.user.email,
          transaction.registration.user.name,
          transaction.registration.event.title,
          transaction.amount,
          reason
        );
      } catch (error) {
        console.error('[REFUND] Email error:', error);
      }
    }

    return {
      message: 'Payment refunded and user unenrolled successfully',
      transaction_id: transactionId,
    };
  }

  /**
   * ========================================================================
   * STEP 6: EXPIRE PENDING PAYMENTS (CRON JOB)
   * ========================================================================
   */
  /**
   * ========================================================================
   * EXPIRE PENDING PAYMENTS (CRON JOB)
   * ========================================================================
   * Deletes expired pending payments (no record kept)
   */
  async expirePendingPayments() {
    const now = new Date();

    const expiredTransactions = await prisma.paymentTransaction.findMany({
      where: {
        status: { code: 'pending' },
        expiresAt: { lte: now },
      },
    });

    // ⭐ Delete expired transactions (no record kept)
    const deleteResult = await prisma.paymentTransaction.deleteMany({
      where: {
        status: { code: 'pending' },
        expiresAt: { lte: now },
      },
    });

    return { expired_count: deleteResult.count };
  }

  /**
   * ========================================================================
   * GET SINGLE TRANSACTION
   * ========================================================================
   */
  async getTransaction(transactionId: string) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId },
      include: {
        registration: {
          include: {
            event: { select: { id: true, title: true, slug: true, startDate: true, endDate: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return transaction;
  }

  /**
   * ========================================================================
   * ADMIN: GET ALL PAYMENTS
   * ========================================================================
   */
  async getAllPayments(filters: PaymentFilters) {
    const { status, userId, eventId, page = 1, limit = 50 } = filters;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (eventId) where.registration = { eventId };

    const [total, transactions] = await Promise.all([
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.findMany({
        where,
        include: {
          registration: {
            include: {
              event: { select: { id: true, title: true, slug: true } },
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

}

export const paymentService = new PaymentService();
