/**
 * Payment Cleanup Cron Job
 * Automatically expires pending payments that have timed out
 * 
 * Schedule: Every 5 minutes
 * Purpose: Cleanup stale payments and free up event capacity
 */

import cron from 'node-cron';
import { paymentService } from '../modules/payments/payment.service.js';

export const paymentCleanupCron = cron.schedule(
  '*/5 * * * *', // Every 5 minutes
  async () => {
    try {
      console.log('[CRON] Starting payment cleanup...');
      const result = await paymentService.expirePendingPayments();
      console.log(`[CRON] Payment cleanup completed: ${result.expired_count} payments expired`);
    } catch (error) {
      console.error('[CRON] Payment cleanup error:', error);
    }
  },
  {
    scheduled: false, // Don't start automatically
    timezone: 'Asia/Dhaka',
  }
);

export const startPaymentCleanup = () => {
  console.log('[CRON] Payment cleanup job started');
  paymentCleanupCron.start();
};

export const stopPaymentCleanup = () => {
  console.log('[CRON] Payment cleanup job stopped');
  paymentCleanupCron.stop();
};
