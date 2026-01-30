export class EventTransformer {
  /**
   * Transform single event - extracts code from relation objects
   */
  transformEvent(event: any) {
    const { eventType, eventMode, eventStatus, registrationStatus, onlinePlatform, ...eventData } = event;

    return {
      ...eventData,
      eventType: eventType?.code,
      eventMode: eventMode?.code,
      eventStatus: eventStatus?.code,
      registrationStatus: registrationStatus?.code,
      onlinePlatform: onlinePlatform?.code,
    };
  }

  /**
   * Transform event with registration count
   */
  transformEventWithCount(event: any) {
    const { eventType, eventMode, eventStatus, registrationStatus, onlinePlatform, eventGuests, eventSignatures, _count, ...eventData } = event;

    // Transform signatures
    const signatures = eventSignatures?.map((es: any) => ({
      position: es.position,
      name: es.signature.name,
      title: es.signature.title,
      image: es.signature.image,
    })) || [];

    const signature1 = signatures.find((s: any) => s.position === 1);
    const signature2 = signatures.find((s: any) => s.position === 2);

    return {
      ...eventData,
      eventType: eventType.code,
      eventMode: eventMode.code,
      eventStatus: eventStatus.code,
      registrationStatus: registrationStatus.code,
      onlinePlatform: onlinePlatform?.code,
      registered_count: _count?.registrations || 0,
      guests: eventGuests?.map((g: any) => ({
        name: g.name,
        email: g.email,
        bio: g.bio,
        role: g.role.code,
        roleLabel: g.role.label,
        pictureLink: g.pictureLink,
        website: g.website,
        cvLink: g.cvLink,
      })) || [],
      signature1_name: signature1?.name || '',
      signature1_title: signature1?.title || '',
      signature1_image: signature1?.image || '',
      signature2_name: signature2?.name || '',
      signature2_title: signature2?.title || '',
      signature2_image: signature2?.image || '',
    };
  }

  /**
   * Transform list of events - for getAllEvents, getUpcomingEvents, etc.
   */
  transformEventList(events: any[]) {
    return events.map(event => ({
      ...event,
      eventType: event.eventType.code,
      eventMode: event.eventMode.code,
      registrationStatus: event.registrationStatus?.code,
      eventStatus: event.eventStatus?.code,
    }));
  }

  /**
   * Transform user events with registration info
   */
  transformUserEvent(registration: any) {
    return {
      ...registration.event,
      eventType: registration.event.eventType.code,
      eventMode: registration.event.eventMode.code,
      eventStatus: registration.event.eventStatus.code,
      registration_status: registration.status.code,
      payment_status: registration.paymentStatus.code,
      meeting_link: registration.status.code === 'confirmed' ? (registration.event.onlineLink || registration.event.meetingLink) : null,
      certificate_available: registration.event.hasCertificate,
      certificate_id: registration.certificates?.[0]?.certificateId,
      registration_id: registration.id,
    };
  }
}

export const eventTransformer = new EventTransformer();
