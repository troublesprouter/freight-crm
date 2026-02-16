import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Company from '@/lib/models/Company';
import Load from '@/lib/models/Load';
import Deal from '@/lib/models/Deal';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  await dbConnect();
  const orgId = (session.user as any).organizationId;

  const reps = await User.find({ organizationId: orgId, role: { $in: ['rep', 'manager', 'admin'] } }).lean();

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const results = await Promise.all(reps.map(async (rep) => {
    const repId = rep._id.toString();

    // Week's activities
    const weekActivities = await Activity.find({
      repId,
      timestamp: { $gte: startOfWeek },
    }).lean();

    const calls = weekActivities.filter(a => a.type === 'call_outbound' || a.type === 'call_inbound');
    const daysWorked = Math.max(1, Math.ceil((now.getTime() - startOfWeek.getTime()) / 86400000));
    const callsPerDay = Math.round(calls.length / daysWorked);
    const talkTimeTotal = calls.reduce((s, a) => s + (a.durationSeconds || 0), 0);
    const talkTimePerDay = Math.round(talkTimeTotal / 60 / daysWorked);

    const quotesThisWeek = weekActivities.filter(a => a.type === 'quote_sent').length;
    const emailsThisWeek = weekActivities.filter(a => a.type === 'email_sent').length;

    // GP
    const weekLoads = await Load.find({ repId, pickupDate: { $gte: startOfWeek } }).lean();
    const gpThisWeek = weekLoads.reduce((s, l) => s + (l.grossProfit || 0), 0);
    const monthLoads = await Load.find({ repId, pickupDate: { $gte: startOfMonth } }).lean();
    const gpThisMonth = monthLoads.reduce((s, l) => s + (l.grossProfit || 0), 0);

    // Pipeline count
    const activeProspects = await Company.countDocuments({
      ownerRepId: repId,
      status: { $in: ['new_researching', 'cold_outreach', 'engaged', 'qualifying', 'quoting', 'onboarding'] },
    });

    const customersOnboarded = await Company.countDocuments({
      ownerRepId: repId,
      status: 'active_customer',
    });

    // Avg discovery
    const ownedCompanies = await Company.find({ ownerRepId: repId }).lean();
    const avgDiscovery = ownedCompanies.length > 0
      ? Math.round(ownedCompanies.reduce((s, c) => s + (c.discoveryProgress || 0), 0) / ownedCompanies.length)
      : 0;

    // Pipeline value
    const deals = await Deal.find({ repId, stage: { $in: ['qualifying', 'quoting', 'onboarding'] } }).lean();
    const pipelineValue = deals.reduce((s, d) => s + (d.estimatedWeeklyGP || 0), 0);

    return {
      _id: rep._id,
      name: rep.name,
      email: rep.email,
      role: rep.role,
      hireDate: rep.hireDate,
      callsThisWeek: calls.length,
      callsPerDay,
      talkTimePerDay,
      gpThisWeek,
      gpThisMonth,
      quotesThisWeek,
      emailsThisWeek,
      activeProspects,
      customersOnboarded,
      avgDiscovery,
      pipelineValue,
    };
  }));

  return NextResponse.json(results);
}
