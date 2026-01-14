'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils';
import { adminAPI } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Loading, Spinner } from '@/components/ui';
import toast from '@/lib/toast';

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
    price: 0 as string | number,
    maxParticipants: 0 as string | number,
    status: 'upcoming',
    isCertificateAvailable: true,
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
        isCertificateAvailable: true,
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
      price: formData.price === '' ? 0 : Number(formData.price),
      maxParticipants: formData.maxParticipants === '' ? 0 : Number(formData.maxParticipants),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
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
      processedValue = value === '' ? '' : Number(value);
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
    <div className="space-y-4 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-6">

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic Information */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
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
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
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
                    <p className="text-[10px] text-gray-500 mt-1 font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100 inline-block overflow-hidden text-ellipsis whitespace-nowrap max-w-full">
                      Ex: <span className="font-mono text-primary-600 font-bold">ai-workshop</span> → .../events/ai-workshop
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white text-sm h-10"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="webinar">Webinar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Event Mode *
                    </label>
                    <select
                      name="eventMode"
                      value={formData.eventMode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white text-sm h-10"
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Conditional fields based on event mode */}
                {(formData.eventMode === 'offline' || formData.eventMode === 'hybrid') && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
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
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold">Guests/Speakers</CardTitle>
                <Button type="button" size="sm" onClick={addGuest} className="rounded-lg h-8 text-xs font-bold px-3">
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add Guest
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                {guests.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm font-bold text-gray-500">
                      No guests added yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Guest" to add speakers.</p>
                  </div>
                ) : (
                  guests.map((guest, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-3 relative bg-gray-50/30 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">Guest {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeGuest(index)}
                          className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Name *
                          </label>
                          <Input
                            value={guest.name}
                            onChange={(e) => updateGuest(index, 'name', e.target.value)}
                            placeholder="Guest name"
                            className="text-sm rounded-lg h-9"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Email *
                          </label>
                          <Input
                            type="email"
                            value={guest.email}
                            onChange={(e) => updateGuest(index, 'email', e.target.value)}
                            placeholder="guest@example.com"
                            className="text-sm rounded-lg h-9"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Role
                          </label>
                          <select
                            value={guest.role}
                            onChange={(e) => updateGuest(index, 'role', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white h-9"
                          >
                            <option value="speaker">Speaker</option>
                            <option value="moderator">Moderator</option>
                            <option value="panelist">Panelist</option>
                            <option value="host">Host</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                            Bio
                          </label>
                          <textarea
                            value={guest.bio}
                            onChange={(e) => updateGuest(index, 'bio', e.target.value)}
                            placeholder="Brief guest bio"
                            rows={1}
                            className="w-full px-2 py-1.5 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white min-h-[36px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { label: 'Picture', field: 'pictureLink' },
                          { label: 'Website', field: 'website' },
                          { label: 'CV', field: 'cvLink' },
                        ].map((item: any) => (
                          <div key={item.field}>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                              {item.label} Link
                            </label>
                            <Input
                              type="url"
                              value={(guest as any)[item.field] || ''}
                              onChange={(e) => updateGuest(index, item.field as keyof Guest, e.target.value)}
                              placeholder="https://..."
                              className="text-sm rounded-lg h-9"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Date & Venue */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Start Date *
                    </label>
                    <Input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl w-full text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      End Date *
                    </label>
                    <Input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Reg. Deadline *
                    </label>
                    <Input
                      type="datetime-local"
                      name="registrationDeadline"
                      value={formData.registrationDeadline}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl w-full text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Capacity */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Pricing & Capacity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Price (BDT) *
                    </label>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="If free input 0"
                      required
                      className="rounded-xl w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Max Users
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
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Online Meeting Details */}
            {formData.eventMode === 'online' && (
              <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                  <CardTitle className="text-base font-bold">Online Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Platform *
                      </label>
                      <select
                        name="meetingPlatform"
                        value={formData.meetingPlatform}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium bg-white h-10 text-sm"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="zoom">Zoom</option>
                        <option value="google_meet">Meet</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Meeting Link
                      </label>
                      <Input
                        type="url"
                        name="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <label className="text-sm font-bold text-gray-900 block">
                        Auto-send Link
                      </label>
                      <p className="text-[10px] text-gray-500 font-medium">
                        Send via email upon reg.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="autoSendMeetingLink"
                      checked={formData.autoSendMeetingLink}
                      onChange={(e) =>
                        setFormData({ ...formData, autoSendMeetingLink: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                  {formData.autoSendMeetingLink && !formData.meetingLink && (
                    <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center">
                      <span className="mr-1">⚠️</span> Link required
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact & Support */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Contact & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Contact Email
                    </label>
                    <Input
                      type="email"
                      name="eventContactEmail"
                      value={formData.eventContactEmail}
                      onChange={handleInputChange}
                      placeholder="support@oriyet.com"
                      className="w-full rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Contact Phone
                    </label>
                    <Input
                      type="tel"
                      name="eventContactPhone"
                      value={formData.eventContactPhone}
                      onChange={handleInputChange}
                      placeholder="+880..."
                      className="w-full rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="participantInstructions"
                    value={formData.participantInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Instructions for participants..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Thumbnail */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Thumbnail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Image URL
                  </label>
                  <Input
                    value={thumbnailUrl}
                    onChange={handleThumbnailUrlChange}
                    placeholder="https://..."
                    className="w-full rounded-xl"
                  />
                </div>
                {thumbnailUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={getImageUrl(thumbnailUrl)}
                      alt="Thumbnail preview"
                      className="w-full h-32 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="rounded-[1.25rem] border-gray-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-3">
                <CardTitle className="text-base font-bold">Status</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-white text-sm"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3 pt-2 lg:pt-0">
              <Button
                type="submit"
                className="w-full rounded-xl py-4 font-bold text-base shadow-lg shadow-primary-500/30"
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
                <Button type="button" variant="outline" className="w-full rounded-xl py-4 font-bold border-gray-200 bg-white hover:bg-gray-50 text-gray-600">
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
