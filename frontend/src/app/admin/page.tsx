'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Clock,
  Plus,
  MoreHorizontal,
  Search,
  Activity,
  DollarSign
} from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Loading, Skeleton, Badge, Button } from '@/components/ui';

export default function AdminDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminAPI.getDashboardStats();
      return response.data.data;
    },
  });

  const { data: recentRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['recent-registrations'],
    queryFn: async () => {
      try {
        const response = await adminAPI.getRecentRegistrations(5);
        return response.data?.data?.registrations || [];
      } catch (error) {
        console.error('Failed to fetch registrations:', error);
        return [];
      }
    },
  });

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['admin-upcoming-events'],
    queryFn: async () => {
      try {
        const response = await adminAPI.getUpcomingEvents(5);
        return response.data?.data?.events || [];
      } catch (error) {
        console.error('Failed to fetch upcoming events:', error);
        return [];
      }
    },
  });

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.total_users || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
      href: '/admin/users',
    },
    {
      label: 'Total Events',
      value: stats?.total_events || 0,
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: 'emerald',
      href: '/admin/events',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0),
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'violet',
      href: '/admin/payments',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mt-10">
        <div >
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back, Admin! Here's your daily summary.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="hidden sm:flex items-center px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-600 border border-gray-200">
            <Clock className="w-4 h-4 mr-2.5 text-gray-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <Button
            variant="primary"
            className="rounded-xl shadow-lg shadow-primary-500/20 w-full sm:w-auto justify-center py-2.5 sm:py-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm h-40">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))
          : statCards.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 ring-blue-50',
              emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-50',
              violet: 'bg-violet-50 text-violet-600 ring-violet-50',
            }[stat.color] || 'bg-gray-50 text-gray-600';

            return (
              <Link key={stat.label} href={stat.href} className="group block focus:outline-none">
                <div className="relative bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-3.5 rounded-2xl ${colorClasses} ring-1 ring-inset`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                      {stat.change}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-1">{stat.value}</h3>
                    <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </Link>
            );
          })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Registrations (Occupies 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg">Recent Registrations</h3>
                  <p className="text-xs sm:text-sm text-gray-500">Latest activity from your users</p>
                </div>
              </div>
              <Link
                href="/admin/registrations"
                className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                View all
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              {registrationsLoading ? (
                <div className="p-6 space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentRegistrations?.length > 0 ? (
                <div className="divide-y divide-gray-50 min-w-[600px] sm:min-w-0">
                  {recentRegistrations.map((reg: any) => (
                    <div key={reg.id} className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                          {(reg?.user?.name?.charAt(0) ?? 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 max-w-[150px] sm:max-w-xs truncate">{reg?.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">{reg?.user?.email}</p>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-gray-700 max-w-[150px] lg:max-w-[200px] truncate">{reg?.event?.title || 'Unknown Event'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-medium">{formatDate(reg.createdAt)}</p>
                      </div>

                      <div>
                        <Badge
                          variant={reg.status === 'confirmed' ? 'success' : reg.status === 'pending' ? 'warning' : 'error'}
                          className="capitalize py-1 px-2.5 text-xs"
                        >
                          {reg.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-bold mb-1">No activities yet</h3>
                  <p className="text-gray-500 text-sm">New registrations will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6 sm:space-y-8">
          {/* Upcoming Events Widget */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Upcoming Events</h3>
                <p className="text-xs sm:text-sm text-gray-500">Next on schedule</p>
              </div>
              <Link href="/admin/events" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {eventsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : upcomingEvents?.length > 0 ? (
                upcomingEvents.map((event: any) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.slug || event.id}`}
                    className="block p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-14 text-center bg-gray-50 rounded-xl p-1.5 border border-gray-100 group-hover:border-red-100 group-hover:bg-red-50/50 transition-colors">
                        <span className="block text-[10px] font-bold text-red-500 uppercase tracking-wider">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="block text-xl font-extrabold text-gray-900 leading-none mt-0.5">
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 flex items-center font-medium">
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            {event.registrationCount || 0}/{event.maxParticipants || '∞'}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${event.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 font-medium">No upcoming events found</p>
                </div>
              )}

              <Link
                href="/admin/events"
                className="block w-full py-3 text-center text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl mt-2 transition-colors uppercase tracking-wide"
              >
                View Full Calendar
              </Link>
            </div>
          </div>

          {/* Quick Actions Widget */}
          <div className="bg-gradient-to-br from-[#004aad] to-[#002a66] rounded-[1.5rem] p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-32 h-32" />
            </div>

            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">Quick Actions</h3>
              <p className="text-blue-100 text-sm mb-6 opacity-90">Manage your platform efficiently</p>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/users" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl transition-all border border-white/10 hover:border-white/20 group">
                  <Users className="w-6 h-6 mb-3 text-blue-200 group-hover:text-white transition-colors" />
                  <span className="text-xs font-bold block tracking-wide">Manage Users</span>
                </Link>

                <Link href="/admin/blog/new" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl transition-all border border-white/10 hover:border-white/20 group">
                  <BarChart3 className="w-6 h-6 mb-3 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                  <span className="text-xs font-bold block tracking-wide">Write Post</span>
                </Link>

                <Link href="/admin/payments" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl transition-all border border-white/10 hover:border-white/20 group">
                  <CreditCard className="w-6 h-6 mb-3 text-violet-300 group-hover:text-violet-200 transition-colors" />
                  <span className="text-xs font-bold block tracking-wide">Payments</span>
                </Link>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white text-[#004aad] hover:bg-blue-50 p-4 rounded-xl transition-all border border-white/10 text-left shadow-lg"
                >
                  <Plus className="w-6 h-6 mb-3" />
                  <span className="text-xs font-bold block tracking-wide">Create Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
