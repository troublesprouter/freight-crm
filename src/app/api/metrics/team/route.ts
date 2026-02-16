import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Load from '@/lib/models/Load';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// GET /api/metrics/team — get metrics for all reps
export async function GET() {
  try {
    const session = await requireSession();
    if (session.user.role === 'rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();

    const reps = await User.find({
      organizationId: session.user.organizationId,
      role: 'rep',
      isActive: true,
    }).select('-passwordHash').lean();

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // 12-week lookback for trailing GP
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(now.getDate() - 84);

    const repMetrics = await Promise.all(
      reps.map(async (rep: any) => {
        const [weekCalls, weekLoads, trailingLoads, poolCount] = await Promise.all([
          Activity.find({
            repId: rep._id,
            organizationId: session.user.organizationId,
            type: 'call',
            timestamp: { $gte: weekStart },
          }).select('durationSeconds').lean(),
          Load.find({
            repId: rep._id,
            organizationId: session.user.organizationId,
            pickupDate: { $gte: weekStart },
          }).select('grossProfit').lean(),
          Load.find({
            repId: rep._id,
            organizationId: session.user.organizationId,
            pickupDate: { $gte: twelveWeeksAgo },
          }).select('grossProfit').lean(),
          Company.countDocuments({
            ownerRepId: rep._id,
            organizationId: session.user.organizationId,
          }),
        ]);

        const weekTalkTime = weekCalls.reduce((sum: number, a: any) => sum + (a.durationSeconds || 0), 0);
        const weekGP = weekLoads.reduce((sum: number, l: any) => sum + (l.grossProfit || 0), 0);
        const trailingGP = trailingLoads.reduce((sum: number, l: any) => sum + (l.grossProfit || 0), 0);
        const trailing12WeekAvg = Math.round(trailingGP / 12);

        return {
          ...rep,
          weekCalls: weekCalls.length,
          weekTalkTimeMinutes: Math.round(weekTalkTime / 60),
          weekGP,
          trailing12WeekAvg,
          poolCount,
          daysInStage: Math.floor((now.getTime() - new Date(rep.hireDate).getTime()) / (1000 * 60 * 60 * 24)),
        };
      })
    );

    return NextResponse.json(repMetrics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
