'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Video,
  Calendar,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatDate, formatCurrency, getEventTypeLabel } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Card,
  Button,
  Input,
  Loading,
  Badge,
  Pagination,
  Modal
} from '@/components/ui';

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all'); // 'all' by default for tabs
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedEventForVideo, setSelectedEventForVideo] = useState<any>(null);
  const [videoLinkInput, setVideoLinkInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events', page, search, status],
    queryFn: async () => {
      const response = await adminAPI.getEvents({
        page,
        limit: 8,
        search,
        status: status === 'all' ? '' : status,
      });
      return response.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminAPI.deleteEvent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      setDeleteId(null);
      toast.success('Event deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Unable to delete event. Please try again.';
      toast.error(message);
    }
  });

  const updateVideoMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEventForVideo) return;
      await adminAPI.updateEvent(selectedEventForVideo.id, { videoLink: videoLinkInput });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
      setVideoModalOpen(false);
      toast.success('Video link saved successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Unable to save video link. Please try again.';
      toast.error(message);
    }
  });

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleVideoClick = (event: any) => {
    setSelectedEventForVideo(event);
    setVideoLinkInput(event.videoLink || '');
    setVideoModalOpen(true);
  };

  const handleSaveVideo = () => {
    updateVideoMutation.mutate();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'all', label: 'All Events' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mt-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Events Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Create, track, and manage all your events in one place.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/events/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary-500/20 justify-center">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col h-full">
        {/* Filters and Search */}
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Tabs - Scrollable on mobile */}
            <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl overflow-x-auto no-scrollbar w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatus(tab.id);
                    setPage(1);
                  }}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${status === tab.id
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registrations</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loading />
                  </td>
                </tr>
              ) : data?.events?.length > 0 ? (
                data.events.map((event: any) => (
                  <tr key={event.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[200px] lg:max-w-[300px]" title={event.title}>
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                event.eventType === 'seminar' ? 'primary' :
                                  event.eventType === 'workshop' ? 'secondary' : 'default'
                              }
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {getEventTypeLabel(event.eventType)}
                            </Badge>
                            <span className="text-xs text-gray-400 truncate max-w-[150px] font-mono">{event.slug}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        event.eventStatus === 'upcoming' ? 'primary' :
                          event.eventStatus === 'ongoing' ? 'success' :
                            event.eventStatus === 'completed' ? 'default' :
                              event.eventStatus === 'cancelled' ? 'error' : 'default'
                      } className="capitalize font-bold">
                        {event.eventStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-bold">{formatDate(event.startDate)}</div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                        <span className="font-bold text-red-600">(Dhaka time)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {event.price === 0 ? <span className="text-green-600">Free</span> : formatCurrency(event.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-bold text-gray-700">{event.registrationCount || 0}</span>
                          <span className="text-gray-400 font-medium">/ {event.maxParticipants || '∞'}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(((event.registrationCount || 0) / (event.maxParticipants || 1)) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {event.eventStatus === 'completed' && (
                          <button
                            onClick={() => handleVideoClick(event)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Add/Edit Recording"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          href={`/events/${event.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Live Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No events found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6 text-sm">
                      {search ? "No events match your search criteria." : "Get started by creating your first event."}
                    </p>
                    <Link href="/admin/events/new">
                      <Button variant="outline" className="rounded-xl">Create Event</Button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.events?.length > 0 && data?.pagination && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action will remove all registration data associated with it and cannot be undone."
      >
        <div className="flex gap-3 mt-6 justify-end">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete Event
          </Button>
        </div>
      </Modal>

      {/* Video Link Modal */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="Event Recording"
      >
        <div className="space-y-4">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">{selectedEventForVideo?.title}</h4>
              <p className="text-xs text-gray-500 mt-1">Add a link to the recorded session (YouTube, Vimeo, etc.) for attendees to access later.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Recording URL
            </label>
            <Input
              value={videoLinkInput}
              onChange={(e) => setVideoLinkInput(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setVideoModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveVideo} isLoading={updateVideoMutation.isPending}>Save Recording</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
