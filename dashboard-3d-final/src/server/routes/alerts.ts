import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, UserRole, ApiResponse } from '../types';
import Alert from '../models/Alert';
import Patient from '../models/Patient';
import { authenticate, authorize } from '../middleware/auth';
import {
  validateAlert,
  validateObjectId,
  validatePagination,
  runValidation,
} from '../middleware/validate';

const router = Router();

router.use(authenticate);

/**
 * GET /api/alerts
 * Get all alerts with filtering and pagination
 */
router.get(
  '/',
  validatePagination(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;
      const priority = req.query.priority as string;
      const type = req.query.type as string;
      const acknowledged = req.query.acknowledged;

      const filter: Record<string, any> = {};

      if (priority) {
        filter.priority = priority;
      }

      if (type) {
        filter.type = type;
      }

      if (acknowledged !== undefined) {
        filter.acknowledged = acknowledged === 'true';
      }

      const [alerts, total] = await Promise.all([
        Alert.find(filter)
          .sort('-createdAt')
          .skip(skip)
          .limit(limit)
          .populate('patientId', 'name room status')
          .populate('acknowledgedBy', 'name email')
          .lean(),
        Alert.countDocuments(filter),
      ]);

      const response: ApiResponse = {
        success: true,
        data: alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/patients/:id/alerts
 * Get alerts for a specific patient
 */
router.get(
  '/patients/:id/alerts',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const filter: Record<string, any> = { patientId: req.params.id };

      if (req.query.acknowledged !== undefined) {
        filter.acknowledged = req.query.acknowledged === 'true';
      }

      const alerts = await Alert.find(filter)
        .sort('-createdAt')
        .populate('acknowledgedBy', 'name email')
        .lean();

      const response: ApiResponse = {
        success: true,
        data: alerts,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/alerts
 * Create a new alert
 */
router.post(
  '/',
  validateAlert(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // If patientId provided, verify patient exists
      if (req.body.patientId) {
        const patient = await Patient.findById(req.body.patientId);
        if (!patient) {
          throw new AppError('Referenced patient not found.', 404);
        }
      }

      const alert = new Alert({
        patientId: req.body.patientId,
        type: req.body.type,
        priority: req.body.priority,
        message: req.body.message,
        expiresAt: req.body.expiresAt,
        metadata: req.body.metadata,
      });

      await alert.save();

      // Populate for response
      const populatedAlert = await Alert.findById(alert._id)
        .populate('patientId', 'name room status');

      const response: ApiResponse = {
        success: true,
        data: populatedAlert,
        message: 'Alert created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.put(
  '/:id/acknowledge',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await Alert.findById(req.params.id);

      if (!alert) {
        throw new AppError('Alert not found.', 404);
      }

      if (alert.acknowledged) {
        throw new AppError('Alert has already been acknowledged.', 400);
      }

      alert.acknowledged = true;
      alert.acknowledgedBy = req.user!.id as any;
      alert.acknowledgedAt = new Date();

      await alert.save();

      const populatedAlert = await Alert.findById(alert._id)
        .populate('patientId', 'name room status')
        .populate('acknowledgedBy', 'name email');

      const response: ApiResponse = {
        success: true,
        data: populatedAlert,
        message: 'Alert acknowledged successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/alerts/:id
 * Delete an alert (admin/nurse only)
 */
router.delete(
  '/:id',
  authorize(UserRole.ADMIN, UserRole.NURSE),
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const alert = await Alert.findByIdAndDelete(req.params.id);

      if (!alert) {
        throw new AppError('Alert not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Alert deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;