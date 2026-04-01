import mongoose, { Schema } from 'mongoose';
import { IPatient, PatientStatus, Gender } from '../types';

const VitalsSchema = new Schema(
  {
    heartRate: {
      type: Number,
      required: true,
      min: [0, 'Heart rate cannot be negative'],
      max: [300, 'Heart rate value seems invalid'],
    },
    bloodPressureSystolic: {
      type: Number,
      required: true,
      min: [0, 'Systolic BP cannot be negative'],
      max: [300, 'Systolic BP value seems invalid'],
    },
    bloodPressureDiastolic: {
      type: Number,
      required: true,
      min: [0, 'Diastolic BP cannot be negative'],
      max: [200, 'Diastolic BP value seems invalid'],
    },
    temperature: {
      type: Number,
      required: true,
      min: [90, 'Temperature value seems too low (°F)'],
      max: [110, 'Temperature value seems too high (°F)'],
    },
    oxygenSaturation: {
      type: Number,
      required: true,
      min: [0, 'O2 saturation cannot be negative'],
      max: [100, 'O2 saturation cannot exceed 100%'],
    },
    respiratoryRate: {
      type: Number,
      required: true,
      min: [0, 'Respiratory rate cannot be negative'],
      max: [60, 'Respiratory rate value seems invalid'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const EmergencyContactSchema = new Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  { _id: false }
);

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age value seems invalid'],
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      required: [true, 'Gender is required'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PatientStatus),
      default: PatientStatus.STABLE,
      required: true,
      index: true,
    },
    room: {
      type: String,
      required: [true, 'Room assignment is required'],
      trim: true,
    },
    doctor: {
      type: String,
      required: [true, 'Assigned doctor is required'],
      trim: true,
    },
    assignedNurses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    assignedStaff: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      },
    ],
    vitals: {
      type: VitalsSchema,
      required: [true, 'Initial vitals are required'],
    },
    medications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Medication',
      },
    ],
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    emergencyContact: EmergencyContactSchema,
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes
PatientSchema.index({ status: 1, doctor: 1 });
PatientSchema.index({ room: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ name: 'text', condition: 'text' });

const Patient = mongoose.model<IPatient>('Patient', PatientSchema);
export default Patient;