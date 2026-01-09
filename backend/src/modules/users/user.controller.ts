import { Response } from 'express';
import { userService } from './user.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class UserController {
  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userService.getProfile(req.user!.id);
    res.json({
      success: true,
      data: profile,
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    res.json({
      success: true,
      data: profile,
    });
  });

  getRegisteredEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await userService.getRegisteredEvents(req.user!.id, page, limit);
    res.json({
      success: true,
      ...result,
    });
  });

  getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await userService.getPaymentHistory(req.user!.id, page, limit);
    res.json({
      success: true,
      ...result,
    });
  });

  getCertificates = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await userService.getCertificates(req.user!.id, page, limit);
    res.json({
      success: true,
      ...result,
    });
  });

  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await userService.getDashboardStats(req.user!.id);
    res.json({
      success: true,
      data: stats,
    });
  });

  // Admin endpoints
  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const role = req.query.role as string;
    const result = await userService.getAllUsers(page, limit, search, role);
    res.json({
      success: true,
      ...result,
    });
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(parseInt(req.params.id));
    res.json({
      success: true,
      data: user,
    });
  });

  updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { isActive } = req.body;
    const user = await userService.updateUserStatus(parseInt(req.params.id), isActive);
    res.json({
      success: true,
      data: user,
    });
  });

  updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { role } = req.body;
    const user = await userService.updateUserRole(parseInt(req.params.id), role);
    res.json({
      success: true,
      data: user,
    });
  });

  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await userService.deleteUser(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });
}

export const userController = new UserController();
