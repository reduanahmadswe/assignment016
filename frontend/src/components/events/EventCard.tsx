import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Tag, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency, getEventTypeLabel, getImageUrl, isBase64Image, cn } from '@/lib/utils';

interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  event_type: 'online' | 'offline' | 'hybrid';
  category: string;
  start_date: string;
  end_date: string;
  venue?: string;
  price: number;
  max_participants?: number;
  current_participants: number;
  status: string;
}

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'horizontal' | 'compact';
  className?: string;
}

export default function EventCard({ event, variant = 'default', className }: EventCardProps) {
  // Normalize fields to handle both camelCase (API) and snake_case (Legacy)
  const e = event as any;
  const startDate = e.start_date || e.startDate;
  const endDate = e.end_date || e.endDate;
  const eventType = e.event_type || e.eventType;
  const maxParticipants = e.max_participants || e.maxParticipants;
  const currentParticipants = e.current_participants || e.currentParticipants || 0;

  // Parse price as number
  const eventPrice = Number(event.price) || 0;
  const isFree = eventPrice === 0;
  const isFull = maxParticipants ? currentParticipants >= maxParticipants : false;
  const isPast = new Date(endDate) < new Date();

  // Safely get thumbnail - validate it looks like a valid image path
  const getThumbnail = () => {
    const thumb = e.thumbnail;
    if (!thumb) return '/images/event-placeholder.svg';
    // Check if it's a valid URL or path (not random text)
    if (thumb.startsWith('http') || thumb.startsWith('data:') || thumb.startsWith('/') || thumb.startsWith('uploads/')) {
      return getImageUrl(thumb);
    }
    return '/images/event-placeholder.svg';
  };
  const thumbnailSrc = getThumbnail();

  // Get type badge color
  const getTypeBadge = (type: string) => {
    if (type === 'online') return 'badge-blue';
    if (type === 'offline') return 'badge-purple';
    return 'badge-blue';
  };

  if (variant === 'horizontal') {
    return (
      <Link href={`/events/${event.slug}`} className={cn("group", className)}>
        <div className="card card-hover flex flex-col md:flex-row overflow-hidden">
          {/* Image */}
          <div className="relative w-full md:w-72 h-52 md:h-auto flex-shrink-0">
            <Image
              src={thumbnailSrc}
              alt={event.title}
              fill
              unoptimized={thumbnailSrc.startsWith('data:')}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isPast && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Past Event
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={getTypeBadge(eventType)}>
                {getEventTypeLabel(eventType)}
              </span>
              <span className="badge-purple">{event.category}</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors mb-3">
              {event.title}
            </h3>

            <p className="text-gray-600 mb-5 line-clamp-2">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-5">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-secondary-500" />
                {formatDate(startDate)}
              </div>
              {event.venue && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-secondary-500" />
                  {event.venue}
                </div>
              )}
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-secondary-500" />
                {currentParticipants}{maxParticipants ? `/${maxParticipants}` : ''} enrolled
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-accent-600">
                {isFree ? 'Free' : formatCurrency(eventPrice)}
              </div>
              {isFull && !isPast && (
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                  Full
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/events/${event.slug}`} className={cn("group", className)}>
        <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={thumbnailSrc}
              alt={event.title}
              fill
              unoptimized={thumbnailSrc.startsWith('data:')}
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 truncate mb-1">
              {event.title}
            </h4>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {formatDate(startDate)}
            </div>
          </div>
          <div className="text-base font-bold text-accent-600">
            {isFree ? 'Free' : formatCurrency(eventPrice)}
          </div>
        </div>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link href={`/events/${event.slug}`} className="group h-full">
      <div className={cn(
        "relative overflow-hidden h-full flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#004aad]/30 hover:-translate-y-2 hover:scale-[1.02]",
        className
      )}>

        {/* Image Section - Top - Compact Aspect Ratio */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={thumbnailSrc}
            alt={event.title}
            fill
            unoptimized={thumbnailSrc.startsWith('data:')}
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />

          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Logo/Brand - Top Left on Image */}
          <div className="absolute top-2 left-2 z-10 transition-transform duration-300 group-hover:scale-110">
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300">
              <div className="w-4 h-4 rounded-full bg-[#004aad] flex items-center justify-center group-hover:bg-[#0056cc] transition-colors duration-300">
                <Calendar className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-bold text-[#004aad] tracking-wide">ORIYET</span>
            </div>
          </div>

          {/* Event Type Badge - Top Right on Image */}
          <div className="absolute top-2 right-2 z-10 transition-transform duration-300 group-hover:scale-110">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm group-hover:shadow-md transition-all duration-300",
              eventType === 'online' ? 'bg-[#004aad]/90 text-white group-hover:bg-[#004aad]' :
                eventType === 'offline' ? 'bg-[#ff7620]/90 text-white group-hover:bg-[#ff7620]' :
                  'bg-gradient-to-r from-[#004aad]/90 to-[#ff7620]/90 text-white group-hover:from-[#004aad] group-hover:to-[#ff7620]'
            )}>
              {getEventTypeLabel(eventType)}
            </span>
          </div>

          {/* Overlay for past/full events */}
          {(isPast || isFull) && (
            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center backdrop-blur-[2px] z-20">
              <span className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform rotate-[-5deg] border border-gray-200">
                {isPast ? 'Past Event' : 'Registration Full'}
              </span>
            </div>
          )}
        </div>

        {/* Content Section - Bottom */}
        <div className="flex-1 flex flex-col p-4">
          {/* Title */}
          <h3 className="text-base font-bold leading-tight mb-1.5 text-gray-900 group-hover:text-[#004aad] transition-colors duration-300 line-clamp-2">
            {event.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3 flex-1 group-hover:text-gray-700 transition-colors duration-300">
            {event.description}
          </p>

          {/* Footer: Date, Venue & Price */}
          <div className="space-y-1.5">
            <div className="flex items-center text-[11px] font-medium text-gray-600 group-hover:text-[#004aad] transition-colors duration-300">
              <Calendar className="w-3 h-3 mr-1 text-[#004aad] group-hover:scale-110 transition-transform duration-300" />
              {formatDate(startDate)}
            </div>

            {event.venue && (
              <div className="flex items-center text-[11px] font-medium text-gray-600 group-hover:text-[#ff7620] transition-colors duration-300">
                <MapPin className="w-3 h-3 mr-1 text-[#ff7620] group-hover:scale-110 transition-transform duration-300" />
                <span className="line-clamp-1">{event.venue}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="text-base font-bold text-[#004aad] group-hover:scale-110 transition-transform duration-300 origin-left">
                {isFree ? 'Free' : formatCurrency(eventPrice)}
              </div>

              <div className="flex items-center gap-1 text-[#ff7620] font-bold text-[11px] group-hover:gap-2 transition-all duration-300">
                <span className="group-hover:underline">View Details</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
