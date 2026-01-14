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
  FileText,
  TrendingUp,
  Eye,
  X,
  BarChart3,
  ChevronDown
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Main Container with responsive padding */}
      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
        
        {/* Header Section - Simple & Clean */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Title & Back Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {selectedEvent && (
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setPage(1);
                  setSearch('');
                  setStatusFilter('');
                  setPaymentFilter('');
                }}
                variant="outline"
                className="flex items-center gap-2 rounded-xl min-h-[44px] px-3 sm:px-4"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Event Registrations
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                {selectedEvent 
                  ? 'Viewing detailed registration data' 
                  : 'Select an event to view registrations'}
              </p>
            </div>
          </div>

          {/* Search Bar - Inline on Desktop */}
          {!selectedEvent && (
            <div className="relative w-full lg:w-96 xl:w-[480px]">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base bg-white border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none placeholder:text-gray-400 font-medium min-h-[44px] shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Event Selection Grid - Fully Responsive */}
        {!selectedEvent && (
          <div className="space-y-4 sm:space-y-6">
            {summaryLoading ? (
              <div className="flex justify-center items-center py-20 sm:py-32 bg-white rounded-2xl sm:rounded-3xl border border-gray-100">
                <div className="text-center">
                  <Loading />
                  <p className="text-gray-500 font-medium mt-4 text-sm sm:text-base">Loading events...</p>
                </div>
              </div>
            ) : paginatedEvents.length > 0 ? (
              <>
                {/* Responsive Grid - 1 col mobile, 2 tablet, 3 laptop, 4 desktop */}
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {paginatedEvents.map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event.id)}
                      className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-primary-300 shadow-sm hover:shadow-2xl hover:shadow-primary-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col min-h-[280px] sm:min-h-[320px] active:scale-95"
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => e.key === 'Enter' && setSelectedEvent(event.id)}
                    >
                      {/* Card Header */}
                      <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3 sm:mb-4">
                          <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-600 group-hover:from-primary-100 group-hover:to-indigo-100 transition-all duration-300 group-hover:scale-110">
                            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <Badge
                            variant={
                              event.eventStatus === 'upcoming' ? 'primary' :
                              event.eventStatus === 'ongoing' ? 'success' : 'default'
                            }
                            className="capitalize font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg"
                          >
                            {event.eventStatus}
                          </Badge>
                        </div>

                        {/* Event Title */}
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug min-h-[44px] flex items-center">
                          {event.title}
                        </h3>
                        
                        {/* Event Date */}
                        <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-4 sm:mb-6 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {formatDate(event.startDate)}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-gray-50 mt-auto">
                          <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 group-hover:bg-primary-50/50 transition-colors">
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Registrations</p>
                            <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">
                              {event.totalRegistrations}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 group-hover:bg-green-50/50 transition-colors">
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Revenue</p>
                            <p className={`text-lg sm:text-xl md:text-2xl font-black transition-colors ${
                              event.isFree ? 'text-gray-400' : 
                              event.totalRevenue > 0 ? 'text-green-600 group-hover:text-green-700' : 'text-gray-900'
                            }`}>
                              {event.isFree ? 'Free' : formatCurrency(event.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex items-center justify-between group-hover:from-primary-50/30 group-hover:to-indigo-50/30 transition-all border-t border-gray-100 min-h-[52px]">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(3, event.totalRegistrations))].map((_, i) => (
                            <div 
                              key={i} 
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center shadow-sm ring-1 ring-gray-100"
                            >
                              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                            </div>
                          ))}
                          {event.totalRegistrations > 3 && (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center text-[10px] sm:text-xs text-gray-700 font-black shadow-sm ring-1 ring-gray-100">
                              +{event.totalRegistrations - 3}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-primary-600 group-hover:text-primary-700 transition-all group-hover:gap-3">
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - Responsive */}
                {totalEventsPages > 1 && (
                  <div className="flex justify-center pt-4 sm:pt-6">
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
            ) : (
              <div className="text-center py-16 sm:py-24 md:py-32 bg-white rounded-2xl sm:rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2">No events found</h3>
                <p className="text-sm sm:text-base text-gray-500 font-semibold">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}


        {/* Detailed View - Responsive Registration Details */}
        {selectedEvent && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Filters Bar - Fully Responsive */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6 space-y-4">
                
                {/* Search Input - Full Width on Mobile */}
                <div className="relative w-full">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search registrations by name, email, or number..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl sm:rounded-2xl transition-all outline-none font-medium min-h-[44px]"
                  />
                </div>

                {/* Filters Row - Stack on Mobile, Row on Desktop */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  
                  {/* Status Filter */}
                  <div className="flex-1 sm:flex-none sm:min-w-[180px]">
                    <select
                      className="w-full text-sm sm:text-base font-semibold border-2 border-gray-100 rounded-xl sm:rounded-2xl py-3 px-4 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none cursor-pointer hover:border-gray-200 appearance-none min-h-[44px]"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">All Statuses</option>
                      <option value="confirmed">✓ Confirmed</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="cancelled">✕ Cancelled</option>
                      <option value="attended">★ Attended</option>
                    </select>
                  </div>

                  {/* Payment Filter */}
                  <div className="flex-1 sm:flex-none sm:min-w-[180px]">
                    <select
                      className="w-full text-sm sm:text-base font-semibold border-2 border-gray-100 rounded-xl sm:rounded-2xl py-3 px-4 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none cursor-pointer hover:border-gray-200 appearance-none min-h-[44px]"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.75rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">All Payments</option>
                      <option value="completed">✓ Completed</option>
                      <option value="pending">⏳ Pending</option>
                      <option value="failed">✕ Failed</option>
                      <option value="refunded">↩ Refunded</option>
                    </select>
                  </div>

                  {/* Divider - Hidden on Mobile */}
                  <div className="hidden lg:block h-10 w-px bg-gray-200"></div>

                  {/* Export Buttons - Full Width on Mobile */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none justify-center rounded-xl sm:rounded-2xl font-bold border-2 hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all min-h-[44px] text-sm sm:text-base" 
                      onClick={() => handleExport('excel')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Excel</span>
                      <span className="sm:hidden">XLS</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none justify-center rounded-xl sm:rounded-2xl font-bold border-2 hover:border-red-500 hover:bg-red-50 hover:text-red-700 transition-all min-h-[44px] text-sm sm:text-base" 
                      onClick={() => handleExport('pdf')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">PDF</span>
                      <span className="sm:hidden">PDF</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none justify-center rounded-xl sm:rounded-2xl font-bold border-2 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all min-h-[44px] text-sm sm:text-base" 
                      onClick={() => handleExport('csv')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">CSV</span>
                      <span className="sm:hidden">CSV</span>
                    </Button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {(statusFilter || paymentFilter || search) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    <span className="text-xs sm:text-sm font-bold text-gray-500">Active Filters:</span>
                    {search && (
                      <Badge variant="default" className="font-semibold text-xs sm:text-sm px-3 py-1 rounded-lg">
                        Search: "{search}"
                        <X className="w-3 h-3 ml-1.5 cursor-pointer" onClick={() => setSearch('')} />
                      </Badge>
                    )}
                    {statusFilter && (
                      <Badge variant="primary" className="font-semibold text-xs sm:text-sm px-3 py-1 rounded-lg capitalize">
                        Status: {statusFilter}
                        <X className="w-3 h-3 ml-1.5 cursor-pointer" onClick={() => setStatusFilter('')} />
                      </Badge>
                    )}
                    {paymentFilter && (
                      <Badge variant="success" className="font-semibold text-xs sm:text-sm px-3 py-1 rounded-lg capitalize">
                        Payment: {paymentFilter}
                        <X className="w-3 h-3 ml-1.5 cursor-pointer" onClick={() => setPaymentFilter('')} />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Registrations Display - Responsive Cards for Mobile, Table for Desktop */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
              
              {registrationsLoading ? (
                <div className="flex justify-center items-center py-20 sm:py-32">
                  <div className="text-center">
                    <Loading />
                    <p className="text-gray-500 font-medium mt-4 text-sm sm:text-base">Loading registrations...</p>
                  </div>
                </div>
              ) : registrationsData?.registrations?.length > 0 ? (
                <>
                  {/* Mobile Card View - Hidden on Desktop */}
                  <div className="block lg:hidden divide-y divide-gray-100">
                    {registrationsData.registrations.map((reg: any) => (
                      <div 
                        key={reg.id} 
                        className="p-4 sm:p-5 hover:bg-gray-50 transition-colors active:bg-gray-100"
                      >
                        {/* User Info */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full sm:rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-base sm:text-lg font-black shadow-lg shrink-0">
                            {(reg.user.name?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">{reg.user.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-500 truncate font-medium">{reg.user.email}</p>
                          </div>
                        </div>

                        {/* Registration Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 font-bold mb-1">Reg Number</p>
                            <p className="font-mono text-xs font-bold text-gray-900 truncate">{reg.registrationNumber}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 font-bold mb-1">Date</p>
                            <p className="text-xs font-bold text-gray-900">{formatDate(reg.createdAt)}</p>
                          </div>
                        </div>

                        {/* Event Name */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-bold mb-1">Event</p>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{reg.event.title}</p>
                        </div>

                        {/* Status & Payment */}
                        <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                          <div className="flex flex-col gap-2">
                            <Badge variant={getStatusColor(reg.status)} className="capitalize font-bold text-xs px-2.5 py-1 rounded-lg w-fit">
                              {reg.status}
                            </Badge>
                            <Badge variant={getPaymentColor(reg.paymentStatus)} className="capitalize font-bold text-xs px-2.5 py-1 rounded-lg w-fit">
                              {reg.paymentStatus}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-bold">Amount</p>
                            <p className="text-lg font-black text-green-600">{formatCurrency(reg.paymentAmount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View - Hidden on Mobile */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-100">
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Participant</th>
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Reg Number</th>
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Event</th>
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Status</th>
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Payment</th>
                          <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {registrationsData.registrations.map((reg: any) => (
                          <tr key={reg.id} className="hover:bg-gray-50/70 transition-colors group">
                            <td className="px-4 xl:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-md group-hover:scale-110 transition-transform shrink-0">
                                  {(reg.user.name?.charAt(0) || 'U').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-sm xl:text-base truncate max-w-[200px]">{reg.user.name}</p>
                                  <p className="text-xs xl:text-sm text-gray-500 truncate max-w-[200px] font-medium">{reg.user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-xs xl:text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                                {reg.registrationNumber}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <span className="text-sm xl:text-base text-gray-700 font-bold max-w-[250px] truncate block" title={reg.event.title}>
                                {reg.event.title}
                              </span>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <Badge variant={getStatusColor(reg.status)} className="capitalize font-bold text-xs xl:text-sm px-3 py-1 rounded-lg">
                                {reg.status}
                              </Badge>
                            </td>
                            <td className="px-4 xl:px-6 py-4">
                              <div className="flex flex-col gap-1.5">
                                <Badge variant={getPaymentColor(reg.paymentStatus)} className="capitalize font-bold text-xs px-2.5 py-0.5 rounded-md w-fit">
                                  {reg.paymentStatus}
                                </Badge>
                                <span className="text-sm xl:text-base font-black text-green-600">
                                  {formatCurrency(reg.paymentAmount)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm font-semibold text-gray-600">
                              {formatDate(reg.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 sm:py-24 md:py-32">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2">No registrations found</h3>
                  <p className="text-sm sm:text-base text-gray-500 font-semibold">Try adjusting your filters or search criteria</p>
                </div>
              )}

              {/* Pagination - Responsive */}
              {registrationsData?.pagination?.totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-t-2 border-gray-100 bg-gray-50/50">
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
    </div>
  );
}
