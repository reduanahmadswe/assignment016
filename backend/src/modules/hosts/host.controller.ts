import { Request, Response } from 'express';
import { hostService } from './host.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class HostController {
  getAllHosts = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const activeOnly = req.query.active === 'true';
    const result = await hostService.getAllHosts(page, limit, search, activeOnly);
    res.json({
      success: true,
      ...result,
    });
  });

  getHostById = asyncHandler(async (req: Request, res: Response) => {
    const host = await hostService.getHostById(parseInt(req.params.id));
    res.json({
      success: true,
      data: host,
    });
  });

  getHostEvents = asyncHandler(async (req: Request, res: Response) => {
    const events = await hostService.getHostEvents(parseInt(req.params.id));
    res.json({
      success: true,
      data: events,
    });
  });

  createHost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const host = await hostService.createHost(req.body);
    res.status(201).json({
      success: true,
      data: host,
    });
  });

  updateHost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const host = await hostService.updateHost(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: host,
    });
  });

  deleteHost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await hostService.deleteHost(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });
}

export const hostController = new HostController();
