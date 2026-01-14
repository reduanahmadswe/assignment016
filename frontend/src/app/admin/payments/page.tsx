'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Download,
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Users,
  X,
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Button, Modal, Loading, Badge, Pagination } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Payment {
  id: string;
  transactionId: string;
  invoiceId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    slug: string;
  };
  registrationNumber?: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentData: Record<string, any>;
  createdAt: string;
  completedAt: string | null;
}

const statusConfig = {
  pending: { color: 'warning' as const, icon: Clock, label: 'Pending' },
  completed: { color: 'success' as const, icon: CheckCircle, label: 'Completed' },
  failed: { color: 'error' as const, icon: XCircle, label: 'Failed' },
  refunded: { color: 'secondary' as const, icon: DollarSign, label: 'Refunded' },
};

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventId, setEventId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [eventSearch, setEventSearch] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const eventsPerPage = 12;


  // Events query
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events-list'],
    queryFn: async () => {
      const response = await adminAPI.getEvents({ limit: 100 });
      return response.data.data; // Extract the data.data to get { events: [...], pagination: {...} }
    },
  });

  // Stats query
  const { data: statsData } = useQuery({
    queryKey: ['admin-payment-stats', eventId],
    queryFn: async () => {
      const response = await adminAPI.getPaymentStats(eventId || undefined);
      return response.data.data;
    },
  });

  // Payments query
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments', page, search, statusFilter, eventId],
    queryFn: async () => {
      const response = await adminAPI.getPayments({
        page,
        limit: 20,
        search,
        status: statusFilter,
        eventId: eventId || undefined,
      });
      return response.data.data;
    },
    enabled: !!eventId,
  });

  // Filter events - show all events
  const filteredEvents = eventsData?.events?.filter((event: any) => {
    if (!eventSearch) return true;
    const searchLower = eventSearch.toLowerCase();
    return event.title?.toLowerCase().includes(searchLower);
  }) || [];

  // Count only upcoming events for Active Events stat
  const upcomingEventsCount = eventsData?.events?.filter(
    (event: any) => event.eventStatus === 'upcoming'
  ).length || 0;

  // Paginate filtered events
  const totalEventsPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (eventsPage - 1) * eventsPerPage,
    eventsPage * eventsPerPage
  );

  const exportPayments = async () => {
    try {
      const response = await adminAPI.exportPayments({
        eventId: eventId || undefined,
        status: statusFilter,
        search,
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const selectedEvent = eventsData?.events?.find((e: any) => e.id === eventId);


  // EVENT SELECTION VIEW
  if (!eventId) {
    if (eventsLoading) return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
        <div className="text-center">
          <Loading />
          <p className="text-gray-500 font-medium mt-4 text-sm sm:text-base">Loading payments dashboard...</p>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                Payments
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                Select an event to view its transactions and revenue
              </p>
            </div>

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
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">
                Total System Revenue
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-blue-900">
                {formatCurrency(statsData?.totalRevenue || 0)}
              </p>
              <p className="text-xs text-blue-600 mt-2 font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Overall Income
              </p>
            </div>

            {/* Successful Transactions */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-green-600 uppercase tracking-wide mb-1">
                Successful Transactions
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-green-900">
                {statsData?.successfulTransactions || 0}
              </p>
              <p className="text-xs text-green-600 mt-2 font-semibold">
                ✓ Completed Payments
              </p>
            </div>

            {/* Active Events */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-wide mb-1">
                Active Events
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-900">
                {upcomingEventsCount}
              </p>
              <p className="text-xs text-purple-600 mt-2 font-semibold">
                ★ Upcoming Events
              </p>
            </div>
          </div>

          {/* Events Grid */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">Events Overview</h2>
            
            {filteredEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                  {paginatedEvents.map((event: any) => (
                    <div
                      key={event.id}
                      onClick={() => setEventId(event.id)}
                      className="group bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-primary-300 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col min-h-[260px] active:scale-95"
                    >
                      <div className="p-5 sm:p-6 flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <Badge 
                            variant={
                              event.eventStatus === 'upcoming' ? 'primary' :
                              event.eventStatus === 'ongoing' ? 'success' : 'default'
                            }
                            className="capitalize font-bold text-xs px-2.5 py-1"
                          >
                            {event.eventStatus}
                          </Badge>
                        </div>

                        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors min-h-[44px] flex items-center">
                          {event.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-gray-500 mb-4 flex items-center gap-1.5 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.startDate)}
                        </p>

                        <div className="space-y-2 pt-3 border-t-2 border-gray-50">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-bold">Ticket Price</span>
                            <span className="text-base font-black text-gray-900">
                              {event.isFree ? 'Free' : formatCurrency(event.price)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-t border-gray-100 min-h-[48px]">
                        <span className="text-xs font-bold text-gray-500">Revenue</span>
                        <span className="text-sm font-black text-green-600">View →</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
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
              <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-black text-gray-900 mb-2">No events found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  // PAYMENTS LIST VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 md:py-8 lg:py-10">
        
        {/* Header with Back Button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              onClick={() => {
                setEventId(null);
                setPage(1);
                setSearch('');
                setStatusFilter('');
              }}
              variant="outline"
              className="flex items-center gap-2 rounded-xl min-h-[44px] px-3 sm:px-4"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                {selectedEvent?.title || 'Event Payments'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                Transactions and financial details
              </p>
            </div>
          </div>

          <Button 
            onClick={exportPayments} 
            variant="outline" 
            className="flex items-center gap-2 rounded-xl min-h-[44px] font-bold"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Statement</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        {/* Stats for Selected Event */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-xl bg-blue-50 text-blue-600">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">Total Revenue</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
              {formatCurrency(statsData?.totalRevenue || 0).replace('BDT', '৳')}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-xl bg-indigo-50 text-indigo-600">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">Transactions</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
              {statsData?.totalTransactions || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-xl bg-green-50 text-green-600">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">Successful</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
              {statsData?.successfulTransactions || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 sm:p-3 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-500 mb-1">Pending</p>
            <p className="text-lg sm:text-xl md:text-2xl font-black text-gray-900">
              {statsData?.pendingTransactions || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-5 md:p-6 space-y-4">
            <div className="relative w-full">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, transaction ID, invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-sm sm:text-base bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl sm:rounded-2xl transition-all outline-none font-medium min-h-[44px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-sm sm:text-base font-semibold border-2 border-gray-100 rounded-xl sm:rounded-2xl py-3 px-4 bg-gray-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none cursor-pointer hover:border-gray-200 appearance-none min-h-[44px]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.75rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="completed">✓ Completed</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="failed">✕ Failed</option>
                  <option value="refunded">↩ Refunded</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {(statusFilter || search) && (
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
              </div>
            )}
          </div>
        </div>


        {/* Payments Display */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden">
          {paymentsLoading ? (
            <div className="flex justify-center items-center py-20 sm:py-32">
              <div className="text-center">
                <Loading />
                <p className="text-gray-500 font-medium mt-4 text-sm sm:text-base">Loading transactions...</p>
              </div>
            </div>
          ) : paymentsData?.payments?.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-100">
                {paymentsData.payments.map((payment: Payment) => {
                  const statusInfo = statusConfig[payment.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={payment.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                      {/* User Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-base font-black shadow-lg shrink-0">
                          {(payment.user.name?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-base truncate">{payment.user.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{payment.user.email}</p>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 font-bold mb-1">Transaction ID</p>
                          <p className="font-mono text-xs font-bold text-gray-900 truncate">{payment.transactionId}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 font-bold mb-1">Invoice</p>
                          <p className="font-mono text-xs font-bold text-gray-900 truncate">{payment.invoiceId}</p>
                        </div>
                      </div>

                      {/* Status & Amount */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
                        <Badge variant={statusInfo.color} className="capitalize font-bold text-xs px-2.5 py-1 rounded-lg">
                          {statusInfo.label}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-bold">Amount</p>
                          <p className="text-lg font-black text-green-600">{formatCurrency(payment.amount)}</p>
                        </div>
                      </div>

                      {/* View Details */}
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsDetailModalOpen(true);
                        }}
                        className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 py-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-100">
                      <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Transaction Info</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 xl:px-6 py-4 text-left text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 xl:px-6 py-4 text-right text-xs xl:text-sm font-black text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paymentsData.payments.map((payment: Payment) => {
                      const statusInfo = statusConfig[payment.status];

                      return (
                        <tr key={payment.id} className="hover:bg-gray-50/70 transition-colors group">
                          <td className="px-4 xl:px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 font-mono">
                                {payment.transactionId}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                INV: <span className="font-bold">{payment.invoiceId}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-md group-hover:scale-110 transition-transform">
                                {(payment.user.name?.charAt(0) || 'U').toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{payment.user.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{payment.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-gray-900">
                                {formatCurrency(payment.amount)}
                              </span>
                              {payment.fee > 0 && (
                                <span className="text-xs text-gray-400 font-medium">
                                  Fee: {formatCurrency(payment.fee)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 xl:px-6 py-4">
                            <Badge variant={statusInfo.color} className="capitalize font-bold text-xs px-3 py-1 rounded-lg">
                              {statusInfo.label}
                            </Badge>
                          </td>
                          <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-xs xl:text-sm font-semibold text-gray-600">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-4 xl:px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsDetailModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-20 sm:py-32">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <CreditCard className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-2">No payments found</h3>
              <p className="text-sm sm:text-base text-gray-500 font-semibold">No transactions recorded for this event</p>
            </div>
          )}

          {/* Pagination */}
          {paymentsData?.pagination && paymentsData.pagination.totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-t-2 border-gray-100 bg-gray-50/50">
              <Pagination
                currentPage={page}
                totalPages={paymentsData.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b-2 border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Paid Amount</p>
                <h2 className="text-4xl font-black text-gray-900">{formatCurrency(selectedPayment.amount)}</h2>
                <div className="flex justify-center mt-3">
                  <Badge variant={statusConfig[selectedPayment.status].color} className="text-sm px-4 py-1.5 font-bold">
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1.5">Date</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1.5">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedPayment.method || 'Online Payment'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1.5">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-200 font-semibold break-all">
                    {selectedPayment.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1.5">Invoice No</p>
                  <p className="text-sm font-mono text-gray-900 font-semibold">{selectedPayment.invoiceId}</p>
                </div>
                {selectedPayment.registrationNumber && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1.5">Registration</p>
                    <p className="text-sm font-mono text-gray-900 font-semibold">{selectedPayment.registrationNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <h4 className="font-black text-gray-900 mb-4 flex items-center text-base">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  Customer Information
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-black">
                    {(selectedPayment.user.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedPayment.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <h4 className="font-black text-gray-900 mb-4 flex items-center text-base">
                  <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                  Event Details
                </h4>
                <div>
                  <p className="font-bold text-gray-900">{selectedPayment.event.title}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Ticket purchase</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
