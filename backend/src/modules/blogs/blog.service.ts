import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { lookupService } from '../../services/lookup.service.js';
import { CreateBlogInput, UpdateBlogInput, BlogFilters } from './blog.types.js';
import { blogTransformer } from './blog.transformer.js';
import { blogQueryBuilder } from './blog.query-builder.js';
import { getFileUrl, deleteFile } from '../../utils/file.util.js';

export class BlogService {
  async createPost(data: CreateBlogInput, authorId: number, thumbnailFile?: Express.Multer.File) {
    const slug = generateSlug(data.title) + '-' + Date.now().toString(36);

    const statusId = await lookupService.getBlogStatusId(data.status || 'draft');

    // Handle thumbnail - use uploaded file or provided URL
    let thumbnailUrl = data.thumbnail;
    if (thumbnailFile) {
      thumbnailUrl = getFileUrl(thumbnailFile.filename, 'images');
    }

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        thumbnail: thumbnailUrl,
        authorId,
        authorName: data.author_name,
        authorImage: data.author_image,
        authorWebsite: data.author_website,
        statusId,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
    });

    // Handle tags if provided
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      await this.assignTags(post.id, data.tags);
    }

    return this.getPostById(post.id);
  }

  async updatePost(postId: number, data: UpdateBlogInput, thumbnailFile?: Express.Multer.File) {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    
    // Handle thumbnail update
    if (thumbnailFile) {
      // Delete old thumbnail if it exists and is a local file
      if (post.thumbnail && post.thumbnail.startsWith('/uploads/')) {
        await deleteFile(post.thumbnail.replace('/uploads/', ''));
      }
      updateData.thumbnail = getFileUrl(thumbnailFile.filename, 'images');
    } else if (data.thumbnail !== undefined) {
      updateData.thumbnail = data.thumbnail;
    }
    
    if (data.author_name !== undefined) updateData.authorName = data.author_name;
    if (data.author_image !== undefined) updateData.authorImage = data.author_image;
    if (data.author_website !== undefined) updateData.authorWebsite = data.author_website;
    if (data.status !== undefined) updateData.statusId = await lookupService.getBlogStatusId(data.status);
    if (data.meta_title !== undefined) updateData.metaTitle = data.meta_title;
    if (data.meta_description !== undefined) updateData.metaDescription = data.meta_description;

    if (data.title && data.title !== post.title) {
      updateData.slug = generateSlug(data.title) + '-' + Date.now().toString(36);
    }

    // Handle publishing
    const currentStatus = await prisma.blogStatus.findUnique({ where: { id: post.statusId } });
    if (data.status === 'published' && currentStatus?.code !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    });

    // Handle tags if provided
    if (data.tags !== undefined) {
      await this.assignTags(postId, Array.isArray(data.tags) ? data.tags : []);
    }

    return this.getPostById(updatedPost.id);
  }

  async updatePostStatus(postId: number, status: 'draft' | 'published') {
    const post = await prisma.blogPost.findUnique({ 
      where: { id: postId },
      include: { status: true }
    });
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const statusId = await lookupService.getBlogStatusId(status);
    const updateData: any = { statusId };
    if (status === 'published' && post.status.code !== 'published') {
      updateData.publishedAt = new Date();
    }
    if (status === 'draft') {
      updateData.publishedAt = null;
    }

    const updated = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    });

    return this.getPostById(updated.id);
  }

  async getPostById(postId: number) {
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: { name: true, avatar: true },
        },
        status: { select: { code: true } },
        blogTags: {
          select: {
            tag: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return blogTransformer.transform(post);
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: { code: 'published' },
      },
      include: {
        author: {
          select: { name: true, avatar: true },
        },
        status: { select: { code: true } },
        blogTags: {
          select: {
            tag: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    return blogTransformer.transform(post);
  }

  async getAllPosts(page: number = 1, limit: number = 10, status?: string, search?: string) {
    const { offset } = paginate(page, limit);
    const where = blogQueryBuilder.buildWhereClause({ status, search });

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          authorName: true,
          authorImage: true,
          authorWebsite: true,
          status: { select: { code: true } },
          views: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: { name: true, avatar: true },
          },
          blogTags: {
            select: {
              tag: {
                select: { name: true, slug: true },
              },
            },
          },
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    // Get stats
    const [totalPosts, publishedCount, draftCount] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { status: { code: 'published' } } }),
      prisma.blogPost.count({ where: { status: { code: 'draft' } } }),
    ]);

    // Transform posts to use custom author fields with priority
    const transformedPosts = blogTransformer.transformList(posts);

    return {
      posts: transformedPosts,
      pagination: getPaginationMeta(total, page, limit),
      stats: {
        total: totalPosts,
        published: publishedCount,
        drafts: draftCount,
      },
    };
  }

  async getRecentPosts(limit: number = 5) {
    const posts = await prisma.blogPost.findMany({
      where: { status: { code: 'published' } },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnail: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return posts;
  }

  async getCategories() {
    // Get all tags with their post counts
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        slug: true,
        _count: {
          select: {
            blogTags: {
              where: {
                blogPost: {
                  status: { code: 'published' },
                },
              },
            },
          },
        },
      },
    });

    return tags
      .filter((tag: any) => tag._count.blogTags > 0)
      .map((tag: any) => ({
        name: tag.name,
        slug: tag.slug,
        count: tag._count.blogTags,
      }));
  }

  private async assignTags(blogPostId: number, tagNames: string[]) {
    // Remove existing tags
    await prisma.blogTag.deleteMany({
      where: { blogPostId },
    });

    if (tagNames.length === 0) return;

    // Get or create tags
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        return prisma.tag.upsert({
          where: { slug },
          create: { name, slug },
          update: {},
          select: { id: true },
        });
      })
    );

    // Create blog-tag relationships
    await prisma.blogTag.createMany({
      data: tags.map((tag) => ({
        blogPostId,
        tagId: tag.id,
      })),
    });
  }

  async deletePost(postId: number) {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    await prisma.blogPost.delete({ where: { id: postId } });
    return { message: 'Blog post deleted successfully' };
  }
}

export const blogService = new BlogService();
