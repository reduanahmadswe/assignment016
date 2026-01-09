'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { paymentAPI } from '@/lib/api';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');
  const transactionId = searchParams.get('transaction_id');
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (transactionId && !cancelled && !cancelling) {
      setCancelling(true);
      paymentAPI
        .cancel(transactionId)
        .then(() => {
          setCancelled(true);
          console.log('[CANCEL] Payment cancelled successfully');
        })
        .catch((error) => {
          console.error('[CANCEL] Failed to cancel payment:', error);
          setCancelled(true); // Still mark as done to show the page
        })
        .finally(() => {
          setCancelling(false);
        });
    }
  }, [transactionId, cancelled, cancelling]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {cancelling ? (
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl text-center max-w-md w-full">
          <Loader2 className="w-16 h-16 text-gray-300 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancelling Payment...</h1>
          <p className="text-gray-500 text-lg">Please wait a moment.</p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-10 rounded-[2rem] shadow-xl text-center max-w-lg w-full ring-1 ring-gray-100">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">Payment Cancelled</h1>
          <p className="text-gray-600 mb-8 text-base sm:text-lg leading-relaxed">
            Your payment was cancelled or could not be processed. No amount has been deducted from your account.
          </p>

          {/* Info Card */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 text-left">
            <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2 text-base sm:text-lg">
              <HelpCircle className="w-5 h-5 opacity-80" />
              Why was this cancelled?
            </h3>
            <ul className="space-y-2 text-amber-800/80 text-sm sm:text-base list-disc list-inside ml-1">
              <li>You clicked &quot;Cancel&quot; during payment</li>
              <li>The session timed out</li>
              <li>Issue with selected payment method</li>
              <li>Network interruption</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {eventId && (
              <Link
                href={`/events/${eventId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#003366] text-white rounded-xl hover:bg-[#002244] transition-all shadow-lg shadow-blue-900/10 font-bold text-sm sm:text-base transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Link>
            )}
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>

          {/* Support Notice */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="mailto:support@oriyet.com" className="text-[#003366] font-semibold hover:underline">
                support@oriyet.com
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
