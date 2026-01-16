import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, generateRegistrationNumber, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { sendRegistrationConfirmation, sendEventLink } from '../../utils/email.util.js';

interface CreateEventInput {
  title: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  event_type: 'seminar' | 'workshop' | 'webinar';
  event_mode: 'online' | 'offline' | 'hybrid';
  venue_details?: object;
  online_link?: string;
  online_platform?: 'zoom' | 'google_meet' | 'other';
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  is_free: boolean;
  price?: number;
  max_participants?: number;
  has_certificate: boolean;
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
  host_ids?: number[];
  guests?: Array<{
    name: string;
    email: string;
    bio?: string;
    role: string;
    pictureLink?: string;
    website?: string;
    cvLink?: string;
  }>;
  // Certificate Signature Fields
  signature1_name?: string;
  signature1_title?: string;
  signature1_image?: string;
  signature2_name?: string;
  signature2_title?: string;
  signature2_image?: string;
}

interface EventFilters {
  event_type?: string;
  event_mode?: string;
  event_status?: string;
  is_free?: boolean;
  is_featured?: boolean;
  search?: string;
  price_range?: string;
  date_range?: string;
  category?: string;
}

export class EventService {
  async createEvent(data: CreateEventInput, createdBy: number) {
    const slug = generateSlug(data.title) + '-' + Date.now().toString(36);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const event = await tx.event.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
          thumbnail: data.thumbnail,
          eventType: data.event_type,
          eventMode: data.event_mode,
          venueDetails: data.venue_details ? JSON.stringify(data.venue_details) : null,
          onlineLink: data.online_link,
          onlinePlatform: data.online_platform,
          startDate: new Date(data.start_date),
          endDate: new Date(data.end_date),
          registrationDeadline: data.registration_deadline ? new Date(data.registration_deadline) : null,
          isFree: data.is_free,
          price: data.price || 0,
          maxParticipants: data.max_participants,
          hasCertificate: data.has_certificate,
          metaTitle: data.meta_title,
          metaDescription: data.meta_description,
          isFeatured: data.is_featured || false,
          guests: data.guests && data.guests.length > 0 ? JSON.stringify(data.guests) : null,
          // Certificate Signature Fields
          signature1Name: data.signature1_name,
          signature1Title: data.signature1_title,
          signature1Image: data.signature1_image,
          signature2Name: data.signature2_name,
          signature2Title: data.signature2_title,
          signature2Image: data.signature2_image,
          createdBy,
        },
      });

      return this.getEventById(event.id);
    });
  }

  async updateEvent(eventId: number, data: Partial<CreateEventInput> & { registration_status?: string, event_status?: string, video_link?: string, session_summary?: string, session_summary_pdf?: string, is_published?: boolean }) {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.event_type !== undefined) updateData.eventType = data.event_type;
    if (data.event_mode !== undefined) updateData.eventMode = data.event_mode;
    if (data.online_link !== undefined) updateData.onlineLink = data.online_link;
    if (data.online_platform !== undefined) updateData.onlinePlatform = data.online_platform;
    if (data.start_date !== undefined) updateData.startDate = new Date(data.start_date);
    if (data.end_date !== undefined) updateData.endDate = new Date(data.end_date);
    if (data.registration_deadline !== undefined) updateData.registrationDeadline = data.registration_deadline ? new Date(data.registration_deadline) : null;
    if (data.is_free !== undefined) updateData.isFree = data.is_free;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.max_participants !== undefined) updateData.maxParticipants = data.max_participants;
    if (data.has_certificate !== undefined) updateData.hasCertificate = data.has_certificate;
    if (data.registration_status !== undefined) updateData.registrationStatus = data.registration_status;
    if (data.event_status !== undefined) updateData.eventStatus = data.event_status;
    if (data.video_link !== undefined) updateData.videoLink = data.video_link;
    if (data.session_summary !== undefined) updateData.sessionSummary = data.session_summary;
    if (data.session_summary_pdf !== undefined) updateData.sessionSummaryPdf = data.session_summary_pdf;
    if (data.meta_title !== undefined) updateData.metaTitle = data.meta_title;
    if (data.meta_description !== undefined) updateData.metaDescription = data.meta_description;
    if (data.is_featured !== undefined) updateData.isFeatured = data.is_featured;
    if (data.is_published !== undefined) updateData.isPublished = data.is_published;
    if (data.venue_details !== undefined) updateData.venueDetails = data.venue_details ? JSON.stringify(data.venue_details) : null;
    if (data.guests !== undefined) {
      updateData.guests = (data.guests && data.guests.length > 0) ? JSON.stringify(data.guests) : null;
    }
    
    // Certificate Signature Fields
    if (data.signature1_name !== undefined) updateData.signature1Name = data.signature1_name;
    if (data.signature1_title !== undefined) updateData.signature1Title = data.signature1_title;
    if (data.signature1_image !== undefined) updateData.signature1Image = data.signature1_image;
    if (data.signature2_name !== undefined) updateData.signature2Name = data.signature2_name;
    if (data.signature2_title !== undefined) updateData.signature2Title = data.signature2_title;
    if (data.signature2_image !== undefined) updateData.signature2Image = data.signature2_image;

    if (data.title && data.title !== event.title) {
      updateData.slug = generateSlug(data.title) + '-' + Date.now().toString(36);
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.event.update({ where: { id: eventId }, data: updateData });
    }

    return this.getEventById(eventId);
  }

  async getEventById(eventId: number) {
    let event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: { not: 'cancelled' },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Lazy update: Check if event has ended but status not updated
    if (new Date(event.endDate) < new Date() && ['upcoming', 'ongoing'].includes(event.eventStatus)) {
      event = await prisma.event.update({
        where: { id: eventId },
        data: {
          eventStatus: 'completed',
          registrationStatus: 'closed'
        },
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { not: 'cancelled' },
                },
              },
            },
          },
        },
      });
    }

    // Parse guests JSON
    let guests = [];
    if (event.guests) {
      try {
        guests = JSON.parse(event.guests);
      } catch (error) {
        console.error('Failed to parse guests JSON:', error);
      }
    }

    return {
      ...event,
      registered_count: event._count.registrations,
      guests,
    };
  }

  async getEventBySlug(slug: string) {
    let event = await prisma.event.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: { not: 'cancelled' },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Lazy update: Check if event has ended but status not updated
    if (new Date(event.endDate) < new Date() && ['upcoming', 'ongoing'].includes(event.eventStatus)) {
      event = await prisma.event.update({
        where: { id: event.id },
        data: {
          eventStatus: 'completed',
          registrationStatus: 'closed'
        },
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { not: 'cancelled' },
                },
              },
            },
          },
        },
      });
    }

    // Parse guests JSON
    let guests = [];
    if (event.guests) {
      try {
        guests = JSON.parse(event.guests);
      } catch (error) {
        console.error('Failed to parse guests JSON:', error);
      }
    }

    return {
      ...event,
      registered_count: event._count.registrations,
      guests,
    };
  }

  async getAllEvents(page: number = 1, limit: number = 10, filters: EventFilters = {}) {
    const { offset } = paginate(page, limit);
    const where: any = { isPublished: true };

    if (filters.event_type) where.eventType = filters.event_type;
    if (filters.event_mode) where.eventMode = filters.event_mode;
    if (filters.event_status) where.eventStatus = filters.event_status;
    if (filters.is_free !== undefined) where.isFree = filters.is_free;
    if (filters.is_featured !== undefined) where.isFeatured = filters.is_featured;
    if (filters.category) where.category = filters.category;

    // Price Filtering
    if (filters.price_range) {
      if (filters.price_range === 'free') {
        where.isFree = true;
      } else if (filters.price_range === 'paid') {
        where.isFree = false;
      } else if (filters.price_range === '0-500') {
        where.price = { gte: 0, lte: 500 };
      } else if (filters.price_range === '500-1000') {
        where.price = { gte: 500, lte: 1000 };
      } else if (filters.price_range === '1000+') {
        where.price = { gt: 1000 };
      }
    }

    // Date Filtering
    if (filters.date_range) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (filters.date_range === 'today') {
        where.startDate = {
          gte: today,
          lt: tomorrow,
        };
      } else if (filters.date_range === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        where.startDate = {
          gte: today,
          lte: nextWeek,
        };
      } else if (filters.date_range === 'month') {
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        where.startDate = {
          gte: today,
          lte: endOfMonth
        };
      } else if (filters.date_range === 'next_month') {
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        where.startDate = {
          gte: startOfNextMonth,
          lte: endOfNextMonth,
        };
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    // Re-evaluating types after prisma generate
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          category: true,
          eventType: true,
          eventMode: true,
          startDate: true,
          endDate: true,
          isFree: true,
          price: true,
          registrationStatus: true,
          eventStatus: true,
          hasCertificate: true,
          isFeatured: true,
          currentParticipants: true,
          maxParticipants: true,
        },
        orderBy: [
          {
            eventStatus: 'asc',
          },
          {
            startDate: 'asc',
          },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getUpcomingEvents(limit: number = 6) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        eventStatus: 'upcoming',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: true,
        eventMode: true,
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: true,
        hasCertificate: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
    return events;
  }

  async getFeaturedEvents(limit: number = 3) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        eventStatus: { in: ['upcoming', 'ongoing'] },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: true,
        eventMode: true,
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: true,
        hasCertificate: true,
        isFeatured: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
    return events;
  }

  async getOngoingEvents(limit: number = 6) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        eventStatus: 'ongoing',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: true,
        eventMode: true,
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: true,
        hasCertificate: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });
    return events;
  }

  async getPastEvents(page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          isPublished: true,
          eventStatus: 'completed',
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          eventType: true,
          eventMode: true,
          startDate: true,
          endDate: true,
          videoLink: true,
          sessionSummary: true,
        },
        orderBy: { endDate: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.event.count({
        where: {
          isPublished: true,
          eventStatus: 'completed',
        },
      }),
    ]);

    return {
      events,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async registerForEvent(eventId: number, userId: number) {
    const event = await this.getEventById(eventId);

    // ⭐ SECURITY: Reject paid events - they must use payment flow
    if (!event.isFree) {
      throw new AppError(
        'This is a paid event. Please use the payment endpoint to register.',
        400
      );
    }

    // Check registration status
    if (event.registrationStatus === 'closed') {
      throw new AppError('Registration is closed for this event', 400);
    }
    if (event.registrationStatus === 'full') {
      throw new AppError('This event is full', 400);
    }

    // Check deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      throw new AppError('Registration deadline has passed', 400);
    }

    // Check if already registered (only active registrations)
    const existing = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { in: ['confirmed', 'pending'] }, // ⭐ Ignore cancelled registrations
      },
    });
    if (existing) {
      throw new AppError('You are already registered for this event', 400);
    }

    const registrationNumber = generateRegistrationNumber();

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          registrationNumber,
          status: 'confirmed', // ⭐ Always confirmed for free events
          paymentStatus: 'not_required', // ⭐ Always not_required for free events
          paymentAmount: 0, // ⭐ Always 0 for free events
        },
      });

      // ⭐ Update participant count (now safe - only free events reach here)
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: { currentParticipants: { increment: 1 } },
      });

      // Check if full
      if (event.maxParticipants && updatedEvent.currentParticipants >= event.maxParticipants) {
        await tx.event.update({
          where: { id: eventId },
          data: { registrationStatus: 'full' },
        });
      }
    });

    // Get user info for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (user) {
      // Send confirmation email
      await sendRegistrationConfirmation(
        user.email,
        user.name,
        event.title,
        new Date(event.startDate).toLocaleString(),
        registrationNumber
      );

      // Send event link if online
      if (event.eventMode !== 'offline' && event.onlineLink) {
        await sendEventLink(
          user.email,
          user.name,
          event.title,
          new Date(event.startDate).toLocaleString(),
          event.onlineLink,
          event.onlinePlatform || 'Online'
        );
      }
    }

    return {
      message: 'Registration successful',
      registration_number: registrationNumber,
      requires_payment: false,
      payment_amount: 0,
    };
  }

  async cancelRegistration(eventId: number, userId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: { eventId, userId },
    });

    if (!registration) {
      throw new AppError('Registration not found', 404);
    }

    if (registration.status === 'cancelled') {
      throw new AppError('Registration already cancelled', 400);
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.eventRegistration.update({
        where: { id: registration.id },
        data: { status: 'cancelled' },
      });

      // Update participant count
      await tx.event.update({
        where: { id: eventId },
        data: { currentParticipants: { decrement: 1 } },
      });

      // Update registration status if was full
      await tx.event.updateMany({
        where: {
          id: eventId,
          registrationStatus: 'full',
        },
        data: { registrationStatus: 'open' },
      });
    });

    return { message: 'Registration cancelled successfully' };
  }

  async checkRegistrationStatus(eventId: number, userId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: { in: ['confirmed', 'pending'] }, // ⭐ Only show active registrations
      },
      include: {
        event: {
          select: {
            onlineLink: true,
            onlinePlatform: true,
          },
        },
        certificates: true,
      },
    });

    if (!registration) {
      return { registered: false };
    }

    return {
      registered: true,
      registration_number: registration.registrationNumber,
      status: registration.status,
      payment_status: registration.paymentStatus,
      online_link: registration.status === 'confirmed' ? registration.event.onlineLink : null,
      registration_id: registration.id,
      certificate_id: registration.certificates?.[0]?.certificateId,
    };
  }

  async getEventRegistrations(eventId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.eventRegistration.count({ where: { eventId } }),
    ]);

    return {
      registrations,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getUserEvents(userId: number) {
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        userId,
        status: { not: 'cancelled' },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            eventType: true,
            eventMode: true,
            startDate: true,
            endDate: true,
            onlineLink: true,
            venueDetails: true,
            hasCertificate: true,
            eventStatus: true,
          },
        },
        certificates: true,
      },
      orderBy: {
        event: {
          startDate: 'asc',
        },
      },
    });

    const now = new Date();

    return {
      upcoming: registrations
        .filter(r => new Date(r.event.endDate) >= now)
        .map(r => ({
          ...r.event,
          registration_status: r.status,
          payment_status: r.paymentStatus,
          meeting_link: r.status === 'confirmed' ? r.event.onlineLink : null,
          certificate_available: r.event.hasCertificate,
          certificate_id: r.certificates?.[0]?.certificateId,
          registration_id: r.id,
        })),
      past: registrations
        .filter(r => new Date(r.event.endDate) < now)
        .sort((a, b) => new Date(b.event.startDate).getTime() - new Date(a.event.startDate).getTime()) // Sort past events by date desc
        .map(r => ({
          ...r.event,
          registration_status: r.status,
          payment_status: r.paymentStatus,
          certificate_available: r.event.hasCertificate,
          certificate_id: r.certificates?.[0]?.certificateId,
          registration_id: r.id,
        })),
    };
  }

  async deleteEvent(eventId: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await prisma.event.delete({ where: { id: eventId } });
    return { message: 'Event deleted successfully' };
  }

  // Update event statuses based on dates
  async updateEventStatuses() {
    const now = new Date();

    // Update to ongoing
    await prisma.event.updateMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        eventStatus: 'upcoming',
      },
      data: { eventStatus: 'ongoing' },
    });

    // Update to completed
    await prisma.event.updateMany({
      where: {
        endDate: { lt: now },
        eventStatus: { in: ['upcoming', 'ongoing'] },
      },
      data: {
        eventStatus: 'completed',
        registrationStatus: 'closed',
      },
    });
  }
}

export const eventService = new EventService();
