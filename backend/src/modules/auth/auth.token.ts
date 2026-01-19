import prisma from '../../config/db.js';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt.util.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class TokenService {
  static async storeRefreshToken(userId: number, token: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);

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

      const user = await prisma.user.findFirst({
        where: {
          id: decoded.userId,
          isActive: true,
        },
        select: { id: true, email: true, role: { select: { code: true } } },
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      const newTokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role.code,
      });

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

  static async revokeTokens(userId: number, refreshToken?: string) {
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
  }
}
