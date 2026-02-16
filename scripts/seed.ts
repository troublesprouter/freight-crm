import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mongo_user:y.3.CNPMGvwF9njuyRUpseuCp@cluster0.d0hnnfp.mongodb.net/freightpit?appName=Cluster0';

// Inline schemas to avoid import issues
const OrganizationSchema = new mongoose.Schema({
  name: String,
  settings: {
    leadCap: { type: Number, default: 150 },
    cooldownDays: { type: Number, default: 7 },
    commissionPct: { type: Number, default: 25 },
    baseSalary: { type: Number, default: 4000 },
    podThreshold: { type: Number, default: 4000 },
    stageConfigs: { type: Array, default: [] },
  },
  inviteCode: String,
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String, email: String, passwordHash: String,
  role: String, organizationId: mongoose.Schema.Types.ObjectId,
  hireDate: Date, stage: Number, leadCap: Number,
  salaryMonthly: Number, commissionPct: Number,
  trainingClass: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });

const CompanySchema = new mongoose.Schema({
  name: String, address: String, website: String, industry: String,
  ownerRepId: { type: mongoose.Schema.Types.ObjectId, default: null },
  ownedSince: Date, status: String,
  qualification: { lanes: [String], commodities: [String], equipmentTypes: [String], estWeeklyLoads: Number },
  tags: [String], releasedAt: Date, nextFollowUp: Date,
  lastContactDate: Date, totalTouches: { type: Number, default: 0 },
  organizationId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const ContactSchema = new mongoose.Schema({
  companyId: mongoose.Schema.Types.ObjectId, name: String,
  title: String, phone: String, email: String,
  organizationId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const ActivitySchema = new mongoose.Schema({
  repId: mongoose.Schema.Types.ObjectId, companyId: mongoose.Schema.Types.ObjectId,
  contactId: mongoose.Schema.Types.ObjectId, type: String,
  timestamp: Date, durationSeconds: Number, outcome: String,
  notes: String, recordingUrl: String,
  organizationId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const LoadSchema = new mongoose.Schema({
  repId: mongoose.Schema.Types.ObjectId, companyId: mongoose.Schema.Types.ObjectId,
  pickupDate: Date, deliveryDate: Date, origin: String, destination: String,
  revenue: Number, carrierCost: Number, grossProfit: Number,
  organizationId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean
  const db = mongoose.connection.db!;
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    await db.dropCollection(c.name);
  }
  console.log('Cleaned database');

  const Organization = mongoose.model('Organization', OrganizationSchema);
  const User = mongoose.model('User', UserSchema);
  const Company = mongoose.model('Company', CompanySchema);
  const Contact = mongoose.model('Contact', ContactSchema);
  const Activity = mongoose.model('Activity', ActivitySchema);
  const Load = mongoose.model('Load', LoadSchema);

  // Create org
  const org = await Organization.create({
    name: 'Demo Freight Brokerage',
    inviteCode: 'DEMO2026',
    settings: {
      leadCap: 150,
      cooldownDays: 7,
      commissionPct: 25,
      baseSalary: 4000,
      podThreshold: 4000,
    },
  });

  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  const admin = await User.create({
    name: 'Mike Manager', email: 'admin@demo.com', passwordHash,
    role: 'admin', organizationId: org._id,
    hireDate: new Date('2024-01-01'), stage: 5, salaryMonthly: 6000, commissionPct: 25,
    trainingClass: 'Leadership',
  });

  const reps = await User.create([
    { name: 'Sarah Johnson', email: 'sarah@demo.com', passwordHash, role: 'rep', organizationId: org._id, hireDate: new Date('2025-08-01'), stage: 4, salaryMonthly: 4000, commissionPct: 25, trainingClass: 'Class of Aug 2025' },
    { name: 'Jake Williams', email: 'jake@demo.com', passwordHash, role: 'rep', organizationId: org._id, hireDate: new Date('2025-10-01'), stage: 3, salaryMonthly: 4000, commissionPct: 25, trainingClass: 'Class of Oct 2025' },
    { name: 'Emily Chen', email: 'emily@demo.com', passwordHash, role: 'rep', organizationId: org._id, hireDate: new Date('2025-12-01'), stage: 2, salaryMonthly: 4000, commissionPct: 25, trainingClass: 'Class of Dec 2025' },
    { name: 'Tom Broker', email: 'tom@demo.com', passwordHash, role: 'rep', organizationId: org._id, hireDate: new Date('2026-01-15'), stage: 1, salaryMonthly: 3500, commissionPct: 25, trainingClass: 'Class of Jan 2026' },
  ]);

  const companyNames = [
    { name: 'Midwest Produce Co', industry: 'Agriculture', address: 'Des Moines, IA', tags: ['food-grade', 'reefer'] },
    { name: 'Great Lakes Steel', industry: 'Manufacturing', address: 'Detroit, MI', tags: ['flatbed', 'heavy'] },
    { name: 'Southern Lumber Supply', industry: 'Construction', address: 'Atlanta, GA', tags: ['flatbed'] },
    { name: 'Pacific Electronics Corp', industry: 'Technology', address: 'Portland, OR', tags: ['high-value'] },
    { name: 'Heartland Foods Inc', industry: 'Food & Beverage', address: 'Kansas City, MO', tags: ['reefer', 'food-grade'] },
    { name: 'Mountain Mining Resources', industry: 'Mining', address: 'Denver, CO', tags: ['flatbed', 'heavy'] },
    { name: 'Coastal Fishing Enterprises', industry: 'Seafood', address: 'Seattle, WA', tags: ['reefer'] },
    { name: 'Prairie Wind Energy', industry: 'Energy', address: 'Oklahoma City, OK', tags: ['oversized'] },
    { name: 'Valley Pharmaceutical', industry: 'Healthcare', address: 'Indianapolis, IN', tags: ['temperature-controlled'] },
    { name: 'Metro Distribution LLC', industry: 'Logistics', address: 'Chicago, IL', tags: ['dry-van'] },
    { name: 'Sunshine Citrus Growers', industry: 'Agriculture', address: 'Tampa, FL', tags: ['reefer', 'food-grade'] },
    { name: 'Northern Paper Mills', industry: 'Manufacturing', address: 'Green Bay, WI', tags: ['dry-van'] },
    { name: 'Delta Chemical Products', industry: 'Chemical', address: 'Houston, TX', tags: ['hazmat', 'tanker'] },
    { name: 'Rocky Mountain Brewing', industry: 'Food & Beverage', address: 'Boulder, CO', tags: ['reefer'] },
    { name: 'Eastern Textile Group', industry: 'Textiles', address: 'Charlotte, NC', tags: ['dry-van'] },
    { name: 'Lone Star Cattle Ranch', industry: 'Agriculture', address: 'Dallas, TX', tags: ['livestock'] },
    { name: 'Liberty Auto Parts', industry: 'Automotive', address: 'Columbus, OH', tags: ['dry-van'] },
    { name: 'Bayou Seafood Distributors', industry: 'Seafood', address: 'New Orleans, LA', tags: ['reefer'] },
    { name: 'Alpine Dairy Farms', industry: 'Dairy', address: 'Madison, WI', tags: ['reefer', 'food-grade'] },
    { name: 'Central Plains Grain', industry: 'Agriculture', address: 'Omaha, NE', tags: ['hopper', 'dry-van'] },
  ];

  // Create companies — some owned, some cold
  const companies = [];
  for (let i = 0; i < companyNames.length; i++) {
    const c = companyNames[i];
    const isOwned = i < 12; // first 12 are owned
    const ownerRep = isOwned ? reps[i % reps.length] : null;

    const company = await Company.create({
      ...c,
      ownerRepId: ownerRep?._id || null,
      ownedSince: ownerRep ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
      status: isOwned ? ['cold', 'warm', 'hot', 'quoting'][Math.floor(Math.random() * 4)] : 'cold',
      qualification: {
        lanes: ['SE → MW', 'NE → SE', 'MW → NE'][Math.floor(Math.random() * 3)].split(',').map(s => s.trim()),
        commodities: c.tags.slice(0, 1),
        equipmentTypes: ['Dry Van', 'Reefer', 'Flatbed'].slice(0, Math.floor(Math.random() * 3) + 1),
        estWeeklyLoads: Math.floor(Math.random() * 20) + 1,
      },
      nextFollowUp: isOwned ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      lastContactDate: isOwned ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
      totalTouches: isOwned ? Math.floor(Math.random() * 15) + 1 : 0,
      organizationId: org._id,
    });
    companies.push(company);

    // Create contacts for owned companies
    if (isOwned) {
      const numContacts = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numContacts; j++) {
        await Contact.create({
          companyId: company._id,
          name: ['John Smith', 'Jane Doe', 'Bob Miller', 'Alice Johnson'][j % 4],
          title: ['Logistics Manager', 'VP Operations', 'Shipping Coordinator'][j % 3],
          phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          email: `contact${j}@${c.name.toLowerCase().replace(/\s/g, '')}.com`,
          organizationId: org._id,
        });
      }
    }
  }

  // Create activities for owned companies
  const outcomes = ['no_answer', 'voicemail', 'connected', 'meeting_booked'];
  for (const rep of reps) {
    const repCompanies = companies.filter(c => c.ownerRepId?.toString() === rep._id.toString());
    for (const company of repCompanies) {
      const numActivities = Math.floor(Math.random() * 20) + 5;
      for (let i = 0; i < numActivities; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        await Activity.create({
          repId: rep._id,
          companyId: company._id,
          type: Math.random() > 0.2 ? 'call' : Math.random() > 0.5 ? 'email' : 'note',
          timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          durationSeconds: Math.floor(Math.random() * 600) + 30,
          outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          notes: ['Good conversation about lanes', 'Left voicemail', 'Discussed pricing', 'Talked about reefer needs', 'No pick up'][Math.floor(Math.random() * 5)],
          organizationId: org._id,
        });
      }
    }

    // Create some loads for reps in stages 4-5
    if ((rep as any).stage >= 4) {
      const numLoads = Math.floor(Math.random() * 10) + 3;
      for (let i = 0; i < numLoads; i++) {
        const revenue = Math.floor(Math.random() * 3000) + 1000;
        const carrierCost = Math.floor(revenue * (0.75 + Math.random() * 0.15));
        const daysAgo = Math.floor(Math.random() * 60);
        const repCompany = repCompanies[Math.floor(Math.random() * repCompanies.length)];
        if (!repCompany) continue;
        await Load.create({
          repId: rep._id,
          companyId: repCompany._id,
          pickupDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          deliveryDate: new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000),
          origin: ['Chicago, IL', 'Dallas, TX', 'Atlanta, GA'][Math.floor(Math.random() * 3)],
          destination: ['New York, NY', 'Los Angeles, CA', 'Miami, FL'][Math.floor(Math.random() * 3)],
          revenue,
          carrierCost,
          grossProfit: revenue - carrierCost,
          organizationId: org._id,
        });
      }
    }
  }

  console.log('Seed complete!');
  console.log('Login: admin@demo.com / password123 (Admin)');
  console.log('Login: sarah@demo.com / password123 (Rep, Stage 4)');
  console.log('Login: jake@demo.com / password123 (Rep, Stage 3)');
  console.log('Login: emily@demo.com / password123 (Rep, Stage 2)');
  console.log('Login: tom@demo.com / password123 (Rep, Stage 1)');
  console.log('Invite code: DEMO2026');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
