import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  settings: {
    leadCap: number;
    cooldownDays: number;
    commissionPct: number;
    baseSalary: number;
    commissionThreshold: number;
    supportStaffCost: number;
    trailingAvgWeeks: number;
    inactiveWarningDays: number;
    inactiveAutoMoveDays: number;
    benchmarks: {
      month: number;
      callsPerDay: number;
      talkTimeMinutes: number;
      monthlyGP: number;
      weeklyGP: number;
    }[];
  };
  inviteCode: string;
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  settings: {
    leadCap: { type: Number, default: 150 },
    cooldownDays: { type: Number, default: 7 },
    commissionPct: { type: Number, default: 25 },
    baseSalary: { type: Number, default: 4000 },
    commissionThreshold: { type: Number, default: 4000 },
    supportStaffCost: { type: Number, default: 1000 },
    trailingAvgWeeks: { type: Number, default: 12 },
    inactiveWarningDays: { type: Number, default: 30 },
    inactiveAutoMoveDays: { type: Number, default: 60 },
    benchmarks: {
      type: [{
        month: Number,
        callsPerDay: Number,
        talkTimeMinutes: Number,
        monthlyGP: Number,
        weeklyGP: Number,
      }],
      default: [
        { month: 1, callsPerDay: 100, talkTimeMinutes: 0, monthlyGP: 0, weeklyGP: 0 },
        { month: 2, callsPerDay: 100, talkTimeMinutes: 30, monthlyGP: 0, weeklyGP: 0 },
        { month: 3, callsPerDay: 100, talkTimeMinutes: 45, monthlyGP: 0, weeklyGP: 0 },
        { month: 4, callsPerDay: 0, talkTimeMinutes: 0, monthlyGP: 1200, weeklyGP: 0 },
        { month: 5, callsPerDay: 0, talkTimeMinutes: 0, monthlyGP: 1200, weeklyGP: 0 },
        { month: 6, callsPerDay: 0, talkTimeMinutes: 0, monthlyGP: 2500, weeklyGP: 0 },
        { month: 7, callsPerDay: 0, talkTimeMinutes: 0, monthlyGP: 2500, weeklyGP: 0 },
        { month: 8, callsPerDay: 0, talkTimeMinutes: 0, monthlyGP: 0, weeklyGP: 4000 },
      ],
    },
  },
  inviteCode: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
