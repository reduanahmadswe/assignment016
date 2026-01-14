import { Response } from 'express';
import { adminService } from './admin.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class AdminController {
  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.json({
      success: true,
      data: stats,
    });
  });

  getRecentRegistrations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const registrations = await adminService.getRecentRegistrations(limit);
    res.json({
      success: true,
      data: { registrations },
    });
  });

  getRegistrations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, event_id, status, payment_status, search } = req.query;
    const result = await adminService.getRegistrations({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      eventId: event_id ? parseInt(event_id as string) : undefined,
      status: status as string,
      paymentStatus: payment_status as string,
      search: search as string,
    });
    res.json({
      success: true,
      data: result,
    });
  });

  getRegistrationsSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
    const summary = await adminService.getRegistrationsSummary();
    res.json({
      success: true,
      data: summary,
    });
  });

  getUpcomingEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const events = await adminService.getUpcomingEvents(limit);
    res.json({
      success: true,
      data: { events },
    });
  });

  // Pages
  getAllPages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const pages = await adminService.getAllPages();
    res.json({
      success: true,
      data: pages,
    });
  });

  getPageBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = await adminService.getPageBySlug(req.params.slug);
    res.json({
      success: true,
      data: page,
    });
  });

  updatePage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = await adminService.updatePage(req.params.slug, req.body);
    res.json({
      success: true,
      data: page,
    });
  });

  // Export
  exportRegistrations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { event_id, start_date, end_date, payment_status, format } = req.query;

    const result = await adminService.exportRegistrations(
      event_id ? parseInt(event_id as string) : null,
      start_date as string || null,
      end_date as string || null,
      payment_status as string || null,
      (format as 'excel' | 'csv' | 'pdf') || 'excel'
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${result.filename}`);
    res.send(result.buffer);
  });

  // Event Statistics
  getEventStatistics = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await adminService.getEventStatistics(req.params.eventId);
    res.json({
      success: true,
      data: stats,
    });
  });

  // Event Management
  getEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, search, status } = req.query;
    const result = await adminService.getEvents({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      search: search as string,
      status: status as string,
    });
    res.json({
      success: true,
      data: result,
    });
  });

  createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await adminService.createEvent(req.body);
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  });

  updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await adminService.updateEvent(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  });

  deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await adminService.deleteEvent(parseInt(req.params.id));
    res.json({
      success: true,
      message: result.message,
    });
  });

  getEventById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await adminService.getEventById(req.params.id);
    res.json({
      success: true,
      data: event,
    });
  });

  // System Settings
  getSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const settings = await adminService.getSystemSettings();
    res.json({
      success: true,
      data: settings,
    });
  });

  updateSiteSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = { ...req.body };

    // If using multer, req.file would be populated
    if (req.file) {
      data.siteLogo = `/uploads/${req.file.filename}`;
    }

    await adminService.updateSystemSetting('site', data);
    res.json({
      success: true,
      message: 'Site settings saved successfully',
    });
  });

  updatePaymentSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    await adminService.updateSystemSetting('payment', req.body);
    res.json({
      success: true,
      message: 'Payment settings saved successfully',
    });
  });

  updateEmailSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    await adminService.updateSystemSetting('email', req.body);
    res.json({
      success: true,
      message: 'Email settings saved successfully',
    });
  });

  updateNotificationSettings = asyncHandler(async (req: AuthRequest, res: Response) => {
    await adminService.updateSystemSetting('notifications', req.body);
    res.json({
      success: true,
      message: 'Notification settings saved successfully',
    });
  });

  sendTestEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Logic to send email using settings would go here
    res.json({
      success: true,
      message: 'Test email functionality is not fully wired yet, but settings are saved.',
    });
  });

  // Admin Profile Management
  getAdminProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await adminService.getAdminProfile(req.user!.id);
    res.json({
      success: true,
      data: profile,
    });
  });

  updateAdminProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    console.log('Update profile request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    const avatarFile = req.file;
    const updatedProfile = await adminService.updateAdminProfile(req.user!.id, req.body, avatarFile);
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  });

  // Payment Management
  getPaymentStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.query;
    const stats = await adminService.getPaymentStats(eventId ? parseInt(eventId as string) : undefined);
    res.json({
      success: true,
      data: stats,
    });
  });

  getPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, search, status, eventId } = req.query;
    const result = await adminService.getPayments({
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      search: search as string,
      status: status as string,
      eventId: eventId ? parseInt(eventId as string) : undefined,
    });
    res.json({
      success: true,
      data: result,
    });
  });

  exportPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId, status, search } = req.query;
    const result = await adminService.exportPayments({
      eventId: eventId ? parseInt(eventId as string) : undefined,
      status: status as string,
      search: search as string,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${Date.now()}.csv`);
    res.send(result);
  });
}

export const adminController = new AdminController();
