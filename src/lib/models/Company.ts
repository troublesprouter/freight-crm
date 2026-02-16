import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation {
  address: string;
  phone: string;
  shippingContact: string;
}

export interface ICompany extends Document {
  name: string;
  locations: ILocation[];
  commodityTypes: string[];
  equipmentTypes: string[];
  weeklyTruckloadVolume: string;
  managesFreightVia: string;
  hasRFP: boolean;
  rfpCycle: string;
  rfpNextDate: Date | null;
  shipmentType: string[];
  shipsOnWeekends: boolean;
  busiestSeason: string[];
  slowestSeason: string[];
  avgWeeklyVolumePeak: number;
  avgWeeklyVolumeSlow: number;
  volumeVsLastYear: string;
  whoArrangesInbound: string;
  whoArrangesOutbound: string;
  geography: string[];
  status: string;
  source: string;
  tags: string[];
  ownerRepId: mongoose.Types.ObjectId | null;
  ownedSince: Date | null;
  releasedAt: Date | null;
  lastActivityDate: Date | null;
  daysSinceLastActivity: number;
  totalTouches: number;
  discoveryProgress: number;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  shippingContact: { type: String, default: '' },
}, { _id: true });

const CompanySchema = new Schema<ICompany>({
  name: { type: String, required: true },
  locations: { type: [LocationSchema], default: [] },
  commodityTypes: { type: [String], default: [] },
  equipmentTypes: { type: [String], default: [] },
  weeklyTruckloadVolume: { type: String, default: '' },
  managesFreightVia: { type: String, default: '' },
  hasRFP: { type: Boolean, default: false },
  rfpCycle: { type: String, default: '' },
  rfpNextDate: { type: Date, default: null },
  shipmentType: { type: [String], default: [] },
  shipsOnWeekends: { type: Boolean, default: false },
  busiestSeason: { type: [String], default: [] },
  slowestSeason: { type: [String], default: [] },
  avgWeeklyVolumePeak: { type: Number, default: 0 },
  avgWeeklyVolumeSlow: { type: Number, default: 0 },
  volumeVsLastYear: { type: String, default: '' },
  whoArrangesInbound: { type: String, default: '' },
  whoArrangesOutbound: { type: String, default: '' },
  geography: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['new_researching', 'cold_outreach', 'engaged', 'qualifying', 'quoting', 'onboarding', 'active_customer', 'inactive_customer'],
    default: 'new_researching',
  },
  source: { type: String, default: '' },
  tags: { type: [String], default: [] },
  ownerRepId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  ownedSince: { type: Date, default: null },
  releasedAt: { type: Date, default: null },
  lastActivityDate: { type: Date, default: null },
  daysSinceLastActivity: { type: Number, default: 0 },
  totalTouches: { type: Number, default: 0 },
  discoveryProgress: { type: Number, default: 0 },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, { timestamps: true });

CompanySchema.index({ organizationId: 1, ownerRepId: 1 });
CompanySchema.index({ organizationId: 1, status: 1 });
CompanySchema.index({ organizationId: 1, commodityTypes: 1 });
CompanySchema.index({ organizationId: 1, equipmentTypes: 1 });

export const COMMODITY_OPTIONS = [
  'Steel coils', 'Produce', 'Citrus', 'Chemicals', 'Building materials',
  'Food & beverage', 'Paper', 'Automotive', 'Electronics', 'Pharmaceuticals',
  'Textiles', 'Lumber', 'Plastics', 'Machinery', 'Agriculture', 'Frozen foods',
  'Dairy', 'Meat', 'Seafood', 'Beverages', 'Dry goods', 'Hazmat',
];

export const EQUIPMENT_OPTIONS = [
  'Dry van', 'Reefer', 'Flatbed/open deck', 'Step deck', 'LTL', 'Intermodal',
  'Tanker', 'Hopper', 'Lowboy', 'Conestoga', 'Power only',
];

export const VOLUME_OPTIONS = [
  '0–5', '5–10', '10–20', '20–40', '40–60', '60–100', '100+',
];

export const FREIGHT_MGMT_OPTIONS = [
  'Portal (waterfall)', 'Portal (price-based)', 'Portal (price + service weighted)',
  'Email', 'Phone', 'TMS',
];

export const RFP_CYCLE_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'Semi-annual', 'Ad hoc'];

export const SHIPMENT_TYPE_OPTIONS = [
  'Customer-facing', 'Plant-to-plant', 'Inbound (raw materials)', 'Outbound (finished goods)',
];

export const SEASON_OPTIONS = ['Q1', 'Q2', 'Q3', 'Q4', 'Summer', 'Holiday', 'Spring produce', 'Year-round'];

export const VOLUME_VS_LY_OPTIONS = [
  'Up significantly', 'Up slightly', 'Flat', 'Down slightly', 'Down significantly',
];

export const GEOGRAPHY_OPTIONS = [
  'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West Coast', 'Cross-country', 'Canada', 'Mexico',
];

export const SOURCE_OPTIONS = [
  'Cold call', 'Referral', 'Inbound', 'LinkedIn', 'Website', 'Event', 'Load board',
];

export const PIPELINE_STAGES = [
  { key: 'new_researching', label: 'New / Researching', number: 1 },
  { key: 'cold_outreach', label: 'Cold Outreach', number: 2 },
  { key: 'engaged', label: 'Engaged', number: 3 },
  { key: 'qualifying', label: 'Qualifying', number: 4 },
  { key: 'quoting', label: 'Quoting / Bidding', number: 5 },
  { key: 'onboarding', label: 'Onboarding', number: 6 },
  { key: 'active_customer', label: 'Active Customer', number: 7 },
  { key: 'inactive_customer', label: 'Inactive Customer', number: 8 },
];

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
