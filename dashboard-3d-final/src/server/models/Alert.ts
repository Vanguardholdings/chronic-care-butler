import mongoose, { Schema } from 'mongoose';
import { IAlert, AlertType, AlertPriority } from '../types';

const AlertSchema = new Schema<IAlert>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(AlertType),
      required: [true, 'Alert type is required'],
    },
    priority: {
      type: String,
      enum: Object.values(AlertPriority),
      required: [true, 'Alert priority is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true,
      minlength: [1, 'Message cannot be empty'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const transformed = ret as any;
        transformed.id = transformed._id;
        delete transformed._id;
        delete transformed.__v;
        return transformed;
      },
    },
  }
);

AlertSchema.index({ acknowledged: 1, priority: 1, createdAt: -1 });
AlertSchema.index({ patientId: 1, acknowledged: 1 });
AlertSchema.index({ createdAt: -1 });

const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
export default Alert;