import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'manager' | 'rep';
  hireDate: Date;
  leadCap: number;
  salaryMonthly: number;
  commissionPct: number;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'rep'], default: 'rep' },
  hireDate: { type: Date, default: Date.now },
  leadCap: { type: Number, default: 150 },
  salaryMonthly: { type: Number, default: 4000 },
  commissionPct: { type: Number, default: 25 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
