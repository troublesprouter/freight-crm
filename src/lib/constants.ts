// Shared constants — safe for both client and server components

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

export const CONTACT_ROLES = [
  { key: 'decision_maker', label: 'Decision Maker' },
  { key: 'freight_tenderer_active', label: 'Freight Tenderer (Active)' },
  { key: 'freight_tenderer_prospect', label: 'Freight Tenderer (Not Yet)' },
  { key: 'ops_logistics', label: 'Ops / Logistics' },
  { key: 'accounts_payable', label: 'Accounts Payable' },
  { key: 'other', label: 'Other' },
];

export const CALL_OUTCOMES = [
  'Connected', 'Voicemail', 'No answer', 'Wrong number', 'Busy',
];

export const QUOTE_OUTCOMES = ['won', 'lost', 'pending', 'no_response'];

export const LOST_REASONS = [
  'Price', 'Service', 'Went with competitor', 'No response', 'Not a fit', 'Timing',
];

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
