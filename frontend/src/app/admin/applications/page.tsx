'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Button from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { Mail, ExternalLink } from 'lucide-react';

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
        title: string;
        type: string;
    }
}

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/applications`, {
                headers: { 'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Applications Details</h1>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Applicant</th>
                            <th className="p-4 font-medium text-gray-500">Opportunity</th>
                            <th className="p-4 font-medium text-gray-500">Links</th>
                            <th className="p-4 font-medium text-gray-500">Date</th>
                            <th className="p-4 font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {applications.map(app => (
                            <tr key={app.id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    <div className="font-medium">{app.name}</div>
                                    <div className="text-sm text-gray-500">{app.email}</div>
                                    {app.phone && <div className="text-sm text-gray-500">{app.phone}</div>}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">{app.opportunity.title}</div>
                                    <Badge size="sm">{app.opportunity.type}</Badge>
                                </td>
                                <td className="p-4 space-y-1">
                                    <a href={app.cvLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                        <ExternalLink size={12} /> CV / Resume
                                    </a>
                                    {app.imageLink && (
                                        <a href={app.imageLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                            <ExternalLink size={12} /> Photo
                                        </a>
                                    )}
                                    {app.portfolioLink && (
                                        <a href={app.portfolioLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                                            <ExternalLink size={12} /> Portfolio
                                        </a>
                                    )}
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(app.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <Button size="sm" variant="outline" onClick={() => window.location.href = `mailto:${app.email}?subject=Regarding your application for ${app.opportunity.title}`}>
                                        <Mail size={16} className="mr-2" /> Email
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
