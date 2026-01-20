import { Router } from 'express';

// Import all route modules
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import hostRoutes from './modules/hosts/host.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import certificateRoutes from './modules/certificates/certificate.routes.js';
import blogRoutes from './modules/blogs/blog.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import opportunityRoutes from './modules/opportunities/opportunity.routes.js';
import testRoutes from './routes/test.routes.js';

import contactRoutes from './modules/contact/contact.routes.js';
import newsletterRoutes from './modules/newsletters/newsletter.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';

import prisma from './config/db.js';

const router = Router();

// API Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ORIYET API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/hosts', hostRoutes);
router.use('/payments', paymentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/blogs', blogRoutes);
router.use('/admin', adminRoutes);
router.use('/opportunities', opportunityRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletters', newsletterRoutes);
router.use('/reviews', reviewRoutes);
router.use('/test', testRoutes); // Test endpoint for debugging


// Public pages endpoint
router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findFirst({
      where: { slug: req.params.slug, isPublished: true },
      select: {
        title: true,
        slug: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
      },
    });

    if (!page) {
      res.status(404).json({ success: false, message: 'Page not found' });
      return;
    }

    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
