import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import Load from '@/lib/models/Load';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// GET /api/metrics?repId=xxx&period=day|week|month
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const repId = searchParams.get('repId') || session.user.id;
    const period = searchParams.get('period') || 'day';

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const [calls, allActivities, loads, poolCount] = await Promise.all([
      // Call count
      Activity.countDocuments({
        repId,
        organizationId: session.user.organizationId,
        type: 'call',
        timestamp: { $gte: startDate },
      }),
      // All activities for talk time
      Activity.find({
        repId,
        organizationId: session.user.organizationId,
        type: 'call',
        timestamp: { $gte: startDate },
      }).select('durationSeconds').lean(),
      // GP from loads
      Load.find({
        repId,
        organizationId: session.user.organizationId,
        pickupDate: { $gte: startDate },
      }).select('grossProfit').lean(),
      // Pool count
      Company.countDocuments({
        ownerRepId: repId,
        organizationId: session.user.organizationId,
      }),
    ]);

    const talkTimeSeconds = allActivities.reduce((sum: number, a: any) => sum + (a.durationSeconds || 0), 0);
    const grossProfit = loads.reduce((sum: number, l: any) => sum + (l.grossProfit || 0), 0);

    return NextResponse.json({
      calls,
      talkTimeSeconds,
      talkTimeMinutes: Math.round(talkTimeSeconds / 60),
      grossProfit,
      poolCount,
      period,
      startDate,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
