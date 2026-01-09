import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class TwoFactorUtil {
  /**
   * Generate a new 2FA secret for a user
   */
  static generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `ORIYET (${email})`,
      issuer: 'ORIYET',
      length: 32,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }

  /**
   * Generate QR code data URL from otpauth URL
   */
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (±60 seconds tolerance)
    });
  }

  /**
   * Generate a 6-digit OTP code for email verification
   */
  static generateEmailOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
