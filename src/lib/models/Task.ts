import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  notes: string;
  dueDate: Date;
  dueTime: string;
  companyId: mongoose.Types.ObjectId | null;
  contactId: mongoose.Types.ObjectId | null;
  repId: mongoose.Types.ObjectId;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  triggerSource: 'manual' | 'rfp_reminder' | 'inactive_30' | 'inactive_60' | 'email_opened' | 'no_contact_7d' | 'quarterly_review' | 'stale_prospect';
  organizationId: mongoose.Types.ObjectId;
  completedAt: Date | null;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  notes: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  dueTime: { type: String, default: '' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
  repId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['pending', 'completed', 'overdue'], default: 'pending' },
  triggerSource: {
    type: String,
    enum: ['manual', 'rfp_reminder', 'inactive_30', 'inactive_60', 'email_opened', 'no_contact_7d', 'quarterly_review', 'stale_prospect'],
    default: 'manual',
  },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

TaskSchema.index({ repId: 1, dueDate: 1, status: 1 });
TaskSchema.index({ organizationId: 1, repId: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
