import mongoose, { Document, Schema } from 'mongoose';

export interface IPushSubscription extends Document {
  user: mongoose.Types.ObjectId;
  endpoint: string;
  auth: string;
  p256dh: string;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  auth: {
    type: String,
    required: true,
  },
  p256dh: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

pushSubscriptionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);

