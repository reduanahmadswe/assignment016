import { RefreshCw, Clock, DollarSign, AlertCircle, Phone } from 'lucide-react';

export default function RefundPolicy() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-[#004aad] text-white py-16 sm:py-20">
                <div className="container-custom text-center">
                    <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-[#ff7620]" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Refund Policy</h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
                        Our goal is your complete satisfaction. Learn about our refund guidelines and procedures below.
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
                                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Refund Eligibility</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem] space-y-4">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We offer refunds under the following circumstances:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2 marker:text-[#ff7620]">
                                    <li className="pl-2"><span className="text-base sm:text-lg">Event cancellation by the organizer.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Technical issues preventing access to purchased content, verified by our support team.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Duplicate payments for the same item.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Requests made within 24 hours of purchase, provided the content has not been accessed or consumed significantly.</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Non-Refundable Items</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    Certain items are non-refundable, including but not limited to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2 mt-2 marker:text-[#ff7620]">
                                    <li className="pl-2"><span className="text-base sm:text-lg">Downloadable software products.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Services that have already been fully performed.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">Gift cards or promotional credits.</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Processing Refunds</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund. If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
                                </p>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Us</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    If you have any questions about our Refund Policy, please contact us at <a href="mailto:team.oriyet@gmail.com" className="text-[#004aad] hover:underline font-medium">team.oriyet@gmail.com</a>.
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
