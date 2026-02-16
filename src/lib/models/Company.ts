import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  address: string;
  website: string;
  industry: string;
  ownerRepId: mongoose.Types.ObjectId | null;
  ownedSince: Date | null;
  status: 'cold' | 'warm' | 'hot' | 'quoting' | 'onboarded' | 'active' | 'released';
  qualification: {
    lanes: string[];
    commodities: string[];
    equipmentTypes: string[];
    estWeeklyLoads: number;
  };
  tags: string[];
  releasedAt: Date | null;
  nextFollowUp: Date | null;
  lastContactDate: Date | null;
  totalTouches: number;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  address: { type: String, default: '' },
  website: { type: String, default: '' },
  industry: { type: String, default: '' },
  ownerRepId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  ownedSince: { type: Date, default: null },
  status: { type: String, enum: ['cold', 'warm', 'hot', 'quoting', 'onboarded', 'active', 'released'], default: 'cold' },
  qualification: {
    lanes: { type: [String], default: [] },
    commodities: { type: [String], default: [] },
    equipmentTypes: { type: [String], default: [] },
    estWeeklyLoads: { type: Number, default: 0 },
  },
  tags: { type: [String], default: [] },
  releasedAt: { type: Date, default: null },
  nextFollowUp: { type: Date, default: null },
  lastContactDate: { type: Date, default: null },
  totalTouches: { type: Number, default: 0 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

CompanySchema.index({ organizationId: 1, ownerRepId: 1 });
CompanySchema.index({ organizationId: 1, status: 1 });

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
