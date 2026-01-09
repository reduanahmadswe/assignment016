import { Router } from 'express';
import { eventController } from './event.controller.js';
import { authenticate, optionalAuth } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { createEventValidation, updateEventValidation } from './event.validation.js';

const router = Router();

// Public routes
router.get('/', optionalAuth, eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/ongoing', eventController.getOngoingEvents);
router.get('/past', eventController.getPastEvents);
router.get('/slug/:slug', optionalAuth, eventController.getEventBySlug);

// User routes (authenticated)
router.get('/my-events', authenticate, eventController.getMyEvents);
router.post('/:id/register', authenticate, eventController.registerForEvent);
router.delete('/:id/register', authenticate, eventController.cancelRegistration);
router.get('/:id/registration-status', authenticate, eventController.checkRegistrationStatus);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(createEventValidation), eventController.createEvent);
router.put('/:id', authenticate, requireAdmin, validate(updateEventValidation), eventController.updateEvent);
router.delete('/:id', authenticate, requireAdmin, eventController.deleteEvent);
router.get('/:id/registrations', authenticate, requireAdmin, eventController.getEventRegistrations);
router.get('/:id', authenticate, requireAdmin, eventController.getEventById);

export default router;
