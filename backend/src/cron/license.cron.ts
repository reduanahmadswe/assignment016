import cron from 'node-cron';
import { checkAndEnforceLicense } from '../utils/license.util.js';

export const startLicenseCheckCron = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            const isExpired = await checkAndEnforceLicense();
            if (isExpired) {
                } else {
                }
        } catch (error) {
            console.error('License check failed:', error);
        }
    });

    // Run once immediately on startup logic if needed, but the middleware covers that.

    };
