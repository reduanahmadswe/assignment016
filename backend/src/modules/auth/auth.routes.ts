import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  resendOTPValidation,
  googleAuthValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from './auth.validation.js';
import twoFactorRoutes from './twoFactor.routes.js';

const router = Router();

// Public routes
router.post('/register', validate(registerValidation), authController.register);
router.post('/verify-email', validate(verifyEmailValidation), authController.verifyEmail);
router.post('/resend-otp', validate(resendOTPValidation), authController.resendOTP);
router.post('/login', validate(loginValidation), authController.login);
router.post('/verify-login-otp', authController.verifyLoginOTP);
router.post('/google', validate(googleAuthValidation), authController.googleAuth);
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken);
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword);

// 2FA routes
router.use('/2fa', twoFactorRoutes);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(changePasswordValidation), authController.changePassword);
router.get('/me', authenticate, authController.getMe);

export default router;
