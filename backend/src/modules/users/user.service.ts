import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { paginate, getPaginationMeta } from '../../utils/helpers.util.js';

interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export class UserService {
  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateUserInput) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar) updateData.avatar = data.avatar;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No data to update', 400);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getProfile(userId);
  }

  async getRegisteredEvents(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const registrations = await prisma.eventRegistration.findMany({
      where: { userId },
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
            onlinePlatform: true,
            venueDetails: true,
            eventStatus: true,
            hasCertificate: true,
          },
        },
      },
      orderBy: { event: { startDate: 'desc' } },
      skip: offset,
      take: limit,
    });

    const total = await prisma.eventRegistration.count({
      where: { userId },
    });

    return {
      registrations,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const payments = await prisma.paymentTransaction.findMany({
      where: { userId },
      include: {
        registration: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await prisma.paymentTransaction.count({
      where: { userId },
    });

    return {
      payments,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getCertificates(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventType: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
      skip: offset,
      take: limit,
    });

    const total = await prisma.certificate.count({
      where: { userId },
    });

    return {
      certificates,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getDashboardStats(userId: number) {
    const [totalRegistrations, upcomingEvents, totalCertificates, paymentSum] = await Promise.all([
      prisma.eventRegistration.count({ where: { userId } }),
      prisma.eventRegistration.count({
        where: {
          userId,
          event: { eventStatus: 'upcoming' },
        },
      }),
      prisma.certificate.count({ where: { userId } }),
      prisma.paymentTransaction.aggregate({
        where: { userId, status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    return {
      total_registrations: totalRegistrations,
      upcoming_events: upcomingEvents,
      total_certificates: totalCertificates,
      total_spent: paymentSum._sum.amount || 0,
    };
  }

  // Admin functions
  async getAllUsers(page: number = 1, limit: number = 10, search?: string, role?: string) {
    const { offset } = paginate(page, limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              registrations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Map isActive to status and add events_count
    const mappedUsers = users.map((user: any) => ({
      ...user,
      status: user.isActive ? 'active' : 'suspended',
      events_count: user._count.registrations,
      created_at: user.createdAt,
    }));

    return {
      users: mappedUsers,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUserStatus(userId: number, isActive: boolean) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
    
    return this.getUserById(userId);
  }

  async updateUserRole(userId: number, role: 'user' | 'admin') {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    
    return this.getUserById(userId);
  }

  async deleteUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id: userId },
    });
    
    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
