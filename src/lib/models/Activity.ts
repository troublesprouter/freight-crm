import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
  repId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId | null;
  type: 'call_outbound' | 'call_inbound' | 'email_sent' | 'email_received' | 'text' | 'quote_sent' | 'meeting' | 'note';
  timestamp: Date;
  durationSeconds: number;
  outcome: string;
  notes: string;
  // Quote-specific
  quoteLane: string;
  quoteRate: number;
  quoteEquipment: string;
  quoteOutcome: string;
  // Email-specific (placeholder)
  emailSubject: string;
  organizationId: mongoose.Types.ObjectId;
}

const ActivitySchema = new Schema<IActivity>({
  repId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', default: null },
  type: {
    type: String,
    enum: ['call_outbound', 'call_inbound', 'email_sent', 'email_received', 'text', 'quote_sent', 'meeting', 'note'],
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  durationSeconds: { type: Number, default: 0 },
  outcome: { type: String, default: '' },
  notes: { type: String, default: '' },
  quoteLane: { type: String, default: '' },
  quoteRate: { type: Number, default: 0 },
  quoteEquipment: { type: String, default: '' },
  quoteOutcome: { type: String, enum: ['won', 'lost', 'pending', 'no_response', ''], default: '' },
  emailSubject: { type: String, default: '' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

ActivitySchema.index({ repId: 1, timestamp: -1 });
ActivitySchema.index({ companyId: 1, timestamp: -1 });
ActivitySchema.index({ organizationId: 1, repId: 1, timestamp: -1 });

export const CALL_OUTCOMES = [
  'Connected', 'Voicemail', 'No answer', 'Wrong number', 'Busy',
];

export const QUOTE_OUTCOMES = ['won', 'lost', 'pending', 'no_response'];

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
