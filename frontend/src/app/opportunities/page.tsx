'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

import { ChevronLeft, ChevronRight, Briefcase, ServerCrash, RefreshCcw, MapPin, Clock, Calendar } from 'lucide-react';

interface Opportunity {
    id: number;
    slug: string;
    title: string;
    type: string;
    location: string;
    duration: string;
    deadline: string;
    description: string;
    banner?: string;
}

export default function OpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        fetchOpportunities();
    }, [currentPage]);

    const fetchOpportunities = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
            const data = await res.json();
            if (data.success) {
                setOpportunities(data.data.opportunities);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch opportunities', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">
                        Available Opportunities
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Explore internships, jobs, and fellowships to kickstart your career.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white h-[400px] rounded-lg shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl mx-auto text-center px-4">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-10 h-10 text-orange-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Opportunities Not Available
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto text-lg">
                            Stay tuned! New opportunities are coming soon. Check back later for exciting internships, jobs, and fellowships.
                        </p>
                    </div>
                ) : opportunities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-lg max-w-2xl mx-auto text-center px-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Opportunities Found</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            We currently don't have any open positions. Please check back later or explore our events.
                        </p>
                        <Link href="/events">
                            <Button variant="outline">Explore Events</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <p className="text-sm text-gray-500 font-medium">
                                Showing <span className="text-gray-900 font-bold">{opportunities.length}</span> active listings
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {opportunities.map((opp) => (
                                <Link key={opp.id} href={`/opportunities/${opp.slug}`} className="group h-full">
                                    <div className="relative overflow-hidden h-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1">

                                        {/* Image Section - Top - Compact Aspect Ratio */}
                                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                                            {opp.banner ? (
                                                <img
                                                    src={getImageUrl(opp.banner)}
                                                    alt={opp.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                    <Briefcase size={32} />
                                                </div>
                                            )}

                                            {/* Gradient Overlay on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                            {/* Logo/Brand - Top Left on Image */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300">
                                                    <div className="w-4 h-4 rounded-full bg-[#004aad] flex items-center justify-center group-hover:bg-[#0056cc] transition-colors duration-300">
                                                        <Briefcase className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[#004aad] tracking-wide">ORIYET</span>
                                                </div>
                                            </div>

                                            {/* Type Badge - Top Right on Image */}
                                            <div className="absolute top-2 right-2 z-10">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm group-hover:shadow-md transition-all duration-300 ${opp.type === 'INTERNSHIP'
                                                    ? 'bg-[#004aad]/90 text-white group-hover:bg-[#004aad]'
                                                    : 'bg-[#ff7620]/90 text-white group-hover:bg-[#ff7620]'
                                                    }`}>
                                                    {opp.type}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section - Bottom */}
                                        <div className="flex-1 flex flex-col p-4">
                                            {/* Title */}
                                            <h3 className="text-base font-bold leading-tight mb-1.5 text-gray-900 line-clamp-2">
                                                {opp.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
                                                {opp.description}
                                            </p>

                                            {/* Footer: Metadata */}
                                            <div className="space-y-1.5 pt-1 border-t border-gray-50/50">
                                                {opp.location && (
                                                    <div className="flex items-center text-[11px] font-medium text-gray-600">
                                                        <MapPin className="w-3 h-3 mr-1.5 text-[#004aad] flex-shrink-0" />
                                                        <span className="truncate">{opp.location}</span>
                                                    </div>
                                                )}

                                                {opp.duration && (
                                                    <div className="flex items-center text-[11px] font-medium text-gray-600">
                                                        <Clock className="w-3 h-3 mr-1.5 text-[#ff7620] flex-shrink-0" />
                                                        <span className="truncate">{opp.duration}</span>
                                                    </div>
                                                )}

                                                {opp.deadline && (
                                                    <div className="flex items-center justify-between mt-2 pt-1">
                                                        <div className="flex items-center text-[10px] font-semibold text-gray-500">
                                                            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                            {new Date(opp.deadline).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[#004aad] font-bold text-[10px]">
                                                            <span className="uppercase tracking-wide">Apply Now</span>
                                                            <ChevronRight className="w-3 h-3" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-4">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    className="border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    <ChevronLeft size={16} className="mr-2" /> Previous
                                </Button>
                                <span className="text-gray-600 font-medium px-4">
                                    Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    className="border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                                >
                                    Next <ChevronRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
