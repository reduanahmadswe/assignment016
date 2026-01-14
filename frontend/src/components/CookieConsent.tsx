'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!isClient || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              🍪 Cookie Consent
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We use cookies to enhance your experience, remember your preferences, and understand how you use our site. By continuing to use our website, you consent to our use of cookies. You can change your preference at any time.{' '}
              <Link href="/cookies" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
            <Button
              onClick={handleReject}
              variant="outline"
              className="justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              className="justify-center gap-2 whitespace-nowrap text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
