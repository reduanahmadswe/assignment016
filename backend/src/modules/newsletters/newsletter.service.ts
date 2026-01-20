import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { CreateNewsletterInput, UpdateNewsletterInput } from './newsletter.types.js';
import { newsletterSlugGenerator } from './newsletter.utils.js';
import { newsletterQueryBuilder } from './newsletter.query-builder.js';

export class NewsletterService {
  async createNewsletter(data: CreateNewsletterInput) {
    const slug = await newsletterSlugGenerator.generateUniqueSlug(data.title);

    const newsletter = await prisma.newsletter.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        thumbnail: data.thumbnail,
        pdfLink: data.pdf_link,
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        isPublished: data.is_published ?? true,
      },
    });

    return newsletter;
  }

  async updateNewsletter(id: number, data: UpdateNewsletterInput) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    const updateData: any = {};

    // If title is updated, regenerate slug
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = await newsletterSlugGenerator.generateUniqueSlugForUpdate(data.title, id);
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.pdf_link !== undefined) updateData.pdfLink = data.pdf_link;
    if (data.start_date !== undefined) updateData.startDate = data.start_date ? new Date(data.start_date) : null;
    if (data.end_date !== undefined) updateData.endDate = data.end_date ? new Date(data.end_date) : null;
    if (data.is_published !== undefined) updateData.isPublished = data.is_published;

    const updated = await prisma.newsletter.update({
      where: { id },
      data: updateData,
    });

    return updated;
  }

  async deleteNewsletter(id: number) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    await prisma.newsletter.delete({ where: { id } });
    return { message: 'Newsletter deleted successfully' };
  }

  async getNewsletterById(id: number) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    return newsletter;
  }

  async getNewsletterBySlug(slug: string) {
    const newsletter = await prisma.newsletter.findUnique({
      where: { slug },
    });

    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    // Increment views when accessed by slug
    await prisma.newsletter.update({
      where: { id: newsletter.id },
      data: { views: { increment: 1 } },
    });

    return newsletter;
  }

  async getAllNewsletters(page: number = 1, limit: number = 10, search?: string, isPublished?: boolean) {
    const { offset } = paginate(page, limit);
    const where = newsletterQueryBuilder.buildWhereClause(search, isPublished);

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.newsletter.count({ where }),
    ]);

    return {
      newsletters,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async getPublishedNewsletters(page: number = 1, limit: number = 12, search?: string) {
    const { offset } = paginate(page, limit);
    const where = newsletterQueryBuilder.buildPublishedWhereClause(search);

    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.newsletter.count({ where }),
    ]);

    return {
      newsletters,
      pagination: getPaginationMeta(total, page, limit),
    };
  }

  async incrementViews(id: number) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    await prisma.newsletter.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return { message: 'View count incremented' };
  }

  async incrementDownloads(id: number) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    await prisma.newsletter.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    return { message: 'Download count incremented' };
  }

  async togglePublishStatus(id: number) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    const updated = await prisma.newsletter.update({
      where: { id },
      data: { isPublished: !newsletter.isPublished },
    });

    return updated;
  }
}

export const newsletterService = new NewsletterService();
