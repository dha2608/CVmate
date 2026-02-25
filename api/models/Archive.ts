import mongoose, { Schema } from 'mongoose';

export interface IArchive {
  collection: string;
  originalId: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  archivedAt: Date;
  reason?: string;
}

const archiveSchema = new Schema<IArchive>({
  collection: {
    type: String,
    required: true,
    index: true,
  },
  originalId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  data: {
    type: Schema.Types.Mixed,
    required: true,
  },
  archivedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  reason: {
    type: String,
    trim: true,
  },
});

archiveSchema.index({ collection: 1, archivedAt: -1 });

export default mongoose.model<IArchive>('Archive', archiveSchema);

