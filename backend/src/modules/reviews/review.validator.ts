import prisma from '../../config/db.js';
import { AppError } from '../../middlewares/error.middleware.js';

export class ReviewValidator {
  static async validateEventExists(eventId: number) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return event;
  }

  static validateEventEnded(event: { endDate: Date }) {
    if (new Date() < event.endDate) {
      throw new AppError('You can only review events that have ended', 400);
    }
  }

  static async validateUserRegistration(userId: number, eventId: number) {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        userId,
        eventId,
        status: { code: 'confirmed' },
      },
    });

    if (!registration) {
      throw new AppError('You must be a confirmed participant to review this event', 403);
    }

    return registration;
  }

  static async validateNoExistingReview(userId: number, eventId: number) {
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this event', 400);
    }
  }

  static async validateReviewOwnership(reviewId: number, userId: number) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('You can only modify your own reviews', 403);
    }

    return review;
  }

  static validateReviewNotApproved(review: { isApproved: boolean }) {
    if (review.isApproved) {
      throw new AppError('You cannot update an approved review', 400);
    }
  }

  static async validateReviewExists(reviewId: number) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    return review;
  }
}
