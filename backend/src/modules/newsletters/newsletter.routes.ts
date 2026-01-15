import { Router } from 'express';
import { newsletterController } from './newsletter.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

// Public routes
router.get('/', newsletterController.getPublishedNewsletters);
router.get('/slug/:slug', newsletterController.getNewsletterBySlug); // Shareable link by slug
router.get('/:id', newsletterController.getNewsletterById);
router.post('/:id/view', newsletterController.incrementViews);
router.post('/:id/download', newsletterController.incrementDownloads);

// Admin routes
router.get('/admin/all', authenticate, requireAdmin, newsletterController.getAllNewsletters);
router.post('/admin', authenticate, requireAdmin, newsletterController.createNewsletter);
router.put('/admin/:id', authenticate, requireAdmin, newsletterController.updateNewsletter);
router.delete('/admin/:id', authenticate, requireAdmin, newsletterController.deleteNewsletter);
router.put('/admin/:id/toggle-publish', authenticate, requireAdmin, newsletterController.togglePublishStatus);

export default router;
