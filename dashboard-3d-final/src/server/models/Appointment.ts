import mongoose, { Schema } from 'mongoose';
import { IAppointment, AppointmentType, AppointmentStatus } from '../types';

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      required: [true, 'Appointment type is required'],
    },
    dateTime: {
      type: Date,
      required: [true, 'Appointment date/time is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    doctor: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      min: [5, 'Duration must be at least 5 minutes'],
      max: [480, 'Duration cannot exceed 8 hours'],
      default: 30,
    },
    reminderSent: {
      type: Boolean,
      default: false,
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

AppointmentSchema.index({ patientId: 1, dateTime: -1 });
AppointmentSchema.index({ status: 1, dateTime: 1 });
AppointmentSchema.index({ doctor: 1, dateTime: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
export default Appointment;