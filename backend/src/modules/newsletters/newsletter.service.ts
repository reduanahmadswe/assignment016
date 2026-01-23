import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';
import { paginate, getPaginationMeta } from '../../utils/helpers.util.js';
import { CreateNewsletterInput, UpdateNewsletterInput } from './newsletter.types.js';
import { newsletterSlugGenerator } from './newsletter.utils.js';
import { newsletterQueryBuilder } from './newsletter.query-builder.js';

export class NewsletterService {
  async createNewsletter(data: CreateNewsletterInput) {
    // Comprehensive field validation
    const errors: string[] = [];

    // Title validation
    if (!data.title || !data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    } else if (data.title.trim().length > 255) {
      errors.push('Title cannot exceed 255 characters');
    }

    // PDF Link validation
    if (!data.pdf_link || !data.pdf_link.trim()) {
      errors.push('PDF link is required');
    } else {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(data.pdf_link.trim())) {
        errors.push('PDF link must be a valid URL');
      } else if (data.pdf_link.trim().length > 1000) {
        errors.push('PDF link cannot exceed 1000 characters');
      }
    }

    // Thumbnail validation (optional)
    if (data.thumbnail && data.thumbnail.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(data.thumbnail.trim())) {
        errors.push('Thumbnail must be a valid URL');
      } else if (data.thumbnail.trim().length > 1000) {
        errors.push('Thumbnail URL cannot exceed 1000 characters');
      }
    }

    // Description validation (optional)
    if (data.description && data.description.trim() && data.description.trim().length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    // Date range validation
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (isNaN(startDate.getTime())) {
        errors.push('Start date is invalid');
      }
      if (isNaN(endDate.getTime())) {
        errors.push('End date is invalid');
      }
      if (startDate.getTime() && endDate.getTime() && startDate > endDate) {
        errors.push('Start date must be before end date');
      }
    }

    // If there are validation errors, throw them as a single error message
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }

    // Check for duplicate title
    try {
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
    } catch (error: any) {
      // Handle Prisma-specific errors
      if (error.code === 'P2002') {
        throw new AppError('A newsletter with this title already exists', 409);
      }
      if (error.code === 'P2003') {
        throw new AppError('Invalid reference to related data', 400);
      }
      throw error;
    }
  }

  async updateNewsletter(id: number, data: UpdateNewsletterInput) {
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) {
      throw new AppError('Newsletter not found', 404);
    }

    // Comprehensive field validation (only for fields being updated)
    const errors: string[] = [];

    // Title validation
    if (data.title !== undefined) {
      if (!data.title || !data.title.trim()) {
        errors.push('Title is required');
      } else if (data.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
      } else if (data.title.trim().length > 255) {
        errors.push('Title cannot exceed 255 characters');
      }
    }

    // PDF Link validation
    if (data.pdf_link !== undefined) {
      if (!data.pdf_link || !data.pdf_link.trim()) {
        errors.push('PDF link is required');
      } else {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(data.pdf_link.trim())) {
          errors.push('PDF link must be a valid URL');
        } else if (data.pdf_link.trim().length > 1000) {
          errors.push('PDF link cannot exceed 1000 characters');
        }
      }
    }

    // Thumbnail validation (optional)
    if (data.thumbnail !== undefined && data.thumbnail && data.thumbnail.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(data.thumbnail.trim())) {
        errors.push('Thumbnail must be a valid URL');
      } else if (data.thumbnail.trim().length > 1000) {
        errors.push('Thumbnail URL cannot exceed 1000 characters');
      }
    }

    // Description validation (optional)
    if (data.description !== undefined && data.description && data.description.trim() && data.description.trim().length > 1000) {
      errors.push('Description cannot exceed 1000 characters');
    }

    // Date range validation
    const startDateToCheck = data.start_date !== undefined ? data.start_date : newsletter.startDate?.toISOString();
    const endDateToCheck = data.end_date !== undefined ? data.end_date : newsletter.endDate?.toISOString();

    if (startDateToCheck && endDateToCheck) {
      const startDate = new Date(startDateToCheck);
      const endDate = new Date(endDateToCheck);
      
      if (isNaN(startDate.getTime())) {
        errors.push('Start date is invalid');
      }
      if (isNaN(endDate.getTime())) {
        errors.push('End date is invalid');
      }
      if (startDate.getTime() && endDate.getTime() && startDate > endDate) {
        errors.push('Start date must be before end date');
      }
    }

    // If there are validation errors, throw them as a single error message
    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
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

    try {
      const updated = await prisma.newsletter.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (error: any) {
      // Handle Prisma-specific errors
      if (error.code === 'P2002') {
        throw new AppError('A newsletter with this title already exists', 409);
      }
      if (error.code === 'P2003') {
        throw new AppError('Invalid reference to related data', 400);
      }
      throw error;
    }
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
