import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Prisma errors
  if (err.message?.includes('prisma') || err.message?.includes('Prisma')) {
    statusCode = 500;
    if (err.message.includes('does not exist')) {
      message = 'Database configuration error. Please contact support.';
    } else if (err.message.includes('Unique constraint')) {
      message = 'This record already exists in the system.';
      statusCode = 409;
    } else if (err.message.includes('Foreign key constraint')) {
      message = 'Cannot complete this action due to related data.';
      statusCode = 400;
    } else if (err.message.includes('Record to update not found')) {
      message = 'The requested item was not found.';
      statusCode = 404;
    } else {
      message = 'A database error occurred. Please try again later.';
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please sign in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please sign in again.';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Please check your input and try again.';
  }

  // Handle multer file upload errors
  if (err.message?.includes('LIMIT_FILE_SIZE')) {
    statusCode = 400;
    message = 'File size is too large. Please upload a smaller file.';
  }

  if (err.message?.includes('Invalid file type')) {
    statusCode = 400;
    message = 'Invalid file type. Please upload a supported file format.';
  }

  // Handle network/connection errors
  if (err.message?.includes('ECONNREFUSED') || err.message?.includes('ETIMEDOUT')) {
    statusCode = 503;
    message = 'Service temporarily unavailable. Please try again later.';
  }

  // Don't expose internal errors to users in production
  if (env.nodeEnv === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Our team has been notified.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(env.nodeEnv === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export class AppError extends Error {
  statusCode: number;
  errors: any[];

  constructor(message: string, statusCode: number = 500, errors: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
