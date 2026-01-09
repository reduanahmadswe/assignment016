'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

import { CheckCircle } from 'lucide-react';

export default function OpportunityDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [opportunity, setOpportunity] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cvLink: '',
        imageLink: '',
        portfolioLink: '',
        phone: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        if (slug) fetchOpportunity();
    }, [slug]);

    const fetchOpportunity = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/${slug}`);
            const data = await res.json();
            if (data.success) {
                setOpportunity(data.data);
            } else {
                // If fallback to generic lookup fails, handle error
            }
        } catch (error) {
            console.error('Failed to fetch opportunity', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        setStatus(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/${slug}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setIsSubmitted(true);
                window.scrollTo(0, 0);
            } else {
                const msg = data.errors ? data.errors[0].message : data.message || 'Failed to submit application';
                setStatus({ type: 'error', message: msg });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loading /></div>;
    if (!opportunity) return (
        <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center items-center min-h-[50vh]">
            <Card className="p-12 text-center max-w-lg w-full">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🔍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Opportunity Not Found</h2>
                <p className="text-gray-500 mb-8">
                    The opportunity you are looking for might have been removed, closed, or the link is incorrect.
                </p>
                <Button variant="primary" onClick={() => router.push('/opportunities')}>
                    Browse All Opportunities
                </Button>
            </Card>
        </div>
    );

    if (isSubmitted) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={48} className="text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h2>
                    <p className="text-gray-600 text-lg mb-8 max-w-lg">
                        Thank you for applying to <strong>{opportunity.title}</strong>.
                        We have sent a confirmation email to <strong>{formData.email}</strong>.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => router.push('/opportunities')}>
                            Browse More Opportunities
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            View Details Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="p-8 mb-8">
                {opportunity.banner && (
                    <div className="w-full h-64 md:h-80 relative mb-8 rounded-lg overflow-hidden">
                        <img src={opportunity.banner} alt={opportunity.title} className="w-full h-full object-cover" />
                    </div>
                )}
                <div className="flex justify-between items-start mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">{opportunity.title}</h1>
                    <Badge variant="primary" size="md">{opportunity.type}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {opportunity.location && <p><strong>Location:</strong> {opportunity.location}</p>}
                    {opportunity.duration && <p><strong>Duration:</strong> {opportunity.duration}</p>}
                    {opportunity.deadline && <p><strong>Deadline:</strong> {new Date(opportunity.deadline).toLocaleDateString()}</p>}
                    <p><strong>Status:</strong> {opportunity.status}</p>
                </div>

                <div className="prose max-w-none mb-8">
                    <h3 className="text-xl font-semibold mb-2">Description</h3>
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{opportunity.description}</p>
                </div>

                {!showApply ? (
                    <Button className="w-full md:w-auto" size="lg" onClick={() => setShowApply(true)} disabled={opportunity.status !== 'open'}>
                        {opportunity.status === 'open' ? 'Apply Now' : 'Applications Closed'}
                    </Button>
                ) : (
                    <div className="mt-8 border-t pt-8">
                        <h3 className="text-2xl font-bold mb-6">Application Form</h3>
                        {status && <Alert variant={status.type} className="mb-4">{status.message}</Alert>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                                <Input
                                    label="Portfolio Link (Optional)"
                                    value={formData.portfolioLink}
                                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                                />
                            </div>

                            <Input
                                label="CV/Resume Link (Google Drive/Dropbox etc.)"
                                required
                                value={formData.cvLink}
                                onChange={(e) => setFormData({ ...formData, cvLink: e.target.value })}
                                placeholder="https://..."
                            />

                            <Input
                                label="Formal Photo Link"
                                required
                                value={formData.imageLink}
                                onChange={(e) => setFormData({ ...formData, imageLink: e.target.value })}
                                placeholder="https://..."
                            />

                            <div className="flex gap-4 mt-6">
                                <Button type="submit" isLoading={submitLoading}>Submit Application</Button>
                                <Button type="button" variant="outline" onClick={() => setShowApply(false)}>Cancel</Button>
                            </div>
                        </form>
                    </div>
                )}
            </Card>
        </div>
    );
}
