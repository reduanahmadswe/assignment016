import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// We'll use local font definitions or google fonts class names if configured
// For now, assuming standard Tailwind sans/serif stacks, but styling to match.

interface CertificateProps {
    data: {
        userName: string;
        eventTitle: string;
        eventType?: string;
        issueDate: string;
        certificateId: string;
        organization?: string;
    };
    qrData: string;
}

// Helper for Title Case
const toTitleCase = (str: string) => {
    return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

export const ClassicCertificate: React.FC<CertificateProps> = ({ data, qrData }) => {

    // Formatting name and date
    const formattedName = toTitleCase(data.userName);
    const dateObj = new Date(data.issueDate);
    const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden font-sans">
            {/* --- Background Image (Template) --- */}
            <img
                src="/images/oriyetcertificate.png"
                alt="Certificate Template"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* --- Overlay Content --- */}

            {/* 1. Recipient Name */}
            <div className="absolute top-[39%] left-0 w-full text-center z-10 px-8">
                <h2 className="font-script text-6xl text-[#1976D2] leading-none mb-4" style={{
                    fontFamily: "'Great Vibes', cursive",
                    textShadow: "1px 1px 1px rgba(0,0,0,0.1)"
                }}>
                    {formattedName}
                </h2>
            </div>

            {/* 2. Body Text (Event Title & Date) */}
            <div className="absolute top-[56%] left-0 w-full text-center z-10 px-16">
                <div className="text-gray-900 text-lg font-medium leading-relaxed max-w-6xl mx-auto">
                    For successfully completing the Online Class on
                    <span className="font-bold text-black mx-1">“{data.eventTitle}”</span>
                    on <span className="font-bold">{formattedDate}</span>
                </div>
            </div>

            {/* 3. Footer Content: Signatures & QR Code */}
            <div className="absolute bottom-[9%] left-0 w-full flex justify-between items-end px-20 z-10">

                {/* Left Signature - Dr. Rauful Alam */}
                <div className="flex flex-col items-center text-center w-72">
                    {/* Signature Text (Script) */}
                    <div className="h-10 mb-1 w-full relative flex items-center justify-center">
                        <span className="font-script text-4xl text-gray-800 transform -rotate-3" style={{ fontFamily: "'Great Vibes', cursive" }}>
                            Rauful Alam
                        </span>
                    </div>

                    {/* Dynamic Line */}
                    <div className="w-48 h-0.5 bg-[#fd7e14] mb-1 mx-auto opacity-80"></div>

                    <h4 className="font-bold text-[#004085] text-lg">Dr. Rauful Alam</h4>
                    <div className="text-xs text-gray-700 font-bold mt-0.5">Co-founder of ORIYET</div>
                    <div className="text-[10px] text-gray-600 leading-tight mt-0.5">
                        Staff Scientist,<br />
                        Center for Chemical Biology and Therapeutics,<br />
                        University of Chicago, USA
                    </div>
                </div>

                {/* Center - QR Code */}
                <div className="flex flex-col items-center pb-2">
                    <div className="bg-white p-1 border border-[#d4af37] shadow-sm rounded-sm">
                        <QRCodeSVG value={qrData} size={70} level="M" fgColor="#004085" />
                    </div>
                    <div className="text-[9px] mt-1 font-bold text-[#004085] tracking-widest uppercase">Scan to Verify</div>
                    <div className="text-[10px] font-bold text-[#004085] mt-1">{data.certificateId}</div>
                </div>

                {/* Right Signature - Gulam Sarwar Chuwdhury */}
                <div className="flex flex-col items-center text-center w-72">
                    {/* Signature Text (Script) */}
                    <div className="h-10 mb-1 w-full relative flex items-center justify-center">
                        <span className="font-script text-4xl text-gray-800 transform -rotate-6" style={{ fontFamily: "'Great Vibes', cursive" }}>
                            Gulam Sarwar
                        </span>
                    </div>

                    {/* Dynamic Line */}
                    <div className="w-48 h-0.5 bg-[#fd7e14] mb-1 mx-auto opacity-80"></div>

                    <h4 className="font-bold text-[#004085] text-lg">Gulam Sarwar Chuwdhury</h4>
                    <div className="text-xs text-gray-700 font-bold mt-0.5">Founder & CEO, CMBL Bangladesh.</div>
                    <div className="text-[10px] text-gray-600 leading-tight mt-0.5">
                        Graduate (Ph.D.) Research Assistant,<br />
                        Bioinformatics and Computational Biology,<br />
                        lowa State University, Ames, lowa, USA
                    </div>
                </div>
            </div>

        </div>
    );
};
