import { env } from '../config/env.js';
import prisma, { disconnectDB } from '../config/db.js';

export const getExpiryDate = (): Date => {
    if (env.license.expiryDate) {
        return new Date(env.license.expiryDate);
    }
    // Return a date far in the future (year 2099) to make license unlimited
    return new Date('2099-12-31T23:59:59Z');
};

export const isLicenseExpired = (): boolean => {
    const expiryDate = getExpiryDate();
    const now = new Date();
    return now > expiryDate;
};

export const checkAndEnforceLicense = async (): Promise<boolean> => {
    const expired = isLicenseExpired();

    if (expired) {
        console.warn('License expired. Disconnecting database...');
        try {
            await disconnectDB();
        } catch (error) {
            console.error('Error disconnecting DB:', error);
        }
        return true;
    } else {
        // Ideally we ensure connection here, but Prisma connects lazily.
        // If we deliberately disconnected it, we might need to rely on the app to reconnect
        // but typically just making a query will reconnect unless we explicitly blocked it.
        // However, for "Auto-reconnect", simply failing to throw the error in middleware 
        // allows the app to try connecting again.
    }
    return false;
};
