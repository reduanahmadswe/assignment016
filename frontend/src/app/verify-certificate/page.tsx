'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, CheckCircle, XCircle, Award, Calendar, User, Download, ShieldCheck, ArrowRight } from 'lucide-react';
import { certificateAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button, Input, Card, CardContent, Alert } from '@/components/ui';

interface VerificationResult {
  valid: boolean;
  certificate?: {
    certificate_number: string;
    recipient_name: string;
    event_title: string;
    issued_at: string;
    event_date: string;
  };
  message?: string;
}

export default function VerifyCertificatePage() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!certificateNumber.trim()) {
      setError('Please enter a certificate number');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await certificateAPI.verify(certificateNumber);
      setResult(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setResult({
          valid: false,
          message: 'Certificate not found. Please check the ID and try again.',
        });
      } else {
        setError(err.response?.data?.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.certificate) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const downloadUrl = `${apiUrl}/certificates/${result.certificate.certificate_number}/download`;

      // Open in new tab to trigger download
      window.open(downloadUrl, '_blank');
    } catch {
      alert('Failed to download certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Decorations matching other pages */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#004aad]/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff7620]/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#004aad]/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* Header Section */}
      <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#004aad] to-blue-600 shadow-xl shadow-blue-500/20 mb-4 sm:mb-6 transform hover:scale-105 transition-transform duration-300">
          <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#004aad] mb-3 sm:mb-4">
          Verify Certificate
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
          Authenticate academic credentials issued by ORIYET using the unique certificate ID.
        </p>
      </section>

      {/* Main Content */}
      <section className="container-custom pb-20 sm:pb-24 relative z-10">
        <div className="max-w-xl mx-auto">
          <Card className="border border-gray-100 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm rounded-[2rem]">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleVerify} className="space-y-5 sm:space-y-6">
                <div>
                  <label htmlFor="cert-id" className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Certificate ID</label>
                  <div className="relative group">
                    <Input
                      id="cert-id"
                      placeholder="e.g., CRT-2024-8X92B"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      className="pl-11 h-12 sm:h-14 text-base sm:text-lg border-gray-200 focus:border-[#004aad] focus:ring-[#004aad]/20 transition-all rounded-xl shadow-sm"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#004aad] transition-colors" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e06516] hover:to-[#ff7620] shadow-lg shadow-[#ff7620]/30 hover:shadow-xl hover:shadow-[#ff7620]/40 transform hover:-translate-y-0.5 transition-all duration-300"
                  isLoading={isLoading}
                >
                  Verify Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              {error && (
                <Alert variant="error" className="mt-6 border-red-100 bg-red-50 text-red-700 rounded-xl" dismissible onDismiss={() => setError('')}>
                  {error}
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Verification Result Card */}
          {result && (
            <div className={`mt-8 transform transition-all duration-500 ease-out fill-mode-forwards ${result ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              {result.valid ? (
                <Card className="border-[#00C853]/20 shadow-2xl overflow-hidden bg-white rounded-[2rem]">
                  <div className="bg-gradient-to-r from-[#00C853]/10 to-[#00C853]/5 p-6 border-b border-[#00C853]/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00C853] flex items-center justify-center shrink-0 shadow-lg shadow-green-500/30 ring-4 ring-green-50">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#00C853]">Authentic Certificate</h3>
                      <p className="text-gray-600 text-sm">This credential has been verified by ORIYET</p>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    <div className="p-6 sm:p-8 space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider gap-2">
                            <User className="w-4 h-4" /> Recipient
                          </div>
                          <p className="font-bold text-gray-900 text-lg sm:text-xl">{result.certificate?.recipient_name}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider gap-2">
                            <Calendar className="w-4 h-4" /> Issue Date
                          </div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {result.certificate?.issued_at ? formatDate(result.certificate.issued_at) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-6 border-t border-gray-100">
                        <div className="flex items-center text-gray-500 text-xs font-bold uppercase tracking-wider gap-2">
                          <Award className="w-4 h-4" /> Certification For
                        </div>
                        <p className="font-bold text-[#004aad] text-lg sm:text-xl leading-snug">
                          {result.certificate?.event_title}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                        <div className="text-xs text-gray-500 font-medium">
                          Certificate ID
                          <div className="font-mono text-gray-700 font-bold text-base sm:text-lg mt-0.5 select-all tracking-tight">
                            {result.certificate?.certificate_number}
                          </div>
                        </div>
                        <ShieldCheck className="w-8 h-8 text-gray-300" />
                      </div>

                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="w-full h-12 sm:h-14 rounded-xl border-[#004aad]/20 text-[#004aad] hover:bg-[#004aad]/5 hover:border-[#004aad]/40 font-bold"
                        leftIcon={<Download className="w-4 h-4" />}
                      >
                        Download Official Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-100 shadow-xl overflow-hidden rounded-[2rem]">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 ring-4 ring-red-50/50">
                      <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h3>
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto text-lg">
                      {result.message || 'We could not find a valid certificate matching the ID provided.'}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => setResult(null)}
                      className="text-gray-500 hover:text-gray-900 font-medium bg-gray-50 hover:bg-gray-100 rounded-xl px-6 py-3"
                    >
                      Try checking the ID again
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Helper Links */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm mb-4 font-medium">
              Where can I find the Certificate ID?
            </p>
            <div className="inline-block bg-white px-4 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-500 shadow-sm mb-6 font-mono">
              Look for <strong className="text-gray-700">CRT-XXXX-XXXX</strong> at the bottom of your document
            </div>
            <p className="text-sm text-gray-600">
              Need assistance? <Link href="/contact" className="text-[#ff7620] font-bold hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
