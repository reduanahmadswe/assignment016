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
      const result = await paymentService.expirePendingPayments();
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
  paymentCleanupCron.start();
};

export const stopPaymentCleanup = () => {
  paymentCleanupCron.stop();
};
