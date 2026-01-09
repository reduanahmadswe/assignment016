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
import {
  sendPaymentConfirmation,
  sendPaymentFailure,
  sendRegistrationConfirmation,
  sendEventLink,
  sendPaymentCancellation,
  sendRefundNotification,
} from '../../utils/email.util.js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UddoktaPayCreateResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

interface UddoktaPayVerifyResponse {
  full_name: string;
  email: string;
  amount: string;
  fee: string;
  charged_amount: string;
  invoice_id: string;
  metadata: {
    user_id: string;
    event_id: string;
    registration_id: string;
    transaction_id: string;
  };
  payment_method: string;
  sender_number: string;
  transaction_id: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'ERROR';
}

interface InitiatePaymentInput {
  event_id: number;
  amount?: number;
  ip_address?: string;
  user_agent?: string;
}

interface VerifyPaymentResult {
  success: boolean;
  status: string;
  message: string;
  registration_number?: string | null;
  event_title?: string;
  already_processed?: boolean;
  registration?: any;
  transaction?: any;
}

// ============================================================================
// PAYMENT SERVICE CLASS
// ============================================================================

export class PaymentService {
  private readonly PAYMENT_TIMEOUT_MINUTES = 30;
  private readonly MAX_VERIFICATION_ATTEMPTS = 5;

