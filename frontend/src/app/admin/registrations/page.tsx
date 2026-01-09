'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Download,
  Calendar,
  Filter,
  ArrowLeft,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  Button,
  Input,
  Loading,
  Badge,
  Pagination,
  Modal
} from '@/components/ui';

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const eventsPerPage = 12;

  // Fetch summary of all events
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['registrations-summary'],
    queryFn: async () => {
      const response = await adminAPI.getRegistrationsSummary();
      return response.data.data || [];
    },
  });

  // Fetch detailed registrations for selected event
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', selectedEvent, page, search, statusFilter, paymentFilter],
    queryFn: async () => {
      const response = await adminAPI.getRegistrations({
        page,
        limit: 10,
        event_id: selectedEvent,
        status: statusFilter,
        payment_status: paymentFilter,
        search,
      });
      return response.data.data || { registrations: [], pagination: {} };
    },
    enabled: !!selectedEvent,
  });

  // Filter events based on search
  const filteredSummary = summary?.filter((event: any) => {
    if (!eventSearch) return true;
    const searchLower = eventSearch.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchLower) ||
      event.eventType?.toLowerCase().includes(searchLower) ||
      event.eventStatus?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Pagination for events
  const totalEventsPages = Math.ceil(filteredSummary.length / eventsPerPage);
  const startIndex = (eventsPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const paginatedEvents = filteredSummary.slice(startIndex, endIndex);

  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const params: any = {};
      if (selectedEvent) params.event_id = selectedEvent;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      params.format = format;

      const response = await adminAPI.exportRegistrations(params);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registrations_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export registrations');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'attended':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Event Registrations</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {selectedEvent ? 'Viewing detailed registration data' : 'Select an event to view its registrations and analytics.'}
          </p>
        </div>

        {!selectedEvent && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={eventSearch}
              onChange={(e) => setEventSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none"
            />
          </div>
        )}

        {selectedEvent && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedEvent(null);
                setPage(1);
                setSearch('');
              }}
              className="flex items-center w-full sm:w-auto justify-center rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
          </div>
        )}
      </div>

      {/* Event Selection Grid */}
      {!selectedEvent && (
        <>
          {summaryLoading ? (
            <div className="flex justify-center py-20">
              <Loading />
            </div>
          ) : paginatedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {paginatedEvents.map((event: any) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event.id)}
                  className="group bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
                >
                  <div className="p-5 sm:p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl bg-gray-50 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <Badge
                        variant={
                          event.eventStatus === 'upcoming' ? 'primary' :
                            event.eventStatus === 'ongoing' ? 'success' : 'default'
                        }
                        className="capitalize font-bold"
                      >
                        {event.eventStatus}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 mb-6 flex-1">
                      {formatDate(event.startDate)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Registrations</p>
                        <p className="text-xl font-extrabold text-gray-900 mt-0.5">{event.totalRegistrations}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Revenue</p>
                        <p className={`text-xl font-extrabold mt-0.5 ${event.totalRevenue > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {event.isFree ? 'Free' : formatCurrency(event.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-6 py-3 flex items-center justify-between group-hover:bg-primary-50/30 transition-colors">
                    <div className="flex -space-x-2">
                      {/* Placeholder avatars based on counts, just for visuals */}
                      {[...Array(Math.min(3, event.totalRegistrations))].map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 ring-1 ring-white">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                      ))}
                      {event.totalRegistrations > 3 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] text-gray-500 font-bold ring-1 ring-white">
                          +{event.totalRegistrations - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-bold text-primary-600 flex items-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity transform lg:translate-x-2 lg:group-hover:translate-x-0 duration-300">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[1.5rem] border border-gray-100 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No events found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your search terms</p>
            </div>
          )}

          {/* Pagination */}
          {totalEventsPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={eventsPage}
                totalPages={totalEventsPages}
                onPageChange={(newPage) => {
                  setEventsPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Detailed View */}
      {selectedEvent && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto flex-1">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in registrations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <select
                className="text-sm font-medium border-gray-200 rounded-xl py-2.5 px-3 bg-gray-50 focus:bg-white transition-colors outline-none cursor-pointer hover:bg-gray-100 w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" className="flex-1 sm:flex-none justify-center rounded-xl" size="sm" onClick={() => handleExport('excel')}>
                  <FileText className="w-4 h-4 mr-2" /> Excel
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-none justify-center rounded-xl" size="sm" onClick={() => handleExport('pdf')}>
                  <FileText className="w-4 h-4 mr-2" /> PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Participant</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Reg Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Event</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {registrationsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center"><Loading /></td>
                    </tr>
                  ) : registrationsData?.registrations?.length > 0 ? (
                    registrationsData.registrations.map((reg: any) => (
                      <tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {(reg.user.name?.charAt(0) || 'U').toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm max-w-[150px] lg:max-w-xs truncate">{reg.user.name}</p>
                              <p className="text-xs text-gray-500 max-w-[150px] lg:max-w-xs truncate">{reg.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {reg.registrationNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700 font-bold max-w-[200px] truncate block">{reg.event.title}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusColor(reg.status)} className="capitalize px-2 py-0.5 font-bold">
                            {reg.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Badge variant={getPaymentColor(reg.paymentStatus)} className="capitalize px-1.5 py-0 text-[10px] h-4 font-bold">
                                {reg.paymentStatus}
                              </Badge>
                            </div>
                            <span className="text-xs font-bold text-gray-900 mt-1">
                              {formatCurrency(reg.paymentAmount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                          {formatDate(reg.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">
                        No registrations found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {registrationsData?.pagination?.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
                <Pagination
                  currentPage={page}
                  totalPages={registrationsData.pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
