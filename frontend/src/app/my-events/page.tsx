'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    MapPin,
    Clock,
    Video,
    Award,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    PlayCircle,
    ArrowRight
} from 'lucide-react';
import { eventAPI, certificateAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { formatDate, formatDateTime, getImageUrl, getEventTypeLabel } from '@/lib/utils';
import { Badge, Button, Loading, Tabs, Modal, Card, CardContent } from '@/components/ui';

export default function MyEventsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.push('/login?redirect=/my-events');
        }
    }, [isAuthenticated, router]);

    // Fetch user's registered events
    const { data: myEvents, isLoading, error } = useQuery({
        queryKey: ['my-events'],
        queryFn: async () => {
            try {
                const response = await eventAPI.getMyEvents();
                return response.data.data;
            } catch (err) {
                console.error("Error fetching my events", err);
                return { upcoming: [], past: [], cancelled: [] };
            }
        },
        enabled: isAuthenticated,
    });

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        try {
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const youtubeMatch = url.match(youtubeRegex);
            if (youtubeMatch) {
                return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
            }
            if (url.includes('drive.google.com') && url.includes('/view')) {
                return url.replace('/view', '/preview');
            }
            return url;
        } catch (e) { return url; }
    };

    if (!isAuthenticated) {
        return <Loading fullScreen text="Verifying session..." />;
    }

    if (isLoading) {
        return <Loading fullScreen text="Loading your events..." />;
    }

    const handleGenerateCertificate = async (event: any) => {
        if (!event.registration_id) return;

        try {
            setGeneratingId(event.id);
            await certificateAPI.generate(event.registration_id);
            queryClient.invalidateQueries({ queryKey: ['my-events'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
        } catch (error) {
            console.error('Failed to generate certificate', error);
        } finally {
            setGeneratingId(null);
        }
    };

    const renderEventCard = (event: any, status: string) => {
        const isOnline = event.event_type === 'online' || event.event_type === 'hybrid';
        const hasCertificate = event.certificate_available;
        const certificateId = event.certificate_id;
        const isEligibleForCert = status === 'completed' || (event.eventStatus === 'completed');
        const videoLink = event.videoLink || event.video_link;

        return (
            <div key={event.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col lg:flex-row h-full">
                    {/* Thumbnail */}
                    <Link href={`/events/${event.slug}`} className="w-full lg:w-72 h-48 lg:h-auto lg:min-h-[220px] relative bg-gray-100 block shrink-0 overflow-hidden">
                        <Image
                            src={event.thumbnail ? getImageUrl(event.thumbnail) : '/images/event-placeholder.svg'}
                            alt={event.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Status Badge Over Image */}
                        <div className="absolute top-3 left-3 z-10 block lg:hidden">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${status === 'confirmed' ? 'bg-emerald-500 text-white' :
                                status === 'pending' ? 'bg-amber-500 text-white' :
                                    'bg-gray-500 text-white'
                                }`}>
                                {status === 'confirmed' ? 'Registered' : status}
                            </span>
                        </div>
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 capitalize">
                                        {getEventTypeLabel(event.event_type)}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                        {event.category}
                                    </span>
                                </div>
                                {/* Status Badge Desktop */}
                                <div className="hidden lg:block">
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                        status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {status === 'confirmed' ? 'Registered' : status}
                                    </span>
                                </div>
                            </div>

                            <Link href={`/events/${event.slug}`} className="group/title block mb-3">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover/title:text-[#004aad] transition-colors line-clamp-2 leading-snug">
                                    {event.title}
                                </h3>
                            </Link>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-6">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium">{formatDateTime(event.start_date || event.startDate)}</span>
                                </div>
                                {event.event_type === 'offline' && (
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mr-3 flex-shrink-0">
                                            <MapPin className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="font-medium truncate">{event.venue || 'Venue TBD'}</span>
                                    </div>
                                )}
                                {isOnline && (
                                    <div className="flex items-center sm:col-span-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 flex-shrink-0">
                                            <Video className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        {status === 'confirmed' && event.meeting_link ? (
                                            <a href={event.meeting_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline flex items-center">
                                                Join Meeting <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-500 italic text-xs sm:text-sm">Link available after confirmation</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
                            <Link
                                href={`/events/${event.slug}`}
                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm order-2 sm:order-1"
                            >
                                View Details
                            </Link>

                            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2 sm:ml-auto w-full sm:w-auto">
                                {status === 'completed' && videoLink && (
                                    <button
                                        onClick={() => setPlayingVideo(getEmbedUrl(videoLink))}
                                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 border border-transparent rounded-xl hover:bg-red-100 transition-all w-full sm:w-auto"
                                    >
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Watch Recording
                                    </button>
                                )}

                                {hasCertificate && (event.eventStatus === 'completed' || status === 'completed') && (
                                    <>
                                        {certificateId ? (
                                            <Link
                                                href={`/certificates/${certificateId}`}
                                                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-purple-600 bg-purple-50 border border-transparent rounded-xl hover:bg-purple-100 transition-all w-full sm:w-auto"
                                            >
                                                <Award className="w-4 h-4 mr-2" />
                                                View Certificate
                                            </Link>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                isLoading={generatingId === event.id}
                                                disabled={status !== 'completed' && event.registration_status !== 'confirmed'}
                                                onClick={() => handleGenerateCertificate(event)}
                                                className="w-full sm:w-auto bg-[#ff7620] hover:bg-[#e06516] text-white border-0 font-bold py-2.5 rounded-xl"
                                            >
                                                <Award className="w-4 h-4 mr-2" />
                                                Get Certificate
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const upcomingEvents = myEvents?.upcoming || [];
    const pastEvents = myEvents?.past || [];

    const tabItems = [
        {
            id: 'upcoming',
            label: `Upcoming (${upcomingEvents.length})`,
            content: (
                <div className="space-y-6 pt-6">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event: any) => renderEventCard(event, event.registration_status || 'confirmed'))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Calendar className="w-10 h-10 text-blue-500" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No upcoming events</h3>
                            <p className="text-gray-500 mb-8 max-w-sm text-base md:text-lg">
                                You haven't registered for any upcoming events yet. Browse our events to start learning!
                            </p>
                            <Link href="/events">
                                <Button size="lg" className="bg-[#ff7620] hover:bg-[#e06516] text-white border-none rounded-xl px-8 py-3 h-auto text-lg hover:-translate-y-1 shadow-lg shadow-orange-500/20">
                                    Browse Events <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            ),
        },
        {
            id: 'past',
            label: `Past Events (${pastEvents.length})`,
            content: (
                <div className="space-y-6 pt-6">
                    {pastEvents.length > 0 ? (
                        pastEvents.map((event: any) => renderEventCard(event, 'completed'))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Clock className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">No past events</h3>
                            <p className="text-gray-500 text-base md:text-lg">You haven't attended any events yet.</p>
                        </div>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="bg-gray-50/50 min-h-screen py-10 sm:py-16">
            <div className="container-custom max-w-5xl">
                <div className="mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">My Events</h1>
                    <p className="text-lg text-gray-500">Manage your registrations and access event materials.</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-4 sm:p-8">
                    <Tabs items={tabItems} variant="pills" />
                </div>
            </div>

            <Modal
                isOpen={!!playingVideo}
                onClose={() => setPlayingVideo(null)}
                title="Event Recording"
                size="4xl"
            >
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative shadow-2xl">
                    {playingVideo && (
                        <iframe
                            src={playingVideo}
                            className="absolute inset-0 w-full h-full"
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            title="Event Recording"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
