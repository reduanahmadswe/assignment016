import prisma from '../../config/db.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { lookupService } from '../../services/lookup.service.js';
import { CreateEventInput, UpdateEventInput, EventFilters } from './event.types.js';
import { eventTransformer } from './event.transformer.js';
import { eventQueryBuilder } from './event.query-builder.js';
import { registrationService } from './registration.service.js';

export class EventService {
  async createEvent(data: CreateEventInput, createdBy: number) {
    const slug = generateSlug(data.title) + '-' + Date.now().toString(36);

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Get lookup IDs
      const eventTypeId = await lookupService.getEventTypeId(data.event_type);
      const eventModeId = await lookupService.getEventModeId(data.event_mode);
      const eventStatusId = await lookupService.getEventStatusId('upcoming');
      const registrationStatusId = await lookupService.getRegistrationStatusId('open');
      const onlinePlatformId = data.online_platform 
        ? await lookupService.getOnlinePlatformId(data.online_platform)
        : null;

      const event = await tx.event.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          content: data.content,
          thumbnail: data.thumbnail,
          eventTypeId,
          eventModeId,
          eventStatusId,
          registrationStatusId,
          venueDetails: data.venue_details ? JSON.stringify(data.venue_details) : null,
          onlineLink: data.online_link,
          onlinePlatformId,
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
          createdBy,
        },
      });

      return this.getEventById(event.id);
    });
  }

  async updateEvent(eventId: number, data: UpdateEventInput) {
    const event = await this.getEventById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.event_type !== undefined) updateData.eventTypeId = await lookupService.getEventTypeId(data.event_type);
    if (data.event_mode !== undefined) updateData.eventModeId = await lookupService.getEventModeId(data.event_mode);
    if (data.online_link !== undefined) updateData.onlineLink = data.online_link;
    if (data.online_platform !== undefined) updateData.onlinePlatformId = data.online_platform ? await lookupService.getOnlinePlatformId(data.online_platform) : null;
    if (data.start_date !== undefined) updateData.startDate = new Date(data.start_date);
    if (data.end_date !== undefined) updateData.endDate = new Date(data.end_date);
    if (data.registration_deadline !== undefined) updateData.registrationDeadline = data.registration_deadline ? new Date(data.registration_deadline) : null;
    if (data.is_free !== undefined) updateData.isFree = data.is_free;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.max_participants !== undefined) updateData.maxParticipants = data.max_participants;
    if (data.has_certificate !== undefined) updateData.hasCertificate = data.has_certificate;
    if (data.registration_status !== undefined) updateData.registrationStatusId = await lookupService.getRegistrationStatusId(data.registration_status);
    if (data.event_status !== undefined) updateData.eventStatusId = await lookupService.getEventStatusId(data.event_status);
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
        eventType: true,
        eventMode: true,
        eventStatus: true,
        registrationStatus: true,
        onlinePlatform: true,
        _count: {
          select: {
            registrations: {
              where: {
                status: { code: { not: 'cancelled' } },
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
    if (new Date(event.endDate) < new Date() && ['upcoming', 'ongoing'].includes(event.eventStatus.code)) {
      const completedStatusId = await lookupService.getEventStatusId('completed');
      const closedStatusId = await lookupService.getRegistrationStatusId('closed');
      
      event = await prisma.event.update({
        where: { id: eventId },
        data: {
          eventStatusId: completedStatusId,
          registrationStatusId: closedStatusId
        },
        include: {
          eventType: true,
          eventMode: true,
          eventStatus: true,
          registrationStatus: true,
          onlinePlatform: true,
          _count: {
            select: {
              registrations: {
                where: {
                  status: { code: { not: 'cancelled' } },
                },
              },
            },
          },
        },
      });
    }

    return eventTransformer.transformEventWithCount(event);
  }

  async getEventBySlug(slug: string) {
    let event = await prisma.event.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        eventType: true,
        eventMode: true,
        eventStatus: true,
        registrationStatus: true,
        onlinePlatform: true,
        eventGuests: {
          include: {
            role: { select: { code: true, label: true } },
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: { code: { not: 'cancelled' } },
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
    if (new Date(event.endDate) < new Date() && ['upcoming', 'ongoing'].includes(event.eventStatus.code)) {
      const completedStatusId = await lookupService.getEventStatusId('completed');
      const closedStatusId = await lookupService.getRegistrationStatusId('closed');
      
      event = await prisma.event.update({
        where: { id: event.id },
        data: {
          eventStatusId: completedStatusId,
          registrationStatusId: closedStatusId
        },
        include: {
          eventType: true,
          eventMode: true,
          eventStatus: true,
          registrationStatus: true,
          onlinePlatform: true,
          eventGuests: {
            include: {
              role: { select: { code: true, label: true } },
            },
          },
          _count: {
            select: {
              registrations: {
                where: {
                  status: { code: { not: 'cancelled' } },
                },
              },
            },
          },
        },
      });
    }

    return eventTransformer.transformEventWithCount(event);
  }

  async getAllEvents(page: number = 1, limit: number = 10, filters: EventFilters = {}) {
    const { offset } = paginate(page, limit);
    const where = eventQueryBuilder.buildWhereClause(filters);

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
          eventType: { select: { code: true, label: true } },
          eventMode: { select: { code: true, label: true } },
          startDate: true,
          endDate: true,
          isFree: true,
          price: true,
          registrationStatus: { select: { code: true, label: true } },
          eventStatus: { select: { code: true, label: true } },
          hasCertificate: true,
          isFeatured: true,
          currentParticipants: true,
          maxParticipants: true,
        },
        orderBy: [
          {
            eventStatus: { code: 'asc' },
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
      events: eventTransformer.transformEventList(events),
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getUpcomingEvents(limit: number = 6) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        eventStatus: { code: 'upcoming' },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: { select: { code: true, label: true } },
        eventMode: { select: { code: true, label: true } },
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: { select: { code: true, label: true } },
        hasCertificate: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return eventTransformer.transformEventList(events);
  }

  async getFeaturedEvents(limit: number = 3) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        eventStatus: { code: { in: ['upcoming', 'ongoing'] } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: { select: { code: true, label: true } },
        eventMode: { select: { code: true, label: true } },
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: { select: { code: true, label: true } },
        hasCertificate: true,
        isFeatured: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return eventTransformer.transformEventList(events);
  }

  async getOngoingEvents(limit: number = 6) {
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        eventStatus: { code: 'ongoing' },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        thumbnail: true,
        eventType: { select: { code: true, label: true } },
        eventMode: { select: { code: true, label: true } },
        startDate: true,
        endDate: true,
        isFree: true,
        price: true,
        registrationStatus: { select: { code: true, label: true } },
        hasCertificate: true,
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return eventTransformer.transformEventList(events);
  }

  async getPastEvents(page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          isPublished: true,
          eventStatus: { code: 'completed' },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          thumbnail: true,
          eventType: { select: { code: true, label: true } },
          eventMode: { select: { code: true, label: true } },
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
          eventStatus: { code: 'completed' },
        },
      }),
    ]);

    return {
      events: eventTransformer.transformEventList(events),
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async registerForEvent(eventId: number, userId: number) {
    const event = await this.getEventById(eventId);
    return registrationService.registerForEvent(eventId, userId, event);
  }

  async cancelRegistration(eventId: number, userId: number) {
    return registrationService.cancelRegistration(eventId, userId);
  }

  async checkRegistrationStatus(eventId: number, userId: number) {
    return registrationService.checkRegistrationStatus(eventId, userId);
  }

  async getEventRegistrations(eventId: number, page: number = 1, limit: number = 10) {
    return registrationService.getEventRegistrations(eventId, page, limit);
  }

  async getUserEvents(userId: number) {
    return registrationService.getUserEvents(userId);
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

    const upcomingStatusId = await lookupService.getEventStatusId('upcoming');
    const ongoingStatusId = await lookupService.getEventStatusId('ongoing');
    const completedStatusId = await lookupService.getEventStatusId('completed');
    const closedStatusId = await lookupService.getRegistrationStatusId('closed');

    // Update to ongoing
    await prisma.event.updateMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        eventStatusId: upcomingStatusId,
      },
      data: { eventStatusId: ongoingStatusId },
    });

    // Update to completed
    await prisma.event.updateMany({
      where: {
        endDate: { lt: now },
        eventStatusId: { in: [upcomingStatusId, ongoingStatusId] },
      },
      data: {
        eventStatusId: completedStatusId,
        registrationStatusId: closedStatusId,
      },
    });
  }
}

export const eventService = new EventService();
