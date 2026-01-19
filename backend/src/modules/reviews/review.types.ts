export interface ReviewCreateData {
  userId: number;
  eventId: number;
  rating: number;
  comment?: string;
}

export interface ReviewUpdateData {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  isApproved?: boolean;
  eventId?: number;
  page: number;
  limit: number;
}

export interface ReviewApprovalData {
  reviewId: number;
  adminId: number;
  isApproved: boolean;
  isFeatured?: boolean;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  featured: number;
  averageRating: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
