import prisma from '../../config/db.js';
import { generateTokens } from '../../utils/jwt.util.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { OTPUtil } from '../../utils/otp.util.js';
import { TwoFactorUtil } from '../../utils/twoFactor.util.js';
import { AuthValidator } from './auth.validator.js';
import { AuthTransformer } from './auth.transformer.js';
import { RegistrationService, OTPService, PasswordService } from './auth.helpers.js';
import { GoogleAuthService } from './auth.google.js';
import { TokenService } from './auth.token.js';
import type { RegisterInput, LoginInput, VerifyLoginOTPInput } from './auth.types.js';

export class AuthService {
  async register(data: RegisterInput) {
    const { email, password, name, phone } = data;
    console.log('📧 [SERVICE] Register - Received email:', email);
    const normalizedEmail = email.trim();
    console.log('📧 [SERVICE] Register - Normalized email:', normalizedEmail);
    console.log('📧 [SERVICE] Register - Email has dot?', normalizedEmail.includes('.'));

    try {
      // Validate email not exists
      const pendingReg = await AuthValidator.validateEmailNotExists(normalizedEmail);

      // Delete old pending registration if exists
      if (pendingReg) {
        await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
      }

      // Create pending registration and send OTP
      await RegistrationService.createPendingRegistration(normalizedEmail, password, name, phone);

      return {
        message: 'Registration initiated! Please check your email for verification code.',
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (target && target.includes('email')) {
          throw new AppError('This email is already registered. Please use a different email or login.', 400, [
            { field: 'email', message: 'This email is already registered. Please use a different email or login.' }
          ]);
        }
        if (target && target.includes('phone')) {
          throw new AppError('This phone number is already registered. Please use a different number.', 400, [
            { field: 'phone', message: 'This phone number is already registered. Please use a different number.' }
          ]);
        }
        throw new AppError('This information is already registered. Please use different details.', 400);
      }

      if (error.message?.includes('does not exist') || error.message?.includes('database')) {
        throw new AppError('Unable to connect to the registration service. Please try again later.', 503);
      }

      if (error.message?.includes('email') || error.message?.includes('SMTP')) {
        throw new AppError('Unable to send verification email. Please check your email address and try again.', 500, [
          { field: 'email', message: 'Unable to send verification email. Please check your email address and try again.' }
        ]);
      }

      console.error('Registration error:', error);
      throw new AppError('An error occurred during registration. Please try again.', 500);
    }
  }

  async verifyEmail(email: string, otp: string) {
    // Validate OTP
    const otpRecord = await AuthValidator.validateOTP(email, otp, 'verification');

    // Complete registration
    const result = await RegistrationService.completeRegistration(email, otpRecord.id);

    const tokens = generateTokens({
      userId: result.id,
      email: result.email,
      role: result.role.code,
    });

    await TokenService.storeRefreshToken(result.id, tokens.refreshToken);

    return {
      message: 'Email verified successfully! Your account has been created.',
      user: AuthTransformer.transformUser(result),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async resendOTP(email: string) {
    const normalizedEmail = email.trim();
    const pendingReg = await prisma.pendingRegistration.findUnique({
      where: { email: normalizedEmail },
      select: { email: true },
    });

    if (pendingReg) {
      await OTPService.sendVerificationOTP(normalizedEmail, true);
      return { message: 'OTP sent successfully' };
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      throw new AppError('No registration found for this email. Please register first.', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    await OTPService.sendVerificationOTP(normalizedEmail, false);
    return { message: 'OTP sent successfully' };
  }

  async login(data: LoginInput) {
    const { email, password } = data;

    try {
      const user = await AuthValidator.validateUserCredentials(email, password);

      if (!user.isVerified) {
        await OTPService.sendVerificationOTP(email, false);
        throw new AppError('Please verify your email. A new OTP has been sent to your email.', 403);
      }

      // Check if 2FA/OTP is required (skip for admin)
      const requires2FA = user.role.code !== 'admin' && (user.emailOtpEnabled || user.twoFactorEnabled);

      if (requires2FA) {
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
          tempUserId: user.id,
        };
      }

      // Admin or no 2FA - direct login
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role.code,
      });

      await TokenService.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        message: 'Login successful',
        user: AuthTransformer.transformUser(user),
        ...tokens,
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error.message?.includes('does not exist') || error.message?.includes('database')) {
        throw new AppError('Unable to connect to the authentication service. Please try again later.', 503);
      }

      console.error('Login error:', error);
      throw new AppError('An error occurred during login. Please try again.', 500);
    }
  }

  async verifyLoginOTP(data: VerifyLoginOTPInput) {
    const { email, otp, token } = data;
    const normalizedEmail = email.trim();

    if (!otp && !token) {
      throw new AppError('Please provide OTP code', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: { select: { code: true } },
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

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.code,
    });

    await TokenService.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Login successful',
      user: AuthTransformer.transformUser(user),
      ...tokens,
    };
  }

  async googleAuth(idToken: string) {
    const user = await GoogleAuthService.authenticateWithIdToken(idToken);

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.code,
    });

    await TokenService.storeRefreshToken(user.id, tokens.refreshToken);

    return AuthTransformer.transformUserWithTokens(user, tokens);
  }

  async googleAuthCallback(code: string, redirectUri: string) {
    const user = await GoogleAuthService.authenticateWithCallback(code, redirectUri);

    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role.code,
    });

    await TokenService.storeRefreshToken(user.id, tokens.refreshToken);

    return AuthTransformer.transformUserWithTokens(user, tokens);
  }

  async refreshToken(refreshToken: string) {
    return TokenService.refreshAccessToken(refreshToken);
  }

  async logout(userId: number, refreshToken?: string) {
    await TokenService.revokeTokens(userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        authProvider: { code: 'local' },
      },
      select: { id: true },
    });

    if (!user) {
      console.error(`Forgot Password: User with email ${email} not found.`);
      throw new AppError('User with this email does not exist.', 404);
    }

    await OTPService.sendPasswordResetOTP(email);

    return { message: 'If the email exists, an OTP has been sent' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const otpRecord = await AuthValidator.validateOTP(email, otp, 'password_reset');
    await PasswordService.resetPassword(email, otpRecord.id, newPassword);

    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    await AuthValidator.validatePasswordMatch(userId, currentPassword);

    const hashedPassword = await PasswordService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async sendPasswordChangeOTP(userId: number) {
    const user = await AuthValidator.validateLocalAuthUser(userId);
    await OTPService.sendPasswordChangeOTP(user.email, user.name);

    return { message: 'OTP sent to your email address' };
  }

  async verifyAndChangePassword(userId: number, otp: string, currentPassword: string, newPassword: string) {
    const user = await AuthValidator.validateLocalAuthUser(userId);
    const otpRecord = await AuthValidator.validateOTP(user.email, otp, 'password_change');
    await AuthValidator.validatePasswordMatch(userId, currentPassword);
    await PasswordService.changePassword(userId, otpRecord.id, newPassword, user.name, user.email);

    return { message: 'Password changed successfully' };
  }
}

export const authService = new AuthService();
