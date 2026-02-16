import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
  name: string;
  companyId: mongoose.Types.ObjectId;
  contactIds: mongoose.Types.ObjectId[];
  stage: string;
  lanes: string;
  equipmentType: string;
  estimatedWeeklyLoads: number;
  estimatedMarginPerLoad: number;
  estimatedWeeklyGP: number;
  actualLoads: number;
  actualMargin: number;
  dateWonLost: Date | null;
  lostReason: string;
  repId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const DealSchema = new Schema<IDeal>({
  name: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  contactIds: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  stage: {
    type: String,
    enum: ['new_researching', 'cold_outreach', 'engaged', 'qualifying', 'quoting', 'onboarding', 'active_customer', 'inactive_customer'],
    default: 'new_researching',
  },
  lanes: { type: String, default: '' },
  equipmentType: { type: String, default: '' },
  estimatedWeeklyLoads: { type: Number, default: 0 },
  estimatedMarginPerLoad: { type: Number, default: 0 },
  estimatedWeeklyGP: { type: Number, default: 0 },
  actualLoads: { type: Number, default: 0 },
  actualMargin: { type: Number, default: 0 },
  dateWonLost: { type: Date, default: null },
  lostReason: { type: String, default: '' },
  repId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

DealSchema.index({ companyId: 1 });
DealSchema.index({ repId: 1 });
DealSchema.index({ organizationId: 1, stage: 1 });

// Auto-calculate estimated weekly GP
DealSchema.pre('save', function () {
  this.estimatedWeeklyGP = this.estimatedWeeklyLoads * this.estimatedMarginPerLoad;
});

export const LOST_REASONS = [
  'Price', 'Service', 'Went with competitor', 'No response', 'Not a fit', 'Timing',
];

export default mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
