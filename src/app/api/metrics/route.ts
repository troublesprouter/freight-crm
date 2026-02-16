import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import Company from '@/lib/models/Company';
import Load from '@/lib/models/Load';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const repId = url.searchParams.get('repId') || (session.user as any).id;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  // Today's calls
  const todayActivities = await Activity.find({
    repId,
    type: { $in: ['call_outbound', 'call_inbound'] },
    timestamp: { $gte: startOfDay },
  }).lean();

  const callsToday = todayActivities.length;
  const talkTimeToday = Math.round(todayActivities.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 60);

  // GP this week
  const weekLoads = await Load.find({ repId, pickupDate: { $gte: startOfWeek } }).lean();
  const gpThisWeek = weekLoads.reduce((sum, l) => sum + (l.grossProfit || 0), 0);

  // Active prospects count (stages 1-6)
  const user = await User.findById(repId).lean();
  const activeProspects = await Company.countDocuments({
    ownerRepId: repId,
    status: { $in: ['new_researching', 'cold_outreach', 'engaged', 'qualifying', 'quoting', 'onboarding'] },
  });

  return NextResponse.json({
    callsToday,
    talkTimeToday,
    gpThisWeek,
    activeProspects,
    leadCap: (user as any)?.leadCap || 150,
  });
}
