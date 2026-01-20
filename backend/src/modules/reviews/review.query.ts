import prisma from '../../config/db.js';
import type { ReviewFilters, PaginationInfo } from './review.types.js';

export class ReviewQueryService {
  static readonly REVIEW_INCLUDE = {
    user: {
      select: { id: true, name: true, email: true, avatar: true },
    },
    event: {
      select: { id: true, title: true, slug: true },
    },
  };

  static async getMyReviews(userId: number) {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: this.REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return reviews;
  }

  static async getApprovedReviews(featured?: boolean, limit?: number) {
    const where: any = { isApproved: true };

    if (featured) {
      where.isFeatured = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        event: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return reviews;
  }

  static async getAllReviews(filters: ReviewFilters) {
    const { isApproved, eventId, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (isApproved !== undefined) {
      where.isApproved = isApproved;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: this.REVIEW_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return { reviews, pagination };
  }
}
