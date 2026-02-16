import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mongo_user:y.3.CNPMGvwF9njuyRUpseuCp@cluster0.d0hnnfp.mongodb.net/freightpit?appName=Cluster0';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db!;

  // Clean existing data
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }

  // Create organization
  const org = await db.collection('organizations').insertOne({
    name: 'Demo Freight Brokerage',
    settings: {
      leadCap: 150,
      cooldownDays: 7,
      commissionPct: 25,
      baseSalary: 4000,
      commissionThreshold: 4000,
      supportStaffCost: 1000,
      trailingAvgWeeks: 12,
      inactiveWarningDays: 30,
      inactiveAutoMoveDays: 60,
      benchmarks: [
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
    inviteCode: 'DEMO2026',
    createdAt: new Date(),
  });

  const orgId = org.insertedId;
  const hash = await bcrypt.hash('password123', 10);

  // Create users
  const admin = await db.collection('users').insertOne({
    name: 'Sarah Manager',
    email: 'admin@demo.com',
    passwordHash: hash,
    role: 'admin',
    hireDate: new Date('2024-01-01'),
    leadCap: 150,
    salaryMonthly: 6000,
    commissionPct: 25,
    organizationId: orgId,
    createdAt: new Date(),
  });

  const rep1 = await db.collection('users').insertOne({
    name: 'Jake Thompson',
    email: 'jake@demo.com',
    passwordHash: hash,
    role: 'rep',
    hireDate: new Date('2025-09-01'),
    leadCap: 150,
    salaryMonthly: 4000,
    commissionPct: 25,
    organizationId: orgId,
    createdAt: new Date(),
  });

  const rep2 = await db.collection('users').insertOne({
    name: 'Maria Garcia',
    email: 'maria@demo.com',
    passwordHash: hash,
    role: 'rep',
    hireDate: new Date('2025-11-01'),
    leadCap: 150,
    salaryMonthly: 4000,
    commissionPct: 25,
    organizationId: orgId,
    createdAt: new Date(),
  });

  // Create companies with freight-specific data
  const companyData = [
    { name: 'Midwest Steel Corp', owner: rep1.insertedId, status: 'qualifying', commodityTypes: ['Steel coils', 'Automotive'], equipmentTypes: ['Flatbed/open deck', 'Step deck'], weeklyTruckloadVolume: '20–40', managesFreightVia: 'Email', geography: ['Midwest', 'Northeast'], source: 'Cold call', discoveryProgress: 62, totalTouches: 18 },
    { name: 'Florida Citrus Growers', owner: rep1.insertedId, status: 'quoting', commodityTypes: ['Citrus', 'Produce'], equipmentTypes: ['Reefer'], weeklyTruckloadVolume: '40–60', managesFreightVia: 'Portal (waterfall)', hasRFP: true, rfpCycle: 'Annual', geography: ['Southeast'], source: 'Referral', discoveryProgress: 85, totalTouches: 25 },
    { name: 'Pacific Paper Products', owner: rep1.insertedId, status: 'engaged', commodityTypes: ['Paper'], equipmentTypes: ['Dry van'], weeklyTruckloadVolume: '10–20', managesFreightVia: 'TMS', geography: ['West Coast'], source: 'Cold call', discoveryProgress: 35, totalTouches: 7 },
    { name: 'Gulf Chemical Transport', owner: rep1.insertedId, status: 'active_customer', commodityTypes: ['Chemicals', 'Hazmat'], equipmentTypes: ['Tanker'], weeklyTruckloadVolume: '5–10', managesFreightVia: 'Email', geography: ['Southwest', 'Southeast'], source: 'LinkedIn', discoveryProgress: 90, totalTouches: 42 },
    { name: 'Southern Building Supply', owner: rep1.insertedId, status: 'cold_outreach', commodityTypes: ['Building materials', 'Lumber'], equipmentTypes: ['Flatbed/open deck'], weeklyTruckloadVolume: '10–20', geography: ['Southeast'], source: 'Cold call', discoveryProgress: 8, totalTouches: 3 },
    { name: 'Great Lakes Dairy', owner: rep2.insertedId, status: 'qualifying', commodityTypes: ['Dairy', 'Frozen foods'], equipmentTypes: ['Reefer'], weeklyTruckloadVolume: '20–40', managesFreightVia: 'Portal (price-based)', geography: ['Midwest', 'Northeast'], source: 'Cold call', discoveryProgress: 55, totalTouches: 14 },
    { name: 'Texas Auto Parts Inc', owner: rep2.insertedId, status: 'engaged', commodityTypes: ['Automotive', 'Machinery'], equipmentTypes: ['Dry van', 'Flatbed/open deck'], weeklyTruckloadVolume: '10–20', managesFreightVia: 'Email', geography: ['Southwest', 'Cross-country'], source: 'Cold call', discoveryProgress: 28, totalTouches: 9 },
    { name: 'Carolina Textiles', owner: rep2.insertedId, status: 'onboarding', commodityTypes: ['Textiles'], equipmentTypes: ['Dry van'], weeklyTruckloadVolume: '5–10', managesFreightVia: 'Phone', geography: ['Southeast'], source: 'Referral', discoveryProgress: 72, totalTouches: 20 },
    // Unowned (prospect pool)
    { name: 'Northwest Lumber Co', owner: null, status: 'new_researching', commodityTypes: ['Lumber', 'Building materials'], equipmentTypes: ['Flatbed/open deck'], geography: ['West Coast'], source: 'Load board' },
    { name: 'Boston Seafood Distributors', owner: null, status: 'new_researching', commodityTypes: ['Seafood', 'Frozen foods'], equipmentTypes: ['Reefer'], geography: ['Northeast'], source: 'Cold call' },
    { name: 'Denver Electronics Hub', owner: null, status: 'new_researching', commodityTypes: ['Electronics'], equipmentTypes: ['Dry van'], geography: ['Southwest', 'West Coast'], source: 'Website' },
    { name: 'Nashville Food & Bev Corp', owner: null, status: 'new_researching', commodityTypes: ['Food & beverage', 'Beverages'], equipmentTypes: ['Reefer', 'Dry van'], geography: ['Southeast', 'Midwest'], source: 'Event' },
    { name: 'Phoenix Plastics', owner: null, status: 'new_researching', commodityTypes: ['Plastics'], equipmentTypes: ['Dry van'], geography: ['Southwest'], source: 'Cold call' },
  ];

  const companyIds: any[] = [];
  for (const c of companyData) {
    const res = await db.collection('companies').insertOne({
      ...c,
      ownerRepId: c.owner,
      ownedSince: c.owner ? new Date(Date.now() - Math.random() * 90 * 86400000) : null,
      locations: c.owner ? [{ address: '123 Main St', phone: '555-0100', shippingContact: 'Dock Manager' }] : [],
      shipmentType: ['Customer-facing'],
      shipsOnWeekends: false,
      busiestSeason: ['Q4', 'Summer'],
      slowestSeason: ['Q1'],
      avgWeeklyVolumePeak: 0,
      avgWeeklyVolumeSlow: 0,
      volumeVsLastYear: 'Flat',
      whoArrangesInbound: '',
      whoArrangesOutbound: '',
      hasRFP: c.hasRFP || false,
      rfpCycle: c.rfpCycle || '',
      rfpNextDate: null,
      tags: [],
      releasedAt: null,
      lastActivityDate: c.owner ? new Date(Date.now() - Math.random() * 14 * 86400000) : null,
      daysSinceLastActivity: c.owner ? Math.floor(Math.random() * 14) : 0,
      discoveryProgress: c.discoveryProgress || 0,
      totalTouches: c.totalTouches || 0,
      organizationId: orgId,
      createdAt: new Date(Date.now() - Math.random() * 120 * 86400000),
    });
    companyIds.push({ id: res.insertedId, owner: c.owner, name: c.name });
  }

  // Create contacts
  const contactData = [
    { companyIdx: 0, name: 'Bob Mitchell', title: 'VP of Logistics', role: 'decision_maker', isPrimary: true, phone: '555-0201', email: 'bob@midweststeel.com', personalKids: 'Two boys - Tyler (8) and Mason (5)', personalSportsTeam: 'Cleveland Browns', personalHobbies: 'Fishing, golf on weekends' },
    { companyIdx: 0, name: 'Lisa Chen', title: 'Freight Coordinator', role: 'freight_tenderer_active', isPrimary: false, phone: '555-0202', email: 'lisa@midweststeel.com', personalHobbies: 'Runs marathons' },
    { companyIdx: 1, name: 'Carlos Rodriguez', title: 'Supply Chain Director', role: 'decision_maker', isPrimary: true, phone: '555-0301', email: 'carlos@flcitrus.com', personalSportsTeam: 'Miami Dolphins', personalKids: 'Daughter Sofia, just started college' },
    { companyIdx: 1, name: 'Amy Foster', title: 'Shipping Manager', role: 'freight_tenderer_active', isPrimary: false, phone: '555-0302', email: 'amy@flcitrus.com', bestTimeToReach: 'Tuesday/Thursday mornings' },
    { companyIdx: 2, name: 'Tom Walker', title: 'Operations Manager', role: 'ops_logistics', isPrimary: true, phone: '555-0401', email: 'tom@pacificpaper.com', personalHobbies: 'Big into sailing' },
    { companyIdx: 3, name: 'Diana Price', title: 'Logistics VP', role: 'decision_maker', isPrimary: true, phone: '555-0501', email: 'diana@gulfchem.com', personalSportsTeam: 'Houston Texans', personalNotes: 'Alma mater: Texas A&M' },
    { companyIdx: 5, name: 'Mike Anderson', title: 'Distribution Manager', role: 'decision_maker', isPrimary: true, phone: '555-0601', email: 'mike@greatlakesdairy.com', personalKids: 'Three kids, youngest just started little league', personalSportsTeam: 'Green Bay Packers' },
    { companyIdx: 6, name: 'Jenny Park', title: 'Freight Manager', role: 'freight_tenderer_prospect', isPrimary: true, phone: '555-0701', email: 'jenny@texasauto.com', preferredContactMethod: 'Email', bestTimeToReach: 'After 2pm CST' },
    { companyIdx: 7, name: 'Rachel Torres', title: 'Supply Chain Lead', role: 'freight_tenderer_active', isPrimary: true, phone: '555-0801', email: 'rachel@carolinatextiles.com' },
  ];

  const contactIds: any[] = [];
  for (const c of contactData) {
    const company = companyIds[c.companyIdx];
    const res = await db.collection('contacts').insertOne({
      companyId: company.id,
      name: c.name,
      title: c.title,
      phone: c.phone || '',
      email: c.email || '',
      role: c.role,
      isPrimary: c.isPrimary,
      locationId: '',
      personalKids: c.personalKids || '',
      personalSportsTeam: c.personalSportsTeam || '',
      personalHobbies: c.personalHobbies || '',
      personalPastJobs: '',
      personalNotes: c.personalNotes || '',
      preferredContactMethod: c.preferredContactMethod || '',
      bestTimeToReach: c.bestTimeToReach || '',
      organizationId: orgId,
      createdAt: new Date(),
    });
    contactIds.push(res.insertedId);
  }

  // Create activities
  const now = Date.now();
  const activities = [];
  for (let i = 0; i < 80; i++) {
    const companyEntry = companyIds[Math.floor(Math.random() * 8)]; // owned companies
    if (!companyEntry.owner) continue;
    activities.push({
      repId: companyEntry.owner,
      companyId: companyEntry.id,
      contactId: contactIds[Math.floor(Math.random() * contactIds.length)],
      type: ['call_outbound', 'call_outbound', 'call_outbound', 'email_sent', 'note', 'quote_sent'][Math.floor(Math.random() * 6)],
      timestamp: new Date(now - Math.random() * 30 * 86400000),
      durationSeconds: Math.floor(Math.random() * 600),
      outcome: ['Connected', 'Voicemail', 'No answer', 'Connected'][Math.floor(Math.random() * 4)],
      notes: ['Great conversation about Q2 volumes', 'Left voicemail, will try again Thursday', 'Discussed dry van rates for ATL-CHI lane', 'Sent intro email', 'Follow up on quote sent last week', ''][Math.floor(Math.random() * 6)],
      quoteLane: '',
      quoteRate: 0,
      quoteEquipment: '',
      quoteOutcome: '',
      emailSubject: '',
      organizationId: orgId,
      createdAt: new Date(),
    });
  }
  if (activities.length > 0) await db.collection('activities').insertMany(activities);

  // Create deals
  const dealData = [
    { companyIdx: 0, name: 'Midwest Steel — CHI to DET Flatbed', lanes: 'Chicago, IL → Detroit, MI', equipmentType: 'Flatbed/open deck', estimatedWeeklyLoads: 5, estimatedMarginPerLoad: 350, stage: 'qualifying' },
    { companyIdx: 1, name: 'FL Citrus — ORL to NYC Reefer', lanes: 'Orlando, FL → New York, NY', equipmentType: 'Reefer', estimatedWeeklyLoads: 12, estimatedMarginPerLoad: 400, stage: 'quoting' },
    { companyIdx: 3, name: 'Gulf Chem — HOU to ATL Tanker', lanes: 'Houston, TX → Atlanta, GA', equipmentType: 'Tanker', estimatedWeeklyLoads: 3, estimatedMarginPerLoad: 500, stage: 'active_customer' },
    { companyIdx: 5, name: 'Great Lakes — MKE to CHI Reefer', lanes: 'Milwaukee, WI → Chicago, IL', equipmentType: 'Reefer', estimatedWeeklyLoads: 8, estimatedMarginPerLoad: 250, stage: 'qualifying' },
    { companyIdx: 7, name: 'Carolina Textiles — CLT to NYC', lanes: 'Charlotte, NC → New York, NY', equipmentType: 'Dry van', estimatedWeeklyLoads: 4, estimatedMarginPerLoad: 300, stage: 'onboarding' },
  ];

  for (const d of dealData) {
    const company = companyIds[d.companyIdx];
    await db.collection('deals').insertOne({
      name: d.name,
      companyId: company.id,
      contactIds: [],
      stage: d.stage,
      lanes: d.lanes,
      equipmentType: d.equipmentType,
      estimatedWeeklyLoads: d.estimatedWeeklyLoads,
      estimatedMarginPerLoad: d.estimatedMarginPerLoad,
      estimatedWeeklyGP: d.estimatedWeeklyLoads * d.estimatedMarginPerLoad,
      actualLoads: d.stage === 'active_customer' ? d.estimatedWeeklyLoads : 0,
      actualMargin: d.stage === 'active_customer' ? d.estimatedMarginPerLoad : 0,
      dateWonLost: null,
      lostReason: '',
      repId: company.owner,
      organizationId: orgId,
      createdAt: new Date(),
    });
  }

  // Create loads for active customer
  const loads = [];
  for (let w = 0; w < 8; w++) {
    for (let l = 0; l < 3; l++) {
      const pickupDate = new Date(now - w * 7 * 86400000 - l * 86400000);
      loads.push({
        repId: rep1.insertedId,
        companyId: companyIds[3].id,
        dealId: null,
        pickupDate,
        deliveryDate: new Date(pickupDate.getTime() + 2 * 86400000),
        origin: 'Houston, TX',
        destination: 'Atlanta, GA',
        revenue: 2200 + Math.random() * 400,
        carrierCost: 1600 + Math.random() * 300,
        grossProfit: 400 + Math.random() * 200,
        organizationId: orgId,
        createdAt: new Date(),
      });
    }
  }
  if (loads.length > 0) await db.collection('loads').insertMany(loads);

  // Create some tasks
  const taskData = [
    { title: 'Follow up with Bob Mitchell on Q2 rates', repId: rep1.insertedId, companyId: companyIds[0].id, dueDate: new Date(now + 86400000), priority: 'high', triggerSource: 'manual' },
    { title: 'Send updated quote to Florida Citrus', repId: rep1.insertedId, companyId: companyIds[1].id, dueDate: new Date(now + 2 * 86400000), priority: 'high', triggerSource: 'manual' },
    { title: 'Follow up with Pacific Paper — 7 days since last touch', repId: rep1.insertedId, companyId: companyIds[2].id, dueDate: new Date(now), priority: 'medium', triggerSource: 'no_contact_7d' },
    { title: 'Call Mike Anderson re: upcoming peak season', repId: rep2.insertedId, companyId: companyIds[5].id, dueDate: new Date(now + 86400000), priority: 'medium', triggerSource: 'manual' },
    { title: 'Send onboarding paperwork to Carolina Textiles', repId: rep2.insertedId, companyId: companyIds[7].id, dueDate: new Date(now), priority: 'high', triggerSource: 'manual' },
  ];

  for (const t of taskData) {
    await db.collection('tasks').insertOne({
      ...t,
      notes: '',
      dueTime: '',
      contactId: null,
      status: 'pending',
      completedAt: null,
      organizationId: orgId,
      createdAt: new Date(),
    });
  }

  // Discovery answers for some companies
  const discoveryData = [
    { companyIdx: 0, questionId: 'order_portal_email', answer: 'Email — they prefer sending requests via email' },
    { companyIdx: 0, questionId: 'ship_type', answer: 'Outbound finished steel products' },
    { companyIdx: 0, questionId: 'ship_lanes_frequent', answer: 'CHI to DET, CHI to CLE, CHI to PIT' },
    { companyIdx: 0, questionId: 'season_busy', answer: 'Q2 and Q3 — construction season' },
    { companyIdx: 1, questionId: 'rfp_has', answer: 'Yes — annual RFP in October' },
    { companyIdx: 1, questionId: 'season_busy', answer: 'Jan-May — citrus season, peak in Feb-Mar' },
    { companyIdx: 1, questionId: 'ship_lanes_frequent', answer: 'ORL to NYC, ORL to BOS, ORL to PHI, ORL to DC' },
    { companyIdx: 1, questionId: 'ship_weekends', answer: 'Yes, Saturday pickups during peak season' },
  ];

  for (const d of discoveryData) {
    await db.collection('discoveryanswers').insertOne({
      companyId: companyIds[d.companyIdx].id,
      questionId: d.questionId,
      answer: d.answer,
      answeredBy: rep1.insertedId,
      answeredAt: new Date(),
      organizationId: orgId,
      createdAt: new Date(),
    });
  }

  console.log('✅ Seed complete!');
  console.log(`  Organization: ${orgId}`);
  console.log(`  Admin: admin@demo.com / password123`);
  console.log(`  Rep 1: jake@demo.com / password123`);
  console.log(`  Rep 2: maria@demo.com / password123`);
  console.log(`  ${companyIds.length} companies, ${contactIds.length} contacts`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
