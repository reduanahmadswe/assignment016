import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { PrismaClient } from '@prisma/client';
import { generateTokens, verifyRefreshToken, JwtPayload } from '../../utils/jwt.util.js';
import { sendOTPEmail, sendEmail } from '../../utils/email.util.js';
import { generateOTP } from '../../utils/helpers.util.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { OTPUtil } from '../../utils/otp.util.js';
import { TwoFactorUtil } from '../../utils/twoFactor.util.js';
import { getExpirationTimeUTC } from '../../utils/timezone.util.js';

// Type for Prisma transaction client
type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];
let googleClient = new OAuth2Client(env.google.clientId);

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface VerifyLoginOTPInput {
  email: string;
  otp?: string;
  token?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
}

export class AuthService {
  async register(data: RegisterInput) {
    const { email, password, name, phone } = data;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError('This email is already registered. Please login or use a different email.', 400);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          authProvider: 'local',
        },
      });

      // Generate and send OTP
      const otp = generateOTP();
      const expiresAt = getExpirationTimeUTC(2); // 2 minutes

      await prisma.otpCode.create({
        data: {
          email,
          code: otp,
          type: 'verification',
          expiresAt,
        },
      });

      await sendOTPEmail(email, otp, 'verification');

      return {
        message: 'Registration successful! Please check your email for verification code.',
        userId: user.id,
      };
    } catch (error: any) {
      // If it's already an AppError, re-throw it
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle database connection errors
      if (error.message?.includes('does not exist') || error.message?.includes('database')) {
        throw new AppError('Unable to connect to the registration service. Please try again later.', 503);
      }
      
      // Handle any other unexpected errors
      console.error('Registration error:', error);
      throw new AppError('An error occurred during registration. Please try again.', 500);
    }
  }

  async verifyEmail(email: string, otp: string) {
    // Find valid OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        type: 'verification',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Use Prisma transaction
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // Mark OTP as used
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Verify user
      const user = await tx.user.update({
        where: { email },
        data: { isVerified: true },
        select: { id: true, email: true, name: true, role: true },
      });

      return user;
    });

    const tokens = generateTokens({
      userId: result.id,
      email: result.email,
      role: result.role,
    });

    // Store refresh token
    await this.storeRefreshToken(result.id, tokens.refreshToken);

    return {
      message: 'Email verified successfully',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
      ...tokens,
    };
  }

  async resendOTP(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(10);

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        type: 'verification',
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp, 'verification');

    return { message: 'OTP sent successfully' };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          authProvider: true,
          emailOtpEnabled: true,
          twoFactorEnabled: true,
        },
      });

      console.log('👤 User lookup result:', user ? `Found: ${user.email}` : 'NOT FOUND');

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      if (user.authProvider !== 'local') {
        throw new AppError('Please use Google login for this account', 400);
      }

      if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Please contact support.', 403);
      }

      if (!user.isVerified) {
        // Send new OTP
        const otp = generateOTP();
        const expiresAt = getExpirationTimeUTC(10);

        await prisma.otpCode.create({
          data: {
            email,
            code: otp,
            type: 'verification',
            expiresAt,
          },
        });

        await sendOTPEmail(email, otp, 'verification');

        throw new AppError('Please verify your email. A new OTP has been sent to your email.', 403);
      }

      console.log('🔑 Comparing passwords...');
      const isPasswordValid = await bcrypt.compare(password, user.password!);
      console.log('   Comparison result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('❌ Password mismatch!');
        throw new AppError('Invalid email or password', 401);
      }

      // Check if 2FA/OTP is required (skip for admin)
      const requires2FA = user.role !== 'admin' && (user.emailOtpEnabled || user.twoFactorEnabled);

      if (requires2FA) {
        // Send email OTP if enabled
        if (user.emailOtpEnabled) {
          await OTPUtil.sendLoginOTP(email);
        }

        return {
          message: 'Please verify your identity',
          requiresOTP: true,
          otpMethods: {
            email: user.emailOtpEnabled,
            authenticator: user.twoFactorEnabled,
          },
          tempUserId: user.id, // Temporary identifier for OTP verification
        };
      }

      // Admin or no 2FA - direct login
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error: any) {
      // If it's already an AppError, re-throw it
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle database connection errors
      if (error.message?.includes('does not exist') || error.message?.includes('database')) {
        throw new AppError('Unable to connect to the authentication service. Please try again later.', 503);
      }
      
      // Handle any other unexpected errors
      console.error('Login error:', error);
      throw new AppError('An error occurred during login. Please try again.', 500);
    }
  }

  async verifyLoginOTP(data: VerifyLoginOTPInput) {
    const { email, otp, token } = data;

    // Must provide either email OTP or authenticator token
    if (!otp && !token) {
      throw new AppError('Please provide OTP code', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        emailOtpEnabled: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    let isValid = false;

    // Try authenticator app token first if provided
    if (token && user.twoFactorEnabled && user.twoFactorSecret) {
      isValid = TwoFactorUtil.verifyToken(user.twoFactorSecret, token);
    }
    
    // Try email OTP if authenticator failed or not provided
    if (!isValid && otp && user.emailOtpEnabled) {
      isValid = await OTPUtil.verifyOTP(email, otp, 'login');
    }

    if (!isValid) {
      throw new AppError('Invalid verification code', 401);
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
      ...tokens,
    };
  }

  async googleAuth(idToken: string) {
    try {
      // Reinitialize client with current env values to ensure fresh credentials
      googleClient = new OAuth2Client(env.google.clientId);
      
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Google sign-in failed. Please try again.', 400);
      }

      const { email, name, picture, sub: googleId } = payload;

      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email! },
            { googleId },
          ],
        },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: email!,
            name: name!,
            avatar: picture,
            googleId,
            authProvider: 'google',
            isVerified: true,
            isActive: true,
          },
        });
      } else {
        // Update Google ID if not set
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              avatar: picture,
            },
          });
        }
      }

      if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 403);
      }

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        },
        ...tokens,
      };
    } catch (error: any) {
      console.error('Google Auth Error Detail:', error);
      if (error instanceof AppError) throw error;
      
      // User-friendly error messages
      if (error.message?.includes('Wrong recipient') || error.message?.includes('audience')) {
        throw new AppError('Google sign-in configuration error. Please contact support.', 400);
      }
      if (error.message?.includes('Token used too late') || error.message?.includes('expired')) {
        throw new AppError('Google sign-in session expired. Please try again.', 400);
      }
      
      throw new AppError('Unable to sign in with Google. Please try again or use email/password.', 400);
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Check if token exists in database
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.userId,
          token: refreshToken,
          expiresAt: { gt: new Date() },
        },
      });

      if (!tokenRecord) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user
      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Generate new tokens
      const newTokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update refresh token
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          token: newTokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return newTokens;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: number, refreshToken?: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        authProvider: 'local',
      },
      select: { id: true },
    });

    if (!user) {
      console.error(`Forgot Password: User with email ${email} not found.`);
      throw new AppError('User with this email does not exist.', 404);
    }

    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(10);

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        type: 'password_reset',
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp, 'password_reset');

    return { message: 'If the email exists, an OTP has been sent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code: otp,
        type: 'password_reset',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      await tx.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (user) {
        await tx.refreshToken.deleteMany({
          where: { userId: user.id },
        });
      }
    });

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Send OTP to user's email for password change verification
   */
  async sendPasswordChangeOTP(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, authProvider: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has local auth (password-based)
    if (user.authProvider !== 'local') {
      throw new AppError('Password change is not available for social login accounts', 400);
    }

    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(10); // 10 minutes

    await prisma.otpCode.create({
      data: {
        email: user.email,
        code: otp,
        type: 'password_change',
        expiresAt,
      },
    });

    // Send OTP email
    await sendEmail({
      to: user.email,
      subject: 'ORIYET - Password Change Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ORIYET</h1>
            </div>
            <div class="content">
              <h2>Password Change Request</h2>
              <p>Hello ${user.name},</p>
              <p>We received a request to change your password. Use the following OTP code to verify your identity:</p>
              <div class="otp-box">
                <span class="otp-code">${otp}</span>
              </div>
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request this password change, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { message: 'OTP sent to your email address' };
  }

  /**
   * Verify OTP and change password
   */
  async verifyAndChangePassword(userId: number, otp: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, password: true, authProvider: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if user has local auth
    if (user.authProvider !== 'local') {
      throw new AppError('Password change is not available for social login accounts', 400);
    }

    // Verify OTP
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: user.email,
        code: otp,
        type: 'password_change',
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password!);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx: TransactionClient) => {
      // Mark OTP as used
      await tx.otpCode.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      // Update password
      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'ORIYET - Password Changed Successfully',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { text-align: center; margin: 20px 0; }
            .success-icon span { font-size: 60px; }
            .info-box { background: #e8f4fd; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ORIYET</h1>
            </div>
            <div class="content">
              <div class="success-icon">
                <span>✅</span>
              </div>
              <h2 style="text-align: center;">Password Changed Successfully!</h2>
              <p>Hello ${user.name},</p>
              <p>Your password has been successfully changed.</p>
              <div class="info-box">
                <p><strong>📅 Changed at:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              <div class="warning">
                <strong>⚠️ Important:</strong> If you did not make this change, please contact our support team immediately and secure your account.
              </div>
              <p>Thank you for keeping your account secure!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ORIYET. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { message: 'Password changed successfully' };
  }

  private async storeRefreshToken(userId: number, token: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }
}

export const authService = new AuthService();
