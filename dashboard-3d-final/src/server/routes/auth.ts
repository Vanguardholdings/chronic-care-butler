import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, UserRole, ApiResponse } from '../types';
import User from '../models/User';
import { authenticate, generateToken } from '../middleware/auth';
import { validateLogin, validateRegister, runValidation } from '../middleware/validate';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateRegister(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, name, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError('An account with this email already exists.', 409);
      }

      // Only admins can create admin accounts
      const userRole = role || UserRole.STAFF;
      if (userRole === UserRole.ADMIN && req.user?.role !== UserRole.ADMIN) {
        // For initial setup, allow first admin creation if no admins exist
        const adminCount = await User.countDocuments({ role: UserRole.ADMIN });
        if (adminCount > 0 && req.user?.role !== UserRole.ADMIN) {
          throw new AppError('Only administrators can create admin accounts.', 403);
        }
      }

      const user = new User({
        email,
        passwordHash: password,
        name,
        role: userRole,
      });

      await user.save();

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
        message: 'User registered successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post(
  '/login',
  validateLogin(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user with password field included
      const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

      if (!user) {
        throw new AppError('Invalid email or password.', 401);
      }

      if (!user.isActive) {
        throw new AppError('Your account has been deactivated. Contact an administrator.', 403);
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password.', 401);
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            lastLogin: user.lastLogin,
          },
          token,
        },
        message: 'Login successful',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/users
 * Get all users (admin only) or filtered by role
 */
router.get(
  '/users',
  authenticate,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admin can list all users
      if (req.user?.role !== 'admin') {
        throw new AppError('Only administrators can list users.', 403);
      }

      const role = req.query.role as string;
      const filter: Record<string, any> = {};
      
      if (role && ['admin', 'nurse', 'staff'].includes(role)) {
        filter.role = role;
      }

      const users = await User.find(filter)
        .select('name email role isActive lastLogin createdAt')
        .sort({ role: 1, name: 1 })
        .lean();

      const response: ApiResponse = {
        success: true,
        data: users.map(u => ({ ...u, id: u._id })),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;