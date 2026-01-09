'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, Loading, Badge, Tabs, Button } from '@/components/ui';
import { EventCard } from '@/components/events';

export default function MyEventsPage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'upcoming';

  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery({
    queryKey: ['my-upcoming-events'],
    queryFn: async () => {
      const response = await userAPI.getMyEvents({ status: 'upcoming' });
      return response.data.events;
    },
  });

  const { data: pastEvents, isLoading: pastLoading } = useQuery({
    queryKey: ['my-past-events'],
    queryFn: async () => {
      const response = await userAPI.getMyEvents({ status: 'past' });
      return response.data.events;
    },
  });

  const { data: allEvents, isLoading: allLoading } = useQuery({
    queryKey: ['my-all-events'],
    queryFn: async () => {
      const response = await userAPI.getMyEvents({});
      return response.data.events;
    },
  });

  const renderEventsList = (events: any[], loading: boolean, emptyMessage: string, icon: any) => {
    if (loading) {
      return <Loading text="Loading events..." />;
    }

    if (!events || events.length === 0) {
      return (
        <div className="text-center py-16 px-4 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-gray-100">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{emptyMessage}</p>
          <Link href="/events">
            <Button className="bg-[#004aad] hover:bg-[#003366] text-white border-0 rounded-xl px-6 py-2.5 font-bold shadow-lg shadow-blue-500/20">
              Browse Events <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((registration: any) => (
          <div key={registration.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
            {/* We wrap EventCard but control layout */}
            <div className="flex-1">
              <EventCard event={registration.event} variant="default" className="h-full border-0 shadow-none rounded-none" />
            </div>

            <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/30 mt-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${registration.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : registration.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                    {registration.status}
                  </span>
                  {registration.payment_status && registration.payment_status !== 'free' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                      {registration.payment_status}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  Reg: {formatDate(registration.created_at)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabItems = [
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <Clock className="w-4 h-4" />,
      content: renderEventsList(upcomingEvents || [], upcomingLoading, 'You have no upcoming events scheduled.', <Clock className="w-8 h-8 text-gray-300" />),
    },
    {
      id: 'past',
      label: 'Past Events',
      icon: <CheckCircle className="w-4 h-4" />,
      content: renderEventsList(pastEvents || [], pastLoading, 'You haven\'t attended any events in the past.', <CheckCircle className="w-8 h-8 text-gray-300" />),
    },
    {
      id: 'all',
      label: 'All Events',
      icon: <Calendar className="w-4 h-4" />,
      content: renderEventsList(allEvents || [], allLoading, 'You haven\'t registered for any events yet.', <Calendar className="w-8 h-8 text-gray-300" />),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Events</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your registrations and track your learning journey.</p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6">
          <Tabs items={tabItems} defaultTab={defaultTab} variant="pills" />
        </div>
      </div>
    </div>
  );
}
