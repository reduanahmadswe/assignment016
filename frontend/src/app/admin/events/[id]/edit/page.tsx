'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Loading, Spinner } from '@/components/ui';
import { toast } from 'react-hot-toast';

interface Guest {
  name: string;
  email: string;
  bio: string;
  role: string;
  pictureLink?: string;
  website?: string;
  cvLink?: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [realEventId, setRealEventId] = useState<number | null>(null);

  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    eventType: 'workshop',
    eventMode: 'offline',
    venue: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    price: 0,
    maxParticipants: 0,
    status: 'upcoming',
    isCertificateAvailable: false,
    meetingPlatform: '',
    meetingLink: '',
    autoSendMeetingLink: true,
    eventContactEmail: '',
    eventContactPhone: '',
    participantInstructions: '',
  });

  // Fetch event data
  const { data: eventData, isLoading } = useQuery({
    queryKey: ['admin-event', eventId],
    queryFn: async () => {
      console.log('🔍 Fetching event:', eventId);
      const response = await adminAPI.getEventById(eventId);
      console.log('📡 API Response:', response);
      console.log('📦 Response data:', response.data);
      const data = response.data.data || response.data;
      console.log('✅ Final event data:', data);
      return data;
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (eventData) {
      const event = eventData;
      console.log('📥 Loading event data:', event);
      console.log('Event ID:', event.id);
      console.log('Event guests:', event.guests);
      console.log('Guests is array:', Array.isArray(event.guests));
      console.log('Guests length:', event.guests?.length);
      
      setRealEventId(event.id);

      // Parse venue from venueDetails JSON
      let venueName = '';
      if (event.venueDetails) {
        try {
          const venueData = typeof event.venueDetails === 'string' 
            ? JSON.parse(event.venueDetails) 
            : event.venueDetails;
          venueName = venueData.name || venueData.venue || '';
        } catch (e) {
          venueName = event.venueDetails;
        }
      }

      setFormData({
        title: event.title || '',
        slug: event.slug || '',
        description: event.description || '',
        eventType: event.eventType || 'workshop',
        eventMode: event.eventMode || 'offline',
        venue: venueName,
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().slice(0, 16) : '',
        price: event.price ? Number(event.price) : 0,
        maxParticipants: event.maxParticipants || 0,
        status: event.eventStatus || 'upcoming',
        isCertificateAvailable: event.isCertificateAvailable || false,
        meetingPlatform: event.meetingPlatform || '',
        meetingLink: event.meetingLink || '',
        autoSendMeetingLink: event.autoSendMeetingLink !== undefined ? event.autoSendMeetingLink : true,
        eventContactEmail: event.eventContactEmail || '',
        eventContactPhone: event.eventContactPhone || '',
        participantInstructions: event.participantInstructions || '',
      });

      setThumbnailUrl(event.thumbnail || '');

      // Load existing guests
      if (event.guests && Array.isArray(event.guests) && event.guests.length > 0) {
        console.log('✅ Loading', event.guests.length, 'guests');
        setGuests(event.guests);
      } else {
        console.log('⚠️ No guests found in event data');
      }
    }
  }, [eventData]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!realEventId) throw new Error("Event ID not loaded");
      await adminAPI.updateEvent(realEventId, data);
    },
    onSuccess: () => {
      toast.success('Event updated successfully!');
      router.push('/admin/events');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Unable to update event. Please try again.';
      toast.error(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData: any = {
      ...formData,
    };

    if (thumbnailUrl) {
      submitData.thumbnail = thumbnailUrl;
    }

    if (guests.length > 0) {
      submitData.guests = guests;
    }

    console.log('📤 Submitting event update:');
    console.log('Guests count:', guests.length);
    console.log('Guests data:', guests);
    console.log('Submit data guests:', submitData.guests);

    updateMutation.mutate(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;

    if (name === 'price' || name === 'maxParticipants') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleThumbnailUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(e.target.value);
  };

  const addGuest = () => {
    setGuests([...guests, { name: '', email: '', bio: '', role: 'speaker', pictureLink: '', website: '', cvLink: '' }]);
  };

  const removeGuest = (index: number) => {
    setGuests(guests.filter((_, i) => i !== index));
  };

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index][field] = value;
    setGuests(updatedGuests);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="outline" size="sm" className="rounded-xl h-10 w-10 p-0 flex items-center justify-center hover:bg-gray-50 border-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Edit Event</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">Update event details</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    required
                    className="w-full rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Slug *
                  </label>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="your-event-name-2025"
                    required
                    className="w-full rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                    Example: <span className="font-mono text-primary-600 font-bold">ai-workshop-dhaka</span> → URL will be: <span className="font-mono font-bold">oriyet.com/events/ai-workshop-dhaka</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    rows={5}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="seminar">Seminar</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Event Mode *
                    </label>
                    <select
                      name="eventMode"
                      value={formData.eventMode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Conditional fields based on event mode */}
                {(formData.eventMode === 'offline' || formData.eventMode === 'hybrid') && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Venue *
                    </label>
                    <Input
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      placeholder="Enter event venue"
                      required={formData.eventMode === 'offline'}
                      className="w-full rounded-xl bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guests/Speakers */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold">Guests/Speakers</CardTitle>
                <Button type="button" size="sm" onClick={addGuest} className="rounded-lg h-9 font-bold px-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {guests.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-500">
                      No guests added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Guest" to add speakers or hosts.</p>
                  </div>
                ) : (
                  guests.map((guest, index) => (
                    <div key={index} className="p-5 border border-gray-200 rounded-2xl space-y-4 relative bg-gray-50/30 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Guest {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Name *
                          </label>
                          <Input
                            value={guest.name}
                            onChange={(e) => updateGuest(index, 'name', e.target.value)}
                            placeholder="Guest name"
                            className="text-sm rounded-xl"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={guest.email}
                            onChange={(e) => updateGuest(index, 'email', e.target.value)}
                            placeholder="guest@example.com"
                            className="text-sm rounded-xl"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          Role
                        </label>
                        <select
                          value={guest.role}
                          onChange={(e) => updateGuest(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                          <option value="speaker">Speaker</option>
                          <option value="moderator">Moderator</option>
                          <option value="panelist">Panelist</option>
                          <option value="host">Host</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                          Bio
                        </label>
                        <textarea
                          value={guest.bio}
                          onChange={(e) => updateGuest(index, 'bio', e.target.value)}
                          placeholder="Brief bio of the guest"
                          rows={2}
                          className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Picture Link
                          </label>
                          <Input
                            type="url"
                            value={guest.pictureLink || ''}
                            onChange={(e) => updateGuest(index, 'pictureLink', e.target.value)}
                            placeholder="https://..."
                            className="text-sm rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Website
                          </label>
                          <Input
                            type="url"
                            value={guest.website || ''}
                            onChange={(e) => updateGuest(index, 'website', e.target.value)}
                            placeholder="https://..."
                            className="text-sm rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            CV Link
                          </label>
                          <Input
                            type="url"
                            value={guest.cvLink || ''}
                            onChange={(e) => updateGuest(index, 'cvLink', e.target.value)}
                            placeholder="https://..."
                            className="text-sm rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Date & Venue */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Registration Deadline *
                  </label>
                  <Input
                    type="datetime-local"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleInputChange}
                    required
                    className="rounded-xl w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Capacity */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Pricing & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Price (BDT) *
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      required
                      className="rounded-xl w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                      Enter 0 for free events
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <Input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      className="rounded-xl w-full"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                      Leave 0 for unlimited
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Configuration */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Certificate Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <label className="text-sm font-bold text-gray-900 block">
                      Enable Certificates
                    </label>
                    <p className="text-xs text-gray-500 font-medium">
                      Automatically generate certificates for participants
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isCertificateAvailable"
                    checked={formData.isCertificateAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isCertificateAvailable: e.target.checked })
                    }
                    className="h-6 w-6 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Online Meeting Details */}
            {formData.eventMode === 'online' && (
              <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                  <CardTitle className="text-lg font-bold">Online Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Meeting Platform *
                    </label>
                    <select
                      name="meetingPlatform"
                      value={formData.meetingPlatform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium bg-white"
                      required
                    >
                      <option value="">Select platform...</option>
                      <option value="zoom">Zoom</option>
                      <option value="google_meet">Google Meet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <Input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleInputChange}
                      placeholder="https://zoom.us/j/123456789"
                      className="w-full rounded-xl"
                    />
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Full URL to the online meeting
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <label className="text-sm font-bold text-gray-900 block">
                        Auto-send Meeting Link
                      </label>
                      <p className="text-xs text-gray-500 font-medium">
                        Automatically send meeting link upon registration
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="autoSendMeetingLink"
                      checked={formData.autoSendMeetingLink}
                      onChange={(e) =>
                        setFormData({ ...formData, autoSendMeetingLink: e.target.checked })
                      }
                      className="h-6 w-6 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                  {formData.autoSendMeetingLink && !formData.meetingLink && (
                    <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center">
                      <span className="mr-1">⚠️</span> Meeting link is required when auto-send is enabled
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact & Support */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Contact & Support Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Event Contact Email
                  </label>
                  <Input
                    type="email"
                    name="eventContactEmail"
                    value={formData.eventContactEmail}
                    onChange={handleInputChange}
                    placeholder="support@oriyet.com"
                    className="w-full rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Email for participants to reach out with questions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Event Contact Phone
                  </label>
                  <Input
                    type="tel"
                    name="eventContactPhone"
                    value={formData.eventContactPhone}
                    onChange={handleInputChange}
                    placeholder="+880 1234-567890"
                    className="w-full rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Phone number for event inquiries
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Participant Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="participantInstructions"
                    value={formData.participantInstructions}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Important instructions for participants, e.g.,&#10;• Check your email (inbox & spam) after registration&#10;• For offline events: Arrive 15 minutes early&#10;• For online events: Join the meeting 5 minutes before start time&#10;• Bring your government-issued ID for verification"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Instructions will be shown to participants after registration
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Event Thumbnail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Image URL
                  </label>
                  <Input
                    value={thumbnailUrl}
                    onChange={handleThumbnailUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Paste an image URL from any platform
                  </p>
                </div>
                {thumbnailUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
                <CardTitle className="text-lg font-bold">Publication Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Choose the appropriate status for this event
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3 pt-6 lg:pt-0">
              <Button
                type="submit"
                className="w-full rounded-xl py-6 font-bold text-lg shadow-lg shadow-primary-500/30"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
              <Link href="/admin/events" className="block">
                <Button type="button" variant="outline" className="w-full rounded-xl py-6 font-bold border-gray-200 bg-white hover:bg-gray-50 text-gray-600">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
