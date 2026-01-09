import { Router } from 'express';
import { twoFactorController } from './twoFactor.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// All 2FA routes require authentication
router.post('/setup', authenticate, twoFactorController.setup);
router.post('/enable', authenticate, twoFactorController.enable);
router.post('/disable', authenticate, twoFactorController.disable);
router.get('/status', authenticate, twoFactorController.status);
router.post('/toggle-email-otp', authenticate, twoFactorController.toggleEmailOTP);

export default router;
