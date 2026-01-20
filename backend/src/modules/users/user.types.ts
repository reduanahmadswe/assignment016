export interface UpdateUserInput {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UserProfileData {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface DashboardStats {
  total_registrations: number;
  upcoming_events: number;
  total_certificates: number;
  total_spent: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
