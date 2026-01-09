import { Router } from 'express';
import { hostController } from './host.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

// Public routes
router.get('/', hostController.getAllHosts);
router.get('/:id', hostController.getHostById);
router.get('/:id/events', hostController.getHostEvents);

// Admin routes
router.post('/', authenticate, requireAdmin, hostController.createHost);
router.put('/:id', authenticate, requireAdmin, hostController.updateHost);
router.delete('/:id', authenticate, requireAdmin, hostController.deleteHost);

export default router;
