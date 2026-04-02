import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserRole, AppError } from '../types';
import User from '../models/User';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
}

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches user to request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Access denied. Invalid token format.', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('Server configuration error: JWT_SECRET not set', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Verify user still exists and is active
    const user = await User.findById(decoded.id).select('email role name isActive');
    if (!user) {
      throw new AppError('User associated with this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('User account has been deactivated.', 403);
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token has expired. Please log in again.', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
    } else {
      next(new AppError('Authentication failed.', 401));
    }
  }
};

/**
 * Role-Based Access Control Middleware
 * Restricts access to specified roles only
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${allowedRoles.join(', ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Generate JWT token for a user
 */
export const generateToken = (user: {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtSecret,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN as any) || '24h',
    }
  );
};