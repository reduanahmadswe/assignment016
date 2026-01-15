import cron from 'node-cron';
import { checkAndEnforceLicense } from '../utils/license.util.js';

export const startLicenseCheckCron = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running license check cron job...');

        try {
            const isExpired = await checkAndEnforceLicense();
            if (isExpired) {
                console.log('Database disconnected.');
            } else {
                console.log('License is valid.');
            }
        } catch (error) {
            console.error('License check failed:', error);
        }
    });

    // Run once immediately on startup logic if needed, but the middleware covers that.

    console.log('⏰ License check cron job scheduled');
};
