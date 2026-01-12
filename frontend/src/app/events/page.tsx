'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { eventAPI } from '@/lib/api';
import { EventCard, EventFilters, EventFiltersData } from '@/components/events';
import { EventCardSkeleton, Pagination } from '@/components/ui';
import { CalendarOff } from 'lucide-react';

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFiltersData>({
    search: searchParams.get('search') || '',
    eventMode: searchParams.get('mode') || '',
    priceRange: searchParams.get('price') || '',
    dateRange: searchParams.get('date') || '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['events', page, filters],
    queryFn: async () => {
      const params: any = {
        page,
        limit: 12, // Increased limit for larger screens
        status: 'published',
        event_status: 'upcoming', // Only show upcoming events
      };

      if (filters.search) params.search = filters.search;
      if (filters.eventMode) params.event_mode = filters.eventMode;
      if (filters.priceRange) params.price_range = filters.priceRange;
      if (filters.dateRange) params.date_range = filters.dateRange;

      const response = await eventAPI.getAll(params);
      return response.data;
    },
    retry: 1,
  });

  const handleFilterChange = (newFilters: EventFiltersData) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-12 md:py-16 bg-gradient-to-r from-[#004aad] to-[#003882] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff7620]/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-lg sm:text-xl text-orange-400 font-semibold mb-2">
            জাগো বাংলাদেশ, জ্ঞান-গবেষণায়, আবিষ্কার-উদ্ভাবনে
          </p>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Learn something new, connect with experts, and advance your career
          </p>
        </div>
      </section>

      {/* Filters & Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <EventFilters
            onFilterChange={handleFilterChange}
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
              <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <CalendarOff className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Events Not Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg">
                Stay tuned! Exciting events are coming soon. Check back later for workshops, seminars, and learning opportunities.
              </p>
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
                onClick={() => handleFilterChange({ search: '', eventMode: '', priceRange: '', dateRange: '' })}
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
