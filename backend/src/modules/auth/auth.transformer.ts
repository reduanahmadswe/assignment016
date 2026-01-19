import prisma from '../../config/db.js';
import type { UserResponse } from './auth.types.js';

export class AuthTransformer {
  static transformUser(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: typeof user.role === 'string' ? user.role : user.role.code,
    };
  }

  static transformUserWithTokens(user: any, tokens: { accessToken: string; refreshToken: string }) {
    return {
      message: 'Login successful',
      user: this.transformUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
