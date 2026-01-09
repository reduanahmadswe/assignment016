import { EventCardSkeleton } from '@/components/ui';

export default function Loading() {
  return (
    <div>
      {/* Hero Skeleton */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 text-white overflow-hidden">
        <div className="container-custom py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <div className="h-16 bg-white/10 rounded-lg animate-pulse max-w-2xl mx-auto lg:mx-0"></div>
              <div className="h-24 bg-white/10 rounded-lg animate-pulse max-w-xl mx-auto lg:mx-0"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <div className="h-14 w-48 bg-white/10 rounded-lg animate-pulse"></div>
                <div className="h-14 w-48 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Skeleton */}
      <section className="py-12 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                <div className="h-8 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Skeleton */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-72 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
