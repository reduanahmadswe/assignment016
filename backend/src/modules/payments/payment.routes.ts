/**
 * Payment Routes V2 - Enterprise Grade
 * Secure routes with authentication, authorization, and rate limiting
 */

import express from 'express';
import { paymentController } from './payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import {
  paymentRateLimiter,
  verificationRateLimiter,
  webhookRateLimiter,
} from '../../middlewares/rate-limit.middleware.js';
import { asyncHandler } from '../../utils/helpers.util.js';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * POST /api/payments/webhook
 * Webhook endpoint for UddoktaPay notifications
 * - No authentication required (validated by API key in request)
 * - Rate limited to prevent abuse
 */
router.post(
  '/webhook',
  webhookRateLimiter,
  asyncHandler(paymentController.handleWebhook.bind(paymentController))
);

// ============================================================================
// AUTHENTICATED USER ROUTES
// ============================================================================

/**
 * POST /api/payments/initiate
 * Initiates a new payment for an event
 * - Requires authentication
 * - Rate limited to 5 requests per 15 minutes
 */
router.post(
  '/initiate',
  authenticate,
  paymentRateLimiter,
  asyncHandler(paymentController.initiatePayment.bind(paymentController))
);

/**
 * POST /api/payments/verify
 * Verifies payment after redirect from gateway
 * - Requires authentication
 * - Rate limited to 10 requests per 5 minutes
 */
router.post(
  '/verify',
  authenticate,
  verificationRateLimiter,
  asyncHandler(paymentController.verifyPayment.bind(paymentController))
);

/**
 * POST /api/payments/cancel
 * Cancels a pending payment
 * - Requires authentication
 */
router.post(
  '/cancel',
  authenticate,
  asyncHandler(paymentController.cancelPayment.bind(paymentController))
);

/**
 * GET /api/payments/transaction/:transactionId
 * Gets transaction details
 * - Requires authentication
 * - Users can only view their own transactions
 * - Admins can view all transactions
 */
router.get(
  '/transaction/:transactionId',
  authenticate,
  asyncHandler(paymentController.getTransaction.bind(paymentController))
);

/**
 * GET /api/payments/my-payments
 * Gets user's payment history
 * - Requires authentication
 */
router.get(
  '/my-payments',
  authenticate,
  asyncHandler(paymentController.getMyPayments.bind(paymentController))
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/payments/admin/all
 * Gets all payments with filters
 * - Requires admin role
 */
router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  asyncHandler(paymentController.getAllPayments.bind(paymentController))
);

/**
 * POST /api/payments/admin/refund
 * Refunds a completed payment
 * - Requires admin role
 * - Automatically unenrolls user and revokes certificates
 */
router.post(
  '/admin/refund',
  authenticate,
  requireRole('admin'),
  asyncHandler(paymentController.refundPayment.bind(paymentController))
);

/**
 * POST /api/payments/admin/expire-pending
 * Manually expires pending payments
 * - Requires admin role
 * - Normally handled by cron job
 */
router.post(
  '/admin/expire-pending',
  authenticate,
  requireRole('admin'),
  asyncHandler(paymentController.expirePendingPayments.bind(paymentController))
);

export default router;

