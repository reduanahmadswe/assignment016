export interface PageInput {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published?: boolean;
}

export interface DashboardStats {
  total_users: number;
  new_users_30d: number;
  total_events: number;
  upcoming_events: number;
  total_registrations: number;
  registrations_30d: number;
  total_revenue: number;
  revenue_30d: number;
  total_certificates: number;
  recentRegistrations: any[];
  eventStats: any[];
}

export interface RegistrationFilters {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface PaymentFilters {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  eventId?: number;
}

export interface ExportParams {
  eventId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  paymentStatus?: string | null;
  format: 'excel' | 'csv' | 'pdf';
}

export interface AdminProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface SystemSettings {
  site: any;
  payment: any;
  email: any;
  notifications: any;
}
