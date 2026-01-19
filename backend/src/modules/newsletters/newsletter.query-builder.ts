export class NewsletterQueryBuilder {
  /**
   * Build WHERE clause for newsletter queries
   */
  buildWhereClause(search?: string, isPublished?: boolean) {
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    return where;
  }

  /**
   * Build WHERE clause for published newsletters only
   */
  buildPublishedWhereClause(search?: string) {
    const where: any = {
      isPublished: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return where;
  }
}

export const newsletterQueryBuilder = new NewsletterQueryBuilder();
