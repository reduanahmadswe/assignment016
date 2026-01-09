import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JwtPayload } from '../utils/jwt.util.js';
import prisma from '../config/db.js';

export interface AuthRequest extends Request {
  user?: JwtPayload & { 
    id: number;
    name?: string;
    phone?: string | null;
    avatar?: string | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token is required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      
      // Verify user still exists and is active
      const user = await prisma.user.findFirst({
        where: { id: decoded.userId, isActive: true },
        select: { 
          id: true, 
          email: true, 
          name: true,
          phone: true,
          avatar: true,
          role: true, 
          isActive: true 
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found or inactive',
        });
        return;
      }

      req.user = {
        ...decoded,
        id: decoded.userId,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      };

      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyAccessToken(token);
      req.user = {
        ...decoded,
        id: decoded.userId,
      };
    } catch (error) {
      // Token invalid, but continue without auth
    }

    next();
  } catch (error) {
    next(error);
  }
};
