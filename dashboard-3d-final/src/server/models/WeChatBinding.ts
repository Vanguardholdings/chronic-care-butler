import mongoose, { Schema } from 'mongoose';
import { Types } from 'mongoose';

export interface IWeChatBinding {
  openId: string;
  patientId: Types.ObjectId;
  patientName: string;
  boundBy?: Types.ObjectId;
  boundAt: Date;
  lastInteraction?: Date;
  isActive: boolean;
}

const WeChatBindingSchema = new Schema<IWeChatBinding>(
  {
    openId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    boundBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    boundAt: {
      type: Date,
      default: Date.now,
    },
    lastInteraction: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Index for queries
WeChatBindingSchema.index({ patientId: 1 });
WeChatBindingSchema.index({ isActive: 1 });

const WeChatBinding = mongoose.model<IWeChatBinding>('WeChatBinding', WeChatBindingSchema);
export default WeChatBinding;
