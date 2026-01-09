'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Calendar, Award, Clock, ArrowRight } from 'lucide-react';
import { userAPI, eventAPI } from '@/lib/api';
import { useAppSelector } from '@/store/hooks';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { EventCard } from '@/components/events';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await userAPI.getDashboardStats();
      const s = response.data; // e.g. { registered_events: 5, upcoming_events: 2, certificates: 3 }
      return {
        registeredEvents: s.registered_events || 0,
        upcomingEvents: s.upcoming_events || 0,
        certificates: s.certificates || 0,
        totalSpent: s.total_spent || 0,
      };
    },
  });

  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['user-upcoming-events'],
    queryFn: async () => {
      const response = await eventAPI.getMyEvents();
      return response.data.data.upcoming.slice(0, 3);
    },
  });

  const { data: recentCertificates, isLoading: certsLoading } = useQuery({
    queryKey: ['user-recent-certificates'],
    queryFn: async () => {
      const response = await userAPI.getMyCertificates({ limit: 3 });
      return response.data.certificates;
    },
  });

  const statCards = [
    {
      label: 'Registered Events',
      value: stats?.registeredEvents || 0,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100',
      href: '/my-events',
    },
    {
      label: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100',
      href: '/my-events?tab=upcoming',
    },
    {
      label: 'Certificates',
      value: stats?.certificates || 0,
      icon: Award,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100',
      href: '/certificates',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here's what's happening with your learning journey today.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
          : statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href} className="block group">
                <Card className={`h-full border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${stat.borderColor}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-gray-400 group-hover:text-primary-500 transition-colors">
                        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <Card className="border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary-500" />
                Upcoming Events
              </CardTitle>
              <Link href="/my-events" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center transition-colors group">
                View All <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {eventsLoading ? (
              <div className="p-6 space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors block">
                    <EventCard event={event} variant="compact" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                <p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">
                  You haven't registered for any upcoming events yet.
                </p>
                <Link href="/events" className="btn-primary hover:scale-105 transition-transform">
                  Browse Events
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card className="border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5 text-purple-500" />
                Recent Certificates
              </CardTitle>
              <Link href="/certificates" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center transition-colors group">
                View All <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {certsLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : recentCertificates && recentCertificates.length > 0 ? (
              <div className="p-6 space-y-4">
                {recentCertificates.map((cert: any) => (
                  <div key={cert.id} className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-1">{cert.event_title}</h4>
                        <p className="text-sm text-gray-500">Issued {formatDate(cert.issued_at)}</p>
                      </div>
                    </div>
                    <Link
                      href={`/certificates/${cert.certificate_number}`}
                      className="px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full min-h-[300px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
                <p className="text-gray-500 mt-1 mb-6 max-w-xs mx-auto">
                  Attend events to earn certificates and showcase your achievements.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
