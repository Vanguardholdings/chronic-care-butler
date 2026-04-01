import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, ApiResponse } from '../types';
import Appointment from '../models/Appointment';
import Patient from '../models/Patient';
import { authenticate } from '../middleware/auth';
import {
  validateAppointment,
  validateObjectId,
  runValidation,
} from '../middleware/validate';

const router = Router();

router.use(authenticate);

/**
 * GET /api/patients/:id/appointments
 * Get all appointments for a patient
 */
router.get(
  '/patients/:id/appointments',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const status = req.query.status as string;
      const upcoming = req.query.upcoming === 'true';

      const filter: Record<string, any> = { patientId: req.params.id };

      if (status) {
        filter.status = status;
      }

      if (upcoming) {
        filter.dateTime = { $gte: new Date() };
        filter.status = { $in: ['scheduled', 'in_progress'] };
      }

      const appointments = await Appointment.find(filter)
        .sort('dateTime')
        .lean();

      const response: ApiResponse = {
        success: true,
        data: appointments,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/appointments
 * Create an appointment for a patient
 */
router.post(
  '/patients/:id/appointments',
  validateObjectId('id'),
  validateAppointment(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const appointment = new Appointment({
        patientId: req.params.id,
        type: req.body.type,
        dateTime: req.body.dateTime,
        status: req.body.status || 'scheduled',
        notes: req.body.notes,
        doctor: req.body.doctor || patient.doctor,
        location: req.body.location,
        duration: req.body.duration || 30,
      });

      await appointment.save();

      // Add reference to patient
      patient.appointments.push(appointment._id);
      await patient.save({ validateBeforeSave: false });

      const response: ApiResponse = {
        success: true,
        data: appointment,
        message: 'Appointment created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/appointments/:id
 * Update an appointment
 */
router.put(
  '/appointments/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allowedUpdates = [
        'type', 'dateTime', 'status', 'notes', 'doctor', 'location', 'duration',
      ];

      const updates: Record<string, any> = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!appointment) {
        throw new AppError('Appointment not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: appointment,
        message: 'Appointment updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/appointments/:id
 * Delete an appointment
 */
router.delete(
  '/appointments/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const appointment = await Appointment.findById(req.params.id);

      if (!appointment) {
        throw new AppError('Appointment not found.', 404);
      }

      // Remove reference from patient
      await Patient.findByIdAndUpdate(appointment.patientId, {
        $pull: { appointments: appointment._id },
      });

      await Appointment.findByIdAndDelete(req.params.id);

      const response: ApiResponse = {
        success: true,
        message: 'Appointment deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;