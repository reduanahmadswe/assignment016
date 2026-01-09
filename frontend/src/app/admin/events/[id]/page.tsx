'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
    Calendar,
    Users,
    CreditCard,
    MapPin,
    Clock,
    Edit,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Video
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Loading, Badge, Button, Modal, Input } from '@/components/ui';
import { toast } from 'react-hot-toast';

export default function AdminEventDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;
    const queryClient = useQueryClient();

    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [videoLink, setVideoLink] = useState('');
    const [realEventId, setRealEventId] = useState<number | null>(null);

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['admin-event-stats', eventId],
        queryFn: async () => {
            const response = await adminAPI.getEventStats(eventId);
            return response.data?.data;
        },
        enabled: !!eventId,
    });

    const { event, statistics } = statsData || {};

    useEffect(() => {
        if (event) {
            setRealEventId(event.id);
            if (event.videoLink) setVideoLink(event.videoLink);
        }
    }, [event]);

    const updateVideoMutation = useMutation({
        mutationFn: async (link: string) => {
            if (!realEventId) throw new Error("Event ID not available");
            await adminAPI.updateEvent(realEventId, { videoLink: link });
        },
        onSuccess: () => {
            toast.success('Video link saved successfully');
            setIsVideoModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-event-stats', eventId] });
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || error.message || 'Unable to save video link. Please try again.';
            toast.error(message);
        }
    });

    const handleVideoSave = () => {
        updateVideoMutation.mutate(videoLink);
    };

    if (isLoading) {
        return <Loading text="Loading event details..." />;
    }

    if (!statsData?.event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Event not found</h2>
                <Button onClick={() => router.back()} variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Go Back
                </Button>
            </div>
        );
    }

    const kpiCards = [
        {
            label: 'Total Registrations',
            value: statistics?.total_registrations || 0,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            label: 'Confirmed',
            value: statistics?.confirmed || 0,
            icon: CheckCircle,
            color: 'bg-green-500',
        },
        {
            label: 'Total Revenue',
            value: formatCurrency(statistics?.total_revenue || 0),
            icon: CreditCard,
            color: 'bg-purple-500',
        },
        {
            label: 'Pending',
            value: statistics?.pending || 0,
            icon: Clock,
            color: 'bg-yellow-500',
        },
    ];

    return (
        <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                <div className="w-full md:w-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-700 mb-2 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Events
                    </button>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{event.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant={event.eventStatus === 'upcoming' ? 'primary' : event.eventStatus === 'ongoing' ? 'success' : 'secondary'} className="capitalize font-bold px-2.5 py-0.5">
                            {event.eventStatus}
                        </Badge>
                        <span className="text-sm font-medium text-gray-500 flex items-center bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            {formatDate(event.startDate)}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto mt-2 md:mt-0">
                    {event.eventStatus === 'completed' && (
                        <Button
                            variant="outline"
                            leftIcon={<Video className="w-4 h-4" />}
                            onClick={() => setIsVideoModalOpen(true)}
                            className="justify-center rounded-xl font-bold"
                        >
                            {event.videoLink ? 'Edit Recording' : 'Add Recording'}
                        </Button>
                    )}
                    <Link href={`/admin/events/${eventId}/edit`} className="w-full sm:w-auto">
                        <Button leftIcon={<Edit className="w-4 h-4" />} className="w-full justify-center rounded-xl font-bold bg-gray-900 text-white hover:bg-gray-800">
                            Edit Event
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kpiCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-[1.5rem] p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10 text-${stat.color.split('-')[1]}-600`}>
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Event Details */}
                <Card className="lg:col-span-2 rounded-[1.5rem] border-gray-100 overflow-hidden shadow-sm">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                        <CardTitle className="text-lg font-bold">Event Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date & Time</h3>
                                <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    {formatDate(event.startDate)} <span className="text-gray-400 mx-1">-</span> {formatDate(event.endDate)}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</h3>
                                <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {event.eventMode === 'online' ? 'Online Event' : JSON.parse(event.venueDetails || '{}').name || 'Venue TBA'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Registration Fee</h3>
                                <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                    {event.price > 0 ? formatCurrency(event.price) : 'Free'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Participants</h3>
                                <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {statistics.total_registrations} / <span className="text-gray-500">{event.maxParticipants || 'Unlimited'}</span>
                                </p>
                            </div>
                        </div>

                        {event.videoLink && (
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 mt-2">
                                <h3 className="text-sm font-bold text-purple-900 mb-1 flex items-center">
                                    <Video className="w-4 h-4 mr-2 text-purple-600" />
                                    Recording Link
                                </h3>
                                <p className="text-sm text-purple-700 truncate font-medium">
                                    <a href={event.videoLink} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                        {event.videoLink}
                                        <ArrowLeft className="w-3 h-3 rotate-180" />
                                    </a>
                                </p>
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-3">Description</h3>
                            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {event.description}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links / Actions */}
                <Card className="rounded-[1.5rem] border-gray-100 overflow-hidden shadow-sm h-fit">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                        <CardTitle className="text-lg font-bold">Management Action</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-6">
                        <Link href={`/admin/registrations?eventId=${eventId}`} className="block">
                            <Button variant="outline" className="w-full justify-start rounded-xl py-6 hover:bg-gray-50 border-gray-200" leftIcon={<Users className="w-5 h-5 text-gray-500" />}>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-900">View Registrations</span>
                                    <span className="block text-xs text-gray-500 font-medium mt-0.5">Manage attendee list</span>
                                </div>
                            </Button>
                        </Link>
                        <Link href={`/admin/events/${eventId}/edit`} className="block">
                            <Button variant="outline" className="w-full justify-start rounded-xl py-6 hover:bg-gray-50 border-gray-200" leftIcon={<Edit className="w-5 h-5 text-gray-500" />}>
                                <div className="text-left">
                                    <span className="block font-bold text-gray-900">Edit Event Details</span>
                                    <span className="block text-xs text-gray-500 font-medium mt-0.5">Update content & settings</span>
                                </div>
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={isVideoModalOpen}
                onClose={() => setIsVideoModalOpen(false)}
                title="Add Event Recording"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Recording URL
                        </label>
                        <Input
                            placeholder="https://youtube.com/..."
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            className="w-full rounded-xl"
                        />
                        <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                            Paste the link to the event recording (YouTube, Google Drive, etc.)
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setIsVideoModalOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVideoSave}
                            disabled={updateVideoMutation.isPending}
                            className="rounded-xl"
                        >
                            {updateVideoMutation.isPending ? 'Saving...' : 'Save Recording'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
