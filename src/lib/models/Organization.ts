import mongoose, { Schema, Document } from 'mongoose';

export interface IStageConfig {
  stageName: string;
  stageNumber: number;
  durationWeeks: number;
  metrics: string[];
  targets: Record<string, number>;
}

export interface IOrganization extends Document {
  name: string;
  settings: {
    leadCap: number;
    cooldownDays: number;
    commissionPct: number;
    baseSalary: number;
    podThreshold: number;
    stageConfigs: IStageConfig[];
  };
  inviteCode: string;
  createdAt: Date;
}

const StageConfigSchema = new Schema<IStageConfig>({
  stageName: { type: String, required: true },
  stageNumber: { type: Number, required: true },
  durationWeeks: { type: Number, required: true },
  metrics: [String],
  targets: { type: Schema.Types.Mixed, default: {} },
}, { _id: false });

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  settings: {
    leadCap: { type: Number, default: 150 },
    cooldownDays: { type: Number, default: 7 },
    commissionPct: { type: Number, default: 25 },
    baseSalary: { type: Number, default: 4000 },
    podThreshold: { type: Number, default: 4000 },
    stageConfigs: {
      type: [StageConfigSchema],
      default: [
        { stageName: 'Training', stageNumber: 1, durationWeeks: 12, metrics: ['attendance', 'trainingCompletion', 'loadsCovered'], targets: {} },
        { stageName: 'Activity Only', stageNumber: 2, durationWeeks: 4, metrics: ['callCount'], targets: { dailyCalls: 100, weeklyCalls: 400 } },
        { stageName: 'Activity + Talk Time', stageNumber: 3, durationWeeks: 4, metrics: ['callCount', 'talkTime'], targets: { dailyCalls: 100, weeklyCalls: 400, dailyTalkTimeMinutes: 45 } },
        { stageName: 'Activity + Talk Time + Revenue', stageNumber: 4, durationWeeks: 8, metrics: ['callCount', 'talkTime', 'grossProfit'], targets: { dailyCalls: 100, monthlyGP: 2500 } },
        { stageName: 'Graduated', stageNumber: 5, durationWeeks: 0, metrics: ['grossProfit'], targets: { weeklyGP: 4000 } },
      ],
    },
  },
  inviteCode: { type: String, unique: true },
}, { timestamps: true });

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
