import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  title: string;
  phone: string;
  email: string;
  role: string;
  isPrimary: boolean;
  locationId: string;
  // Personal details
  personalKids: string;
  personalSportsTeam: string;
  personalHobbies: string;
  personalPastJobs: string;
  personalNotes: string;
  preferredContactMethod: string;
  bestTimeToReach: string;
  organizationId: mongoose.Types.ObjectId;
}

const ContactSchema = new Schema<IContact>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  title: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  role: {
    type: String,
    enum: ['decision_maker', 'freight_tenderer_active', 'freight_tenderer_prospect', 'ops_logistics', 'accounts_payable', 'other'],
    default: 'other',
  },
  isPrimary: { type: Boolean, default: false },
  locationId: { type: String, default: '' },
  personalKids: { type: String, default: '' },
  personalSportsTeam: { type: String, default: '' },
  personalHobbies: { type: String, default: '' },
  personalPastJobs: { type: String, default: '' },
  personalNotes: { type: String, default: '' },
  preferredContactMethod: { type: String, enum: ['Phone', 'Email', 'Text', ''], default: '' },
  bestTimeToReach: { type: String, default: '' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

ContactSchema.index({ companyId: 1 });

export const CONTACT_ROLES = [
  { key: 'decision_maker', label: 'Decision Maker' },
  { key: 'freight_tenderer_active', label: 'Freight Tenderer (Active)' },
  { key: 'freight_tenderer_prospect', label: 'Freight Tenderer (Not Yet)' },
  { key: 'ops_logistics', label: 'Ops / Logistics' },
  { key: 'accounts_payable', label: 'Accounts Payable' },
  { key: 'other', label: 'Other' },
];

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
