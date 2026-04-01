import mongoose, { Schema } from 'mongoose';
import { IMedication, MedicationFrequency } from '../types';

const AdherenceRecordSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    taken: {
      type: Boolean,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Adherence notes cannot exceed 500 characters'],
    },
  },
  { _id: false }
);

const MedicationSchema = new Schema<IMedication>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      minlength: [1, 'Medication name cannot be empty'],
      maxlength: [200, 'Medication name cannot exceed 200 characters'],
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      enum: Object.values(MedicationFrequency),
      required: [true, 'Frequency is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IMedication, value: Date | undefined) {
          if (!value) return true;
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    adherence: [AdherenceRecordSchema],
    prescribedBy: {
      type: String,
      required: [true, 'Prescriber name is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sideEffects: [
      {
        type: String,
        trim: true,
      },
    ],
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

MedicationSchema.index({ patientId: 1, isActive: 1 });
MedicationSchema.index({ name: 1 });

const Medication = mongoose.model<IMedication>('Medication', MedicationSchema);
export default Medication;