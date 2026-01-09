import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';


export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};
