import bcrypt from 'bcryptjs';
import prisma from '../../config/db.js';
import { PrismaClient } from '@prisma/client';
import { generateOTP } from '../../utils/helpers.util.js';
import { sendOTPEmail, sendEmail } from '../../utils/email.util.js';
import { getExpirationTimeUTC } from '../../utils/timezone.util.js';
import { lookupService } from '../../services/lookup.service.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { passwordChangeOTPEmail, passwordResetSuccessEmail } from './auth.email.js';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export class RegistrationService {
  static async createPendingRegistration(email: string, password: string, name: string, phone?: string) {
    const normalizedEmail = email.trim();
    const hashedPassword = await bcrypt.hash(password, 12);
    const cleanedPhone = phone ? phone.replace(/[\s\-()]/g, '') : undefined;

    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(2); // 2 minutes
    const regExpiresAt = getExpirationTimeUTC(30); // 30 minutes for registration

    await prisma.$transaction(async (tx) => {
      const pendingReg = await tx.pendingRegistration.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name,
          phone: cleanedPhone,
          expiresAt: regExpiresAt,
        },
      });

      const verificationTypeId = await lookupService.getOtpTypeId('verification');
      await tx.otpCode.create({
        data: {
          email: normalizedEmail,
          code: otp,
          typeId: verificationTypeId,
          expiresAt,
        },
      });
    });

    await sendOTPEmail(email, otp, 'verification');
  }

  static async completeRegistration(email: string, otpId: number) {
    const normalizedEmail = email.trim();
    const pendingReg = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
    });

    if (!pendingReg) {
      throw new AppError('Registration data not found. Please register again.', 404);
    }

    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.update({
        where: { id: otpId },
        data: { isUsed: true },
      });

      const userRoleId = await lookupService.getUserRoleId('user');
      const localAuthId = await lookupService.getAuthProviderId('local');

      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: pendingReg.password,
          name: pendingReg.name,
          phone: pendingReg.phone,
          roleId: userRoleId,
          authProviderId: localAuthId,
          isVerified: true,
        },
        select: { id: true, email: true, name: true, role: { select: { code: true } } },
      });

      await tx.pendingRegistration.delete({
        where: { email: normalizedEmail },
      });

      return user;
    });

    return result;
  }
}

export class OTPService {
  static async sendVerificationOTP(email: string, isPendingReg: boolean) {
    const normalizedEmail = email.trim();
    const otp = generateOTP();
    const expiresAt = isPendingReg ? getExpirationTimeUTC(2) : getExpirationTimeUTC(10);
    const verificationTypeId = await lookupService.getOtpTypeId('verification');

    await prisma.otpCode.create({
      data: {
        email: normalizedEmail,
        code: otp,
        typeId: verificationTypeId,
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp, 'verification');
  }

  static async sendPasswordResetOTP(email: string) {
    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(10);
    const passwordResetTypeId = await lookupService.getOtpTypeId('password_reset');

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        typeId: passwordResetTypeId,
        expiresAt,
      },
    });

    await sendOTPEmail(email, otp, 'password_reset');
  }

  static async sendPasswordChangeOTP(email: string, name: string) {
    const otp = generateOTP();
    const expiresAt = getExpirationTimeUTC(10);
    const passwordChangeTypeId = await lookupService.getOtpTypeId('password_change');

    await prisma.otpCode.create({
      data: {
        email,
        code: otp,
        typeId: passwordChangeTypeId,
        expiresAt,
      },
    });

    await sendEmail({
      to: email,
      subject: 'ORIYET - Password Change Verification',
      html: passwordChangeOTPEmail(name, otp),
    });
  }
}

export class PasswordService {
  static async resetPassword(email: string, otpId: number, newPassword: string) {
    const normalizedEmail = email.trim();
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.update({
        where: { id: otpId },
        data: { isUsed: true },
      });

      await tx.user.update({
        where: { email: normalizedEmail },
        data: { password: hashedPassword },
      });

      const user = await tx.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (user) {
        await tx.refreshToken.deleteMany({
          where: { userId: user.id },
        });
      }
    });
  }

  static async changePassword(userId: number, otpId: number, newPassword: string, userName: string, userEmail: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.otpCode.update({
        where: { id: otpId },
        data: { isUsed: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    });

    await sendEmail({
      to: userEmail,
      subject: 'ORIYET - Password Changed Successfully',
      html: passwordResetSuccessEmail(userName),
    });
  }

  static async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }
}
