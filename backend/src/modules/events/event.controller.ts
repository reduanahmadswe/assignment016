import { Response } from 'express';
import { eventService } from './event.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class EventController {
  // Public endpoints
  getAllEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filters = {
      event_type: req.query.event_type as string,
      event_mode: req.query.event_mode as string,
      event_status: req.query.event_status as string,
      is_free: req.query.is_free ? req.query.is_free === 'true' : undefined,
      is_featured: req.query.is_featured ? req.query.is_featured === 'true' : undefined,
      search: req.query.search as string,
      price_range: req.query.price_range as string,
      date_range: req.query.date_range as string,
      category: req.query.category as string,
    };
    const result = await eventService.getAllEvents(page, limit, filters);
    res.json({
      success: true,
      ...result,
    });
  });

  getUpcomingEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const events = await eventService.getUpcomingEvents(limit);
    res.json({
      success: true,
      events: events,
    });
  });

  getFeaturedEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 3;
    const events = await eventService.getFeaturedEvents(limit);
    res.json({
      success: true,
      events: events,
    });
  });

  getOngoingEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 6;
    const events = await eventService.getOngoingEvents(limit);
    res.json({
      success: true,
      data: events,
    });
  });

  getPastEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await eventService.getPastEvents(page, limit);
    res.json({
      success: true,
      ...result,
    });
  });

  getEventBySlug = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await eventService.getEventBySlug(req.params.slug);
    res.json({
      success: true,
      data: event,
    });
  });

  getEventById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await eventService.getEventById(parseInt(req.params.id));
    res.json({
      success: true,
      data: event,
    });
  });

  // User endpoints
  registerForEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await eventService.registerForEvent(
      parseInt(req.params.id),
      req.user!.id
    );
    res.status(201).json({
      success: true,
      ...result,
    });
  });

  cancelRegistration = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await eventService.cancelRegistration(
      parseInt(req.params.id),
      req.user!.id
    );
    res.json({
      success: true,
      ...result,
    });
  });

  checkRegistrationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await eventService.checkRegistrationStatus(
      parseInt(req.params.id),
      req.user!.id
    );
    res.json({
      success: true,
      data: result,
    });
  });

  getMyEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const events = await eventService.getUserEvents(req.user!.id);
    res.json({
      success: true,
      data: events,
    });
  });

  // Admin endpoints
  createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await eventService.createEvent(req.body, req.user!.id);
    res.status(201).json({
      success: true,
      data: event,
    });
  });

  updateEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (req.body.guests) {
      // Guests validation
    }

    const event = await eventService.updateEvent(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: event,
    });
  });

  deleteEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await eventService.deleteEvent(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });

  getEventRegistrations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await eventService.getEventRegistrations(
      parseInt(req.params.id),
      page,
      limit
    );
    res.json({
      success: true,
      ...result,
    });
  });
}

export const eventController = new EventController();
