'use client';

import Link from 'next/link';
import { Search, UserPlus, CreditCard, Video, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HowItWorksPage() {
    const steps = [
        {
            id: 1,
            title: 'Discover Research Events',
            description: 'Browse our curated list of scientific webinars, workshops, and conferences in Bioinformatics, Nanotech, and more.',
            icon: Search,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            id: 2,
            title: 'Register Online',
            description: 'Create your account and secure your seat. We support easy local payments (bKash/Nagad) for paid workshops.',
            icon: UserPlus,
            color: 'bg-orange-50 text-orange-600',
        },
        {
            id: 3,
            title: 'Receive Zoom Link',
            description: 'Check your email or dashboard. We send the exclusive Zoom joining link directly to you before the session starts.',
            icon: Video,
            color: 'bg-green-50 text-green-600',
        },
        {
            id: 4,
            title: 'Attend Live Session',
            description: 'Join the live class, interact with global professors, ask questions, and engage in panel discussions.',
            icon: Video,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            id: 5,
            title: 'Get Verified Certificate',
            description: 'Upon completion, instantly download your certificate to showcase your new skills on your CV and LinkedIn.',
            icon: Award,
            color: 'bg-pink-50 text-pink-600',
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-20 md:py-24 bg-[#004aad] overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-white/5 blur-3xl"></div>
                    <div className="absolute top-20 left-20 w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-[#ff7620]/10 blur-3xl"></div>
                </div>

                <div className="relative container-custom text-center text-white">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                        Your Learning Journey <br className="hidden sm:block" /> Made Simple
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
                        ORIYET connects you with top-tier educational events in just a few clicks. Here is how you can start upskilling today.
                    </p>
                    <div className="flex justify-center">
                        <Link href="/events" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto bg-[#ff7620] hover:bg-[#e06516] text-white border-none shadow-lg shadow-[#ff7620]/20 px-8 py-6 text-lg rounded-xl h-auto">
                                Browse Events
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Steps Diagram Section */}
            <section className="py-16 sm:py-24 bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12 sm:mb-16">
                        <span className="text-[#ff7620] font-bold tracking-wider text-sm uppercase mb-2 block">Process</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How ORIYET Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            We've streamlined the process so you can focus on what matters most—learning and growing.
                        </p>
                    </div>

                    <div className="relative">
                        {/* Vertical Line for Mobile/Tablet */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 lg:hidden"></div>
                        {/* Horizontal Line for Desktop */}
                        <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-0.5 bg-gray-200 w-[85%] mx-auto -z-10"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-8 relative z-10">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={step.id} className="relative flex lg:flex-col items-start lg:items-center group">
                                        {/* Icon Circle */}
                                        <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg mb-0 lg:mb-6 transition-transform duration-300 group-hover:scale-110 relative z-10
                      ${index % 2 === 0 ? 'bg-white border-2 border-[#004aad]/10' : 'bg-white border-2 border-[#ff7620]/10'}
                    `}>
                                            <Icon className={`w-7 h-7 ${index % 2 === 0 ? 'text-[#004aad]' : 'text-[#ff7620]'}`} />

                                            {/* Step Number Badge */}
                                            <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs border-2 border-white shadow-sm">
                                                {step.id}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="ml-6 lg:ml-0 lg:text-center pt-2 lg:pt-0">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 lg:mb-3">{step.title}</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Feature Section */}
            <section className="py-16 sm:py-24 bg-white overflow-hidden">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div className="relative order-2 lg:order-1">
                            <div className="absolute inset-0 bg-blue-50 rounded-[2rem] transform rotate-3 scale-105"></div>
                            <div className="relative bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                                        <Award className="w-7 h-7 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Verified Certificate</h4>
                                        <p className="text-sm text-gray-500">Issued by ORIYET Research</p>
                                    </div>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="h-3 bg-gray-100 rounded-full w-3/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded-full w-full animate-pulse delay-75"></div>
                                    <div className="h-3 bg-gray-100 rounded-full w-5/6 animate-pulse delay-150"></div>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="text-xs font-mono text-gray-400">ID: ABC-12345678</div>
                                    <div className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">Valid</div>
                                </div>
                            </div>

                            {/* Floating Checkmark Badge */}
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#004aad] flex items-center justify-center text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">100% Verified</div>
                                        <div className="text-xs text-gray-500">Global Standard</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <div className="inline-block p-2 px-4 rounded-full bg-[#004aad]/10 text-[#004aad] font-bold text-xs uppercase tracking-wider mb-4">
                                Why Choose Us
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                                Why Choose <span className="text-[#004aad]">ORIYET</span>?
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                We are more than just an event platform. We are a community dedicated to fostering scientific research and innovation among the youth.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: 'Curated Events', desc: 'We verify every organizer to ensure high-quality learning experiences.', icon: Search, color: 'blue' },
                                    { title: 'Seamless Experience', desc: 'From registration to certification, everything is handled on one platform.', icon: Video, color: 'orange' },
                                    { title: 'Community Focused', desc: 'Connect with like-minded learners and expand your professional network.', icon: UserPlus, color: 'purple' }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className={`w-12 h-12 rounded-2xl bg-${feature.color}-50 flex items-center justify-center shrink-0 group-hover:bg-${feature.color}-100 transition-colors`}>
                                            <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 text-lg">{feature.title}</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 bg-gray-50">
                <div className="container-custom text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-[#004aad] leading-tight">
                            Ready to Start Researching?
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
                            Join ORIYET today and unlock access to expert-led workshops and global research opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register" className="w-full sm:w-auto">
                                <div className="group relative px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e06516] hover:to-[#ff7620] shadow-xl shadow-[#ff7620]/30 hover:shadow-2xl hover:shadow-[#ff7620]/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center cursor-pointer overflow-hidden">
                                    <span className="relative z-10 flex items-center">
                                        Create Free Account
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </div>
                            </Link>
                            <Link href="/events" className="w-full sm:w-auto">
                                <div className="group px-8 py-4 rounded-xl font-bold text-[#004aad] bg-white border-2 border-[#004aad]/20 hover:border-[#004aad] hover:bg-gradient-to-r hover:from-[#004aad]/5 hover:to-[#004aad]/10 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-[#004aad]/20 hover:-translate-y-1 flex items-center justify-center gap-2 cursor-pointer">
                                    Browse Events
                                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all duration-300" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
