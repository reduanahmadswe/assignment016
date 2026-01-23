'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentAPI } from '@/lib/api';
import { CheckCircle, XCircle, Loader2, Calendar, Clock, Hash, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get('invoice_id');

  // ---------------------------------------------------------------------------
  // CONSOLE LOGGING & DEBUGGING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (invoiceId) {
      }
  }, [invoiceId]);

  const { data, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['payment-verify', invoiceId],
    queryFn: async () => {
      if (!invoiceId) throw new Error('No invoice ID provided');

      try {
        const response = await paymentAPI.verify(invoiceId);
        return response.data;
      } catch (err: any) {
        console.error(`%c[PAYMENT VERIFY] FAILED! Error:`, 'color: red; font-weight: bold;', err.response?.data || err.message);
        throw err;
      }
    },
    enabled: !!invoiceId,
    retry: false, // ⭐ No automatic retries - User must click "Retry" manually
    refetchOnWindowFocus: false, // Don't verify just because user switched tabs
  });

  const isPending = data?.status === 'PENDING' || data?.data?.status === 'PENDING';

  // ---------------------------------------------------------------------------
  // UI STATES
  // ---------------------------------------------------------------------------

  if (!invoiceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full ring-1 ring-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-8 text-lg">No payment invoice ID found.</p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#003366] text-white rounded-xl hover:bg-[#002244] transition-all font-bold"
          >
            Browse Events <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl text-center max-w-md w-full">
          <Loader2 className="w-16 h-16 text-[#003366] animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
          <p className="text-gray-500 text-lg">Communicating with payment gateway...</p>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE (Including 404 Not Found, 400 Bad Request)
  if (isError || !data?.success) {
    const errorObj = error as any;
    const isNotFound = errorObj?.response?.status === 404;

    let title = 'Payment Failed';
    let errorMessage = data?.message || errorObj?.message || 'Payment verification failed.';

    // Customize message for 404 (Not Found)
    if (isNotFound) {
      title = 'Transaction Not Found';
      errorMessage = "We could not find this payment. It may not exist or has expired.";
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl text-center max-w-md w-full ring-1 ring-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{title}</h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">{errorMessage}</p>

          <div className="flex flex-col gap-3">
            {/* Always allow Retry */}
            <button
              onClick={() => {
                refetch();
              }}
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#003366] text-white font-bold rounded-xl hover:bg-[#002244] transition-all"
            >
              Try Again
            </button>

            <Link
              href="/events"
              className="inline-flex items-center justify-center w-full px-6 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paymentData = data.data || data;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f9ff] py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl text-center max-w-lg w-full relative overflow-hidden">
        {/* Confetti / Decoration Background */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-[#003366]"></div>

        {/* Success Animation */}
        <div className="relative mb-8 mt-2">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-green-50/50">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Payment Successful!</h1>
        <p className="text-gray-600 mb-8 text-lg leading-relaxed px-4">
          You are now registered for<br />
          <strong className="text-[#003366] text-xl block mt-1">{paymentData.event_title}</strong>
        </p>

        {/* Payment Details Card */}
        <div className="bg-[#f8fafc] rounded-2xl p-6 text-left mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CreditCard className="w-24 h-24 text-gray-900" />
          </div>

          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            Transaction Receipt
          </h2>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
              <span className="text-gray-500 flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4" />
                Registration ID
              </span>
              <span className="font-mono font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 text-sm">
                {paymentData.registration_number}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 border-dashed">
              <span className="text-gray-500 text-sm">Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                {paymentData.status}
              </span>
            </div>
            {paymentData.transaction?.amount && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-900 font-bold text-lg">Total Paid</span>
                <span className="font-extrabold text-2xl text-[#003366]">৳{paymentData.transaction.amount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left flex items-start gap-3">
          <div className="p-1.5 bg-blue-100 rounded-full shrink-0 mt-0.5">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm text-blue-900 leading-relaxed font-medium">
            Details have been sent to your email. You can also view this event in your dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <Link
            href="/my-events"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#003366] text-white rounded-xl hover:bg-[#002244] transition-all font-bold shadow-lg shadow-blue-900/20 transform hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5" />
            View My Events
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold text-sm"
          >
            Browse More Events
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
