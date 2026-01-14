import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import cloudinary from '../../config/cloudinary.js';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { createObjectCsvStringifier } from 'csv-writer';
import PDFDocument from 'pdfkit';

interface PageInput {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

export class AdminService {
  // Dashboard Stats
  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsers30d, totalEvents, upcomingEvents, totalRegistrations,
      registrations30d, transactionRevenue, registrationRevenue, revenue30d, totalCertificates] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.event.count(),
        prisma.event.count({ where: { eventStatus: 'upcoming' } }),
        prisma.eventRegistration.count(),
        prisma.eventRegistration.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        // Check PaymentTransaction
        prisma.paymentTransaction.aggregate({
          where: {
            status: { in: ['completed', 'COMPLETED'] },
            createdAt: { gte: startOfMonth }
          },
          _sum: { amount: true },
        }),
        // Check EventRegistration as fallback
        prisma.eventRegistration.aggregate({
          where: {
            paymentStatus: { in: ['completed', 'COMPLETED', 'paid'] },
            createdAt: { gte: startOfMonth }
          },
          _sum: { paymentAmount: true }
        }),
        prisma.paymentTransaction.aggregate({
          where: { status: 'completed', createdAt: { gte: thirtyDaysAgo } },
          _sum: { amount: true },
        }),
        prisma.certificate.count(),
      ]);

    // Use transaction revenue if available, otherwise fallback to registration revenue
    const currentMonthRevenue = (transactionRevenue._sum.amount || 0) > 0
      ? (transactionRevenue._sum.amount || 0)
      : (registrationRevenue._sum.paymentAmount || 0);

    // Get recent registrations
    const recentRegistrations = await prisma.eventRegistration.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        event: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get event stats
    const eventStats = await prisma.event.groupBy({
      by: ['eventStatus'],
      _count: true,
    });

    return {
      total_users: totalUsers,
      new_users_30d: newUsers30d,
      total_events: totalEvents,
      upcoming_events: upcomingEvents,
      total_registrations: totalRegistrations,
      registrations_30d: registrations30d,
      total_revenue: currentMonthRevenue,
      revenue_30d: revenue30d._sum.amount || 0,
      total_certificates: totalCertificates,
      recentRegistrations: recentRegistrations.map((r: any) => ({
        ...r,
        name: r.user.name,
        email: r.user.email,
        event_title: r.event.title,
      })),
      eventStats: eventStats.map((s: any) => ({
        event_status: s.eventStatus,
        count: s._count,
      })),
    };
  }

  // Get Recent Registrations
  async getRecentRegistrations(limit: number = 10) {
    const registrations = await prisma.eventRegistration.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: { id: true, title: true, eventType: true },
        },
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
  async getRegistrations(filters: {
    page?: number;
    limit?: number;
    eventId?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

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
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          event: {
            select: { id: true, title: true, eventType: true, startDate: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.eventRegistration.count({ where }),
    ]);

    return {
      registrations: registrations.map((r: any) => ({
        id: r.id,
        registrationNumber: r.registrationNumber,
        user: r.user,
        event: r.event,
        status: r.status,
        paymentStatus: r.paymentStatus,
        paymentAmount: Number(r.paymentAmount),
        createdAt: r.createdAt,
      })),
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
        eventType: true,
        eventStatus: true,
        startDate: true,
        endDate: true,
        maxParticipants: true,
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: [
        { startDate: 'asc' }, // Earlier dates first
      ],
    });

    // Sort events by status: upcoming first, ongoing second, completed last
    const sortedEvents = events.sort((a, b) => {
      const statusOrder: Record<string, number> = {
        upcoming: 1,
        ongoing: 2,
        completed: 3,
      };

      const statusA = statusOrder[a.eventStatus] || 4;
      const statusB = statusOrder[b.eventStatus] || 4;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // If same status, sort by start date (ascending)
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    const eventsWithStats = await Promise.all(
      sortedEvents.map(async (event: any) => {
        const [confirmed, pending, cancelled, attended, totalRevenue] = await Promise.all([
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: 'confirmed' },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: 'pending' },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: 'cancelled' },
          }),
          prisma.eventRegistration.count({
            where: { eventId: event.id, status: 'attended' },
          }),
          prisma.paymentTransaction.aggregate({
            where: {
              registration: { eventId: event.id },
              status: 'completed',
            },
            _sum: { amount: true },
          }),
        ]);

        return {
          id: event.id,
          title: event.title,
          eventType: event.eventType,
          eventStatus: event.eventStatus,
          startDate: event.startDate,
          endDate: event.endDate,
          maxParticipants: event.maxParticipants,
          totalRegistrations: event._count.registrations,
          confirmed,
          pending,
          cancelled,
          attended,
          totalRevenue: totalRevenue._sum.amount || 0,
        };
      })
    );

    return eventsWithStats;
  }

  // Get Upcoming Events
  async getUpcomingEvents(limit: number = 5) {
    const events = await prisma.event.findMany({
      where: {
        eventStatus: 'upcoming',
        startDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        eventType: true,
        startDate: true,
        maxParticipants: true,
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
  async exportRegistrations(
    eventId: number | null,
    startDate: string | null,
    endDate: string | null,
    paymentStatus: string | null,
    format: 'excel' | 'csv' | 'pdf'
  ) {
    const where: any = {};

    if (eventId) where.eventId = eventId;
    if (startDate) where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            title: true,
            eventType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedData = registrations.map((r: any) => ({
      registration_number: r.registrationNumber,
      participant_name: r.user.name,
      participant_email: r.user.email,
      participant_phone: r.user.phone,
      event_title: r.event.title,
      event_type: r.event.eventType,
      registration_status: r.status,
      payment_status: r.paymentStatus,
      payment_amount: Number(r.paymentAmount),
      registration_date: r.createdAt,
    }));

    switch (format) {
      case 'excel':
        return this.generateExcel(formattedData);
      case 'csv':
        return this.generateCSV(formattedData);
      case 'pdf':
        return this.generatePDF(formattedData);
      default:
        throw new AppError('Invalid export format', 400);
    }
  }

  private generateExcel(data: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `registrations_${Date.now()}.xlsx`,
    };
  }

  private generateCSV(data: any[]) {
    const csvStringifier = createObjectCsvStringifier({
      header: Object.keys(data[0] || {}).map((key: string) => ({ id: key, title: key })),
    });

    const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

    return {
      buffer: Buffer.from(csvString),
      contentType: 'text/csv',
      filename: `registrations_${Date.now()}.csv`,
    };
  }

  private async generatePDF(data: any[]): Promise<{ buffer: Buffer; contentType: string; filename: string }> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: 'application/pdf',
          filename: `registrations_${Date.now()}.pdf`,
        });
      });
      doc.on('error', reject);

      // Title
      doc.fontSize(16).text('Registration Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Table header
      const headers = ['Reg. No', 'Name', 'Email', 'Event', 'Status', 'Payment'];
      const colWidths = [80, 100, 150, 150, 80, 80];
      let x = 30;

      doc.fontSize(9).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, doc.y, { width: colWidths[i], continued: i < headers.length - 1 });
        x += colWidths[i];
      });
      doc.moveDown();

      // Table rows
      doc.font('Helvetica').fontSize(8);
      data.slice(0, 50).forEach(row => { // Limit to 50 rows for PDF
        x = 30;
        const rowData = [
          row.registration_number || '-',
          row.participant_name || '-',
          row.participant_email || '-',
          (row.event_title || '-').substring(0, 25),
          row.registration_status || '-',
          row.payment_status || '-',
        ];

        rowData.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], continued: i < rowData.length - 1 });
          x += colWidths[i];
        });
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }

  // Event Statistics
  // Event Statistics
  async getEventStatistics(identifier: number | string) {
    const where: any = {};
    if (typeof identifier === 'number') {
      where.id = identifier;
    } else {
      // Check if it looks like a number
      const id = parseInt(identifier as string);
      if (!isNaN(id) && identifier.toString() === id.toString()) {
        where.id = id;
      } else {
        where.slug = identifier;
      }
    }

    const event = await prisma.event.findFirst({
      where,
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const eventId = event.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalRegistrations, confirmed, pending, cancelled, attended, paid, totalRevenue, certificatesIssued] = await Promise.all([
      prisma.eventRegistration.count({ where: { eventId } }),
      prisma.eventRegistration.count({ where: { eventId, status: 'confirmed' } }),
      prisma.eventRegistration.count({ where: { eventId, status: 'pending' } }),
      prisma.eventRegistration.count({ where: { eventId, status: 'cancelled' } }),
      prisma.eventRegistration.count({ where: { eventId, status: 'attended' } }),
      prisma.eventRegistration.count({ where: { eventId, paymentStatus: 'completed' } }),
      prisma.paymentTransaction.aggregate({
        where: {
          registration: { eventId },
          status: 'completed',
        },
        _sum: { amount: true },
      }),
      prisma.certificate.count({ where: { eventId } }),
    ]);

    // Registration trend (last 7 days)
    const trend = await prisma.eventRegistration.groupBy({
      by: ['createdAt'],
      where: {
        eventId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    });

    return {
      event,
      statistics: {
        total_registrations: totalRegistrations,
        confirmed,
        pending,
        cancelled,
        attended,
        paid,
        total_revenue: totalRevenue._sum.amount || 0,
        certificates_issued: certificatesIssued,
      },
      registrationTrend: trend.map((t: any) => ({
        date: t.createdAt,
        count: t._count,
      })),
    };
  }

  // Event Management
  async getEvents(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
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
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: [
          // Custom sort: upcoming first, then ongoing, then completed
          { eventStatus: 'desc' }, // 'upcoming' > 'ongoing' > 'completed' alphabetically desc
          { startDate: 'asc' },    // Earlier dates first within same status
        ],
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return {
      events: events.map((e: any) => ({
        ...e,
        registrationCount: e._count.registrations,
      })),
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

    const eventData: any = {
      title: data.title,
      slug: formattedSlug,
      description: data.description,
      eventType: data.eventType,
      eventMode: data.eventMode || 'offline',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationDeadline: new Date(data.registrationDeadline),
      price: parseFloat(data.price) || 0,
      maxParticipants: parseInt(data.maxParticipants) || null,
      eventStatus: data.status || 'upcoming',
      isPublished: true,

      // Boolean fields - convert strings to booleans
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

    // Handle venue for offline/hybrid events
    if (data.venue) {
      eventData.venueDetails = JSON.stringify({ name: data.venue });
    }

    // Handle online link and platform for online/hybrid events
    if (data.onlineLink) {
      eventData.onlineLink = data.onlineLink;
      eventData.onlinePlatform = data.onlinePlatform || 'other';
    }

    // Handle thumbnail URL with Google Drive support
    if (data.thumbnailUrl || data.thumbnail) {
      let imageUrl = data.thumbnailUrl || data.thumbnail;

      // Convert Google Drive share links to direct image URLs
      if (imageUrl.includes('drive.google.com')) {
        let fileId = null;

        // Format: https://drive.google.com/file/d/FILE_ID/view
        const viewMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (viewMatch) fileId = viewMatch[1];

        // Format: https://drive.google.com/open?id=FILE_ID
        const openMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (openMatch) fileId = openMatch[1];

        // Format: https://drive.google.com/uc?id=FILE_ID
        const ucMatch = imageUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (ucMatch) fileId = ucMatch[1];

        if (fileId) {
          imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }

      eventData.thumbnail = imageUrl;
    }

    // Handle guests (JSON field)
    if (data.guests) {
      const guests = typeof data.guests === 'string' ? JSON.parse(data.guests) : data.guests;
      eventData.guests = guests && guests.length > 0 ? JSON.stringify(guests) : null;
    }

    const event = await prisma.event.create({
      data: eventData,
    });

    return event;
  }

  async updateEvent(id: number, data: any) {
    const eventData: any = {};

    if (data.title) eventData.title = data.title;
    if (data.slug) {
      // Format and validate slug
      eventData.slug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (data.description) eventData.description = data.description;
    if (data.eventType) eventData.eventType = data.eventType;
    if (data.eventMode) {
      eventData.eventMode = data.eventMode;

      // Validate online event requirements
      if (data.eventMode === 'online' && data.meetingPlatform === undefined) {
        throw new AppError('Meeting platform is required for online events', 400);
      }
    }

    // Boolean fields - convert strings to booleans
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
      eventData.onlinePlatform = data.onlinePlatform || 'other';
    }

    if (data.startDate) eventData.startDate = new Date(data.startDate);
    if (data.endDate) eventData.endDate = new Date(data.endDate);
    if (data.registrationDeadline) eventData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.price !== undefined) eventData.price = parseFloat(data.price);
    if (data.maxParticipants !== undefined) eventData.maxParticipants = parseInt(data.maxParticipants) || null;
    if (data.status) eventData.eventStatus = data.status;

    // Handle thumbnail - support both field names and Google Drive links
    if (data.thumbnail || data.thumbnailUrl) {
      let imageUrl = data.thumbnail || data.thumbnailUrl;

      // Convert Google Drive share links to direct image URLs
      if (imageUrl.includes('drive.google.com')) {
        // Extract file ID from various Google Drive URL formats
        let fileId = null;

        // Format: https://drive.google.com/file/d/FILE_ID/view
        const viewMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (viewMatch) {
          fileId = viewMatch[1];
        }

        // Format: https://drive.google.com/open?id=FILE_ID
        const openMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (openMatch) {
          fileId = openMatch[1];
        }

        // Format: https://drive.google.com/uc?id=FILE_ID
        const ucMatch = imageUrl.match(/\/uc\?id=([a-zA-Z0-9_-]+)/);
        if (ucMatch) {
          fileId = ucMatch[1];
        }

        if (fileId) {
          // Convert to direct image URL
          imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        }
      }

      eventData.thumbnail = imageUrl;
    }
    if (data.videoLink !== undefined) eventData.videoLink = data.videoLink;
    if (data.participantInstructions !== undefined) eventData.participantInstructions = data.participantInstructions;

    // Handle guests update (JSON field)
    if (data.guests !== undefined) {
      const guests = typeof data.guests === 'string' ? JSON.parse(data.guests) : data.guests;
      eventData.guests = guests && guests.length > 0 ? JSON.stringify(guests) : null;
    }

    const event = await prisma.event.update({
      where: { id },
      data: eventData,
    });

    return event;
  }

  async deleteEvent(id: number) {
    // Check if event has registrations
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

    // Parse guests JSON if exists
    let guests = null;
    if (event.guests) {
      try {
        guests = JSON.parse(event.guests);
      } catch (e) {
        console.error('Failed to parse guests JSON:', e);
        guests = [];
      }
    }

    return {
      ...event,
      guests,
      registrationCount: (event as any)._count.registrations,
    };
  }

  // System Settings Logic
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
    // Basic validation or sanitization could go here
    return (prisma as any).systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }

  // Admin Profile Management
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

  async updateAdminProfile(userId: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
  }, avatarFile?: Express.Multer.File) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updateData: any = {};

    // Update basic fields
    if (data.name) {
      updateData.name = data.name;
    }

    if (data.email && data.email !== user.email) {
      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new AppError('Email is already in use', 400);
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new AppError('Invalid email format', 400);
      }

      updateData.email = data.email;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    // Handle avatar file upload to Cloudinary
    if (avatarFile) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(avatarFile.path, {
          folder: 'oriyet/avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          public_id: `user-${userId}-${Date.now()}`,
        });

        // Delete old avatar from Cloudinary if exists
        if (user.avatar && user.avatar.includes('cloudinary')) {
          const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (error) {
            console.log('Error deleting old avatar:', error);
          }
        }

        // Delete local file
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

      // Verify current password
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password || '');

      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Validate new password strength
      if (data.newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 12);
      updateData.password = hashedPassword;
    }

    // Update user
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
    const where = eventId ? { eventId } : {};

    const [totalRevenue, totalTransactions, successfulTransactions, pendingTransactions] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        where: { ...where, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.count({ where: { ...where, status: 'completed' } }),
      prisma.paymentTransaction.count({ where: { ...where, status: 'pending' } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
    };
  }

  async getPayments(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    eventId?: number;
  }) {
    const { page, limit, search, status, eventId } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
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
          event: {
            select: { id: true, title: true, slug: true },
          },
          registration: {
            select: { registrationNumber: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    return {
      payments: payments.map((p: any) => ({
        id: p.id,
        transactionId: p.transactionId,
        invoiceId: p.invoiceId,
        user: p.user,
        event: p.event,
        registrationNumber: p.registration?.registrationNumber,
        amount: p.amount,
        fee: p.fee || 0,
        netAmount: p.netAmount || p.amount,
        currency: p.currency || 'BDT',
        method: p.method,
        status: p.status,
        paymentData: p.paymentData,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
      })),
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
      where.eventId = params.eventId;
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
        event: {
          select: { title: true },
        },
        registration: {
          select: { registrationNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create CSV
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'transactionId', title: 'Transaction ID' },
        { id: 'invoiceId', title: 'Invoice ID' },
        { id: 'userName', title: 'User Name' },
        { id: 'userEmail', title: 'User Email' },
        { id: 'eventTitle', title: 'Event' },
        { id: 'registrationNumber', title: 'Registration Number' },
        { id: 'amount', title: 'Amount (BDT)' },
        { id: 'status', title: 'Status' },
        { id: 'method', title: 'Payment Method' },
        { id: 'createdAt', title: 'Date' },
      ],
    });

    const records = payments.map((p: any) => ({
      transactionId: p.transactionId,
      invoiceId: p.invoiceId,
      userName: p.user.name,
      userEmail: p.user.email,
      eventTitle: p.event.title,
      registrationNumber: p.registration?.registrationNumber || 'N/A',
      amount: p.amount,
      status: p.status,
      method: p.method || 'Online',
      createdAt: new Date(p.createdAt).toLocaleString(),
    }));

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    return csv;
  }
}

export const adminService = new AdminService();
