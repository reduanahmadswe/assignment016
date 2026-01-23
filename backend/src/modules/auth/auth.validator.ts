import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { lookupService } from '../../services/lookup.service.js';

export class AuthValidator {
  static async validateEmailNotExists(email: string) {
    const normalizedEmail = email.trim();
    const [existingUser, pendingReg] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      prisma.pendingRegistration.findUnique({ where: { email: normalizedEmail } })
    ]);

    if (existingUser) {
      throw new AppError('This email is already registered. Please login or use a different email.', 400, [
        { field: 'email', message: 'This email is already registered. Please login or use a different email.' }
      ]);
    }

    return pendingReg;
  }

  static async validateUserCredentials(email: string, password: string) {
    const normalizedEmail = email.trim();

    );
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        phone: true,
        avatar: true,
        role: { select: { code: true } },
        isVerified: true,
        isActive: true,
        authProvider: { select: { code: true } },
        emailOtpEnabled: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.authProvider.code !== 'local') {
      throw new AppError('Please use Google login for this account', 400);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    
    if (!isPasswordValid) {
      :', user.password!.substring(0, 30) + '...');
      throw new AppError('Invalid email or password', 401);
    }

    return user;
  }

  static async validatePasswordMatch(userId: number, currentPassword: string) {
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

    return user;
  }

  static async validateLocalAuthUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, password: true, authProvider: { select: { code: true } } },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.authProvider.code !== 'local') {
      throw new AppError('Password change is not available for social login accounts', 400);
    }

    return user;
  }

  static cleanPhoneNumber(phone?: string): string | undefined {
    return phone ? phone.replace(/[\s\-()]/g, '') : undefined;
  }

  static async validateOTP(email: string, otp: string, otpType: string) {
    const typeId = await lookupService.getOtpTypeId(otpType);
    const normalizedEmail = email.trim();
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email: normalizedEmail,
        code: otp,
        typeId,
        isUsed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    return otpRecord;
  }
}
