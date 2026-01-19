import { EventFilters } from './event.types.js';

export class EventQueryBuilder {
  /**
   * Build complete WHERE clause from filters
   */
  buildWhereClause(filters: EventFilters = {}) {
    const where: any = { isPublished: true };

    // Basic filters
    if (filters.event_type) where.eventType = { code: filters.event_type };
    if (filters.event_mode) where.eventMode = { code: filters.event_mode };
    if (filters.event_status) where.eventStatus = { code: filters.event_status };
    if (filters.is_free !== undefined) where.isFree = filters.is_free;
    if (filters.is_featured !== undefined) where.isFeatured = filters.is_featured;
    if (filters.category) where.category = filters.category;

    // Price filtering
    this.applyPriceFilter(where, filters.price_range);

    // Date filtering
    this.applyDateFilter(where, filters.date_range);

    // Search filtering
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    return where;
  }

  /**
   * Apply price range filter
   */
  private applyPriceFilter(where: any, priceRange?: string) {
    if (!priceRange) return;

    if (priceRange === 'free') {
      where.isFree = true;
    } else if (priceRange === 'paid') {
      where.isFree = false;
    } else if (priceRange === '0-500') {
      where.price = { gte: 0, lte: 500 };
    } else if (priceRange === '500-1000') {
      where.price = { gte: 500, lte: 1000 };
    } else if (priceRange === '1000+') {
      where.price = { gt: 1000 };
    }
  }

  /**
   * Apply date range filter
   */
  private applyDateFilter(where: any, dateRange?: string) {
    if (!dateRange) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateRange === 'today') {
      where.startDate = {
        gte: today,
        lt: tomorrow,
      };
    } else if (dateRange === 'week') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      where.startDate = {
        gte: today,
        lte: nextWeek,
      };
    } else if (dateRange === 'month') {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      where.startDate = {
        gte: today,
        lte: endOfMonth,
      };
    } else if (dateRange === 'next_month') {
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      where.startDate = {
        gte: startOfNextMonth,
        lte: endOfNextMonth,
      };
    }
  }
}

export const eventQueryBuilder = new EventQueryBuilder();
