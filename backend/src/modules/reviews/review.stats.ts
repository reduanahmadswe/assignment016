import prisma from '../../config/db.js';
import type { ReviewStats } from './review.types.js';

export class ReviewStatsService {
  static async getReviewStats(): Promise<ReviewStats> {
    const [total, pending, approved, featured] = await Promise.all([
      prisma.review.count(),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count({ where: { isApproved: true, isFeatured: true } }),
    ]);

    const avgRating = await prisma.review.aggregate({
      where: { isApproved: true },
      _avg: { rating: true },
    });

    return {
      total,
      pending,
      approved,
      featured,
      averageRating: avgRating._avg.rating ? Number(avgRating._avg.rating.toFixed(1)) : 0,
    };
  }
}
