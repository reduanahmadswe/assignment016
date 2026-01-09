/**
 * Rate Limiting Middleware
 * Prevents abuse and brute force attacks on payment endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please try again later.',
    keyGenerator = (req: Request) => {
      // Default: Use user ID if authenticated, otherwise IP
      const userId = (req as any).user?.id;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      return userId ? `user:${userId}` : `ip:${ip}`;
    },
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Reset if window expired
    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      throw new AppError(message, 429);
    }

    next();
  };
};

// Predefined rate limiters for common use cases
export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 payment initiations per 15 minutes per user
  message: 'Too many payment attempts. Please wait before trying again.',
});

export const verificationRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 verification attempts per 5 minutes
  message: 'Too many verification attempts. Please wait before trying again.',
});

export const webhookRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 100, // 100 webhook calls per minute (generous for legitimate use)
  message: 'Webhook rate limit exceeded',
  keyGenerator: (req: Request) => {
    // Rate limit by IP for webhooks
    return `webhook:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
});
