/**
 * Convert date to Dhaka timezone with proper formatting
 */
const formatDateToDhaka = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'short',
    hour12: true
  });
};

/**
 * Format date to ISO string in Dhaka timezone
 */
const toISOStringDhaka = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Convert date to Dhaka timezone for datetime-local input (YYYY-MM-DDTHH:mm format)
 * This is used for edit forms to show the correct time
 */
const toDateTimeLocalDhaka = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convert to Dhaka timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(dateObj);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

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
      // Format dates to Dhaka timezone
      startDate: toISOStringDhaka(eventData.startDate),
      endDate: toISOStringDhaka(eventData.endDate),
      registrationDeadline: toISOStringDhaka(eventData.registrationDeadline),
      startDateFormatted: formatDateToDhaka(eventData.startDate),
      endDateFormatted: formatDateToDhaka(eventData.endDate),
      registrationDeadlineFormatted: formatDateToDhaka(eventData.registrationDeadline),
      // For edit form inputs (datetime-local format in Dhaka time)
      startDateInput: toDateTimeLocalDhaka(eventData.startDate),
      endDateInput: toDateTimeLocalDhaka(eventData.endDate),
      registrationDeadlineInput: toDateTimeLocalDhaka(eventData.registrationDeadline),
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
      // Format dates to Dhaka timezone
      startDate: toISOStringDhaka(eventData.startDate),
      endDate: toISOStringDhaka(eventData.endDate),
      registrationDeadline: toISOStringDhaka(eventData.registrationDeadline),
      startDateFormatted: formatDateToDhaka(eventData.startDate),
      endDateFormatted: formatDateToDhaka(eventData.endDate),
      registrationDeadlineFormatted: formatDateToDhaka(eventData.registrationDeadline),
      // For edit form inputs (datetime-local format in Dhaka time)
      startDateInput: toDateTimeLocalDhaka(eventData.startDate),
      endDateInput: toDateTimeLocalDhaka(eventData.endDate),
      registrationDeadlineInput: toDateTimeLocalDhaka(eventData.registrationDeadline),
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
      // Format dates to Dhaka timezone
      startDate: toISOStringDhaka(event.startDate),
      endDate: toISOStringDhaka(event.endDate),
      registrationDeadline: toISOStringDhaka(event.registrationDeadline),
      startDateFormatted: formatDateToDhaka(event.startDate),
      endDateFormatted: formatDateToDhaka(event.endDate),
      registrationDeadlineFormatted: formatDateToDhaka(event.registrationDeadline),
      // For edit form inputs (datetime-local format in Dhaka time)
      startDateInput: toDateTimeLocalDhaka(event.startDate),
      endDateInput: toDateTimeLocalDhaka(event.endDate),
      registrationDeadlineInput: toDateTimeLocalDhaka(event.registrationDeadline),
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
      // Format dates to Dhaka timezone
      startDate: toISOStringDhaka(registration.event.startDate),
      endDate: toISOStringDhaka(registration.event.endDate),
      registrationDeadline: toISOStringDhaka(registration.event.registrationDeadline),
      startDateFormatted: formatDateToDhaka(registration.event.startDate),
      endDateFormatted: formatDateToDhaka(registration.event.endDate),
      registrationDeadlineFormatted: formatDateToDhaka(registration.event.registrationDeadline),
      // For edit form inputs (datetime-local format in Dhaka time)
      startDateInput: toDateTimeLocalDhaka(registration.event.startDate),
      endDateInput: toDateTimeLocalDhaka(registration.event.endDate),
      registrationDeadlineInput: toDateTimeLocalDhaka(registration.event.registrationDeadline),
    };
  }
}

export const eventTransformer = new EventTransformer();
