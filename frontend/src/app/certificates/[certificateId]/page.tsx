'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toJpeg } from 'html-to-image';
import {
    Download,
    Share2,
    CheckCircle,
    FileImage,
    ArrowLeft,
    Linkedin,
    Facebook,
    Twitter,
    AlertCircle
} from 'lucide-react';
import { certificateAPI } from '@/lib/api';
import { Button, Loading } from '@/components/ui';
import { ClassicCertificate } from '@/components/certificate/CertificateTemplates';

export default function CertificateViewPage() {
    const params = useParams();
    const certificateId = params.certificateId as string;
    const certificateRef = useRef<HTMLDivElement>(null);

    const { data: certificate, isLoading, error } = useQuery({
        queryKey: ['certificate', certificateId],
        queryFn: async () => {
            const response = await certificateAPI.getById(certificateId);
            return response.data.data;
        },
        enabled: !!certificateId,
    });

    const handleDownload = () => {
        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/certificates/download/${certificateId}`, '_blank');
    };

    const handleDownloadJpg = useCallback(() => {
        if (certificateRef.current === null) {
            return;
        }

        toJpeg(certificateRef.current, {
            quality: 1.0,
            pixelRatio: 3,
            backgroundColor: 'white',
            style: { margin: '0' }
        })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `certificate-${certificateId}.jpg`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('oops, something went wrong!', err);
            });
    }, [certificateRef, certificateId]);

    if (isLoading) {
        return <Loading fullScreen text="Loading certificate..." />;
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 sm:p-12 text-center max-w-lg w-full ring-1 ring-gray-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">Certificate Not Found</h2>
                    <p className="text-gray-500 mb-8 text-lg">We couldn't find the certificate you're looking for. It may have been removed or the ID is incorrect.</p>
                    <Link href="/dashboard">
                        <Button className="w-full bg-[#004aad] hover:bg-[#003366] text-white font-bold rounded-xl py-4 h-auto text-base shadow-lg shadow-blue-900/20">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Data for templates
    const certData = {
        userName: certificate.user_name,
        eventTitle: certificate.event_title,
        eventType: certificate.event_type,
        issueDate: certificate.event?.endDate || certificate.issued_at,
        certificateId: certificateId,
        organization: "ORIYET"
    };

    const qrData = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificateId}`;

    return (
        <div className="min-h-screen bg-gray-100/50 py-8 sm:py-12 px-4 sm:px-6 font-sans relative">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700&display=swap');
                .font-script { font-family: 'Great Vibes', cursive; }
                .font-serif { font-family: 'Playfair Display', serif; }
                .font-sans { font-family: 'Montserrat', sans-serif; }
            `}</style>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#f8fafc] -z-10"></div>

            <div className="max-w-6xl mx-auto">
                {/* Actions Bar */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6 no-print">
                    <Link
                        href="/certificates"
                        className="group inline-flex items-center text-gray-500 hover:text-[#004aad] transition-colors font-bold text-sm bg-white px-4 py-2.5 rounded-xl border border-gray-200 hover:border-blue-200 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to My Certificates
                    </Link>

                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        <Button
                            variant="outline"
                            onClick={handleDownloadJpg}
                            className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 font-bold rounded-xl py-3 px-6 h-auto shadow-sm w-full sm:w-auto"
                        >
                            <FileImage className="w-4 h-4 mr-2 text-gray-500" />
                            Download as Image
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownload}
                            className="bg-[#004aad] hover:bg-[#003366] text-white font-bold rounded-xl py-3 px-6 h-auto shadow-lg shadow-blue-900/20 border-0 w-full sm:w-auto"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Certificate Container */}
                <div className="bg-white rounded-md shadow-2xl p-2 sm:p-4 md:p-8 overflow-hidden mx-auto max-w-5xl ring-1 ring-black/5">
                    <div className="relative w-full aspect-[1.414/1] overflow-hidden bg-white" ref={certificateRef}>
                        <div className="transform origin-top-left w-full h-full scale-[1] sm:scale-100">
                            <ClassicCertificate
                                data={certData}
                                qrData={qrData}
                                signatures={{
                                    signature1Name: certificate.event?.signature1Name,
                                    signature1Title: certificate.event?.signature1Title,
                                    signature1Image: certificate.event?.signature1Image,
                                    signature2Name: certificate.event?.signature2Name,
                                    signature2Title: certificate.event?.signature2Title,
                                    signature2Image: certificate.event?.signature2Image,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Verification Link */}
                <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm max-w-2xl mx-auto text-center no-print">
                    <p className="text-sm text-gray-500 font-medium mb-2 uppercase tracking-wide">Verification URL</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-gray-50 rounded-xl p-3 border border-dashed border-gray-200">
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                        <Link href={`/verify/${certificateId}`} className="text-[#004aad] hover:underline font-bold text-sm sm:text-base break-all">
                            {typeof window !== 'undefined' ? window.location.origin : 'oriyet.com'}/verify/{certificateId}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
