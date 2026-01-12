/**
 * Timezone Utility
 * Handles timezone conversions for the application
 * 
 * IMPORTANT: All times are stored as UTC in the database.
 * This approach works for all timezones globally.
 * Only convert to local timezone for display purposes.
 */

/**
 * Get current UTC time (for database storage)
 * @returns Date object in UTC
 */
export function getCurrentUTCTime(): Date {
  return new Date();
}

/**
 * Get expiration time in UTC (for database storage)
 * @param minutesFromNow - Number of minutes from now
 * @returns Date object representing expiration time in UTC
 */
export function getExpirationTimeUTC(minutesFromNow: number = 10): Date {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutesFromNow * 60 * 1000);
  return expiresAt;
}

/**
 * Check if a given UTC date has expired
 * @param expiresAt - Expiration date (UTC)
 * @returns boolean indicating if the date has expired
 */
export function isExpired(expiresAt: Date): boolean {
  const now = new Date();
  return now > expiresAt;
}

/**
 * Get remaining time until expiration
 * @param expiresAt - Expiration date (UTC)
 * @returns number of milliseconds remaining (negative if expired)
 */
export function getTimeRemaining(expiresAt: Date): number {
  const now = new Date();
  return expiresAt.getTime() - now.getTime();
}

/**
 * Format time difference for display
 * @param milliseconds - Time difference in milliseconds
 * @returns formatted string
 */
export function formatTimeDifference(milliseconds: number): string {
  if (milliseconds < 0) {
    return 'Expired';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export default {
  getCurrentUTCTime,
  getExpirationTimeUTC,
  isExpired,
  getTimeRemaining,
  formatTimeDifference,
};
