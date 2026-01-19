import prisma from '../../config/db.js';
import type { DashboardStats } from './user.types.js';

export class UserStatsService {
  static async getDashboardStats(userId: number): Promise<DashboardStats> {
    const [totalRegistrations, upcomingEvents, totalCertificates, paymentSum] = await Promise.all([
      prisma.eventRegistration.count({ where: { userId } }),
      prisma.eventRegistration.count({
        where: {
          userId,
          event: { eventStatus: { code: 'upcoming' } },
        },
      }),
      prisma.certificate.count({ where: { userId } }),
      prisma.paymentTransaction.aggregate({
        where: { userId, status: { code: 'completed' } },
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
}
