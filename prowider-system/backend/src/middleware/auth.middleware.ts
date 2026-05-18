import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { AppError } from './error.middleware';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  body: any;
  query: any;
  params: any;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw new AppError('Invalid or expired token', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  req.userId = user.id;
  req.userRole = user.role;
  next();
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      throw new AppError('User role not found', 403);
    }

    if (!allowedRoles.includes(req.userRole)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};
