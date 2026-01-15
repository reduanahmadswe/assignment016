import { Request, Response, NextFunction } from 'express';
import { isLicenseExpired, checkAndEnforceLicense } from '../utils/license.util.js';

export const licenseMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check if specific routes should be exempt (e.g., health check maybe? likely not if we want "turn off")
    // The user said "disable / turn off the website", so everything usually.

    if (isLicenseExpired()) {
        // Ensure DB is disconnected (fire and forget to avoid delaying response, or await?)
        // Awaiting might be safer to ensure compliance.
        // However, we don't want to spam disconnect calls.
        // We can rely on the cron to do the heavy lifting or do it once here.
        // Let's just catch any error from it.
        checkAndEnforceLicense().catch(console.error);

        res.status(503).json({
            success: false,
            message: 'Database connection error',
            error: {
                code: 'LICENSE_EXPIRED',
                status: 503
            }
        });
        return; // STOP execution
    }

    next();
};
