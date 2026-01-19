export class AdminTransformer {
  static transformRegistration(registration: any) {
    return {
      id: registration.id,
      registrationNumber: registration.registrationNumber,
      user: registration.user,
      event: {
        ...registration.event,
        eventType: registration.event.eventType.code,
      },
      status: registration.status.code,
      paymentStatus: registration.paymentStatus.code,
      paymentAmount: Number(registration.paymentAmount),
      createdAt: registration.createdAt,
    };
  }

  static transformRecentRegistration(registration: any) {
    return {
      ...registration,
      name: registration.user.name,
      email: registration.user.email,
      event_title: registration.event.title,
    };
  }

  static transformEvent(event: any) {
    return {
      ...event,
      eventType: event.eventType.code,
      eventMode: event.eventMode.code,
      eventStatus: event.eventStatus.code,
      registrationStatus: event.registrationStatus.code,
      registrationCount: event._count.registrations,
    };
  }

  static transformEventWithStats(event: any, stats: any) {
    return {
      id: event.id,
      title: event.title,
      thumbnail: event.thumbnail,
      eventType: event.eventType,
      eventStatus: event.eventStatus.code,
      startDate: event.startDate,
      endDate: event.endDate,
      maxParticipants: event.maxParticipants,
      totalRegistrations: event._count.registrations,
      confirmed: stats.confirmed,
      pending: stats.pending,
      cancelled: stats.cancelled,
      attended: stats.attended,
      isFree: Number(event.price) === 0,
      totalRevenue: stats.totalRevenue,
    };
  }

  static transformCreatedEvent(createdEvent: any) {
    const transformed = {
      ...createdEvent,
      eventType: createdEvent.eventType.code,
      eventMode: createdEvent.eventMode.code,
      eventStatus: createdEvent.eventStatus.code,
      registrationStatus: createdEvent.registrationStatus.code,
      onlinePlatform: createdEvent.onlinePlatform?.code || null,
      
      // Transform signatures to old format
      signature1Name: createdEvent.eventSignatures.find((s: any) => s.position === 1)?.signature.name || null,
      signature1Title: createdEvent.eventSignatures.find((s: any) => s.position === 1)?.signature.title || null,
      signature1Image: createdEvent.eventSignatures.find((s: any) => s.position === 1)?.signature.image || null,
      signature2Name: createdEvent.eventSignatures.find((s: any) => s.position === 2)?.signature.name || null,
      signature2Title: createdEvent.eventSignatures.find((s: any) => s.position === 2)?.signature.title || null,
      signature2Image: createdEvent.eventSignatures.find((s: any) => s.position === 2)?.signature.image || null,
      
      // Transform guests to old format
      guests: createdEvent.eventGuests.map((g: any) => ({
        name: g.name,
        email: g.email,
        bio: g.bio,
        role: g.role.code,
        pictureLink: g.pictureLink,
        website: g.website,
        cvLink: g.cvLink,
      })),
    };

    // Remove normalized fields
    delete (transformed as any).eventTypeId;
    delete (transformed as any).eventModeId;
    delete (transformed as any).eventStatusId;
    delete (transformed as any).registrationStatusId;
    delete (transformed as any).onlinePlatformId;
    delete (transformed as any).eventSignatures;
    delete (transformed as any).eventGuests;

    return transformed;
  }

  static transformEventById(event: any) {
    return {
      ...event,
      eventType: event.eventType.code,
      eventMode: event.eventMode.code,
      eventStatus: event.eventStatus.code,
      registrationStatus: event.registrationStatus.code,
      onlinePlatform: event.onlinePlatform?.code || null,
      registrationCount: (event as any)._count.registrations,
    };
  }

  static transformPayment(payment: any) {
    return {
      id: payment.id,
      transactionId: payment.transactionId,
      invoiceId: payment.invoiceId,
      user: payment.user,
      event: payment.registration?.event,
      registrationNumber: payment.registration?.registrationNumber,
      amount: payment.amount,
      fee: payment.fee || 0,
      netAmount: payment.netAmount || payment.amount,
      currency: payment.currency || 'BDT',
      method: payment.method,
      status: payment.status,
      paymentData: payment.paymentData,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
    };
  }

  static transformPaymentForExport(payment: any) {
    return {
      transactionId: payment.transactionId,
      invoiceId: payment.invoiceId,
      userName: payment.user.name,
      userEmail: payment.user.email,
      eventTitle: payment.registration?.event?.title || 'N/A',
      registrationNumber: payment.registration?.registrationNumber || 'N/A',
      amount: payment.amount,
      status: payment.status,
      method: payment.method || 'Online',
      createdAt: new Date(payment.createdAt).toLocaleString(),
    };
  }

  static transformRegistrationForExport(registration: any) {
    return {
      registration_number: registration.registrationNumber,
      participant_name: registration.user.name,
      participant_email: registration.user.email,
      participant_phone: registration.user.phone,
      event_title: registration.event.title,
      event_type: registration.event.eventType,
      registration_status: registration.status,
      payment_status: registration.paymentStatus,
      payment_amount: Number(registration.paymentAmount),
      registration_date: registration.createdAt,
    };
  }
}
