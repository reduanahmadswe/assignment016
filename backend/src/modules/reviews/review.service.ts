import prisma from '../../config/db.js';
import { ReviewValidator } from './review.validator.js';
import { ReviewQueryService } from './review.query.js';
import { ReviewStatsService } from './review.stats.js';
import type { ReviewUpdateData, ReviewFilters } from './review.types.js';

class ReviewService {
  // Create a new review
  async createReview(userId: number, eventId: number, rating: number, comment?: string) {
    // Validate event exists
    const event = await ReviewValidator.validateEventExists(eventId);

    // Validate event has ended
    ReviewValidator.validateEventEnded(event);

    // Validate user registration
    await ReviewValidator.validateUserRegistration(userId, eventId);

    // Validate no existing review
    await ReviewValidator.validateNoExistingReview(userId, eventId);

    // Create review
    const review = await prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        comment: comment || null,
      },
      include: ReviewQueryService.REVIEW_INCLUDE,
    });

    return {
      message: 'Review submitted successfully',
      review,
    };
  }

  // Get user's reviews
  async getMyReviews(userId: number) {
    const reviews = await ReviewQueryService.getMyReviews(userId);
    return { reviews };
  }

  // Get approved reviews (public)
  async getApprovedReviews(featured?: boolean, limit?: number) {
    const reviews = await ReviewQueryService.getApprovedReviews(featured, limit);
    return { reviews };
  }

  // Get all reviews (admin)
  async getAllReviews(filters: ReviewFilters) {
    return ReviewQueryService.getAllReviews(filters);
  }

  // Update review
  async updateReview(reviewId: number, userId: number, data: ReviewUpdateData) {
    // Validate ownership
    const review = await ReviewValidator.validateReviewOwnership(reviewId, userId);

    // Validate not approved
    ReviewValidator.validateReviewNotApproved(review);

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
      include: ReviewQueryService.REVIEW_INCLUDE,
    });

    return {
      message: 'Review updated successfully',
      review: updatedReview,
    };
  }

  // Delete review
  async deleteReview(reviewId: number, userId: number) {
    // Validate ownership
    await ReviewValidator.validateReviewOwnership(reviewId, userId);

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }

  // Approve or reject review (admin)
  async approveReview(
    reviewId: number,
    adminId: number,
    isApproved: boolean,
    isFeatured?: boolean
  ) {
    // Validate review exists
    await ReviewValidator.validateReviewExists(reviewId);

    // Prepare update data
    const updateData: any = {
      isApproved,
      approvedAt: isApproved ? new Date() : null,
      approvedBy: isApproved ? adminId : null,
    };

    if (isFeatured !== undefined && isApproved) {
      updateData.isFeatured = isFeatured;
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: ReviewQueryService.REVIEW_INCLUDE,
    });

    return {
      message: isApproved ? 'Review approved successfully' : 'Review rejected successfully',
      review: updatedReview,
    };
  }

  // Get review statistics
  async getReviewStats() {
    const stats = await ReviewStatsService.getReviewStats();
    return { stats };
  }
}

export const reviewService = new ReviewService();
