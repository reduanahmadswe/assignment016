export interface CreateEventInput {
  title: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  event_type: 'seminar' | 'workshop' | 'webinar';
  event_mode: 'online' | 'offline' | 'hybrid';
  venue_details?: object;
  online_link?: string;
  online_platform?: 'zoom' | 'google_meet' | 'other';
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  is_free: boolean;
  price?: number;
  max_participants?: number;
  has_certificate: boolean;
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
  host_ids?: number[];
  guests?: Array<{
    name: string;
    email: string;
    bio?: string;
    role: string;
    pictureLink?: string;
    website?: string;
    cvLink?: string;
  }>;
  // Certificate Signature Fields
  signature1_name?: string;
  signature1_title?: string;
  signature1_image?: string;
  signature2_name?: string;
  signature2_title?: string;
  signature2_image?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  registration_status?: string;
  event_status?: string;
  video_link?: string;
  session_summary?: string;
  session_summary_pdf?: string;
  is_published?: boolean;
}

export interface EventFilters {
  event_type?: string;
  event_mode?: string;
  event_status?: string;
  is_free?: boolean;
  is_featured?: boolean;
  search?: string;
  price_range?: string;
  date_range?: string;
  category?: string;
}
