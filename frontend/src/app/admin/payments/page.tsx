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
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { api, adminAPI } from '@/lib/api';
import { Button, Modal, Loading, Badge, Pagination, Card, CardContent, Input } from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

// ... (keep interface Payment and statusConfig as is)
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
  const [status, setStatus] = useState('');
  const [eventId, setEventId] = useState<string | null>(null); // Null means "List Mode"
  const [page, setPage] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Events query (for selection list)
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-events-list'],
    queryFn: () => adminAPI.getEvents({ limit: 100 }).then(res => res.data),
  });

  // Stats query
  const { data: statsData } = useQuery({
    queryKey: ['admin-payment-stats', eventId],
    queryFn: () => api.get('/admin/payments/stats', { params: { eventId } }).then(res => res.data),
  });

  // Payments query
  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, search, status, eventId],
    queryFn: () =>
      adminAPI.getPayments({ page, limit: 20, search, status, eventId })
        .then(res => res.data),
    enabled: !!eventId,
  });

  const exportPayments = async () => {
    try {
      const response = await api.get('/admin/payments/export', {
        responseType: 'blob',
        params: { search, status, eventId }
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments-${eventId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const selectedEvent = eventsData?.events?.find((e: any) => e.id === eventId);

  // RENDER: EVENT SELECTION VIEW
  if (!eventId) {
    if (eventsLoading) return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Loading payments dashboard..." />
      </div>
    );

    return (
      <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Payments</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Select an event to view its transactions and revenue.</p>
          </div>
          {/* Could add a 'All Transactions' global view button later */}
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-blue-100 relative overflow-hidden group">
            <div className="absolute top-4 right-4 p-2 bg-blue-200/50 text-blue-700 rounded-xl">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-blue-600 mb-1 uppercase tracking-wide">Total System Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{formatCurrency(statsData?.totalRevenue || 0)}</h3>
            <div className="mt-4 flex items-center text-xs sm:text-sm text-blue-700 font-bold">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>Overall Income</span>
            </div>
          </div>

          {/* Successful Transactions */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-emerald-100 relative overflow-hidden group">
            <div className="absolute top-4 right-4 p-2 bg-emerald-200/50 text-emerald-700 rounded-xl">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wide">Successful Transactions</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{statsData?.successfulTransactions || 0}</h3>
            <div className="mt-4 flex items-center text-xs sm:text-sm text-emerald-700 font-bold">
              <Activity className="w-4 h-4 mr-1.5" />
              <span>Completed Payments</span>
            </div>
          </div>

          {/* Active Events */}
          <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-violet-100 relative overflow-hidden group">
            <div className="absolute top-4 right-4 p-2 bg-violet-200/50 text-violet-700 rounded-xl">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-violet-600 mb-1 uppercase tracking-wide">Active Events</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{eventsData?.events?.length || 0}</h3>
            <div className="mt-4 flex items-center text-xs sm:text-sm text-violet-700 font-bold">
              <Activity className="w-4 h-4 mr-1.5" />
              <span>With Transactions</span>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Events Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {eventsData?.events?.map((event: any) => (
              <div
                key={event.id}
                onClick={() => setEventId(event.id)}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={event.eventStatus === 'ongoing' ? 'success' : event.eventStatus === 'upcoming' ? 'primary' : 'secondary'} className="capitalize font-bold">
                    {event.eventStatus}
                  </Badge>
                  <div className="p-1.5 rounded-full bg-gray-50 group-hover:bg-primary-50 text-gray-400 group-hover:text-primary-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary-700 transition-colors text-lg">
                  {event.title}
                </h3>

                <div className="flex items-center text-sm font-medium text-gray-500 mb-auto">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  {formatDate(event.startDate)}
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Ticket Price</span>
                    <span className="font-extrabold text-gray-900">{formatCurrency(event.price)}</span>
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-lg group-hover:bg-primary-100 transition-colors">View Transactions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: PAYMENTS LIST VIEW (Existing Logic adapted)
  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
        <div>
          <button
            onClick={() => setEventId(null)}
            className="flex items-center text-sm text-gray-500 hover:text-primary-600 mb-2 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Events
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{selectedEvent?.title || 'Event Payments'}</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Managing transactions and financial details for this event</p>
        </div>
        <Button onClick={exportPayments} variant="outline" className="shadow-sm w-full md:w-auto justify-center rounded-xl" leftIcon={<Download className="w-4 h-4" />}>
          Export Statement
        </Button>
      </div>

      {/* Stats for Selected Event */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: statsData?.totalRevenue, icon: DollarSign, color: 'blue', isCurrency: true },
          { label: 'Total Transactions', value: statsData?.totalTransactions, icon: CreditCard, color: 'indigo', isCurrency: false },
          { label: 'Successful', value: statsData?.successfulTransactions, icon: CheckCircle, color: 'emerald', isCurrency: false },
          { label: 'Pending', value: statsData?.pendingTransactions, icon: Clock, color: 'amber', isCurrency: false },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500">{stat.label}</p>
              <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                {stat.isCurrency ? formatCurrency(stat.value || 0) : (stat.value || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col h-full">
        {/* Filters */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search user, transaction ID, invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-medium border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loading text="Loading transactions..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.payments?.map((payment: Payment) => {
                  const statusInfo = statusConfig[payment.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={payment.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 font-mono">
                            {payment.transactionId}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 font-medium">
                            INV: <span className="font-bold">{payment.invoiceId}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {(payment.user.name?.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">
                              {payment.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {payment.user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </span>
                          {payment.fee > 0 && (
                            <span className="text-xs text-gray-400 font-medium">
                              Fee: {formatCurrency(payment.fee)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={statusInfo.color} className="capitalize px-2.5 py-0.5 font-bold">
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
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

            {data?.payments?.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No payments found</h3>
                <p className="text-gray-500 font-medium">No transactions recorded for this event yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
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
            {/* Payment Summary Ticket */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-gray-50/50 p-6 border-b border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Paid Amount</p>
                <h2 className="text-4xl font-extrabold text-gray-900">{formatCurrency(selectedPayment.amount)}</h2>
                <div className="flex justify-center mt-3">
                  <Badge variant={statusConfig[selectedPayment.status].color} className="text-sm px-3 py-1 font-bold">
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Date</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 capitalize">{selectedPayment.method || 'Online Payment'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all bg-gray-50 p-1.5 rounded-lg border border-gray-100 inline-block font-medium">
                    {selectedPayment.transactionId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">Invoice No</p>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all font-medium">
                    {selectedPayment.invoiceId}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer & Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-gray-400" />
                  Customer Information
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    {(selectedPayment.user.name?.charAt(0) || 'U').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedPayment.user.name}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
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
