import prisma from '../../config/db.js';

export class AdminStatsService {
  static async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, newUsers30d, totalEvents, upcomingEvents, totalRegistrations,
      registrations30d, transactionRevenue, registrationRevenue, revenue30d, totalCertificates] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.event.count(),
        prisma.event.count({ where: { eventStatus: { code: 'upcoming' } } }),
        prisma.eventRegistration.count(),
        prisma.eventRegistration.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        prisma.paymentTransaction.aggregate({
          where: {
            status: { code: { in: ['completed', 'COMPLETED'] } },
            createdAt: { gte: startOfMonth }
          },
          _sum: { amount: true },
        }),
        prisma.eventRegistration.aggregate({
          where: {
            paymentStatus: { code: { in: ['completed', 'COMPLETED', 'paid'] } },
            createdAt: { gte: startOfMonth }
          },
          _sum: { paymentAmount: true }
        }),
        prisma.paymentTransaction.aggregate({
          where: { status: { code: 'completed' }, createdAt: { gte: thirtyDaysAgo } },
          _sum: { amount: true },
        }),
        prisma.certificate.count(),
      ]);

    const currentMonthRevenue = (transactionRevenue._sum.amount || 0) > 0
      ? (transactionRevenue._sum.amount || 0)
      : (registrationRevenue._sum.paymentAmount || 0);

    const recentRegistrations = await prisma.eventRegistration.findMany({
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const eventStats = await prisma.event.groupBy({
      by: ['eventStatusId'],
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
      recentRegistrations,
      eventStats: eventStats.map((s: any) => ({
        event_status: s.eventStatus,
        count: s._count,
      })),
    };
  }

  static async getEventStatistics(identifier: number | string) {
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

    const event = await prisma.event.findFirst({ where });
    if (!event) return null;

    const eventId = event.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalRegistrations, confirmed, pending, cancelled, attended, paid, totalRevenue, certificatesIssued] = await Promise.all([
      prisma.eventRegistration.count({ where: { eventId } }),
      prisma.eventRegistration.count({ where: { eventId, status: { code: 'confirmed' } } }),
      prisma.eventRegistration.count({ where: { eventId, status: { code: 'pending' } } }),
      prisma.eventRegistration.count({ where: { eventId, status: { code: 'cancelled' } } }),
      prisma.eventRegistration.count({ where: { eventId, status: { code: 'attended' } } }),
      prisma.eventRegistration.count({ where: { eventId, paymentStatus: { code: 'completed' } } }),
      prisma.paymentTransaction.aggregate({
        where: {
          registration: { eventId },
          status: { code: 'completed' },
        },
        _sum: { amount: true },
      }),
      prisma.certificate.count({ where: { eventId } }),
    ]);

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

  static async getPaymentStats(eventId?: number) {
    const where: any = eventId ? { registration: { eventId } } : {};

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
}
