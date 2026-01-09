import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { PrismaClient } from '@prisma/client';
import { generateTokens, verifyRefreshToken, JwtPayload } from '../../utils/jwt.util.js';
import { sendOTPEmail } from '../../utils/email.util.js';
import { generateOTP } from '../../utils/helpers.util.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env.js';
import { OTPUtil } from '../../utils/otp.util.js';
import { TwoFactorUtil } from '../../utils/twoFactor.util.js';

// Type for Prisma transaction client
type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];
const googleClient = new OAuth2Client(env.google.clientId);

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
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

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
        expiresAt: { gt: new Date() },
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: env.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Invalid Google token', 400);
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
      throw new AppError(`Google authentication failed: ${error.message}`, 400);
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
        expiresAt: { gt: new Date() },
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
