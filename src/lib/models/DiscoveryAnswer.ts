import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscoveryAnswer extends Document {
  companyId: mongoose.Types.ObjectId;
  questionId: string;
  answer: string;
  answeredBy: mongoose.Types.ObjectId;
  answeredAt: Date;
  organizationId: mongoose.Types.ObjectId;
}

const DiscoveryAnswerSchema = new Schema<IDiscoveryAnswer>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  questionId: { type: String, required: true },
  answer: { type: String, default: '' },
  answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  answeredAt: { type: Date, default: Date.now },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

DiscoveryAnswerSchema.index({ companyId: 1 });

export const DISCOVERY_QUESTIONS = [
  { id: 'poc_locations', category: 'Points of Contact', question: 'Who are the points of contact for each location?' },
  { id: 'poc_other_locations', category: 'Points of Contact', question: 'Any other locations that ship?' },
  { id: 'order_receive', category: 'Order Process', question: 'When do they typically receive customer orders?' },
  { id: 'order_lead_time', category: 'Order Process', question: 'How much lead time between receiving an order and needing to ship?' },
  { id: 'order_frequency', category: 'Order Process', question: 'Receive orders daily or weekly? Which days?' },
  { id: 'order_consolidate', category: 'Order Process', question: 'When do they consolidate orders for the next week?' },
  { id: 'order_portal_email', category: 'Order Process', question: 'Manage freight through portal or email?', autoFillField: 'managesFreightVia' },
  { id: 'order_portal_type', category: 'Order Process', question: 'If portal: waterfall-style or price-based?' },
  { id: 'order_portal_weight', category: 'Order Process', question: 'If portal: price and service performance weighting?' },
  { id: 'rfp_has', category: 'RFP', question: 'Do they have an RFP?', autoFillField: 'hasRFP' },
  { id: 'rfp_when', category: 'RFP', question: 'When? How often? (quarterly, annually)', autoFillField: 'rfpCycle' },
  { id: 'ship_type', category: 'Shipping & Lanes', question: 'Shipments customer-facing or plant-to-plant?', autoFillField: 'shipmentType' },
  { id: 'ship_direction', category: 'Shipping & Lanes', question: 'Inbound (raw materials), outbound (finished goods), or both?' },
  { id: 'ship_who_inbound', category: 'Shipping & Lanes', question: 'Who arranges inbound?', autoFillField: 'whoArrangesInbound' },
  { id: 'ship_who_outbound', category: 'Shipping & Lanes', question: 'Who arranges outbound?', autoFillField: 'whoArrangesOutbound' },
  { id: 'ship_weekends', category: 'Shipping & Lanes', question: 'Ship over weekends? Pickups or deliveries?', autoFillField: 'shipsOnWeekends' },
  { id: 'ship_lanes_frequent', category: 'Shipping & Lanes', question: 'Most frequently run lanes?' },
  { id: 'ship_lanes_less', category: 'Shipping & Lanes', question: 'Less frequent lanes?' },
  { id: 'ship_lanes_hard', category: 'Shipping & Lanes', question: 'Lanes with higher rate of service failures or difficulty finding trucks?' },
  { id: 'season_busy', category: 'Seasonality & Volume', question: 'When are your busiest times of year?', autoFillField: 'busiestSeason' },
  { id: 'season_slow', category: 'Seasonality & Volume', question: 'When are your slowest periods?', autoFillField: 'slowestSeason' },
  { id: 'season_vol_busy', category: 'Seasonality & Volume', question: 'Average weekly volumes in busiest vs slowest?', autoFillField: 'avgWeeklyVolumePeak' },
  { id: 'season_vol_vs_ly', category: 'Seasonality & Volume', question: 'Current volume compared to same time last year?', autoFillField: 'volumeVsLastYear' },
  { id: 'season_vol_next', category: 'Seasonality & Volume', question: 'Expected volume next week / month / quarter?' },
  { id: 'season_sales_vs_ly', category: 'Seasonality & Volume', question: "This year's sales/volumes compared to last year?" },
];

export default mongoose.models.DiscoveryAnswer || mongoose.model<IDiscoveryAnswer>('DiscoveryAnswer', DiscoveryAnswerSchema);
