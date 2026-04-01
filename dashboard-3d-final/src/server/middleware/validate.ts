import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Run validation chains and return errors
 */
export const runValidation = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(`Validation error: ${messages.join('. ')}`, 400));
  }
  next();
};

/**
 * Validate MongoDB ObjectId parameter
 */
export const validateObjectId = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
];

/**
 * Patient validation rules
 */
export const validatePatient = (): ValidationChain[] => [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('condition')
    .trim()
    .notEmpty()
    .withMessage('Condition is required'),
  body('status')
    .optional()
    .isIn(['stable', 'critical', 'recovering', 'discharged', 'admitted'])
    .withMessage('Invalid status value'),
  body('room')
    .trim()
    .notEmpty()
    .withMessage('Room is required'),
  body('doctor')
    .trim()
    .notEmpty()
    .withMessage('Doctor is required'),
  body('vitals.heartRate')
    .isFloat({ min: 0, max: 300 })
    .withMessage('Heart rate must be between 0 and 300'),
  body('vitals.bloodPressureSystolic')
    .isFloat({ min: 0, max: 300 })
    .withMessage('Systolic BP must be between 0 and 300'),
  body('vitals.bloodPressureDiastolic')
    .isFloat({ min: 0, max: 200 })
    .withMessage('Diastolic BP must be between 0 and 200'),
  body('vitals.temperature')
    .isFloat({ min: 90, max: 110 })
    .withMessage('Temperature must be between 90 and 110 °F'),
  body('vitals.oxygenSaturation')
    .isFloat({ min: 0, max: 100 })
    .withMessage('O2 saturation must be between 0 and 100'),
  body('vitals.respiratoryRate')
    .isFloat({ min: 0, max: 60 })
    .withMessage('Respiratory rate must be between 0 and 60'),
];

/**
 * Patient update validation (all fields optional)
 */
export const validatePatientUpdate = (): ValidationChain[] => [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  body('status')
    .optional()
    .isIn(['stable', 'critical', 'recovering', 'discharged', 'admitted'])
    .withMessage('Invalid status value'),
  body('vitals.heartRate')
    .optional()
    .isFloat({ min: 0, max: 300 })
    .withMessage('Heart rate must be between 0 and 300'),
  body('vitals.bloodPressureSystolic')
    .optional()
    .isFloat({ min: 0, max: 300 })
    .withMessage('Systolic BP must be between 0 and 300'),
  body('vitals.bloodPressureDiastolic')
    .optional()
    .isFloat({ min: 0, max: 200 })
    .withMessage('Diastolic BP must be between 0 and 200'),
  body('vitals.temperature')
    .optional()
    .isFloat({ min: 90, max: 110 })
    .withMessage('Temperature must be between 90 and 110 °F'),
  body('vitals.oxygenSaturation')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('O2 saturation must be between 0 and 100'),
  body('vitals.respiratoryRate')
    .optional()
    .isFloat({ min: 0, max: 60 })
    .withMessage('Respiratory rate must be between 0 and 60'),
];

/**
 * Medication validation rules
 */
export const validateMedication = (): ValidationChain[] => [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  body('frequency')
    .isIn(['once_daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'as_needed', 'weekly'])
    .withMessage('Invalid frequency value'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('prescribedBy')
    .trim()
    .notEmpty()
    .withMessage('Prescriber name is required'),
];

/**
 * Appointment validation rules
 */
export const validateAppointment = (): ValidationChain[] => [
  body('type')
    .isIn(['checkup', 'follow_up', 'consultation', 'procedure', 'lab_work', 'therapy', 'emergency'])
    .withMessage('Invalid appointment type'),
  body('dateTime')
    .isISO8601()
    .withMessage('DateTime must be a valid ISO 8601 date'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled', 'no_show', 'in_progress'])
    .withMessage('Invalid appointment status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),
  body('duration')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('Duration must be between 5 and 480 minutes'),
];

/**
 * Alert validation rules
 */
export const validateAlert = (): ValidationChain[] => [
  body('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID format'),
  body('type')
    .isIn(['vital_sign', 'medication', 'appointment', 'lab_result', 'system', 'emergency'])
    .withMessage('Invalid alert type'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid priority level'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
];

/**
 * Auth validation rules
 */
export const validateLogin = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const validateRegister = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'nurse', 'staff'])
    .withMessage('Role must be admin, nurse, or staff'),
];

/**
 * Pagination query validation
 */
export const validatePagination = (): ValidationChain[] => [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
];