import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ─── User Types ───────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  STAFF = 'staff',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ─── Patient Types ────────────────────────────────────────────
export enum PatientStatus {
  STABLE = 'stable',
  CRITICAL = 'critical',
  RECOVERING = 'recovering',
  DISCHARGED = 'discharged',
  ADMITTED = 'admitted',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export interface IVitals {
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
  timestamp: Date;
}

export interface IPatient extends Document {
  _id: Types.ObjectId;
  name: string;
  age: number;
  gender: Gender;
  condition: string;
  status: PatientStatus;
  room: string;
  doctor: string;
  assignedNurses: Types.ObjectId[];
  assignedStaff: Types.ObjectId[];
  vitals: IVitals;
  medications: Types.ObjectId[];
  appointments: Types.ObjectId[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Medication Types ─────────────────────────────────────────
export enum MedicationFrequency {
  ONCE_DAILY = 'once_daily',
  TWICE_DAILY = 'twice_daily',
  THREE_TIMES_DAILY = 'three_times_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  AS_NEEDED = 'as_needed',
  WEEKLY = 'weekly',
}

export interface IAdherenceRecord {
  date: Date;
  taken: boolean;
  notes?: string;
}

export interface IMedication extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  name: string;
  dosage: string;
  frequency: MedicationFrequency;
  startDate: Date;
  endDate?: Date;
  adherence: IAdherenceRecord[];
  prescribedBy: string;
  isActive: boolean;
  sideEffects?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Appointment Types ────────────────────────────────────────
export enum AppointmentType {
  CHECKUP = 'checkup',
  FOLLOW_UP = 'follow_up',
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  LAB_WORK = 'lab_work',
  THERAPY = 'therapy',
  EMERGENCY = 'emergency',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  IN_PROGRESS = 'in_progress',
}

export interface IAppointment extends Document {
  _id: Types.ObjectId;
  patientId: Types.ObjectId;
  type: AppointmentType;
  dateTime: Date;
  status: AppointmentStatus;
  notes?: string;
  doctor?: string;
  location?: string;
  duration?: number;
  reminderSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Alert Types ──────────────────────────────────────────────
export enum AlertType {
  VITAL_SIGN = 'vital_sign',
  MEDICATION = 'medication',
  APPOINTMENT = 'appointment',
  LAB_RESULT = 'lab_result',
  SYSTEM = 'system',
  EMERGENCY = 'emergency',
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IAlert extends Document {
  _id: Types.ObjectId;
  patientId?: Types.ObjectId;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: Types.ObjectId;
  acknowledgedAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Request Types ────────────────────────────────────────────
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

// ─── API Response Types ───────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}