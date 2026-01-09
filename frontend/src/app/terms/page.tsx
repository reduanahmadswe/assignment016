import { Shield, Clock, FileText, CheckCircle } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-[#004aad] text-white py-16 sm:py-20">
                <div className="container-custom text-center">
                    <Shield className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-[#ff7620]" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Terms of Service</h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
                        Please read these terms carefully before using our platform. By accessing or using ORIYET, you agree to be bound by these terms.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container-custom py-12 sm:py-16">
                <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 max-w-4xl mx-auto">
                    <div className="space-y-10 sm:space-y-12">
                        {/* Section 1 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <span className="font-bold text-lg sm:text-xl">1</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    By accessing and using the ORIYET platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <span className="font-bold text-lg sm:text-xl">2</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Responsibilities</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem] space-y-4">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    As a user of the platform, you agree to:
                                </p>
                                <ul className="grid gap-3 sm:gap-4">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7620] mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600 text-base sm:text-lg">Provide accurate and complete registration information.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7620] mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600 text-base sm:text-lg">Maintain the security of your account credentials.</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff7620] mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-600 text-base sm:text-lg">Use the platform in compliance with all applicable laws and regulations.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <span className="font-bold text-lg sm:text-xl">3</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Intellectual Property</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    The Service and its original content, features, and functionality are and will remain the exclusive property of ORIYET and its licensors. The Service is protected by copyright, trademark, and other laws of both the Bangladesh and foreign countries.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <span className="font-bold text-lg sm:text-xl">4</span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Termination</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-12 sm:mt-16 pt-8 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: December 2025</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
