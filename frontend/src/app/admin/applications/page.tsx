'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { Mail, ExternalLink, Briefcase } from 'lucide-react';

interface Application {
    id: number;
    name: string;
    email: string;
    phone: string;
    cvLink: string;
    imageLink: string;
    portfolioLink: string;
    status: string;
    createdAt: string;
    opportunity: {
        id: number;
        title: string;
        type: string;
    }
}

interface Opportunity {
    id: number;
    title: string;
    type: string;
    location: string;
    deadline: string;
    _count?: {
        applications: number;
    }
}

export default function AdminApplicationsPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectedOpportunityId, setSelectedOpportunityId] = useState<number | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingApplications, setLoadingApplications] = useState(false);

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities?limit=1000`, {
                headers: { 'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setOpportunities(data.data.opportunities || []);
            }
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicationsByOpportunity = async (opportunityId: number) => {
        setLoadingApplications(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/applications`, {
                headers: { 'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                // Filter applications by selected opportunity
                const filteredApps = data.data.filter((app: Application) => app.opportunity.id === opportunityId);
                setApplications(filteredApps);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoadingApplications(false);
        }
    };

    const handleOpportunitySelect = (opportunityId: number) => {
        setSelectedOpportunityId(opportunityId);
        fetchApplicationsByOpportunity(opportunityId);
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Applications Details</h1>
                <p className="text-gray-600">Select an opportunity to view its applications</p>
            </div>

            {/* Opportunity Selection */}
            {!selectedOpportunityId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {opportunities.map((opportunity) => (
                        <div
                            key={opportunity.id}
                            onClick={() => handleOpportunitySelect(opportunity.id)}
                            className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Gradient Accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300 shadow-sm">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                                <Badge size="sm" variant="primary" className="text-xs">{opportunity.type}</Badge>
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-base text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                {opportunity.title}
                            </h3>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {opportunity.location}
                                </span>
                                {opportunity._count && (
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                        {opportunity._count.applications} {opportunity._count.applications === 1 ? 'App' : 'Apps'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {opportunities.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No opportunities found.
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Back Button & Selected Opportunity Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 shadow-sm">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedOpportunityId(null);
                                        setApplications([]);
                                    }}
                                    className="bg-white hover:bg-gray-50"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Opportunities
                                </Button>
                                <Badge className="text-xs">{opportunities.find(o => o.id === selectedOpportunityId)?.type}</Badge>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                    <Briefcase className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                                        {opportunities.find(o => o.id === selectedOpportunityId)?.title}
                                    </h2>
                                    <p className="text-xs text-gray-600 flex items-center gap-2">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            {applications.length} {applications.length === 1 ? 'Application' : 'Applications'}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {opportunities.find(o => o.id === selectedOpportunityId)?.location}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Applications Table */}
                    {loadingApplications ? (
                        <Loading />
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Links</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {applications.map((app, index) => (
                                            <tr key={app.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                                            {app.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-sm text-gray-900">{app.name}</div>
                                                            <div className="text-xs text-gray-500">{app.email}</div>
                                                            {app.phone && <div className="text-xs text-gray-400">{app.phone}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <a
                                                            href={app.cvLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            CV / Resume
                                                        </a>
                                                        {app.imageLink && (
                                                            <a
                                                                href={app.imageLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                Photo
                                                            </a>
                                                        )}
                                                        {app.portfolioLink && (
                                                            <a
                                                                href={app.portfolioLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                Portfolio
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(app.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.location.href = `mailto:${app.email}?subject=Regarding your application for ${app.opportunity.title}`}
                                                        className="text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                                                    >
                                                        <Mail size={14} className="mr-1.5" />
                                                        Email
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {applications.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">No applications yet</p>
                                                            <p className="text-xs text-gray-500 mt-1">Applications for this opportunity will appear here</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>
        </div>
    );
}
