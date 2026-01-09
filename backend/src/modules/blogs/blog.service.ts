import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { generateSlug, paginate, getPaginationMeta } from '../../utils/helpers.util.js';

interface CreateBlogInput {
  title: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export class BlogService {
  async createPost(data: CreateBlogInput, authorId: number) {
    const slug = generateSlug(data.title) + '-' + Date.now().toString(36);

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        thumbnail: data.thumbnail,
        authorId,
        status: (data.status || 'draft') as any,
        metaTitle: data.meta_title,
        metaDescription: data.meta_description,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || ''),
        publishedAt: data.status === 'published' ? new Date() : null,
      },
    });

    return this.getPostById(post.id);
  }

  async updatePost(postId: number, data: Partial<CreateBlogInput>) {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.meta_title !== undefined) updateData.metaTitle = data.meta_title;
    if (data.meta_description !== undefined) updateData.metaDescription = data.meta_description;
    if (data.tags !== undefined) {
      // Convert array to comma-separated string for database storage
      updateData.tags = Array.isArray(data.tags) ? data.tags.join(',') : data.tags;
    }

    if (data.title && data.title !== post.title) {
      updateData.slug = generateSlug(data.title) + '-' + Date.now().toString(36);
    }

    // Handle publishing
    if (data.status === 'published' && post.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
    });

    return this.getPostById(updatedPost.id);
  }

  async updatePostStatus(postId: number, status: 'draft' | 'published') {
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    const updateData: any = { status };
    if (status === 'published' && post.status !== 'published') {
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
      },
    });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    return {
      ...post,
      author_name: post.author?.name,
    };
  }

  async getPostBySlug(slug: string) {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        status: 'published',
      },
      include: {
        author: {
          select: { name: true, avatar: true },
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

    return {
      ...post,
      author_name: post.author?.name,
    };
  }

  async getAllPosts(page: number = 1, limit: number = 10, status?: string, search?: string) {
    const { offset } = paginate(page, limit);
    const where: any = {};

    if (status) {
      where.status = status;
    } else {
      where.status = 'published';
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnail: true,
          status: true,
          views: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: { name: true, avatar: true },
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

    const postsWithAuthor = posts.map((post: any) => ({
      ...post,
      author_name: post.author?.name,
    }));

    return {
      posts: postsWithAuthor,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getRecentPosts(limit: number = 5) {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
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
    // Get unique tags from all published posts
    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        tags: {
          not: '',
        },
      },
      select: { tags: true },
    });

    const tagCounts: { [key: string]: number } = {};

    posts.forEach((post: any) => {
      try {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      } catch (e) {
        // Skip invalid data
      }
    });

    return Object.entries(tagCounts).map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
    }));
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