  /**
   * Helper to get dynamic payment configuration
   */
  private async _getPaymentConfig() {
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
    const event = await prisma.event.findUnique({
      where: { id: data.event_id },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
        maxParticipants: true,
        currentParticipants: true,
        registrationStatus: true,
        eventStatus: true,
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
    if (event.registrationStatus !== 'open') {
      throw new AppError('Registration is closed for this event', 400);
    }

    if (event.eventStatus === 'completed' || event.eventStatus === 'cancelled') {
      throw new AppError(`This event has been ${event.eventStatus}`, 400);
    }

    // Check capacity
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new AppError('Event is full. Registration capacity reached.', 400);
    }

    // -------------------------------------------------------------------------
    // 1.2 CHECK EXISTING REGISTRATIONS
    // -------------------------------------------------------------------------
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: data.event_id,
        userId,
        status: { in: ['confirmed', 'pending'] },
      },
      include: {
        paymentTransactions: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // User already confirmed - reject
    if (existingRegistration?.status === 'confirmed') {
      throw new AppError('You are already registered for this event', 400);
    }

    // User has pending payment - prevent duplicate
    if (existingRegistration?.paymentTransactions && existingRegistration.paymentTransactions.length > 0) {
      const pendingPayment = existingRegistration.paymentTransactions[0];

      // Auto-expire old pending payment to allow creating a new one immediately
      await prisma.paymentTransaction.update({
        where: { id: pendingPayment.id },
        data: { status: 'expired' },
      });
    }

    // ⭐ Check for cancelled registration and clean it up
    const cancelledRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: data.event_id,
        userId,
        status: 'cancelled',
      },
    });

    if (cancelledRegistration) {
      // Delete old cancelled registration to allow fresh start
      await prisma.eventRegistration.delete({
        where: { id: cancelledRegistration.id },
      });
    }

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
    // 1.4 CREATE REGISTRATION & PAYMENT TRANSACTION (ATOMIC)
    // -------------------------------------------------------------------------
    const transactionId = generateTransactionId();
    const amount = data.amount || eventPrice;

    // Amount validation - prevent price tampering
    if (Math.abs(amount - eventPrice) > 0.01) {
      throw new AppError('Invalid payment amount', 400);
    }

    const expiresAt = new Date(Date.now() + this.PAYMENT_TIMEOUT_MINUTES * 60 * 1000);

    const { registration, payment } = await prisma.$transaction(async (tx) => {
      // Generate unique registration number
      const regNumber = `REG-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`;

      // Create or update registration
      let reg;
      if (existingRegistration) {
        reg = await tx.eventRegistration.update({
          where: { id: existingRegistration.id },
          data: {
            status: 'pending',
            paymentStatus: 'pending',
            paymentAmount: amount,
          },
        });
      } else {
        reg = await tx.eventRegistration.create({
          data: {
            eventId: data.event_id,
            userId,
            registrationNumber: regNumber,
            status: 'pending',
            paymentStatus: 'pending',
            paymentAmount: amount,
          },
        });
      }

      // Create payment transaction
      const pmt = await tx.paymentTransaction.create({
        data: {
          registrationId: reg.id,
          userId,
          transactionId,
          amount,
          currency: event.currency,
          gateway: 'uddoktapay',
          status: 'pending',
          expiresAt,
          ipAddress: data.ip_address,
          userAgent: data.user_agent,
        },
      });

      return { registration: reg, payment: pmt };
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
        registration_id: registration.id.toString(),
        transaction_id: transactionId,
      },
      redirect_url: `${env.frontendUrl}/payment/success`,
      return_type: 'GET',
      cancel_url: `${env.frontendUrl}/payment/cancel?transaction_id=${transactionId}`,
      webhook_url: `${env.backendUrl}/api/payments/webhook`,
    };

    console.log('[PAYMENT] Initiating payment:', { transactionId, userId, eventId: data.event_id, amount });

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

      console.log('[PAYMENT] Payment initiated successfully:', transactionId);

      return {
        success: true,
        payment_url: response.data.payment_url,
        transaction_id: transactionId,
        registration_id: registration.id,
        expires_at: expiresAt.toISOString(),
      };
    } catch (error: any) {
      console.error('[PAYMENT] Gateway error:', error.response?.data || error.message);

      // Mark payment as failed
      await prisma.paymentTransaction.update({
        where: { id: payment.id },
        data: { status: 'failed' },
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

    console.log('[VERIFY] Starting verification for invoice:', invoiceId);

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
      console.log('[VERIFY] Gateway response:', { invoiceId, status: verifyData.status });
    } catch (error: any) {
      console.error('[VERIFY] Gateway error:', error.response?.data || error.message);
      throw new AppError('Failed to verify payment with gateway', 502);
    }

    // -------------------------------------------------------------------------
    // 2.2 CHECK PAYMENT STATUS
    // -------------------------------------------------------------------------
    if (verifyData.status === 'PENDING') {
      return {
        success: false,
        status: 'PENDING',
        message: 'Payment is still being processed. Please wait a few moments and try again.',
      };
    }

    if (verifyData.status === 'ERROR' || verifyData.status !== 'COMPLETED') {
      // Clean up failed/cancelled registration immediately
      if (verifyData.metadata?.registration_id) {
        try {
          const regId = parseInt(verifyData.metadata.registration_id);
          const existingReg = await prisma.eventRegistration.findUnique({
            where: { id: regId },
            include: { paymentTransactions: true }
          });

          if (existingReg && existingReg.status === 'pending') {
            // Delete related payment transactions first if cascade is not reliable, 
            // but schema says cascade onDelete so deleting registration is enough.
            await prisma.eventRegistration.delete({
              where: { id: regId }
            });
            console.log('[VERIFY] Deleted failed registration:', regId);
          }
        } catch (cleanupError) {
          console.error('[VERIFY] Cleanup failed:', cleanupError);
        }
      }

      return {
        success: false,
        status: 'FAILED',
        message: 'Payment failed or was cancelled. Please try again.',
      };
    }

    // -------------------------------------------------------------------------
    // 2.3 VALIDATE METADATA
    // -------------------------------------------------------------------------
    const { metadata } = verifyData;

    if (!metadata || !metadata.transaction_id || !metadata.registration_id) {
      console.error('[VERIFY] Invalid metadata:', metadata);
      throw new AppError('Invalid payment metadata', 400);
    }

    // Security check - ensure payment belongs to user
    if (userId && metadata.user_id !== userId.toString()) {
      console.error('[VERIFY] User mismatch:', { expected: userId, received: metadata.user_id });
      throw new AppError('Payment verification failed: User mismatch', 403);
    }

    // -------------------------------------------------------------------------
    // 2.4 UPDATE PAYMENT & REGISTRATION (ATOMIC & IDEMPOTENT)
    // -------------------------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // Find transaction
      const transaction = await tx.paymentTransaction.findFirst({
        where: { transactionId: metadata.transaction_id },
        include: {
          registration: {
            include: {
              event: {
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
              },
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // IDEMPOTENCY CHECK - Already processed
      if (transaction.status === 'completed') {
        console.log('[VERIFY] Payment already processed (idempotent):', transaction.transactionId);
        return {
          success: true,
          status: 'COMPLETED',
          message: 'Payment already verified',
          registration_number: transaction.registration.registrationNumber,
          event_title: transaction.registration.event.title,
          already_processed: true,
        };
      }

      // Validate amount matches
      const expectedAmount = Number(transaction.amount);
      const receivedAmount = Number(verifyData.amount);

      if (Math.abs(expectedAmount - receivedAmount) > 0.01) {
        console.error('[VERIFY] Amount mismatch:', { expected: expectedAmount, received: receivedAmount });
        throw new AppError('Payment amount mismatch', 400);
      }

      // Check event capacity (race condition protection)
      const event = transaction.registration.event;
      if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
        // Payment succeeded but event is full - refund needed
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'refunded',
            refundReason: 'Event capacity reached after payment',
            refundedAt: new Date(),
          },
        });

        throw new AppError('Event is full. Your payment will be refunded within 7 business days.', 409);
      }

      // Update payment transaction
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
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

      // Confirm registration
      const registration = await tx.eventRegistration.update({
        where: { id: transaction.registrationId },
        data: {
          status: 'confirmed',
          paymentStatus: 'completed',
          confirmedAt: new Date(),
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              endDate: true,
              onlineLink: true,
              onlinePlatform: true,
              eventMode: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Increment participant count
      await tx.event.update({
        where: { id: event.id },
        data: { currentParticipants: { increment: 1 } },
      });

      console.log('[VERIFY] Payment verified successfully:', {
        transactionId: transaction.transactionId,
        registrationId: registration.id,
        userId: registration.userId,
      });

      return {
        success: true,
        status: 'COMPLETED',
        message: 'Payment verified and enrollment confirmed successfully',
        registration_number: registration.registrationNumber,
        event_title: registration.event.title,
        registration,
        transaction,
      };
    });

    // -------------------------------------------------------------------------
    // 2.5 SEND EMAIL NOTIFICATIONS
    // -------------------------------------------------------------------------
    if (result.success && !result.already_processed && result.registration) {
      const { registration } = result;
      this.sendPaymentSuccessEmails(registration, verifyData).catch((error) => {
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
   * - Updates payment and registration status
   */
  async handleWebhook(payload: any, apiKey: string, ipAddress?: string) {
    const config = await this._getPaymentConfig();

    // Validate webhook authenticity
    if (apiKey !== config.apiKey) {
      console.error('[WEBHOOK] Unauthorized request from IP:', ipAddress);
      throw new AppError('Unauthorized webhook request', 401);
    }

    console.log('[WEBHOOK] Received:', payload);

    const { metadata, status, invoice_id, payment_method, sender_number, transaction_id, amount } = payload;

    if (!metadata || !metadata.transaction_id) {
      throw new AppError('Invalid webhook payload - missing metadata', 400);
    }

    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.paymentTransaction.findFirst({
        where: { transactionId: metadata.transaction_id },
        include: {
          registration: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  startDate: true,
                  endDate: true,
                  onlineLink: true,
                  onlinePlatform: true,
                  eventMode: true,
                },
              },
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });

      if (!transaction) {
        console.log('[WEBHOOK] Transaction not found:', metadata.transaction_id);
        return { message: 'Transaction not found', processed: false };
      }

      // Idempotency - already processed
      if (transaction.status === 'completed') {
        console.log('[WEBHOOK] Already processed (idempotent):', transaction.transactionId);
        return { message: 'Already processed', processed: false };
      }

      // Check for COMPLETED status strictly
      const paymentStatus = status === 'COMPLETED' ? 'completed' : 'failed';

      // Update payment
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: paymentStatus,
          invoiceId: invoice_id,
          paymentMethod: payment_method,
          senderNumber: sender_number,
          gatewayTransactionId: transaction_id,
          gatewayResponse: JSON.stringify(payload),
          paidAt: paymentStatus === 'completed' ? new Date() : null,
        },
      });

      // If completed, confirm registration and increment participants
      if (paymentStatus === 'completed') {
        await tx.eventRegistration.update({
          where: { id: transaction.registrationId },
          data: {
            status: 'confirmed',
            paymentStatus: 'completed',
            confirmedAt: new Date(),
          },
        });

        await tx.event.update({
          where: { id: transaction.registration.event.id },
          data: { currentParticipants: { increment: 1 } },
        });

        console.log('[WEBHOOK] Payment confirmed via webhook:', transaction.transactionId);

        // Send Email Notification (Async)
        // We use the fetched registration data. Note: The status in 'transaction.registration' object 
        // is still 'pending' in memory, but that shouldn't affect the email content which mostly uses title/date/name.
        this.sendPaymentSuccessEmails(transaction.registration, payload).catch((error) => {
          console.error('[WEBHOOK] Failed to send success email:', error);
        });
      } else {
        console.log('[WEBHOOK] Payment failed via webhook:', transaction.transactionId);
      }

      return { message: 'Webhook processed successfully', processed: true, status: paymentStatus };
    });
  }

  /**
   * ========================================================================
   * STEP 4: CANCEL PAYMENT
   * ========================================================================
   */
  async cancelPayment(transactionId: string, userId: number) {
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId, userId },
      include: { registration: true },
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status !== 'pending') {
      throw new AppError(`Cannot cancel payment with status: ${transaction.status}`, 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'cancelled' },
      });

      await tx.eventRegistration.update({
        where: { id: transaction.registrationId },
        data: {
          status: 'cancelled',
          paymentStatus: 'failed',
          cancelledAt: new Date(),
          cancelReason: 'User cancelled payment',
        },
      });
    });

    return { message: 'Payment cancelled successfully' };
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

    if (transaction.status !== 'completed') {
      throw new AppError('Can only refund completed payments', 400);
    }

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
          refundReason: reason,
          refundedBy: adminId,
        },
      });

      // Unenroll user
      await tx.eventRegistration.update({
        where: { id: transaction.registrationId },
        data: {
          status: 'refunded',
          paymentStatus: 'refunded',
          cancelledAt: new Date(),
          cancelReason: reason,
        },
      });

      // Decrement participant count
      await tx.event.update({
        where: { id: transaction.registration.event.id },
        data: { currentParticipants: { decrement: 1 } },
      });

      // Revoke certificates
      if (transaction.registration.certificates.length > 0) {
        await tx.certificate.deleteMany({
          where: { registrationId: transaction.registrationId },
        });
      }
    });

    // Send refund notification
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

    console.log('[REFUND] Payment refunded:', { transactionId, adminId, reason });

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
  async expirePendingPayments() {
    const now = new Date();

    const expiredTransactions = await prisma.paymentTransaction.findMany({
      where: {
        status: 'pending',
        expiresAt: { lte: now },
      },
      include: { registration: true },
    });

    console.log(`[CLEANUP] Found ${expiredTransactions.length} expired payments`);

    for (const transaction of expiredTransactions) {
      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: { status: 'expired' },
        });

        await tx.eventRegistration.update({
          where: { id: transaction.registrationId },
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
            cancelledAt: now,
            cancelReason: 'Payment timeout - not completed within 30 minutes',
          },
        });
      });
    }

    return { expired_count: expiredTransactions.length };
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
  async getAllPayments(filters: {
    status?: string;
    userId?: number;
    eventId?: number;
    page?: number;
    limit?: number;
  }) {
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

  /**
   * ========================================================================
   * HELPER: SEND SUCCESS EMAILS
   * ========================================================================
   */
  private async sendPaymentSuccessEmails(registration: any, verifyData: UddoktaPayVerifyResponse) {
    try {
      await sendPaymentConfirmation(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        Number(verifyData.amount),
        verifyData.transaction_id
      );

      await sendRegistrationConfirmation(
        registration.user.email,
        registration.user.name,
        registration.event.title,
        new Date(registration.event.startDate).toLocaleString(),
        registration.registrationNumber || ''
      );

      if (registration.event.eventMode !== 'offline' && registration.event.onlineLink) {
        await sendEventLink(
          registration.user.email,
          registration.user.name,
          registration.event.title,
          new Date(registration.event.startDate).toLocaleString(),
          registration.event.onlineLink,
          registration.event.onlinePlatform || 'Online'
        );
      }
    } catch (error) {
      console.error('[EMAIL] Error sending success emails:', error);
    }
  }
}

export const paymentService = new PaymentService();
