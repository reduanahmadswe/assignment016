import { Router } from 'express';
import { blogController } from './blog.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/role.middleware.js';
import { uploadImage } from '../../utils/file.util.js';

const router = Router();

// Public routes
router.get('/', blogController.getAllPosts);
router.get('/recent', blogController.getRecentPosts);
router.get('/categories', blogController.getCategories);
router.get('/slug/:slug', blogController.getPostBySlug);

// Admin routes
router.get('/:id', authenticate, requireAdmin, blogController.getPostById);
router.post('/', authenticate, requireAdmin, uploadImage.single('thumbnail'), blogController.createPost);
router.put('/:id', authenticate, requireAdmin, uploadImage.single('thumbnail'), blogController.updatePost);
router.put('/:id/status', authenticate, requireAdmin, blogController.updatePostStatus);
router.delete('/:id', authenticate, requireAdmin, blogController.deletePost);

export default router;
