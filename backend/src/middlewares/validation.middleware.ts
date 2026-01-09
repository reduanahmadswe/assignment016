import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: 'path' in err ? err.path : 'unknown',
        message: err.msg,
      })),
    });
  };
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  phone: body('phone')
    .optional()
    .matches(/^(\+88)?01[3-9]\d{8}$/)
    .withMessage('Please provide a valid Bangladeshi phone number'),

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID'),

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],

  slug: param('slug')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Slug is required'),
};

export { body, param, query };
