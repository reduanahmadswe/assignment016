import prisma from '../../config/db.js';

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

export class NewsletterSlugGenerator {
  /**
   * Generate unique slug for new newsletter
   */
  async generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title);

    // Check if slug already exists and make it unique
    let slugExists = await prisma.newsletter.findUnique({ where: { slug } });
    let counter = 1;
    
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await prisma.newsletter.findUnique({ where: { slug } });
      counter++;
    }

    return slug;
  }

  /**
   * Generate unique slug for updating newsletter (excluding current ID)
   */
  async generateUniqueSlugForUpdate(title: string, currentId: number): Promise<string> {
    let slug = generateSlug(title);

    // Check if slug already exists (excluding current newsletter)
    let slugExists = await prisma.newsletter.findFirst({
      where: {
        slug,
        id: { not: currentId }
      }
    });
    let counter = 1;
    
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await prisma.newsletter.findFirst({
        where: {
          slug,
          id: { not: currentId }
        }
      });
      counter++;
    }

    return slug;
  }
}

export const newsletterSlugGenerator = new NewsletterSlugGenerator();
