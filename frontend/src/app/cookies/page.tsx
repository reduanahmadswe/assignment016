import { Cookie, Clock, Settings, Info } from 'lucide-react';

export default function CookiePolicy() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-[#004aad] text-white py-16 sm:py-20">
                <div className="container-custom text-center">
                    <Cookie className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 text-[#ff7620]" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Cookie Policy</h1>
                    <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed px-4">
                        Understand how we use cookies to improve your experience on ORIYET.
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
                                    <Info className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What Are Cookies?</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    Cookies are small text files that are stored on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login, language, font size and other display preferences) over a period of time, so you don't have to keep re-entering them whenever you come back to the site or browse from one page to another.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">How We Use Cookies</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem] space-y-4">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We use cookies for the following purposes:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2 marker:text-[#ff7620]">
                                    <li className="pl-2"><span className="text-base sm:text-lg">To enable certain functions of the Service.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">To provide analytics and understand how our Service is used.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">To store your preferences.</span></li>
                                    <li className="pl-2"><span className="text-base sm:text-lg">To enable advertisements delivery, including behavioral advertising.</span></li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Cookie className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Types of Cookies We Use</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem] space-y-4">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    We use both session and persistent cookies on the Service and we use different types of cookies to run the Service:
                                </p>
                                <div className="grid sm:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#004aad]/20 transition-colors">
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg">Essential</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Strictly necessary for the website to function properly.</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#004aad]/20 transition-colors">
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg">Performance</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Help us understand how visitors interact with the website.</p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-[#004aad]/20 transition-colors">
                                        <h3 className="font-bold text-gray-900 mb-2 text-lg">Functionality</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">Remember your choices to provide enhanced features.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 sm:gap-4 mb-2">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#004aad]/10 flex items-center justify-center text-[#004aad] shrink-0">
                                    <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Managing Cookies</h2>
                            </div>
                            <div className="pl-0 sm:pl-[4rem]">
                                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                                    You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.
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
