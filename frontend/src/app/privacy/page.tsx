import { Lock, Clock, Eye, Database, Share2 } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-[#004aad] text-white py-16 sm:py-20">
                <div className="container-custom text-center">
                    <Lock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-[#ff7620]" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Privacy Policy</h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
                        We value your privacy. This policy explains how we collect, use, and protect your personal information.
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
                                    <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Information We Collect</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem] space-y-4">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We collect information that you provide directly to us, including:
                                </p>
                                <ul className="list-disc list-inside space-y-3 text-gray-600 ml-2 marker:text-[#ff7620]">
                                    <li className="pl-2"><span className="text-base sm:text-lg">Personal identification information (Name, email address, phone number, etc.)</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Account credentials (username and password)</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Payment information (processed securely by our payment providers)</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Communications you send to us</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We use the information we collect to operate, maintain, and provide the features of the Service, to communicate with you, to monitor and analyze our Service, and for compliance with legal obligations.
                                </p>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Sharing Your Information</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates, and advertisers.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Security</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
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
