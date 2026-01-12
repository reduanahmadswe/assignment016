import prisma from '../config/db.js';
import { sendEmail } from './email.util.js';
import { TwoFactorUtil } from './twoFactor.util.js';
import { getExpirationTimeUTC } from './timezone.util.js';

export class OTPUtil {
  /**
   * Generate and send OTP to user's email for login
   */
  static async sendLoginOTP(email: string): Promise<void> {
    // Generate 6-digit OTP
    const code = TwoFactorUtil.generateEmailOTP();
    
    // Set expiration to 10 minutes from now (UTC)
    const expiresAt = getExpirationTimeUTC(10);

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        email,
        code,
        type: 'login',
        expiresAt,
        isUsed: false,
      },
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: 'ORIYET - Login OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #4F46E5, #9333EA); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">ORIYET</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Login Verification Code</h2>
            <p style="color: #4b5563; font-size: 16px;">
              Your one-time password (OTP) for logging into ORIYET is:
            </p>
            <div style="background-color: white; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4F46E5; font-size: 36px; margin: 0; letter-spacing: 8px;">${code}</h1>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="background-color: #1f2937; padding: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} ORIYET. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(email: string, code: string, type: string = 'login'): Promise<boolean> {
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: {
          gte: new Date(), // Allow equal time (already stored in DB with timezone)
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return true;
  }

  /**
   * Clean up expired OTPs (should be run periodically)
   */
  static async cleanupExpiredOTPs(): Promise<void> {
    await prisma.otpCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isUsed: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // Delete used OTPs older than 24 hours
        ],
      },
    });
  }
}
