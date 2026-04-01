import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, ApiResponse } from '../types';
import Medication from '../models/Medication';
import Patient from '../models/Patient';
import { authenticate } from '../middleware/auth';
import {
  validateMedication,
  validateObjectId,
  runValidation,
} from '../middleware/validate';
import { body } from 'express-validator';

const router = Router();

router.use(authenticate);

/**
 * GET /api/patients/:id/medications
 * Get all medications for a patient
 */
router.get(
  '/patients/:id/medications',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const activeOnly = req.query.active === 'true';
      const filter: Record<string, any> = { patientId: req.params.id };

      if (activeOnly) {
        filter.isActive = true;
      }

      const medications = await Medication.find(filter)
        .sort('-createdAt')
        .lean();

      const response: ApiResponse = {
        success: true,
        data: medications,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/medications
 * Add a medication to a patient
 */
router.post(
  '/patients/:id/medications',
  validateObjectId('id'),
  validateMedication(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const medication = new Medication({
        patientId: req.params.id,
        name: req.body.name,
        dosage: req.body.dosage,
        frequency: req.body.frequency,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        prescribedBy: req.body.prescribedBy,
        sideEffects: req.body.sideEffects || [],
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      });

      await medication.save();

      // Add medication reference to patient
      patient.medications.push(medication._id);
      await patient.save({ validateBeforeSave: false });

      const response: ApiResponse = {
        success: true,
        data: medication,
        message: 'Medication added successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/medications/:id
 * Update a medication
 */
router.put(
  '/medications/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allowedUpdates = [
        'name', 'dosage', 'frequency', 'startDate', 'endDate',
        'prescribedBy', 'isActive', 'sideEffects',
      ];

      const updates: Record<string, any> = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const medication = await Medication.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!medication) {
        throw new AppError('Medication not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: medication,
        message: 'Medication updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/medications/:id/adherence
 * Record medication adherence
 */
router.put(
  '/medications/:id/adherence',
  validateObjectId('id'),
  [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('taken').isBoolean().withMessage('Taken must be a boolean'),
    body('notes').optional().trim().isLength({ max: 500 }),
  ],
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medication = await Medication.findById(req.params.id);

      if (!medication) {
        throw new AppError('Medication not found.', 404);
      }

      medication.adherence.push({
        date: new Date(req.body.date),
        taken: req.body.taken,
        notes: req.body.notes,
      });

      await medication.save();

      const response: ApiResponse = {
        success: true,
        data: medication,
        message: 'Adherence record added successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/medications/:id
 * Delete a medication
 */
router.delete(
  '/medications/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medication = await Medication.findById(req.params.id);

      if (!medication) {
        throw new AppError('Medication not found.', 404);
      }

      // Remove reference from patient
      await Patient.findByIdAndUpdate(medication.patientId, {
        $pull: { medications: medication._id },
      });

      await Medication.findByIdAndDelete(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Medication deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;