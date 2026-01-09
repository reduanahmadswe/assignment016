'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle,
    XCircle,
    Award,
    Calendar,
    User,
    Download,
    Search,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';
import { certificateAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button, Card, CardContent, Loading, Input } from '@/components/ui';

export default function PublicVerifyPage() {
    // Note: handling both path param and optional verify page
    const params = useParams();
    const urlCertificateId = params.certificateId as string;

    // Logic to auto-verify if ID is present
    const [certificateId, setCertificateId] = useState(urlCertificateId || '');
    const [isLoading, setIsLoading] = useState(!!urlCertificateId);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (urlCertificateId) {
            verifyCertificate(urlCertificateId);
        }
    }, [urlCertificateId]);

    const verifyCertificate = async (id: string) => {
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await certificateAPI.verify(id);
            setResult(response.data);
        } catch (err: any) {
            setResult({ valid: false });
            if (err.response?.status === 404) {
                setError('Certificate not found. Please check the ID.');
            } else {
                setError('Verification failed. Invalid certificate ID.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (certificateId) verifyCertificate(certificateId);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#004aad]/5 to-transparent pointer-events-none" />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="container-custom py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-[#004aad] rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">O</div>
                        <span className="font-extrabold text-[#003366] text-xl tracking-tight">ORIYET</span>
                    </Link>
                    <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                        <ShieldCheck className="w-4 h-4 text-[#004aad]" />
                        Official Verification Portal
                    </div>
                </div>
            </header>

            <main className="flex-1 container-custom py-10 sm:py-16 md:py-20 flex flex-col items-center justify-center relative z-10">
                <div className="w-full max-w-xl mx-auto">
                    {/* Search Box (if no ID or invalid) */}
                    {!urlCertificateId && (
                        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Verify a Certificate</h1>
                            <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                                Enter the unique certificate ID to verify its authenticity and view official details.
                            </p>
                        </div>
                    )}

                    {!urlCertificateId && (
                        <form onSubmit={handleManualVerify} className="mb-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-2xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                                <div className="relative flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-xl ring-1 ring-black/5">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={certificateId}
                                            onChange={(e) => setCertificateId(e.target.value)}
                                            placeholder="Certificate ID (e.g. CRT-202X-XXXX)"
                                            className="block w-full pl-10 pr-3 py-3.5 border-0 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#004aad] sm:text-sm font-medium rounded-xl bg-transparent"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        isLoading={isLoading}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-[#004aad] hover:bg-[#003366] text-white rounded-xl font-bold shadow-lg shadow-[#004aad]/20 transition-all transform active:scale-95"
                                    >
                                        Verify Now
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <Card className="rounded-[2rem] shadow-xl border-0 ring-1 ring-gray-100">
                            <CardContent className="py-16 text-center">
                                <Loading text="Verifying certificate authenticity..." />
                            </CardContent>
                        </Card>
                    )}

                    {/* Success State */}
                    {!isLoading && result?.valid && (
                        <div className="transform transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                            <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white ring-1 ring-black/5">
                                <div className="h-2 bg-gradient-to-r from-green-400 to-[#004aad]"></div>
                                <CardContent className="pt-10 pb-10 px-6 sm:px-10 text-center relative">
                                    {/* Watermark */}
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                        <Award className="w-64 h-64" />
                                    </div>

                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-green-50/50 animate-bounce-short">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>

                                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Certificate Valid</h2>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-8">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Officially Verified
                                    </div>

                                    <div className="space-y-4 text-left bg-gray-50 rounded-[1.5rem] p-6 sm:p-8 mb-8 border border-gray-100 shadow-inner">
                                        <div className="relative">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Issued To</p>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{result.certificate.user_name}</p>
                                        </div>
                                        <div className="h-px bg-gray-200" />
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">For Event</p>
                                            <p className="text-lg font-bold text-[#004aad] leading-snug">{result.certificate.event_title}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 pt-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Issued</p>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{formatDate(result.certificate.issued_at)}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Held On</p>
                                                </div>
                                                <p className="text-gray-900 font-semibold">{formatDate(result.certificate.event_date)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 mb-8 bg-white/50 p-2 rounded-lg border border-dashed border-gray-200">
                                        <span className="text-xs text-gray-400 font-mono select-all">
                                            <span className="font-bold">ID:</span> {result.certificate.certificate_id}
                                        </span>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full h-14 bg-[#ff7620] hover:bg-[#e06516] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 text-lg hover:-translate-y-0.5 transition-all"
                                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/certificates/download/${result.certificate.certificate_id}`, '_blank')}
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download Official PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Error State */}
                    {!isLoading && (error || (result && !result.valid)) && (
                        <div className="transform transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
                            <Card className="border-0 shadow-xl rounded-[2rem] overflow-hidden bg-white ring-1 ring-red-100">
                                <div className="h-2 bg-red-500"></div>
                                <CardContent className="py-12 px-8 text-center">
                                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-8 ring-red-50/50">
                                        <XCircle className="w-12 h-12 text-red-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                                    <p className="text-gray-600 max-w-sm mx-auto mb-8 text-lg leading-relaxed">
                                        {error || result?.message || "We could not find a valid certificate matching the verification ID provided."}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            setCertificateId('');
                                            window.history.pushState({}, '', '/verify');
                                        }}
                                        className="rounded-xl font-bold border-gray-200 hover:bg-gray-50 text-gray-700"
                                    >
                                        Try Another ID
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
            {/* Footer decoration */}
            <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-gray-50 to-transparent pointer-events-none -z-10" />
        </div>
    );
}
