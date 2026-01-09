/**
 * Payment Controller V2 - Enterprise Grade
 * Handles all payment-related HTTP requests with security and validation
 */

import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class PaymentController {
  /**
   * POST /api/payments/initiate
   * Initiates a new payment for an event
   * Rate limited to 5 requests per 15 minutes per user
   */
  async initiatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { event_id, amount } = req.body;

      // Validation
      if (!event_id || typeof event_id !== 'number') {
        throw new AppError('Valid event_id is required', 400);
      }

      if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
        throw new AppError('Amount must be a positive number', 400);
      }

      // Get client info for fraud detection
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await paymentService.initiatePayment(userId, {
        event_id,
        amount,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/verify
   * Verifies payment after redirect from gateway
   * Rate limited to 10 requests per 5 minutes
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { invoice_id } = req.body;

      // Validation
      if (!invoice_id || typeof invoice_id !== 'string' || invoice_id.trim() === '') {
        throw new AppError('Valid invoice_id is required', 400);
      }

      const result = await paymentService.verifyPayment(invoice_id.trim(), userId);

      res.status(200).json({
        success: result.success,
        message: result.message,
        data: {
          status: result.status,
          registration_number: result.registration_number,
          event_title: result.event_title,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/webhook
   * Receives webhook notifications from UddoktaPay
   * Rate limited to 100 requests per minute
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const apiKey = req.get('RT-UDDOKTAPAY-API-KEY');
      const ipAddress = req.ip || req.socket.remoteAddress;

      if (!apiKey) {
        throw new AppError('Missing API key', 401);
      }

      const payload = req.body;

      const result = await paymentService.handleWebhook(payload, apiKey, ipAddress);

      res.status(200).json({
        success: true,
        message: result.message,
        processed: result.processed,
      });
    } catch (error) {
      // Always return 200 to prevent webhook retries
      res.status(200).json({
        success: false,
        message: error instanceof AppError ? error.message : 'Webhook processing failed',
      });
    }
  }

  /**
   * POST /api/payments/cancel
   * Cancels a pending payment
   */
  async cancelPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { transaction_id } = req.body;

      if (!transaction_id || typeof transaction_id !== 'string') {
        throw new AppError('Valid transaction_id is required', 400);
      }

      const result = await paymentService.cancelPayment(transaction_id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/transaction/:transactionId
   * Gets transaction details
   */
  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const userRole = (req as any).user.role;
      const { transactionId } = req.params;

      if (!transactionId) {
        throw new AppError('Transaction ID is required', 400);
      }

      const transaction = await paymentService.getTransaction(transactionId);

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      // Security: Only allow user to view their own transactions unless admin
      if (userRole !== 'admin' && transaction.userId !== userId) {
        throw new AppError('Unauthorized access', 403);
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/my-payments
   * Gets user's payment history
   */
  async getMyPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await paymentService.getAllPayments({
        userId,
        page,
        limit: Math.min(limit, 100), // Max 100 per page
      });

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // ADMIN ENDPOINTS
  // =========================================================================

  /**
   * GET /api/payments/admin/all
   * Gets all payments (Admin only)
   */
  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, userId, eventId, page, limit } = req.query;

      const result = await paymentService.getAllPayments({
        status: status as string,
        userId: userId ? parseInt(userId as string) : undefined,
        eventId: eventId ? parseInt(eventId as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? Math.min(parseInt(limit as string), 100) : 50,
      });

      res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/admin/refund
   * Refunds a payment (Admin only)
   */
  async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = (req as any).user.id;
      const { transaction_id, reason } = req.body;

      // Validation
      if (!transaction_id || typeof transaction_id !== 'string') {
        throw new AppError('Valid transaction_id is required', 400);
      }

      if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
        throw new AppError('Refund reason must be at least 10 characters', 400);
      }

      const result = await paymentService.refundPayment(
        transaction_id,
        adminId,
        reason.trim()
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: { transaction_id: result.transaction_id },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/admin/expire-pending
   * Manually triggers pending payment expiration (Admin only)
   */
  async expirePendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.expirePendingPayments();

      res.status(200).json({
        success: true,
        message: `Expired ${result.expired_count} pending payments`,
        data: { expired_count: result.expired_count },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();

