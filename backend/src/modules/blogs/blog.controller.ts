import { Request, Response } from 'express';
import { blogService } from './blog.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/error.middleware.js';

export class BlogController {
  getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    // Check if status parameter exists in query (even if empty string)
    const hasStatusParam = 'status' in req.query;
    let status = req.query.status as string;
    
    // If status parameter exists but is empty string, set to undefined (admin wants all)
    if (hasStatusParam && status === '') {
      status = undefined as any;
    }
    // If status parameter doesn't exist at all, default to published (public access)
    else if (!hasStatusParam) {
      status = 'published';
    }
    
    const result = await blogService.getAllPosts(page, limit, status, search);
    res.json({
      success: true,
      ...result,
    });
  });

  getRecentPosts = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const posts = await blogService.getRecentPosts(limit);
    res.json({
      success: true,
      data: posts,
    });
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await blogService.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  });

  getPostBySlug = asyncHandler(async (req: Request, res: Response) => {
    const post = await blogService.getPostBySlug(req.params.slug);
    res.json({
      success: true,
      data: post,
    });
  });

  getPostById = asyncHandler(async (req: Request, res: Response) => {
    const post = await blogService.getPostById(parseInt(req.params.id));
    res.json({
      success: true,
      data: post,
    });
  });

  createPost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const thumbnailFile = req.file as Express.Multer.File | undefined;
    console.log('Create Post Request Body:', req.body);
    const post = await blogService.createPost(req.body, req.user!.id, thumbnailFile);
    res.status(201).json({
      success: true,
      data: post,
    });
  });

  updatePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const thumbnailFile = req.file as Express.Multer.File | undefined;
    console.log('Update Post Request Body:', req.body);
    const post = await blogService.updatePost(parseInt(req.params.id), req.body, thumbnailFile);
    res.json({
      success: true,
      data: post,
    });
  });

  updatePostStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: 'draft' | 'published' };
    const post = await blogService.updatePostStatus(parseInt(req.params.id), status);
    res.json({
      success: true,
      data: post,
    });
  });

  deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await blogService.deletePost(parseInt(req.params.id));
    res.json({
      success: true,
      ...result,
    });
  });
}

export const blogController = new BlogController();
