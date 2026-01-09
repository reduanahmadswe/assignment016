'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqs = [
    {
        question: "How do I register for an event?",
        answer: "You can register for any event by creating a free account on ORIYET. Simply browse our 'Events' page, select the workshop or webinar you're interested in, and click 'Register'. You'll be guided through the payment process if it's a paid event."
    },
    {
        question: "How will I receive the Zoom link?",
        answer: "After successful registration, the Zoom link will be sent to your registered email address. You can also find the joining link in your 'Dashboard' under 'My Events' 30 minutes before the session starts."
    },
    {
        question: "Will I receive a certificate after completion?",
        answer: "Yes! All participants who attend the full session will receive a verifiable digital certificate. You can download it directly from your dashboard after the event concludes."
    },
    {
        question: "Are the events free or paid?",
        answer: "ORIYET offers both free and paid events. The pricing details are clearly mentioned on each event's description page. We aim to keep our premium research workshops affordable for students."
    },
    {
        question: "Can I access the recording if I miss the live session?",
        answer: "In most cases, yes. Registered participants get access to the recorded session for a limited time via their dashboard. Check the specific event details to confirm availability."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept major online payment methods, including credit/debit cards and mobile banking (bKash, Nagad), to ensure a smooth transaction process for local and international learners."
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-gray-50 py-16 sm:py-24">
            <div className="container-custom max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-blue-50 rounded-2xl text-[#004aad] shadow-sm transform rotate-3">
                            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#004aad] mb-4 sm:mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        Have questions? We're here to help. Find answers to the most common queries below.
                    </p>
                </div>

                {/* FAQs Accordion */}
                <div className="space-y-4 sm:space-y-5">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === index
                                ? 'border-[#004aad] shadow-lg shadow-[#004aad]/5 ring-1 ring-[#004aad]/20'
                                : 'border-gray-200 hover:border-[#004aad]/30 hover:shadow-md'
                                }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-5 py-5 sm:px-8 sm:py-6 flex items-start sm:items-center justify-between text-left focus:outline-none gap-4"
                            >
                                <span className={`font-bold text-base sm:text-lg leading-snug ${openIndex === index ? 'text-[#004aad]' : 'text-gray-900'}`}>
                                    {faq.question}
                                </span>
                                <span className={`p-1.5 rounded-full shrink-0 transition-all duration-300 ${openIndex === index ? 'bg-blue-50 text-[#004aad] rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </span>
                            </button>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-5 pb-6 sm:px-8 sm:pb-8 text-gray-600 text-base leading-relaxed border-t border-gray-100 pt-4 mt-2">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Support CTA */}
                <div className="mt-16 sm:mt-20 bg-[#004aad] rounded-[2rem] p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff7620]/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-4">Still have questions?</h3>
                        <p className="text-blue-100 mb-8 text-base sm:text-lg leading-relaxed">
                            Can't find the answer you're looking for? Please chat to our friendly team.
                        </p>
                        <Link href="/contact" className="inline-block">
                            <div className="bg-[#ff7620] hover:bg-[#e06516] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-[#e06516]/30 inline-flex items-center gap-2 hover:-translate-y-1 cursor-pointer">
                                <MessageCircle className="w-5 h-5" />
                                Contact Support
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
