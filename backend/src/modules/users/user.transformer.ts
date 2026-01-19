import prisma from '../../config/db.js';

export class UserTransformer {
  static transformProfile(user: any) {
    return {
      ...user,
      role: user.role.code,
    };
  }

  static transformRegistration(reg: any) {
    return {
      ...reg,
      event: {
        ...reg.event,
        eventType: reg.event.eventType.code,
        eventMode: reg.event.eventMode.code,
        eventStatus: reg.event.eventStatus.code,
        onlinePlatform: reg.event.onlinePlatform?.code,
      },
    };
  }

  static transformCertificate(cert: any) {
    return {
      ...cert,
      event: {
        ...cert.event,
        eventType: cert.event.eventType.code,
      },
    };
  }

  static transformAdminUser(user: any) {
    return {
      ...user,
      role: user.role.code,
      status: user.isActive ? 'active' : 'suspended',
      events_count: user._count.registrations,
      created_at: user.createdAt,
    };
  }
}
