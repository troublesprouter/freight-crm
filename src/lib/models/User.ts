import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'rep';
  organizationId: mongoose.Types.ObjectId;
  hireDate: Date;
  stage: number;
  leadCap?: number;
  salaryMonthly: number;
  commissionPct: number;
  trainingClass?: string;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'rep'], default: 'rep' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  hireDate: { type: Date, default: Date.now },
  stage: { type: Number, default: 1, min: 1, max: 5 },
  leadCap: { type: Number },
  salaryMonthly: { type: Number, default: 4000 },
  commissionPct: { type: Number, default: 25 },
  trainingClass: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
