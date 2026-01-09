'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Award, Download, ExternalLink, Eye, ShieldCheck } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Loading, Badge, Button } from '@/components/ui';

export default function CertificatesPage() {
  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: async () => {
      const response = await userAPI.getMyCertificates({});
      return response.data.certificates;
    },
  });

  const handleDownload = async (certificateNumber: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      window.open(`${apiUrl}/certificates/${certificateNumber}/download`, '_blank');
    } catch (error) {
      alert('Failed to download certificate');
    }
  };

  if (isLoading) {
    return <Loading text="Loading certificates..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Certificates</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">View and download your earned credentials.</p>
        </div>
        {certificates && certificates.length > 0 && (
          <div className="hidden sm:block">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold ring-1 ring-blue-100">
              <Award className="w-3.5 h-3.5 mr-1" />
              {certificates.length} Total Earned
            </span>
          </div>
        )}
      </div>

      {certificates && certificates.length > 0 ? (
        <div className="grid gap-4 sm:gap-6">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="group overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
                  {/* Icon & Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#004aad] to-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl leading-snug mb-1 group-hover:text-[#004aad] transition-colors line-clamp-2">
                        {cert.event_title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-sm text-gray-500 mb-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-600 border border-gray-200">
                          {cert.certificate_number}
                        </span>
                        <span className="hidden sm:inline text-gray-300">•</span>
                        <span className="text-xs sm:text-sm">Issued {formatDate(cert.issued_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 lg:w-auto w-full">
                    <Link
                      href={`/certificates/${cert.certificate_number}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Button
                      variant="primary"
                      onClick={() => handleDownload(cert.certificate_number)}
                      className="w-full sm:w-auto justify-center bg-[#004aad] hover:bg-[#003366] text-white border-0 rounded-xl px-5 py-2.5 shadow-md shadow-blue-900/10"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-gray-100">
              <Award className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No certificates yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
              Attend events and complete requirements to earn your first certificate.
            </p>
            <Link href="/events">
              <Button className="bg-[#ff7620] hover:bg-[#e06516] text-white border-0 rounded-xl px-6 py-3 font-bold shadow-lg shadow-orange-500/20">
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Verify Certificate Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm overflow-hidden mt-8">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-[#003366] mb-1">Verify a Certificate</h3>
            <p className="text-blue-700/80 text-sm max-w-md">
              Need to verify someone's credential? Use our official verification tool.
            </p>
          </div>
          <Link href="/verify-certificate">
            <Button variant="outline" className="bg-white border-blue-200 text-[#003366] hover:bg-blue-50 hover:border-blue-300 font-bold px-6 rounded-xl w-full sm:w-auto whitespace-nowrap shadow-sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Go to Verification
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
