/**
 * OTP Cleanup Cron Job
 * Automatically removes expired OTP codes from database
 * 
 * Schedule: Every 10 minutes
 * Purpose: Clean up expired OTPs to keep database clean
 */

import cron from 'node-cron';
import prisma from '../config/db.js';

export const otpCleanupCron = cron.schedule(
  '*/10 * * * *', // Every 10 minutes
  async () => {
    try {
      // Delete OTPs that expired more than 50 minutes ago
      const fiftyMinutesAgo = new Date(Date.now() - 50 * 60 * 1000);
      
      const result = await prisma.otpCode.deleteMany({
        where: {
          expiresAt: {
            lt: fiftyMinutesAgo
          }
        }
      });

      // Also cleanup expired pending registrations
      const pendingCleanup = await prisma.pendingRegistration.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      
      } catch (error) {
      console.error('[CRON] OTP cleanup error:', error);
    }
  },
  {
    scheduled: false, // Don't start automatically
    timezone: 'Asia/Dhaka',
  }
);

export const startOtpCleanup = () => {
  otpCleanupCron.start();
};

export const stopOtpCleanup = () => {
  otpCleanupCron.stop();
};
