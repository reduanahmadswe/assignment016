import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { UserValidator } from './user.validator.js';
import { UserQueryService } from './user.query.js';
import { UserStatsService } from './user.stats.js';
import type { UpdateUserInput, UserFilters } from './user.types.js';

export class UserService {
  async getProfile(userId: number) {
    const user = await UserQueryService.getProfile(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateUserInput) {
    const updateData = UserValidator.validateUpdateData(data);

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getProfile(userId);
  }

  async getRegisteredEvents(userId: number, page: number = 1, limit: number = 10) {
    return UserQueryService.getRegisteredEvents(userId, page, limit);
  }

  async getPaymentHistory(userId: number, page: number = 1, limit: number = 10) {
    return UserQueryService.getPaymentHistory(userId, page, limit);
  }

  async getCertificates(userId: number, page: number = 1, limit: number = 10) {
    return UserQueryService.getCertificates(userId, page, limit);
  }

  async getDashboardStats(userId: number) {
    return UserStatsService.getDashboardStats(userId);
  }

  // Admin functions
  async getAllUsers(page: number = 1, limit: number = 10, search?: string, role?: string) {
    return UserQueryService.getAllUsers({ page, limit, search, role });
  }

  async getUserById(userId: number) {
    const user = await UserQueryService.getUserById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateUserStatus(userId: number, isActive: boolean) {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return this.getUserById(userId);
  }

  async updateUserRole(userId: number, role: 'user' | 'admin') {
    const roleId = await UserValidator.validateRoleUpdate(role);

    await prisma.user.update({
      where: { id: userId },
      data: { roleId },
    });

    return this.getUserById(userId);
  }

  async deleteUser(userId: number) {
    await UserValidator.validateUserExists(userId);

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
