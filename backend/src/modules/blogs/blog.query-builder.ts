import { BlogFilters } from './blog.types.js';

export class BlogQueryBuilder {
  /**
   * Build WHERE clause for blog queries
   */
  buildWhereClause(filters: BlogFilters = {}) {
    const where: any = {};

    if (filters.status) {
      where.status = { code: filters.status };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { excerpt: { contains: filters.search } },
      ];
    }

    return where;
  }

  /**
   * Build WHERE clause for published posts only
   */
  buildPublishedWhereClause() {
    return {
      status: { code: 'published' },
    };
  }
}

export const blogQueryBuilder = new BlogQueryBuilder();
