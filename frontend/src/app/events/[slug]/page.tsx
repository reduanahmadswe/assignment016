'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  User,
  Clock,
  Globe,
  Share2,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Video,
  Award,
  X,
  XCircle,
  Copy,
  Check,
  Mail,
  FileText,
  Globe2
} from 'lucide-react';
import { eventAPI, paymentAPI, certificateAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { formatDate, formatDateTime, formatCurrency, getEventTypeLabel, getImageUrl, cn } from '@/lib/utils';
import { Button, Loading, Badge, Modal, Alert, Tabs } from '@/components/ui';

export default function EventDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Helper to extract embed URL (reused logic)
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      // Handle YouTube
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtu.be')) {
          videoId = url.split('/').pop()?.split('?')[0] || '';
        } else if (url.includes('v=')) {
          videoId = new URLSearchParams(url.split('?')[1]).get('v') || '';
        } else if (url.includes('embed/')) {
          return url; // Already embed url
        }
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&controls=1&disablekb=1`;
      }

      // Handle Google Drive
      if (url.includes('drive.google.com')) {
        // specific handling if needed, usually /preview is enough if replacing /view
        return url.replace('/view', '/preview');
      }

      return url;
    } catch (e) {
      return url;
    }
  };

  // Handle certificate generation
  const handleGenerateCertificate = async () => {
    // We need registration ID for generation. 
    // It should be available in registrationStatus if isRegistered is true
    // fetching it from cache or state if available
    const regStatus = queryClient.getQueryData(['registration-status', eventData?.id]) as any;
    const regId = regStatus?.registration_id || regStatus?.data?.registration_id;

    if (!regId) {
      console.error("Registration ID not found");
      return;
    }

    try {
      setGeneratingCertificate(true);
      await certificateAPI.generate(regId);
      // Invalidate to refresh status and get certificate ID
      queryClient.invalidateQueries({ queryKey: ['registration-status', eventData?.id] });
    } catch (error) {
      console.error('Failed to generate certificate', error);
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const response = await eventAPI.getBySlug(slug as string);
      console.log('Event Detail Response:', response.data);
      return response.data.data || response.data;
    },
    enabled: !!slug,
  });

  // Check registration status if user is logged in
  const { data: registrationStatus, isLoading: isCheckingRegistration, refetch: refetchRegistration } = useQuery({
    queryKey: ['registration-status', eventData?.id],
    queryFn: async () => {
      const response = await eventAPI.checkRegistrationStatus(eventData.id);
      console.log('Registration Status Full Response:', response);
      console.log('Registration Status Data:', response.data);
      // Handle both response.data and response.data.data formats
      const data = response.data?.data || response.data;
      console.log('Parsed Registration Data:', data);
      return data;
    },
    enabled: !!eventData?.id && isAuthenticated,
    staleTime: 0, // Always refetch
    refetchOnMount: 'always',
  });

  // Normalize event data to handle both camelCase and snake_case
  const event = eventData ? {
    ...eventData,
    start_date: eventData.start_date || eventData.startDate,
    end_date: eventData.end_date || eventData.endDate,
    event_type: eventData.event_type || eventData.eventType,
    event_mode: eventData.event_mode || eventData.eventMode,
    current_participants: eventData.current_participants ?? eventData.currentParticipants ?? 0,
    max_participants: eventData.max_participants || eventData.maxParticipants,
    is_registered: registrationStatus?.status === 'confirmed',
    is_pending_payment: registrationStatus?.status === 'pending',
    meeting_link: registrationStatus?.online_link || eventData.meeting_link || eventData.meetingLink,
    certificate_available: eventData.certificate_available ?? eventData.isCertificateAvailable ?? eventData.hasCertificate,
    is_featured: eventData.is_featured || eventData.isFeatured,
    venue_details: eventData.venue_details || eventData.venueDetails,
    video_link: eventData.videoLink || eventData.video_link,
    participant_instructions: eventData.participant_instructions || eventData.participantInstructions,
  } : null;

  // Helper to parse venue details
  const getVenueName = () => {
    if (!event?.venue_details) return null;
    try {
      const parsed = typeof event.venue_details === 'string'
        ? JSON.parse(event.venue_details)
        : event.venue_details;
      return parsed?.name || null;
    } catch {
      return event.venue_details;
    }
  };

  // Helper to safely format date
  const safeFormatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return 'TBA';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'TBA';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Dhaka',
    });
  };

  // Helper to safely format time
  const safeFormatTime = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dhaka',
    });
  };

  // Helper to calculate duration
  const getDuration = () => {
    if (!event?.start_date || !event?.end_date) return 'TBA';
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'TBA';
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    if (hours <= 0) return 'TBA';
    return `${hours} hours`;
  };

  // Parse price as number for accurate comparison
  const eventPrice = Number(event?.price) || 0;

  const registerMutation = useMutation({
    mutationFn: async () => {
      console.log('Event price:', eventPrice, 'Type:', typeof eventPrice);
      if (eventPrice > 0) {
        // Initiate payment
        console.log('Initiating paid registration...');
        const response = await paymentAPI.initiate({
          event_id: event.id,
          amount: eventPrice,
        });
        console.log('Payment API response:', response.data);
        return response.data;
      } else {
        // Free registration
        console.log('Initiating free registration...');
        const response = await eventAPI.register(event.id);
        return response.data;
      }
    },
    onSuccess: (data) => {
      console.log('Mutation success data:', data);
      // Check for payment_url in data or data.data
      const paymentUrl = data?.payment_url || data?.data?.payment_url;
      if (paymentUrl) {
        // Redirect to payment gateway
        console.log('Redirecting to payment URL:', paymentUrl);
        window.location.href = paymentUrl;
      } else {
        // Free registration successful - refetch queries
        queryClient.invalidateQueries({ queryKey: ['event', slug] });
        queryClient.invalidateQueries({ queryKey: ['registration-status', eventData?.id] });
        setShowRegisterModal(false);
        setShowSuccessModal(true);
      }
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unable to complete registration. Please try again.';
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${slug}`);
      return;
    }

    if (eventPrice > 0) {
      setShowRegisterModal(true);
    } else {
      registerMutation.mutate();
    }
  };

  const confirmRegistration = () => {
    registerMutation.mutate();
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/events" className="btn-primary">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const isFree = eventPrice === 0;
  const isFull = event.max_participants ? event.current_participants >= event.max_participants : false;
  const isPast = new Date(event.end_date) < new Date();
  const isRegistered = event.is_registered;
  const canRegister = !isPast && !isFull && !isRegistered && !isCheckingRegistration;

  const tabItems = [
    {
      id: 'about',
      label: 'About',
      content: (
        <div className="space-y-6">
          <div className="prose prose-gray max-w-none">
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>

          {/* Participant Instructions */}
          {event.participant_instructions && (
            <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Important Instructions for Participants
              </h3>
              <div className="text-sm text-blue-800 whitespace-pre-line font-medium leading-relaxed">
                {event.participant_instructions}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'hosts',
      label: 'Speakers & Guests',
      content: (
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Meet Our Speakers & Guests
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Learn from industry experts and distinguished guests who will share their knowledge and experience
            </p>
          </div>

          {event.guests && event.guests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {event.guests.map((guest: any, index: number) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 ease-out hover:-translate-y-2"
                >
                  {/* Gradient Overlay on Hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${guest.role === 'speaker' ? 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5' : 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5'}`} />

                  <div className="relative p-6 md:p-8">
                    {/* Profile Section */}
                    <div className="flex items-start gap-5">
                      {/* Avatar with Glow Effect */}
                      <div className="relative flex-shrink-0">
                        <div className={`absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${guest.role === 'speaker' ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-2 ${guest.role === 'speaker' ? 'ring-blue-200 group-hover:ring-blue-400' : 'ring-emerald-200 group-hover:ring-emerald-400'} transition-all duration-300`}>
                          {guest.pictureLink ? (
                            <Image
                              src={getImageUrl(guest.pictureLink)}
                              alt={guest.name || 'Speaker'}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center ${guest.role === 'speaker' ? 'bg-gradient-to-br from-blue-50 to-indigo-100' : 'bg-gradient-to-br from-emerald-50 to-teal-100'}`}>
                              <User className={`w-10 h-10 ${guest.role === 'speaker' ? 'text-blue-400' : 'text-emerald-400'}`} />
                            </div>
                          )}
                        </div>
                        {/* Role Badge */}
                        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg whitespace-nowrap ${guest.role === 'speaker' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
                          {guest.role === 'speaker' ? '🎤 Speaker' : '⭐ Guest'}
                        </div>
                      </div>

                      {/* Name & Bio */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className={`text-xl font-bold text-gray-900 mb-2 transition-colors duration-300 ${guest.role === 'speaker' ? 'group-hover:text-blue-600' : 'group-hover:text-emerald-600'}`}>
                          {guest.name}
                        </h3>
                        {guest.bio && (
                          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                            {guest.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Links */}
                    {(guest.email || guest.website || guest.cvLink) && (
                      <div className="mt-6 pt-5 border-t border-gray-100/80">
                        <div className="flex flex-wrap gap-2">
                          {/* Email Button */}
                          {guest.email && (
                            <a
                              href={`mailto:${guest.email}`}
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-600 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <Mail className="w-4 h-4" />
                              <span>Email</span>
                            </a>
                          )}

                          {/* Website Button */}
                          {guest.website && (
                            <a
                              href={guest.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-600 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <Globe2 className="w-4 h-4" />
                              <span>Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          {/* CV Button */}
                          {guest.cvLink && (
                            <a
                              href={guest.cvLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-600 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View CV</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <User className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Speakers Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Speaker and guest information will be updated soon. Stay tuned for exciting announcements!
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container-custom py-6 lg:py-8">
          <Link href="/events" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4 md:mb-6 transition-colors p-1 -ml-1">
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back to Events</span>
          </Link>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {/* Event Image */}
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-gray-50 max-w-xl mx-auto">
                <img
                  src={event.thumbnail ? getImageUrl(event.thumbnail) : '/images/event-placeholder.svg'}
                  alt={event.title}
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
                {isPast && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg">
                      Past Event
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Meta Group - Mobile Optimized */}
              <div className="mt-6 md:mt-8">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                  <Badge variant={event.event_type === 'online' ? 'primary' : event.event_type === 'offline' ? 'secondary' : 'warning'}>
                    {getEventTypeLabel(event.event_type)}
                  </Badge>
                  <Badge variant="outline">{event.category}</Badge>
                  {event.is_featured && <Badge variant="success">Featured</Badge>}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                  {event.title}
                </h1>

                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 md:mt-6 text-gray-600 text-sm sm:text-base">
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 mr-3 text-primary-500 flex-shrink-0" />
                    <span className="font-medium">{safeFormatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 mr-3 text-primary-500 flex-shrink-0" />
                    <span className="font-medium">
                      {safeFormatTime(event.start_date)}{' '}
                      <span className="font-bold text-red-600">(Dhaka time)</span>
                    </span>
                  </div>
                  {/* Show venue for offline/hybrid, show Online for online events */}
                  {event.event_mode === 'online' ? (
                    <div className="flex items-center p-2 bg-green-50 rounded-lg text-green-700 sm:col-span-2">
                      <Globe className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="font-medium">Online Event</span>
                    </div>
                  ) : getVenueName() ? (
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg sm:col-span-2">
                      <MapPin className="w-5 h-5 mr-3 text-secondary-500 flex-shrink-0" />
                      <span className="font-medium truncate">{getVenueName()}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Moved Content: Registration Status & Actions */}
              <div className="space-y-4 mt-6 md:mt-8">
                {event.is_pending_payment && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-bold text-amber-900 text-lg">Payment Pending</span>
                    </div>
                    <p className="text-sm text-amber-800 ml-11">
                      Your registration is pending payment confirmation. Please complete the payment to secure your spot.
                    </p>
                    <div className="mt-4 ml-11">
                      <Button
                        onClick={handleRegister}
                        className="bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                        size="sm"
                      >
                        Complete Payment
                      </Button>
                    </div>
                  </div>
                )}

                {isRegistered && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Registration Success Banner */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="font-bold text-green-900 text-lg">You're Registered! 🎉</span>
                      </div>
                      {registrationStatus?.registration_number && (
                        <p className="text-sm text-green-700 ml-11">
                          Registration #: <span className="font-mono font-bold bg-white/50 px-2 py-0.5 rounded">{registrationStatus.registration_number}</span>
                        </p>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      {/* Video Recording Section */}
                      {(isPast || event.eventStatus === 'completed') && event.video_link && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-5 flex flex-col">
                          <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                            <Video className="w-5 h-5" />
                            Recording
                          </h4>
                          <p className="text-sm text-indigo-700 mb-4 flex-grow">
                            Watch the recorded session.
                          </p>
                          <Button
                            onClick={() => setVideoModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white w-full"
                          >
                            Watch Now
                          </Button>
                        </div>
                      )}

                      {/* Certificate Section */}
                      {event.certificate_available && (isPast || event.eventStatus === 'completed') && (
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-5 flex flex-col">
                          <h4 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5" />
                            Certificate
                          </h4>
                          <p className="text-sm text-purple-700 mb-4 flex-grow">
                            Download your certificate.
                          </p>
                          {registrationStatus?.certificate_id ? (
                            <Link
                              href={`/certificates/${registrationStatus.certificate_id}`}
                              className="btn-primary w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 border-purple-600 text-white py-2 px-6 rounded-lg"
                            >
                              View
                            </Link>
                          ) : (
                            <Button
                              onClick={handleGenerateCertificate}
                              isLoading={generatingCertificate}
                              className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white w-full"
                            >
                              Generate
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Meeting Link for Online Events */}
                    {event.event_mode !== 'online' && (event.meeting_link || registrationStatus?.online_link) && !isPast && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-1">
                              <Video className="w-5 h-5" />
                              Join Session
                            </h4>
                            <p className="text-xs text-blue-700">Link active 15 mins before start</p>
                          </div>
                          <a
                            href={event.meeting_link || registrationStatus?.online_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Join Now
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Registration Card */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-6 lg:sticky lg:top-24 shadow-lg lg:shadow-none hover:shadow-xl transition-shadow duration-300">
                <div className="text-center mb-6 pb-6 border-b border-gray-100">
                  <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Price</span>
                  <div className="text-4xl font-black text-primary-600 mt-2">
                    {isFree ? 'Free' : formatCurrency(event.price)}
                  </div>
                  {!isFree && <p className="text-sm text-gray-400 font-medium mt-1">per person</p>}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm group">
                    <span className="text-gray-500 group-hover:text-primary-600 transition-colors">Date</span>
                    <span className="font-bold text-gray-900">{safeFormatDate(event.start_date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm group">
                    <span className="text-gray-500 group-hover:text-primary-600 transition-colors">Duration</span>
                    <span className="font-bold text-gray-900">{getDuration()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm group">
                    <span className="text-gray-500 group-hover:text-primary-600 transition-colors">Participants</span>
                    <span className="font-bold text-gray-900">
                      {event.current_participants || 0}{event.max_participants ? `/${event.max_participants}` : ''}
                    </span>
                  </div>
                  {event.certificate_available && (
                    <div className="flex items-center justify-center pt-2 text-sm text-green-600 font-bold bg-green-50 py-2 rounded-lg mt-2">
                      <Award className="w-4 h-4 mr-2" />
                      Certificate Included
                    </div>
                  )}
                </div>

                {/* Primary Actions */}
                <div className="space-y-3">
                  {isRegistered ? (
                    <Link
                      href="/my-events"
                      className="btn-outline w-full flex items-center justify-center gap-2 py-3 md:py-4 text-base font-bold border-2"
                    >
                      <Calendar className="w-5 h-5" />
                      View My Events
                    </Link>
                  ) : isCheckingRegistration ? (
                    <Button disabled className="w-full py-4 text-base" size="lg" isLoading={true}>
                      Checking...
                    </Button>
                  ) : event.is_pending_payment ? (
                    <Button
                      onClick={handleRegister}
                      className="w-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all text-base py-4 font-bold bg-amber-600 hover:bg-amber-700 border-amber-600 text-white"
                      size="lg"
                      isLoading={registerMutation.isPending}
                    >
                      Complete Payment
                    </Button>
                  ) : canRegister ? (
                    <Button
                      onClick={handleRegister}
                      className="w-full shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-0.5 transition-all text-base py-4 font-bold"
                      size="lg"
                      isLoading={registerMutation.isPending}
                    >
                      {isFree ? 'Register Now' : `Register - ${formatCurrency(event.price)}`}
                    </Button>
                  ) : (
                    <Button disabled className="w-full py-4 text-base font-bold bg-gray-100 text-gray-400 border-gray-200" size="lg">
                      {isPast ? 'Event Ended' : isFull ? 'Registration Full' : 'Unavailable'}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  {/* Copy Link Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: event?.title,
                          text: event?.description?.substring(0, 100) + '...',
                          url: window.location.href,
                        });
                      } else {
                        // Fallback - copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container-custom py-8 lg:py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <Tabs items={tabItems} variant="underline" />
        </div>
      </section>

      {/* Payment Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Complete Registration"
        description={`You'll be redirected to complete payment for ${event?.title}`}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Event Fee</span>
              <span className="font-semibold">{formatCurrency(event?.price || 0)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            You will be redirected to UddoktaPay to complete your payment. After successful payment,
            you'll receive a confirmation email with event details.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowRegisterModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRegistration}
              isLoading={registerMutation.isPending}
              className="flex-1"
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Refetch registration status when modal closes
          refetchRegistration();
        }}
        size="lg"
      >
        <div className="text-center py-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful! 🎉</h3>
          <p className="text-gray-600 mb-6">
            You have successfully registered for <span className="font-semibold">{event?.title}</span>.
            Check your email for confirmation details.
          </p>

          {/* Participant Instructions */}
          {event?.participant_instructions && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-h-60 overflow-y-auto">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2 sticky top-0 bg-blue-50 pb-2">
                <FileText className="w-4 h-4" />
                Important Instructions
              </h4>
              <div className="text-sm text-blue-800 break-words whitespace-pre-wrap font-medium">
                {event.participant_instructions}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                refetchRegistration();
              }}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => router.push('/my-events')}
              className="flex-1"
            >
              View My Events
            </Button>
          </div>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Failed</h3>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Button
            onClick={() => setShowErrorModal(false)}
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </Modal>

      {/* Modern Video Player Overlay */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setVideoModalOpen(false)}
          />

          {/* Player Container */}
          <div className="relative w-full max-w-7xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-medium text-white/90">
                {event?.title || 'Event Recording'}
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Area */}
            <div className="relative w-full bg-black aspect-video flex items-center justify-center group" onContextMenu={(e) => e.preventDefault()}>

              {/* --- SECURITY PATCHES --- */}
              {/* 1. Top Bar Block */}
              <div className="absolute top-0 left-0 w-full h-20 z-20 bg-black" />

              {/* 2. Control Bar Logo Block (Bottom Right) */}
              <div className="absolute bottom-0 right-14 w-32 h-16 z-20 bg-black" />

              {/* 3. Watermark Block (Bottom Right Area) */}
              <div className="absolute bottom-16 right-0 w-24 h-24 z-20 bg-transparent" />
              {/* ------------------------ */}

              {event?.video_link && (
                <iframe
                  src={getEmbedUrl(event.video_link)}
                  className="w-full h-full relative z-10"
                  allowFullScreen
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
