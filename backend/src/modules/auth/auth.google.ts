import { OAuth2Client } from 'google-auth-library';
import prisma from '../../config/db.js';
import { env } from '../../config/env.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { lookupService } from '../../services/lookup.service.js';

let googleClient = new OAuth2Client(env.google.clientId);

export class GoogleAuthService {
  static async authenticateWithIdToken(idToken: string) {
    try {
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

      return this.findOrCreateUser(email!, name!, picture, googleId);
    } catch (error: any) {
      console.error('Google Auth Error Detail:', error);
      if (error instanceof AppError) throw error;

      if (error.message?.includes('Wrong recipient') || error.message?.includes('audience')) {
        throw new AppError('Google sign-in configuration error. Please contact support.', 400);
      }
      if (error.message?.includes('Token used too late') || error.message?.includes('expired')) {
        throw new AppError('Google sign-in session expired. Please try again.', 400);
      }

      throw new AppError('Unable to sign in with Google. Please try again or use email/password.', 400);
    }
  }

  static async authenticateWithCallback(code: string, redirectUri: string) {
    try {
      googleClient = new OAuth2Client(
        env.google.clientId,
        env.google.clientSecret,
        redirectUri
      );

      const { tokens } = await googleClient.getToken(code);

      if (!tokens.id_token) {
        throw new AppError('Failed to get ID token from Google', 400);
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new AppError('Google sign-in failed. Please try again.', 400);
      }

      const { email, name, picture, sub: googleId } = payload;

      return this.findOrCreateUser(email!, name!, picture, googleId);
    } catch (error: any) {
      console.error('Google Callback Error:', error);
      if (error instanceof AppError) throw error;

      throw new AppError('Unable to complete Google sign-in. Please try again.', 400);
    }
  }

  private static async findOrCreateUser(email: string, name: string, picture: string | undefined, googleId: string) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { googleId },
        ],
      },
      include: { role: true },
    });

    if (!user) {
      const userRoleId = await lookupService.getUserRoleId('user');
      const googleAuthId = await lookupService.getAuthProviderId('google');
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar: picture,
          googleId,
          roleId: userRoleId,
          authProviderId: googleAuthId,
          isVerified: true,
          isActive: true,
        },
        include: { role: true },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: picture,
        },
        include: { role: true },
      });
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403);
    }

    return user;
  }
}
