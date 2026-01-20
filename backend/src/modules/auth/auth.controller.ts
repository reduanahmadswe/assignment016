import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    // Normalize email
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;
    const result = await authService.verifyEmail(email, otp);
    res.json({
      success: true,
      ...result,
    });
  });

  resendOTP = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email?.toLowerCase().trim();
    const result = await authService.resendOTP(email);
    res.json({
      success: true,
      ...result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    // Normalize email
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    console.log('🔐 Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const result = await authService.login(req.body);
    res.json({
      success: true,
      ...result,
    });
  });

  verifyLoginOTP = asyncHandler(async (req: Request, res: Response) => {
    // Normalize email
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase().trim();
    }
    const result = await authService.verifyLoginOTP(req.body);
    res.json({
      success: true,
      ...result,
    });
  });

  googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const result = await authService.googleAuth(idToken);
    res.json({
      success: true,
      ...result,
    });
  });

  googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, redirectUri } = req.body;
    const result = await authService.googleAuthCallback(code, redirectUri);
    res.json({
      success: true,
      ...result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json({
      success: true,
      ...result,
    });
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(req.user!.id, refreshToken);
    res.json({
      success: true,
      ...result,
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email?.toLowerCase().trim();
    const result = await authService.forgotPassword(email);
    res.json({
      success: true,
      ...result,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const email = req.body.email?.toLowerCase().trim();
    const { otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json({
      success: true,
      ...result,
    });
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, currentPassword, newPassword);
    res.json({
      success: true,
      ...result,
    });
  });

  sendPasswordChangeOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.sendPasswordChangeOTP(req.user!.id);
    res.json({
      success: true,
      ...result,
    });
  });

  verifyAndChangePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { otp, currentPassword, newPassword } = req.body;
    const result = await authService.verifyAndChangePassword(req.user!.id, otp, currentPassword, newPassword);
    res.json({
      success: true,
      ...result,
    });
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({
      success: true,
      user: req.user,
    });
  });
}

export const authController = new AuthController();
