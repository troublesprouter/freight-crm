import mongoose, { Schema, Document } from 'mongoose';

export interface IPod extends Document {
  leadRepId: mongoose.Types.ObjectId;
  supportMembers: {
    userId: mongoose.Types.ObjectId;
    role: string;
    salary: number;
  }[];
  costSplitPct: number;
  organizationId: mongoose.Types.ObjectId;
}

const PodSchema = new Schema<IPod>({
  leadRepId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supportMembers: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: String,
    salary: Number,
  }],
  costSplitPct: { type: Number, default: 0 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

export default mongoose.models.Pod || mongoose.model<IPod>('Pod', PodSchema);
