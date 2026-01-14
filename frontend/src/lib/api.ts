import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove Content-Type header for FormData to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      error.message = 'Unable to connect to the server. Please check your internet connection and try again.';
      return Promise.reject(error);
    }

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          Cookies.set('accessToken', accessToken, { expires: 7 });
          Cookies.set('refreshToken', newRefreshToken, { expires: 30 });

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Ensure error has a user-friendly message
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.status === 500) {
      error.message = 'An unexpected error occurred. Please try again later.';
    } else if (error.response?.status === 503) {
      error.message = 'Service temporarily unavailable. Please try again in a few moments.';
    } else if (error.response?.status === 404) {
      error.message = 'The requested resource was not found.';
    } else if (error.response?.status === 403) {
      error.message = 'You do not have permission to perform this action.';
    } else if (!error.message || error.message === 'Network Error') {
      error.message = 'Something went wrong. Please try again.';
    }

    return Promise.reject(error);
  }
);

export default api;

// Also export as named export for files that import it directly
export { api };

// Auth APIs
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  resendOTP: (email: string) => api.post('/auth/resend-otp', { email }),
  login: (data: any) => api.post('/auth/login', data),
  verifyLoginOTP: (data: any) => api.post('/auth/verify-login-otp', data),
  googleAuth: (idToken: string) => api.post('/auth/google', { idToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),
  sendPasswordChangeOTP: () => api.post('/auth/send-password-change-otp'),
  verifyAndChangePassword: (data: { otp: string; currentPassword: string; newPassword: string }) => 
    api.post('/auth/verify-and-change-password', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  // 2FA
  setup2FA: () => api.post('/auth/2fa/setup'),
  enable2FA: (token: string) => api.post('/auth/2fa/enable', { token }),
  disable2FA: (data: any) => api.post('/auth/2fa/disable', data),
  get2FAStatus: () => api.get('/auth/2fa/status'),
  toggleEmailOTP: (enabled: boolean) => api.post('/auth/2fa/toggle-email-otp', { enabled }),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  changePassword: (data: any) => api.put('/users/change-password', data),
  getRegisteredEvents: (page = 1, limit = 10) =>
    api.get(`/users/registered-events?page=${page}&limit=${limit}`),
  getPaymentHistory: (page = 1, limit = 10) =>
    api.get(`/users/payment-history?page=${page}&limit=${limit}`),
  getCertificates: (page = 1, limit = 10) =>
    api.get(`/users/certificates?page=${page}&limit=${limit}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
  getMyEvents: (params?: any) => api.get('/users/my-events', { params }),
  getMyCertificates: (params?: any) => api.get('/users/my-certificates', { params }),
};

// Event APIs
export const eventAPI = {
  getAll: (params?: any) => api.get('/events', { params }),
  getUpcoming: (limit = 6) => api.get(`/events/upcoming?limit=${limit}`),
  getOngoing: (limit = 6) => api.get(`/events/ongoing?limit=${limit}`),
  getPast: (page = 1, limit = 10) => api.get(`/events/past?page=${page}&limit=${limit}`),
  getFeatured: (limit = 3) => api.get(`/events/featured?limit=${limit}`),
  getBySlug: (slug: string) => api.get(`/events/slug/${slug}`),
  getById: (id: number) => api.get(`/events/${id}`),
  register: (eventId: number) => api.post(`/events/${eventId}/register`),
  cancelRegistration: (eventId: number) => api.delete(`/events/${eventId}/register`),
  checkRegistrationStatus: (eventId: number) => api.get(`/events/${eventId}/registration-status`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  getRegistrations: (eventId: number, page = 1, limit = 10) =>
    api.get(`/events/${eventId}/registrations?page=${page}&limit=${limit}`),
  getMyEvents: () => api.get('/events/my-events'),
};

// Host APIs
export const hostAPI = {
  getAll: (params?: any) => api.get('/hosts', { params }),
  getById: (id: number) => api.get(`/hosts/${id}`),
  getEvents: (id: number) => api.get(`/hosts/${id}/events`),
  create: (data: any) => api.post('/hosts', data),
  update: (id: number, data: any) => api.put(`/hosts/${id}`, data),
  delete: (id: number) => api.delete(`/hosts/${id}`),
};

// Payment APIs
export const paymentAPI = {
  initiate: (data: { event_id: number; amount?: number }) => api.post('/payments/initiate', data),
  verify: (invoiceId: string) => api.post('/payments/verify', { invoice_id: invoiceId }),
  cancel: (transactionId: string) => api.post('/payments/cancel', { transaction_id: transactionId }),
  getTransaction: (transactionId: string) => api.get(`/payments/transaction/${transactionId}`),
  getMyPayments: () => api.get('/payments/my-payments'),
};

// Certificate APIs
export const certificateAPI = {
  generate: (registrationId: number) => api.post('/certificates/generate', { registration_id: registrationId }),
  verify: (certificateId: string) => api.get(`/certificates/verify/${certificateId}`),
  getById: (certificateId: string) => api.get(`/certificates/${certificateId}`),
  getAll: () => api.get('/certificates'),
};

// Blog APIs
export const blogAPI = {
  getAll: (params?: any) => api.get('/blogs', { params }),
  getRecent: (limit = 5) => api.get(`/blogs/recent?limit=${limit}`),
  getBySlug: (slug: string) => api.get(`/blogs/slug/${slug}`),
  getById: (id: number) => api.get(`/blogs/${id}`),
  getRelated: (slug: string, limit = 3) => api.get(`/blogs/${slug}/related?limit=${limit}`),
  getCategories: () => api.get('/blogs/categories'),
  create: (data: any) => api.post('/blogs', data),
  update: (id: number, data: any) => api.put(`/blogs/${id}`, data),
  delete: (id: number) => api.delete(`/blogs/${id}`),
};

// Newsletter APIs
export const newsletterAPI = {
  // Public
  getAll: (params?: any) => api.get('/newsletters', { params }),
  getById: (id: number) => api.get(`/newsletters/${id}`),
  incrementViews: (id: number) => api.post(`/newsletters/${id}/view`),
  incrementDownloads: (id: number) => api.post(`/newsletters/${id}/download`),
  // Admin
  adminGetAll: (params?: any) => api.get('/newsletters/admin/all', { params }),
  create: (data: any) => api.post('/newsletters/admin', data),
  update: (id: number, data: any) => api.put(`/newsletters/admin/${id}`, data),
  delete: (id: number) => api.delete(`/newsletters/admin/${id}`),
  togglePublish: (id: number) => api.put(`/newsletters/admin/${id}/toggle-publish`),
};

// Page APIs
export const pageAPI = {
  getBySlug: (slug: string) => api.get(`/pages/${slug}`),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getRecentRegistrations: (limit = 10) => api.get(`/admin/registrations/recent?limit=${limit}`),
  getRegistrations: (params?: any) => api.get('/admin/registrations', { params }),
  getRegistrationsSummary: () => api.get('/admin/registrations/summary'),
  getUpcomingEvents: (limit = 5) => api.get(`/admin/events/upcoming?limit=${limit}`),
  getPages: () => api.get('/admin/pages'),
  getPageBySlug: (slug: string) => api.get(`/admin/pages/${slug}`),
  updatePage: (slug: string, data: any) => api.put(`/admin/pages/${slug}`, data),
  exportRegistrations: (params: any) => api.get('/admin/export/registrations', {
    params,
    responseType: 'blob'
  }),
  getEventStats: (eventId: number | string) => api.get(`/admin/events/${eventId}/statistics`),
  // Events management
  getEvents: (params?: any) => api.get('/admin/events', { params }),
  getEventById: (id: number | string) => api.get(`/admin/events/${id}`),
  createEvent: (data: any) => api.post('/admin/events', data),
  updateEvent: (id: number, data: any) => api.put(`/admin/events/${id}`, data),
  deleteEvent: (id: number) => api.delete(`/admin/events/${id}`),
  // User management
  getUsers: (params?: any) => api.get('/users', { params }),
  getUserById: (id: number) => api.get(`/users/${id}`),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  updateUserStatus: (id: number, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
  updateUserRole: (id: number, role: string) => api.patch(`/users/${id}/role`, { role }),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  // Hosts management
  getHosts: (params?: any) => api.get('/hosts', { params }),
  getHostById: (id: number) => api.get(`/hosts/${id}`),
  createHost: (data: any) => api.post('/hosts', data),
  updateHost: (id: number, data: any) => api.put(`/hosts/${id}`, data),
  deleteHost: (id: number) => api.delete(`/hosts/${id}`),
  // Payments management
  getPaymentStats: (eventId?: number) => api.get('/admin/payments/stats', { params: { eventId } }),
  getPayments: (params?: any) => api.get('/admin/payments', { params }),
  exportPayments: (params?: any) => api.get('/admin/payments/export', { 
    params,
    responseType: 'blob'
  }),
  // Certificates management
  getCertificates: (params?: any) => api.get('/admin/certificates', { params }),
  issueCertificate: (data: any) => api.post('/admin/certificates/issue', data),
  revokeCertificate: (id: number) => api.delete(`/admin/certificates/${id}`),
  // Blog management
  getBlogs: (params?: any) => api.get('/blogs', { params }),
  createBlog: (data: any) => api.post('/blogs', data),
  updateBlog: (id: number, data: any) => api.put(`/blogs/${id}`, data),
  updateBlogStatus: (id: number, status: 'draft' | 'published') => api.put(`/blogs/${id}/status`, { status }),
  deleteBlog: (id: number) => api.delete(`/blogs/${id}`),
  // Settings
  getSettings: (section: string) => api.get(`/admin/settings/${section}`),
  updateSettings: (section: string, data: any) => api.put(`/admin/settings/${section}`, data),
  testEmailSettings: () => api.post('/admin/settings/email/test'),
  // Profile
  get: (endpoint: string) => api.get(`/admin${endpoint}`),
  put: (endpoint: string, data: any) => api.put(`/admin${endpoint}`, data),
};
