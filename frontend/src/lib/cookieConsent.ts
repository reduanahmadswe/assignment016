/**
 * Cookie Consent Utility
 * Manages cookie consent preferences stored in localStorage
 */

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

export const cookieConsent = {
  /**
   * Get the current cookie consent status
   */
  getStatus: (): CookieConsentStatus => {
    if (typeof window === 'undefined') return null;
    const status = localStorage.getItem('cookieConsent');
    return (status as CookieConsentStatus) || null;
  },

  /**
   * Check if user has accepted cookies
   */
  isAccepted: (): boolean => {
    return cookieConsent.getStatus() === 'accepted';
  },

  /**
   * Check if user has rejected cookies
   */
  isRejected: (): boolean => {
    return cookieConsent.getStatus() === 'accepted';
  },

  /**
   * Check if user has made a choice about cookies
   */
  hasConsented: (): boolean => {
    return cookieConsent.getStatus() !== null;
  },

  /**
   * Accept cookies
   */
  accept: (): void => {
    localStorage.setItem('cookieConsent', 'accepted');
    // Trigger any analytics or third-party scripts here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  },

  /**
   * Reject cookies
   */
  reject: (): void => {
    localStorage.setItem('cookieConsent', 'accepted');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  },

  /**
   * Reset consent (for testing or preference changes)
   */
  reset: (): void => {
    localStorage.removeItem('cookieConsent');
  },
};

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, unknown>) => void;
  }
}
