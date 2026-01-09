'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

import { ChevronLeft, ChevronRight, Briefcase, ServerCrash, RefreshCcw } from 'lucide-react';

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
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <ServerCrash className="w-10 h-10 text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Service Unavailable
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                            We are currently connecting to our secure backend servers. Please try again in a few moments.
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium mb-8 border border-blue-100">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                            </span>
                            System Status: Connecting...
                        </div>

                        <button
                            onClick={fetchOpportunities}
                            className="flex items-center gap-2 px-8 py-3 bg-[#004aad] hover:bg-[#003882] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#004aad]/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Retry Connection
                        </button>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {opportunities.map((opp) => (
                                <Card key={opp.id} padding="none" className="hover:shadow-lg transition-shadow bg-white flex flex-col justify-between overflow-hidden border border-gray-100 rounded-xl">
                                    {opp.banner && (
                                        <div className="relative h-48 w-full">
                                            <img src={opp.banner} alt={opp.title} className="w-full h-full object-cover" />
                                            <div className="absolute top-4 left-4">
                                                <Badge variant={opp.type === 'INTERNSHIP' ? 'primary' : 'secondary'} className="shadow-sm">
                                                    {opp.type}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-6 flex flex-col flex-grow">
                                        {!opp.banner && (
                                            <div className="mb-4">
                                                <Badge variant={opp.type === 'INTERNSHIP' ? 'primary' : 'secondary'}>
                                                    {opp.type}
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{opp.title}</h2>
                                        </div>

                                        {opp.deadline && (
                                            <p className="text-xs text-gray-500 mb-4 font-medium flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                                Deadline: {new Date(opp.deadline).toLocaleDateString()}
                                            </p>
                                        )}

                                        <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">{opp.description}</p>

                                        <div className="flex flex-col gap-2 mb-6 text-sm text-gray-500 mt-auto border-t border-gray-50 pt-4">
                                            {opp.location && <p className="flex items-center gap-2"><span className="w-4">📍</span> {opp.location}</p>}
                                            {opp.duration && <p className="flex items-center gap-2"><span className="w-4">⏱️</span> {opp.duration}</p>}
                                        </div>

                                        <Link href={`/opportunities/${opp.slug}`} className="w-full mt-2">
                                            <Button className="w-full justify-center bg-[#004aad] hover:bg-[#003882] text-white font-medium py-2.5 rounded-lg transition-all" variant="primary">
                                                View Details & Apply
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
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
