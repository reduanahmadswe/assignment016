'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Award,
    Calendar,
    Download,
    Share2,
    CheckCircle,
    Search,
    Filter,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { eventAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { formatDateTime } from '@/lib/utils';
import { Loading, Button } from '@/components/ui';

export default function CertificatesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [searchTerm, setSearchTerm] = useState('');

    // Redirect if not authenticated
    if (!isAuthenticated && typeof window !== 'undefined') {
        router.push('/login?redirect=/certificates');
    }

    // Fetch user's certificates (using my-events for now as it contains certificate info)
    const { data: myEvents, isLoading } = useQuery({
        queryKey: ['my-events'],
        queryFn: async () => {
            try {
                const response = await eventAPI.getMyEvents();
                return response.data.data;
            } catch (err) {
                return { upcoming: [], past: [] };
            }
        },
        enabled: isAuthenticated,
    });

    // Extract certificates from past events
    const certificates = myEvents?.past
        ?.filter((event: any) => event.certificate_id)
        .map((event: any) => ({
            id: event.certificate_id,
            event_title: event.title,
            event_date: event.start_date,
            issue_date: event.end_date, // Approximate issue date
            thumbnail: event.thumbnail,
            verification_code: `CERT-${event.id}-${event.certificate_id?.substring(0, 8)}`,
        })) || [];

    const filteredCertificates = certificates.filter((cert: any) =>
        cert.event_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <Loading fullScreen text="Loading your achievements..." />;
    }

    return (
        <div className="bg-gray-50/50 min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/90 transform transition-all">
                <div className="container-custom py-4 sm:py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
                                My Certificates
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-1">
                                Showcase and manage your professional achievements
                            </p>
                        </div>

                        {certificates.length > 0 && (
                            <div className="relative w-full md:w-auto md:min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search certificates..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all text-base shadow-sm hover:shadow-md"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="container-custom py-8 sm:py-12">
                {certificates.length > 0 ? (
                    filteredCertificates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {filteredCertificates.map((cert: any) => (
                                <div
                                    key={cert.id}
                                    className="group bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                                >
                                    {/* Certificate Preview Top */}
                                    <div className="relative aspect-[1.4/1] bg-gradient-to-br from-gray-900 to-gray-800 p-6 flex flex-col items-center justify-center text-center overflow-hidden shrink-0">
                                        {/* Background Decoration */}
                                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#004aad]/30 rounded-full blur-3xl group-hover:bg-[#004aad]/40 transition-colors"></div>

                                        <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-500">
                                            <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-inner ring-4 ring-white/5">
                                                <Award className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                                            </div>
                                            <h3 className="font-serif text-xl sm:text-2xl text-white font-bold tracking-wide mb-1 drop-shadow-md">
                                                CERTIFICATE
                                            </h3>
                                            <p className="text-[10px] sm:text-xs text-gray-300 uppercase tracking-[0.2em] font-medium">of Completion</p>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-5 sm:p-6 flex-grow flex flex-col">
                                        <div className="mb-6">
                                            <h4 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 mb-3 group-hover:text-[#004aad] transition-colors" title={cert.event_title}>
                                                {cert.event_title}
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg w-fit">
                                                <Calendar className="w-4 h-4 mr-2 text-[#004aad]" />
                                                <span className="font-medium">{formatDateTime(cert.issue_date).split('at')[0]}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center gap-3">
                                            <Link
                                                href={`/certificates/${cert.id}`}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all shadow-sm"
                                            >
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                View
                                            </Link>

                                            <Button
                                                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/certificates/download/${cert.id}`, '_blank')}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-[#004aad] hover:bg-[#003366] rounded-xl transition-all shadow-lg shadow-blue-900/10 border-0 h-auto"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                PDF
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6 shadow-sm">
                                <Search className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No matching certificates</h3>
                            <p className="text-gray-500 max-w-xs mx-auto mb-6">We couldn't find any certificates matching "{searchTerm}"</p>
                            <Button
                                onClick={() => setSearchTerm('')}
                                variant="outline"
                                className="rounded-xl font-bold border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Clear Search Results
                            </Button>
                        </div>
                    )
                ) : (
                    <div className="max-w-md mx-auto text-center py-20 px-4">
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full flex items-center justify-center shadow-sm border border-blue-100">
                                <Award className="w-12 h-12 text-[#004aad]" />
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">No Certificates Yet</h2>
                        <p className="text-gray-500 mb-10 leading-relaxed text-base sm:text-lg">
                            You haven't earned any certificates yet. Join our exciting events and workshops to start building your professional portfolio.
                        </p>
                        <Link href="/events" className="block w-full sm:w-auto">
                            <Button className="w-full sm:w-auto bg-[#ff7620] hover:bg-[#e06516] text-white border-none rounded-xl px-10 py-4 h-auto text-lg hover:-translate-y-1 shadow-xl shadow-orange-500/20 font-bold transition-transform">
                                Browse Events <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
