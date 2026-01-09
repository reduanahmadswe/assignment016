import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';
import prisma from '../../config/db.js';
import { TwoFactorUtil } from '../../utils/twoFactor.util.js';
import bcrypt from 'bcryptjs';

export class TwoFactorController {
  /**
   * Setup 2FA - Generate secret and QR code
   */
  setup = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // Generate new secret
    const { secret, otpauthUrl } = TwoFactorUtil.generateSecret(req.user!.email);

    // Generate QR code
    const qrCode = await TwoFactorUtil.generateQRCode(otpauthUrl!);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
      },
      message: 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)',
    });
  });

  /**
   * Enable 2FA - Verify token and enable
   */
  enable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'Please setup 2FA first',
      });
    }

    // Verify the token
    const isValid = TwoFactorUtil.verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    });
  });

  /**
   * Disable 2FA
   */
  disable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Verify 2FA token if enabled
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const isTokenValid = TwoFactorUtil.verifyToken(user.twoFactorSecret, token);

      if (!isTokenValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token',
        });
      }
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    res.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    });
  });

  /**
   * Get 2FA status
   */
  status = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        emailOtpEnabled: true,
      },
    });

    res.json({
      success: true,
      data: user,
    });
  });

  /**
   * Toggle email OTP
   */
  toggleEmailOTP = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { enabled } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { emailOtpEnabled: enabled },
    });

    res.json({
      success: true,
      message: `Email OTP ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  });
}

export const twoFactorController = new TwoFactorController();
