import prisma from '../../config/db.js';
import { paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { UserTransformer } from './user.transformer.js';
import type { UserFilters, PaginationMeta } from './user.types.js';

export class UserQueryService {
  static readonly USER_SELECT = {
    id: true,
    email: true,
    name: true,
    phone: true,
    avatar: true,
    role: { select: { code: true } },
    isVerified: true,
    createdAt: true,
  };

  static async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: this.USER_SELECT,
    });

    return user ? UserTransformer.transformProfile(user) : null;
  }

  static async getRegisteredEvents(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { userId },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              eventType: { select: { code: true } },
              eventMode: { select: { code: true } },
              startDate: true,
              endDate: true,
              onlineLink: true,
              onlinePlatform: { select: { code: true } },
              venueDetails: true,
              eventStatus: { select: { code: true } },
              hasCertificate: true,
            },
          },
        },
        orderBy: { event: { startDate: 'desc' } },
        skip: offset,
        take: limit,
      }),
      prisma.eventRegistration.count({ where: { userId } }),
    ]);

    const transformedRegistrations = registrations.map(UserTransformer.transformRegistration);

    return {
      registrations: transformedRegistrations,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  static async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [payments, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
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
      }),
      prisma.paymentTransaction.count({ where: { userId } }),
    ]);

    return {
      payments,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  static async getCertificates(userId: number, page: number = 1, limit: number = 10) {
    const { offset } = paginate(page, limit);

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where: { userId },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              eventType: { select: { code: true } },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.certificate.count({ where: { userId } }),
    ]);

    const transformedCertificates = certificates.map(UserTransformer.transformCertificate);

    return {
      certificates: transformedCertificates,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  static async getAllUsers(filters: UserFilters) {
    const { page = 1, limit = 10, search, role } = filters;
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
          role: { select: { code: true } },
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

    const mappedUsers = users.map(UserTransformer.transformAdminUser);

    return {
      users: mappedUsers,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  static async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...this.USER_SELECT,
        isActive: true,
      },
    });

    return user ? UserTransformer.transformProfile(user) : null;
  }
}
