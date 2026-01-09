import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';

const router = Router();

// User routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/registered-events', authenticate, userController.getRegisteredEvents);
router.get('/payment-history', authenticate, userController.getPaymentHistory);
router.get('/certificates', authenticate, userController.getCertificates);
router.get('/dashboard-stats', authenticate, userController.getDashboardStats);

// Aliases to match frontend expectations
router.get('/my-events', authenticate, userController.getRegisteredEvents);
router.get('/my-certificates', authenticate, userController.getCertificates);

// Admin routes
router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.get('/:id(\\d+)', authenticate, requireAdmin, userController.getUserById);
router.patch('/:id(\\d+)/status', authenticate, requireAdmin, userController.updateUserStatus);
router.patch('/:id(\\d+)/role', authenticate, requireAdmin, userController.updateUserRole);
router.delete('/:id(\\d+)', authenticate, requireAdmin, userController.deleteUser);

export default router;
