import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import Load from '@/lib/models/Load';
import { requireSession } from '@/lib/session';

// GET /api/metrics/weekly?repId=xxx&weeks=12
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const repId = searchParams.get('repId') || session.user.id;
    const weeks = parseInt(searchParams.get('weeks') || '12');

    const now = new Date();
    const weeklyData = [];

    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      const [activities, loads] = await Promise.all([
        Activity.find({
          repId,
          organizationId: session.user.organizationId,
          type: 'call',
          timestamp: { $gte: weekStart, $lte: weekEnd },
        }).select('durationSeconds').lean(),
        Load.find({
          repId,
          organizationId: session.user.organizationId,
          pickupDate: { $gte: weekStart, $lte: weekEnd },
        }).select('grossProfit').lean(),
      ]);

      const talkTimeSeconds = activities.reduce((sum: number, a: any) => sum + (a.durationSeconds || 0), 0);
      const grossProfit = loads.reduce((sum: number, l: any) => sum + (l.grossProfit || 0), 0);

      weeklyData.unshift({
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        calls: activities.length,
        talkTimeMinutes: Math.round(talkTimeSeconds / 60),
        grossProfit,
      });
    }

    return NextResponse.json(weeklyData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
