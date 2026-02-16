import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  title: string;
  phone: string;
  email: string;
  organizationId: mongoose.Types.ObjectId;
}

const ContactSchema = new Schema<IContact>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  title: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

ContactSchema.index({ companyId: 1 });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
