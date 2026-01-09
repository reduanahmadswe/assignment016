'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { eventAPI } from '@/lib/api';
import { EventCard, EventFilters, EventFiltersType } from '@/components/events';
import { Loading, EventCardSkeleton, Pagination } from '@/components/ui';
import { ServerCrash, RefreshCcw, Search, CalendarOff } from 'lucide-react';

const categories = [
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Personal Development',
  'Language',
  'Science',
  'Health',
  'Finance',
  'Education',
  'Bioinformatics',
  'Nanotechnology',
  'Research',
];

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFiltersType>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    eventType: searchParams.get('type') || '',
    priceRange: searchParams.get('price') || '',
    dateRange: searchParams.get('date') || '',
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 12, // Increased limit for larger screens
        status: 'published',
        event_status: 'upcoming', // Only show upcoming events
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.eventType) params.event_type = filters.eventType;

      const response = await eventAPI.getAll(params);
      return response.data;
    },
    retry: 1,
  });

  const handleFilterChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Filters & Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <EventFilters
            onFilterChange={handleFilterChange}
            categories={categories}
          />
        </div>

        {/* Events Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl mx-auto text-center px-4">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ServerCrash className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Events Unavailable at the Moment
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8 text-lg">
                We are currently connecting to our secure backend servers. The events feed will be live precisely when the backend integration is complete.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#004aad] rounded-lg text-sm font-medium mb-8 border border-blue-100">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#004aad]"></span>
                </span>
                System Status: Backend Integration in Progress
              </div>

              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-8 py-3 bg-[#004aad] hover:bg-[#003882] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#004aad]/30 hover:-translate-y-0.5 active:translate-y-0"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          ) : data?.events?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-lg max-w-2xl mx-auto text-center px-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <CalendarOff className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We couldn't find any upcoming events matching your filters. Try adjusting your search criteria.
              </p>
              <button
                onClick={() => handleFilterChange({ search: '', category: '', eventType: '', priceRange: '', dateRange: '' })}
                className="px-6 py-2.5 text-[#004aad] border-2 border-[#004aad]/20 rounded-xl font-semibold hover:bg-[#004aad]/5 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <p className="text-sm text-gray-500 font-medium">
                  Showing <span className="text-gray-900 font-bold">{data?.events?.length}</span> upcoming opportunities
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.events?.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
