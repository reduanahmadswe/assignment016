import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { lookupService } from '../../services/lookup.service.js';

export class UserValidator {
  static async validateUserExists(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static validateUpdateData(data: { name?: string; phone?: string; avatar?: string }) {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatar) updateData.avatar = data.avatar;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No data to update', 400);
    }

    return updateData;
  }

  static async validateRoleUpdate(role: 'user' | 'admin') {
    return lookupService.getUserRoleId(role);
  }
}
