import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';
import { uploadImage } from '../../utils/file.util.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings/site', uploadImage.single('siteLogo'), adminController.updateSiteSettings); // Handle FormData + Upload
router.put('/settings/payment', adminController.updatePaymentSettings);
router.put('/settings/email', adminController.updateEmailSettings);
router.put('/settings/notifications', adminController.updateNotificationSettings);
router.post('/settings/test-email', adminController.sendTestEmail);

// Registrations
router.get('/registrations/recent', adminController.getRecentRegistrations);
router.get('/registrations/summary', adminController.getRegistrationsSummary);
router.get('/registrations', adminController.getRegistrations);

// Events Management
router.get('/events', adminController.getEvents);
router.get('/events/upcoming', adminController.getUpcomingEvents);
router.post('/events', adminController.createEvent);
router.get('/events/:id', adminController.getEventById);
router.put('/events/:id', adminController.updateEvent);
router.delete('/events/:id', adminController.deleteEvent);
router.get('/events/:eventId/statistics', adminController.getEventStatistics);

// Pages
router.get('/pages', adminController.getAllPages);
router.get('/pages/:slug', adminController.getPageBySlug);
router.put('/pages/:slug', adminController.updatePage);

// Export
router.get('/export/registrations', adminController.exportRegistrations);

// Payments
router.get('/payments/stats', adminController.getPaymentStats);
router.get('/payments', adminController.getPayments);
router.get('/payments/export', adminController.exportPayments);

// Admin Profile
router.get('/profile', adminController.getAdminProfile);
router.put('/profile', uploadImage.single('avatar'), adminController.updateAdminProfile);

export default router;
