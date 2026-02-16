import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  repId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId | null;
  type: 'call' | 'email' | 'meeting' | 'note';
  timestamp: Date;
  durationSeconds: number;
  outcome: 'no_answer' | 'voicemail' | 'connected' | 'meeting_booked' | null;
  notes: string;
  recordingUrl: string;
  organizationId: mongoose.Types.ObjectId;
}

const ActivitySchema = new Schema<IActivity>({
  repId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
  type: { type: String, enum: ['call', 'email', 'meeting', 'note'], required: true },
  timestamp: { type: Date, default: Date.now },
  durationSeconds: { type: Number, default: 0 },
  outcome: { type: String, enum: ['no_answer', 'voicemail', 'connected', 'meeting_booked', null], default: null },
  notes: { type: String, default: '' },
  recordingUrl: { type: String, default: '' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

ActivitySchema.index({ repId: 1, timestamp: -1 });
ActivitySchema.index({ companyId: 1, timestamp: -1 });
ActivitySchema.index({ organizationId: 1, repId: 1, timestamp: -1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
