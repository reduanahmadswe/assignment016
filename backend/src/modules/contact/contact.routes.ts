import { Router } from 'express';
import { contactController } from './contact.controller.js';

import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

import { z } from 'zod';
import { validateRequest } from '@/middlewares/validateRequest.middleware.js';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Public route - anyone can submit contact form
router.post(
  '/',
  validateRequest(contactSchema),
  contactController.submitContactForm.bind(contactController)
);

// Admin routes - view and manage contact messages
router.get(
  '/messages',
  authenticate,
  requireRole('admin'),
  contactController.getAllMessages.bind(contactController)
);

router.patch(
  '/messages/:id/read',
  authenticate,
  requireRole('admin'),
  contactController.markAsRead.bind(contactController)
);

router.delete(
  '/messages/:id',
  authenticate,
  requireRole('admin'),
  contactController.deleteMessage.bind(contactController)
);

export default router;
