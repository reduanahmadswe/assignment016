import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import cloudinary from '../../config/cloudinary.js';
import { lookupService } from '../../services/lookup.service.js';
import fs from 'fs';
import { AdminTransformer } from './admin.transformer.js';
import { ExportService } from './admin.export.js';

import type { PageInput, RegistrationFilters, EventFilters, PaymentFilters, AdminProfileUpdate } from './admin.types.js';
import { AdminStatsService } from './admin.stats.js';

export class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    const stats = await AdminStatsService.getDashboardStats();
    return {
      ...stats,
      recentRegistrations: stats.recentRegistrations.map(AdminTransformer.transformRecentRegistration),
    };
  }

  // Get Recent Registrations
  async getRecentRegistrations(limit: number = 10) {
    const registrations = await prisma.eventRegistration.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return registrations.map((r: any) => ({
      id: r.id,
      registrationNumber: r.registrationNumber,
      user: r.user,
      event: r.event,
      status: r.status,
      paymentStatus: r.paymentStatus,
      createdAt: r.createdAt,
    }));
  }

  // Get All Registrations with filters
  async getRegistrations(filters: RegistrationFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.eventId) where.eventId = filters.eventId;
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;

    if (filters.search) {
      where.OR = [
        { registrationNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          event: {
            select: {
              id: true,
              title: true,
              eventType: { select: { code: true, label: true } },
              startDate: true
            },
          },
          status: { select: { code: true, label: true } },
          paymentStatus: { select: { code: true, label: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    return {
      registrations: registrations.map(AdminTransformer.transformRegistration),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get Registrations Summary by Event
  async getRegistrationsSummary() {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        thumbnail: true,
        eventType: true,
        eventStatus: { select: { code: true } },
        startDate: true,
        endDate: true,
        price: true,
        maxParticipants: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: [{ startDate: 'asc' }],
    });

    // Sort events by status
    const sortedEvents = events.sort((a, b) => {
      const statusOrder: Record<string, number> = {
        upcoming: 1,
        ongoing: 2,
        completed: 3,
      };

      const statusA = statusOrder[a.eventStatus.code] || 4;
      const statusB = statusOrder[b.eventStatus.code] || 4;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const eventsWithStats = await Promise.all(
      sortedEvents.map(async (event: any) => {
        const [confirmed, pending, cancelled, attended, totalRevenue] = await Promise.all([
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: { code: 'confirmed' } },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: { code: 'pending' } },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: { code: 'cancelled' } },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: { code: 'attended' } },
          }),
          prisma.paymentTransaction.aggregate({
            where: {
              registration: { eventId: event.id },
              status: { code: 'completed' },
            },
            _sum: { amount: true },
          }),
        ]);

        return AdminTransformer.transformEventWithStats(event, {
          confirmed,
          pending,
          cancelled,
          attended,
          totalRevenue: totalRevenue._sum.amount || 0,
        });
      })
    );

    return eventsWithStats;
  }

  // Get Upcoming Events
  async getUpcomingEvents(limit: number = 5) {
    const events = await prisma.event.findMany({
      where: {
        eventStatus: { code: 'upcoming' },
        startDate: { gte: new Date() },
      },
      include: {
        eventType: { select: { code: true } },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return events.map((e: any) => ({
      ...e,
      eventType: e.eventType.code,
      registrationCount: e._count.registrations,
    }));
  }

  // Page Management
  async getAllPages() {
    const pages = await prisma.page.findMany({
      orderBy: { title: 'asc' },
    });
    return pages;
  }

  async getPageBySlug(slug: string) {
    const page = await prisma.page.findUnique({
      where: { slug },
    });
    if (!page) {
      throw new AppError('Page not found', 404);
    }
    return page;
  }

  async updatePage(slug: string, data: PageInput) {
    const page = await this.getPageBySlug(slug);

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.meta_title !== undefined) updateData.metaTitle = data.meta_title;
    if (data.meta_description !== undefined) updateData.metaDescription = data.meta_description;
    if (data.is_published !== undefined) updateData.isPublished = data.is_published;

    const updatedPage = await prisma.page.update({
      where: { id: page.id },
      data: updateData,
    });

    return this.getPageBySlug(updatedPage.slug);
  }

  // Export Functions
  async exportRegistrations(eventId: number | null, startDate: string | null, endDate: string | null, paymentStatus: string | null, format: 'excel' | 'csv' | 'pdf') {
    const where: any = {};

    if (eventId) where.eventId = eventId;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        event: { select: { title: true, eventType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedData = registrations.map(AdminTransformer.transformRegistrationForExport);

    switch (format) {
      case 'excel':
        return ExportService.generateExcel(formattedData);
      case 'csv':
        return ExportService.generateCSV(formattedData);
      case 'pdf':
        const eventTitle = formattedData.length > 0 ? formattedData[0].event_title : 'All Events';
        return ExportService.generatePDF(formattedData, eventTitle);
      default:
        throw new AppError('Invalid export format', 400);
    }
  }

  // Event Statistics
  async getEventStatistics(identifier: number | string) {
    const result = await AdminStatsService.getEventStatistics(identifier);
    if (!result) {
      throw new AppError('Event not found', 404);
    }
    return result;
  }

  // Event Management
  async getEvents(filters: EventFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.eventStatus = filters.status;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          eventType: { select: { code: true, label: true } },
          eventMode: { select: { code: true, label: true } },
          eventStatus: { select: { code: true, label: true } },
          registrationStatus: { select: { code: true, label: true } },
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: [
          { eventStatus: { code: 'desc' } },
          { startDate: 'asc' },
        ],
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events: events.map(AdminTransformer.transformEvent),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createEvent(data: any) {
    // Format and validate slug
    const formattedSlug = data.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Validate conditional fields
    if (data.eventMode === 'online' && !data.meetingPlatform) {
      throw new AppError('Meeting platform is required for online events', 400);
    }

    if (data.eventMode === 'online' && data.autoSendMeetingLink && !data.meetingLink) {
      throw new AppError('Meeting link is required when auto-send is enabled', 400);
    }

    // Validate email format
    if (data.eventContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.eventContactEmail)) {
      throw new AppError('Invalid email format', 400);
    }

    // Get lookup IDs
    const eventTypeId = await lookupService.getEventTypeId(data.eventType);
    const eventModeId = await lookupService.getEventModeId(data.eventMode || 'offline');
    const eventStatusId = await lookupService.getEventStatusId(data.status || 'upcoming');
    const registrationStatusId = await lookupService.getRegistrationStatusId('open');

    const eventData: any = {
      title: data.title,
      slug: formattedSlug,
      description: data.description,
      eventTypeId,
      eventModeId,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      price: parseFloat(data.price) || 0,
      maxParticipants: parseInt(data.maxParticipants) || null,
      eventStatusId,
      registrationStatusId,
      isPublished: true,

      // Boolean fields
      isCertificateAvailable: data.isCertificateAvailable === true || data.isCertificateAvailable === 'true',
      hasCertificate: data.hasCertificate === true || data.hasCertificate === 'true',
      autoSendMeetingLink: data.autoSendMeetingLink === true || data.autoSendMeetingLink === 'true' || data.autoSendMeetingLink === undefined,

      // Optional string fields
      meetingPlatform: data.meetingPlatform || null,
      meetingLink: data.meetingLink || null,
      eventContactEmail: data.eventContactEmail || null,
      eventContactPhone: data.eventContactPhone || null,
      participantInstructions: data.participantInstructions || null,
    };

    // Handle venue
    if (data.venue) {
      eventData.venueDetails = JSON.stringify({ name: data.venue });
    }

    // Handle online link
    if (data.onlineLink) {
      eventData.onlineLink = data.onlineLink;
      const platformId = await lookupService.getOnlinePlatformId(data.onlinePlatform || 'other');
      eventData.onlinePlatformId = platformId;
    }

    // Handle thumbnail with Google Drive support
    if (data.thumbnailUrl || data.thumbnail) {
      let imageUrl = data.thumbnailUrl || data.thumbnail;

      if (imageUrl.includes('drive.google.com')) {
        let fileId = null;

        const viewMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (viewMatch) fileId = viewMatch[1];

        const openMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (openMatch) fileId = openMatch[1];

        const ucMatch = imageUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (ucMatch) fileId = ucMatch[1];

        if (fileId) {
          imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }

      eventData.thumbnail = imageUrl;
    }

    // Create event
    const event = await prisma.event.create({
      data: eventData,
    });

    // Handle signatures
    if (data.signature1Name || data.signature1_name) {
      const sig1Name = data.signature1_name || data.signature1Name;
      const sig1Title = data.signature1_title || data.signature1Title;
      const sig1Image = data.signature1_image || data.signature1Image;

      if (sig1Name && sig1Title) {
        const signature1 = await prisma.certificateSignature.upsert({
          where: { id: 0 },
          create: {
            name: sig1Name,
            title: sig1Title,
            image: sig1Image || null,
          },
          update: {},
        });

        await prisma.eventSignature.create({
          data: {
            eventId: event.id,
            signatureId: signature1.id,
            position: 1,
          },
        });
      }
    }

    if (data.signature2Name || data.signature2_name) {
      const sig2Name = data.signature2_name || data.signature2Name;
      const sig2Title = data.signature2_title || data.signature2Title;
      const sig2Image = data.signature2_image || data.signature2Image;

      if (sig2Name && sig2Title) {
        const signature2 = await prisma.certificateSignature.upsert({
          where: { id: 0 },
          create: {
            name: sig2Name,
            title: sig2Title,
            image: sig2Image || null,
          },
          update: {},
        });

        await prisma.eventSignature.create({
          data: {
            eventId: event.id,
            signatureId: signature2.id,
            position: 2,
          },
        });
      }
    }

    // Handle guests
    if (data.guests) {
      const guests = typeof data.guests === 'string' ? JSON.parse(data.guests) : data.guests;

      if (guests && Array.isArray(guests) && guests.length > 0) {
        const hostRoleId = await lookupService.getHostRoleId('speaker');

        for (const guest of guests) {
          await prisma.eventGuest.create({
            data: {
              eventId: event.id,
              name: guest.name,
              email: guest.email || null,
              bio: guest.bio || null,
              roleId: hostRoleId,
              pictureLink: guest.pictureLink || null,
              website: guest.website || null,
              cvLink: guest.cvLink || null,
            },
          });
        }
      }
    }

    // Fetch created event with relations
    const createdEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        eventType: { select: { code: true, label: true } },
        eventMode: { select: { code: true, label: true } },
        eventStatus: { select: { code: true, label: true } },
        registrationStatus: { select: { code: true, label: true } },
        onlinePlatform: { select: { code: true, label: true } },
        eventSignatures: {
          include: {
            signature: true,
          },
        },
        eventGuests: {
          include: {
            role: { select: { code: true, label: true } },
          },
        },
      },
    });

    if (!createdEvent) {
      throw new AppError('Event created but not found', 500);
    }

    return AdminTransformer.transformCreatedEvent(createdEvent);
  }

  async updateEvent(id: number, data: any) {
    const eventData: any = {};

    if (data.title) eventData.title = data.title;
    if (data.slug) {
      eventData.slug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (data.description) eventData.description = data.description;
    if (data.eventType) {
      const eventTypeId = await lookupService.getEventTypeId(data.eventType);
      eventData.eventType = { connect: { id: eventTypeId } };
    }
    if (data.eventMode) {
      const eventModeId = await lookupService.getEventModeId(data.eventMode);
      eventData.eventMode = { connect: { id: eventModeId } };

      if (data.eventMode === 'online' && data.meetingPlatform === undefined) {
        throw new AppError('Meeting platform is required for online events', 400);
      }
    }

    // Boolean fields
    if (data.isCertificateAvailable !== undefined) eventData.isCertificateAvailable = data.isCertificateAvailable === true || data.isCertificateAvailable === 'true';
    if (data.hasCertificate !== undefined) eventData.hasCertificate = data.hasCertificate === true || data.hasCertificate === 'true';
    if (data.meetingPlatform !== undefined) eventData.meetingPlatform = data.meetingPlatform;
    if (data.meetingLink !== undefined) eventData.meetingLink = data.meetingLink;
    if (data.autoSendMeetingLink !== undefined) {
      const autoSendValue = data.autoSendMeetingLink === true || data.autoSendMeetingLink === 'true';
      if (data.eventMode === 'online' && autoSendValue && !data.meetingLink) {
        throw new AppError('Meeting link is required when auto-send is enabled', 400);
      }
      eventData.autoSendMeetingLink = autoSendValue;
    }
    if (data.eventContactEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.eventContactEmail)) {
        throw new AppError('Invalid email format', 400);
      }
      eventData.eventContactEmail = data.eventContactEmail;
    }
    if (data.eventContactPhone !== undefined) eventData.eventContactPhone = data.eventContactPhone;

    if (data.venue) {
      eventData.venueDetails = JSON.stringify({ name: data.venue });
    }

    if (data.onlineLink) {
      eventData.onlineLink = data.onlineLink;
      const platformId = await lookupService.getOnlinePlatformId(data.onlinePlatform || 'other');
      eventData.onlinePlatform = { connect: { id: platformId } };
    }

    if (data.status) {
      const eventStatusId = await lookupService.getEventStatusId(data.status);
      eventData.eventStatus = { connect: { id: eventStatusId } };
    }
    if (data.startDate) eventData.startDate = new Date(data.startDate);
    if (data.endDate) eventData.endDate = new Date(data.endDate);
    if (data.registrationDeadline) eventData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.price !== undefined) eventData.price = parseFloat(data.price);
    if (data.maxParticipants !== undefined) eventData.maxParticipants = parseInt(data.maxParticipants) || null;

    // Handle thumbnail
    if (data.thumbnail || data.thumbnailUrl) {
      let imageUrl = data.thumbnail || data.thumbnailUrl;

      if (imageUrl.includes('drive.google.com')) {
        let fileId = null;

        const viewMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (viewMatch) fileId = viewMatch[1];

        const openMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (openMatch) fileId = openMatch[1];

        const ucMatch = imageUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (ucMatch) fileId = ucMatch[1];

        if (fileId) {
          imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }

      eventData.thumbnail = imageUrl;
    }
    if (data.videoLink !== undefined) eventData.videoLink = data.videoLink;
    if (data.participantInstructions !== undefined) eventData.participantInstructions = data.participantInstructions;

    // Handle guests
    if (data.guests !== undefined) {
      const guests = typeof data.guests === 'string' ? JSON.parse(data.guests) : data.guests;
      eventData.guests = guests && guests.length > 0 ? JSON.stringify(guests) : null;
    }

    // Handle certificate signatures
    if (data.signature1_name !== undefined) eventData.signature1Name = data.signature1_name || null;
    if (data.signature1_title !== undefined) eventData.signature1Title = data.signature1_title || null;
    if (data.signature1_image !== undefined) eventData.signature1Image = data.signature1_image || null;
    if (data.signature2_name !== undefined) eventData.signature2Name = data.signature2_name || null;
    if (data.signature2_title !== undefined) eventData.signature2Title = data.signature2_title || null;
    if (data.signature2_image !== undefined) eventData.signature2Image = data.signature2_image || null;

    const event = await prisma.event.update({
      where: { id },
      data: eventData,
    });

    return event;
  }

  async deleteEvent(id: number) {
    const registrationCount = await prisma.eventRegistration.count({
      where: { eventId: id },
    });

    if (registrationCount > 0) {
      throw new AppError('Cannot delete event with existing registrations', 400);
    }

    await prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async getEventById(identifier: number | string) {
    const where: any = {};
    if (typeof identifier === 'number') {
      where.id = identifier;
    } else {
      const id = parseInt(identifier as string);
      if (!isNaN(id) && identifier.toString() === id.toString()) {
        where.id = id;
      } else {
        where.slug = identifier;
      }
    }

    const event = await prisma.event.findFirst({
      where,
      include: {
        eventType: { select: { code: true, label: true } },
        eventMode: { select: { code: true, label: true } },
        eventStatus: { select: { code: true, label: true } },
        registrationStatus: { select: { code: true, label: true } },
        onlinePlatform: { select: { code: true, label: true } },
        eventSignatures: {
          include: {
            signature: true,
          },
        },
        eventGuests: {
          include: {
            role: { select: { code: true, label: true } },
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return AdminTransformer.transformEventById(event);
  }

  // System Settings
  async getSystemSettings() {
    const settings = await (prisma as any).systemSetting.findMany();
    const result = {
      site: {},
      payment: {},
      email: {},
      notifications: {},
    };

    settings.forEach((s: any) => {
      try {
        if (s.key in result) {
          result[s.key as keyof typeof result] = JSON.parse(s.value);
        }
      } catch (e) {
        console.error(`Failed to parse setting ${s.key}`, e);
      }
    });

    return result;
  }

  async updateSystemSetting(key: string, value: any) {
    return (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }

  // Profile Management
  async getAdminProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateAdminProfile(userId: number, data: AdminProfileUpdate, avatarFile?: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError('Email is already in use', 400);
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new AppError('Invalid email format', 400);
      }

      updateData.email = data.email;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    // Handle avatar upload
    if (avatarFile) {
      try {
        const result = await cloudinary.uploader.upload(avatarFile.path, {
          folder: 'oriyet/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `user-${userId}-${Date.now()}`,
        });

        if (user.avatar && user.avatar.includes('cloudinary')) {
          const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.log('Error deleting old avatar:', error);
          }
        }

        if (fs.existsSync(avatarFile.path)) {
          fs.unlinkSync(avatarFile.path);
        }

        updateData.avatar = result.secure_url;
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new AppError('Failed to upload avatar image', 500);
      }
    }

    // Handle password update
    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError('Current password is required to set a new password', 400);
      }

      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password || '');

      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      if (data.newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400);
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 12);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  // Payment Management
  async getPaymentStats(eventId?: number) {
    return AdminStatsService.getPaymentStats(eventId);
  }

  async getPayments(params: PaymentFilters) {
    const { page, limit, search, status, eventId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.registration = { eventId };
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: 'insensitive' } },
        { invoiceId: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          registration: {
            select: {
              registrationNumber: true,
              event: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    return {
      payments: payments.map(AdminTransformer.transformPayment),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async exportPayments(params: {
    eventId?: number;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (params.eventId) {
      where.registration = { eventId: params.eventId };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.OR = [
        { transactionId: { contains: params.search, mode: 'insensitive' } },
        { user: { name: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const payments = await prisma.paymentTransaction.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true },
        },
        registration: {
          select: {
            registrationNumber: true,
            event: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const records = payments.map(AdminTransformer.transformPaymentForExport);
    return ExportService.generatePaymentCSV(records);
  }
}

export const adminService = new AdminService();
