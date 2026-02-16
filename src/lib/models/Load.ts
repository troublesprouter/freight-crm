import mongoose, { Schema, Document } from 'mongoose';

export interface ILoad extends Document {
  repId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  pickupDate: Date;
  deliveryDate: Date;
  origin: string;
  destination: string;
  revenue: number;
  carrierCost: number;
  grossProfit: number;
  organizationId: mongoose.Types.ObjectId;
}

const LoadSchema = new Schema<ILoad>({
  repId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  pickupDate: { type: Date, required: true },
  deliveryDate: { type: Date },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  revenue: { type: Number, default: 0 },
  carrierCost: { type: Number, default: 0 },
  grossProfit: { type: Number, default: 0 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

LoadSchema.index({ repId: 1, pickupDate: -1 });
LoadSchema.index({ organizationId: 1 });

export default mongoose.models.Load || mongoose.model<ILoad>('Load', LoadSchema);
