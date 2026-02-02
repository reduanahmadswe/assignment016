import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // DEBUG: Log timezone BEFORE validation
    console.log('\n✋ VALIDATION MIDDLEWARE - BEFORE');
    console.log('  req.body.timezone:', req.body.timezone);
    console.log('  req.body keys:', Object.keys(req.body));
    
    await Promise.all(validations.map(validation => validation.run(req)));

    // DEBUG: Log timezone AFTER validation
    console.log('✋ VALIDATION MIDDLEWARE - AFTER');
    console.log('  req.body.timezone:', req.body.timezone);
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const formattedErrors = errors.array().map(err => ({
      field: 'path' in err ? err.path : 'unknown',
      message: err.msg,
    }));

    // Group errors by field for easier frontend handling
    const errorsByField: Record<string, string[]> = {};
    formattedErrors.forEach(err => {
      if (!errorsByField[err.field]) {
        errorsByField[err.field] = [];
      }
      errorsByField[err.field].push(err.message);
    });

    // Create a user-friendly main error message
    const firstError = formattedErrors[0];
    const mainMessage = firstError ? firstError.message : 'Validation failed';

    res.status(400).json({
      success: false,
      message: mainMessage,
      errors: formattedErrors,
      errorsByField, // Grouped errors for easier field-specific display
    });
  };
};

// Common validation rules
export const commonValidations = {
  email: body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email'),

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
