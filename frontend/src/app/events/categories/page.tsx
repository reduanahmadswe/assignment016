'use client';

import Link from 'next/link';
import {
    Dna,
    Atom,
    BookOpen,
    GraduationCap,
    Microscope,
    Globe2,
    FlaskConical,
    Trophy,
    ArrowRight,
    MessageCircle
} from 'lucide-react';

const categories = [
    {
        id: 'bioinformatics',
        name: 'Bioinformatics & Bio-Comp',
        description: 'Explore computational biology, genomics, and data analysis in life sciences with global experts.',
        icon: Dna,
        color: 'bg-[#004aad]/10 text-[#004aad]',
        count: 12
    },
    {
        id: 'nanotechnology',
        name: 'Nanotechnology & Materials',
        description: 'Dive into advanced nano-materials, heat transfer, and energy storage applications.',
        icon: Atom,
        color: 'bg-[#ff7620]/10 text-[#ff7620]',
        count: 8
    },
    {
        id: 'research',
        name: 'Research & Publications',
        description: 'Learn research methodology, academic writing, and publishing in high-impact journals.',
        icon: BookOpen,
        color: 'bg-[#004aad]/10 text-[#004aad]',
        count: 15
    },
    {
        id: 'higher-studies',
        name: 'Higher Studies & Career',
        description: 'Guidance on PhD/Masters abroad, scholarships, and global career opportunities.',
        icon: GraduationCap,
        color: 'bg-[#ff7620]/10 text-[#ff7620]',
        count: 20
    },
    {
        id: 'biomedical',
        name: 'Biomedical Science',
        description: 'Workshops on public health, immunology, and clinical research advancements.',
        icon: Microscope,
        color: 'bg-[#004aad]/10 text-[#004aad]',
        count: 10
    },
    {
        id: 'engineering',
        name: 'Engineering & Tech',
        description: 'Technical seminars on software, AI, and emerging engineering technologies.',
        icon: Globe2,
        color: 'bg-[#ff7620]/10 text-[#ff7620]',
        count: 18
    },
    {
        id: 'chemistry',
        name: 'Applied Chemistry',
        description: 'Sessions on chemical engineering, pharmaceuticals, and industrial chemistry.',
        icon: FlaskConical,
        color: 'bg-[#004aad]/10 text-[#004aad]',
        count: 7
    },
    {
        id: 'skills',
        name: 'Skill Development',
        description: 'Soft skills, leadership, and professional development for young researchers.',
        icon: Trophy,
        color: 'bg-[#ff7620]/10 text-[#ff7620]',
        count: 25
    }
];

export default function CategoriesPage() {
    return (
        <div className="min-h-screen bg-gray-50 relative overflow-hidden py-16 sm:py-20 lg:py-24">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#004aad]/5 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] bg-[#ff7620]/5 rounded-full blur-3xl -mr-20 -mt-20 md:-mr-40 md:-mt-40 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] bg-[#004aad]/5 rounded-full blur-3xl -ml-20 -mb-20 md:-ml-40 md:-mb-40 pointer-events-none" />

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="text-center mb-12 sm:mb-16">
                    <div className="inline-block p-1.5 px-4 rounded-full bg-[#004aad]/10 text-[#004aad] font-bold text-xs uppercase tracking-wider mb-4 border border-[#004aad]/20">
                        Academic & Research Events
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#004aad] mb-6 leading-tight">
                        Explore Event Categories
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Discover specialized workshops and seminars designed to empower researchers and students globally.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                href={`/events?category=${category.id}`}
                                key={category.id}
                                className="group block bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-100 hover:border-[#004aad]/30 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                            >
                                {/* Animated Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#004aad]/0 via-[#004aad]/0 to-[#004aad]/0 group-hover:from-[#004aad]/5 group-hover:via-transparent group-hover:to-[#ff7620]/5 transition-all duration-500"></div>

                                {/* Decorative Circle */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100/50 to-transparent rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className={`w-14 h-14 rounded-2xl ${category.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md`}>
                                            <Icon className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" />
                                        </div>
                                        {/* Event Count Badge */}
                                        <div className="px-3 py-1 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-[#004aad]/10 group-hover:border-[#004aad]/10 text-gray-500 group-hover:text-[#004aad] text-xs font-bold transition-all duration-300">
                                            {category.count} events
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#004aad] transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300 h-[60px]">
                                        {category.description}
                                    </p>

                                    <div className="flex items-center text-[#ff7620] font-bold text-xs uppercase tracking-wide transition-all duration-300">
                                        <span className="group-hover:mr-1 transition-all duration-300">Browse Category</span>
                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 sm:mt-24 relative overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-blue-100">
                    <div className="absolute inset-0 bg-[#004aad]"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#ff7620]/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-blue-100 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                            We are constantly updating our event list with new workshops, seminars, and research opportunities.
                            Check out our full schedule to find the perfect match for your academic journey.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/events" className="w-full sm:w-auto">
                                <div className="group relative px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#ff7620] to-[#ff8c42] hover:from-[#e06516] hover:to-[#ff7620] shadow-lg shadow-[#ff7620]/30 hover:shadow-xl hover:shadow-[#ff7620]/40 transform hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex items-center justify-center">
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Browse All Events
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </div>
                            </Link>
                            <Link href="/contact" className="w-full sm:w-auto">
                                <div className="group px-8 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10 cursor-pointer">
                                    Contact Support
                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
