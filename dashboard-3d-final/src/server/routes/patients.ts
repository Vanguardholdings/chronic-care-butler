import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, AppError, ApiResponse } from '../types';
import Patient from '../models/Patient';
import Medication from '../models/Medication';
import Appointment from '../models/Appointment';
import Alert from '../models/Alert';
import { authenticate } from '../middleware/auth';
import {
  validatePatient,
  validatePatientUpdate,
  validateObjectId,
  validatePagination,
  runValidation,
} from '../middleware/validate';

const router = Router();

// All patient routes require authentication
router.use(authenticate);

/**
 * GET /api/patients
 * List all patients with pagination, filtering, sorting, and search
 */
router.get(
  '/',
  validatePagination(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const sort = (req.query.sort as string) || '-createdAt';
      const status = req.query.status as string;
      const doctor = req.query.doctor as string;
      const search = req.query.search as string;

      // Build filter
      const filter: Record<string, any> = {};

      // Role-based filtering
      if (req.user?.role === 'doctor') {
        // Doctors see patients where they are the assigned doctor
        filter.$or = [
          { doctor: { $regex: req.user.name, $options: 'i' } },
          { assignedDoctors: { $in: [req.user.id] } },
        ];
      } else if (req.user?.role === 'nurse') {
        filter.assignedNurses = { $in: [req.user.id] };
      } else if (req.user?.role === 'staff') {
        filter.assignedStaff = { $in: [req.user.id] };
      }
      // Admin sees all patients (no filter)

      if (status) {
        filter.status = status;
      }

      if (doctor) {
        filter.doctor = { $regex: doctor, $options: 'i' };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { condition: { $regex: search, $options: 'i' } },
          { room: { $regex: search, $options: 'i' } },
        ];
      }

      const [patients, total] = await Promise.all([
        Patient.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('medications', 'name dosage frequency isActive')
          .populate('appointments', 'type dateTime status')
          .populate('assignedNurses', 'name email')
          .populate('assignedStaff', 'name email')
          .lean(),
        Patient.countDocuments(filter),
      ]);

      const response: ApiResponse = {
        success: true,
        data: patients,
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
 * GET /api/patients/:id
 * Get a single patient with all populated references
 */
router.get(
  '/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id)
        .populate('medications')
        .populate('appointments');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients
 * Create a new patient
 */
router.post(
  '/',
  validatePatient(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patientData = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        condition: req.body.condition,
        status: req.body.status || 'stable',
        room: req.body.room,
        doctor: req.body.doctor,
        vitals: {
          heartRate: req.body.vitals.heartRate,
          bloodPressureSystolic: req.body.vitals.bloodPressureSystolic,
          bloodPressureDiastolic: req.body.vitals.bloodPressureDiastolic,
          temperature: req.body.vitals.temperature,
          oxygenSaturation: req.body.vitals.oxygenSaturation,
          respiratoryRate: req.body.vitals.respiratoryRate,
          timestamp: new Date(),
        },
        emergencyContact: req.body.emergencyContact,
        notes: req.body.notes,
      };

      const patient = new Patient(patientData);
      await patient.save();

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Patient created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/patients/:id
 * Update an existing patient
 */
router.put(
  '/:id',
  validateObjectId('id'),
  validatePatientUpdate(),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // If updating vitals, set timestamp
      if (req.body.vitals) {
        req.body.vitals.timestamp = new Date();
      }

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('medications', 'name dosage frequency isActive')
        .populate('appointments', 'type dateTime status');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Patient updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/patients/:id
 * Delete a patient and all associated records
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patient = await Patient.findById(req.params.id);

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      // Delete all associated records in parallel
      await Promise.all([
        Medication.deleteMany({ patientId: req.params.id }),
        Appointment.deleteMany({ patientId: req.params.id }),
        Alert.deleteMany({ patientId: req.params.id }),
        Patient.findByIdAndDelete(req.params.id),
      ]);

      const response: ApiResponse = {
        success: true,
        message: 'Patient and all associated records deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/assign-nurse
 * Assign a nurse to a patient (admin only)
 */
router.post(
  '/:id/assign-nurse',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Only admin can assign nurses
      if (req.user?.role !== 'admin') {
        throw new AppError('Only administrators can assign nurses.', 403);
      }

      const { nurseId } = req.body;
      if (!nurseId) {
        throw new AppError('Nurse ID is required.', 400);
      }

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { assignedNurses: nurseId } },
        { new: true }
      )
        .populate('assignedNurses', 'name email')
        .populate('assignedStaff', 'name email');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Nurse assigned successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/unassign-nurse
 * Remove a nurse from a patient (admin only)
 */
router.post(
  '/:id/unassign-nurse',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'admin') {
        throw new AppError('Only administrators can unassign nurses.', 403);
      }

      const { nurseId } = req.body;
      if (!nurseId) {
        throw new AppError('Nurse ID is required.', 400);
      }

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $pull: { assignedNurses: nurseId } },
        { new: true }
      )
        .populate('assignedNurses', 'name email')
        .populate('assignedStaff', 'name email');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Nurse unassigned successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/assign-staff
 * Assign staff to a patient (admin only)
 */
router.post(
  '/:id/assign-staff',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'admin') {
        throw new AppError('Only administrators can assign staff.', 403);
      }

      const { staffId } = req.body;
      if (!staffId) {
        throw new AppError('Staff ID is required.', 400);
      }

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { assignedStaff: staffId } },
        { new: true }
      )
        .populate('assignedNurses', 'name email')
        .populate('assignedStaff', 'name email');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Staff assigned successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/patients/:id/unassign-staff
 * Remove staff from a patient (admin only)
 */
router.post(
  '/:id/unassign-staff',
  validateObjectId('id'),
  runValidation,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== 'admin') {
        throw new AppError('Only administrators can unassign staff.', 403);
      }

      const { staffId } = req.body;
      if (!staffId) {
        throw new AppError('Staff ID is required.', 400);
      }

      const patient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $pull: { assignedStaff: staffId } },
        { new: true }
      )
        .populate('assignedNurses', 'name email')
        .populate('assignedStaff', 'name email');

      if (!patient) {
        throw new AppError('Patient not found.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: patient,
        message: 'Staff unassigned successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;