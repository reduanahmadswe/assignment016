import { Request, Response } from 'express';
import { newsletterService } from './newsletter.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class NewsletterController {
  // Public: Get all published newsletters
  getPublishedNewsletters = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const search = req.query.search as string;

    const result = await newsletterService.getPublishedNewsletters(page, limit, search);
    res.json({
      success: true,
      ...result,
    });
  });

  // Public: Get single newsletter
  getNewsletterById = asyncHandler(async (req: Request, res: Response) => {
    const newsletter = await newsletterService.getNewsletterById(parseInt(req.params.id));
    res.json({
      success: true,
      data: newsletter,
    });
  });

  // Public: Get newsletter by slug (for shareable links)
  getNewsletterBySlug = asyncHandler(async (req: Request, res: Response) => {
    const newsletter = await newsletterService.getNewsletterBySlug(req.params.slug);
    res.json({
      success: true,
      data: newsletter,
    });
  });

  // Public: Increment view count
  incrementViews = asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.incrementViews(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });

  // Public: Increment download count
  incrementDownloads = asyncHandler(async (req: Request, res: Response) => {
    const result = await newsletterService.incrementDownloads(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });

  // Admin: Get all newsletters (including unpublished)
  getAllNewsletters = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isPublished = req.query.is_published === 'true' ? true :
      req.query.is_published === 'false' ? false : undefined;

    const result = await newsletterService.getAllNewsletters(page, limit, search, isPublished);
    res.json({
      success: true,
      ...result,
    });
  });

  // Admin: Create newsletter
  createNewsletter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const newsletter = await newsletterService.createNewsletter(req.body);
    res.status(201).json({
      success: true,
      data: newsletter,
    });
  });

  // Admin: Update newsletter
  updateNewsletter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const newsletter = await newsletterService.updateNewsletter(parseInt(req.params.id), req.body);
    res.json({
      success: true,
      data: newsletter,
    });
  });

  // Admin: Delete newsletter
  deleteNewsletter = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await newsletterService.deleteNewsletter(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });

  // Admin: Toggle publish status
  togglePublishStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const newsletter = await newsletterService.togglePublishStatus(parseInt(req.params.id));
    res.json({
      success: true,
      data: newsletter,
    });
  });
}

export const newsletterController = new NewsletterController();
