import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Load from '@/lib/models/Load';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

const stageNames: Record<number, string> = {
  1: 'Training', 2: 'Activity Only', 3: 'Activity + Talk Time', 4: 'Activity + Talk Time + Revenue', 5: 'Graduated',
};

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.user.role === 'rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { repId } = await req.json();
    await dbConnect();

    const [rep, recentActivities, recentLoads, activeLeads] = await Promise.all([
      User.findById(repId).select('-passwordHash').lean(),
      Activity.find({ repId, type: 'call' }).sort({ timestamp: -1 }).limit(50).lean(),
      Load.find({ repId }).sort({ pickupDate: -1 }).limit(20).lean(),
      Company.find({ ownerRepId: repId }).sort({ lastContactDate: -1 }).limit(10).lean(),
    ]);

    if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 });

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const weekCalls = recentActivities.filter((a: any) => new Date(a.timestamp) >= weekStart);
    const weekTalkTime = weekCalls.reduce((s: number, a: any) => s + (a.durationSeconds || 0), 0);
    const weekGP = recentLoads
      .filter((l: any) => new Date(l.pickupDate) >= weekStart)
      .reduce((s: number, l: any) => s + (l.grossProfit || 0), 0);

    const topLeads = (activeLeads as any[]).slice(0, 5).map((l: any) => `${l.name} (${l.status}, ${l.totalTouches} touches)`).join(', ');

    const prompt = `You are a freight brokerage sales manager preparing for a one-on-one coaching meeting. Generate a concise coaching summary for this rep:

Rep: ${(rep as any).name}
Stage: ${stageNames[(rep as any).stage] || 'Unknown'} (Stage ${(rep as any).stage})
Days since hire: ${Math.floor((now.getTime() - new Date((rep as any).hireDate).getTime()) / (1000 * 60 * 60 * 24))}
This week: ${weekCalls.length} calls, ${Math.round(weekTalkTime / 60)} minutes talk time, $${weekGP} GP
Active leads: ${(activeLeads as any[]).length}
Top leads being worked: ${topLeads || 'None'}
Recent call outcomes: ${weekCalls.slice(0, 10).map((a: any) => a.outcome).join(', ')}

Based on their stage, provide:
1. Key metrics vs expected targets
2. What's going well
3. Areas to improve
4. Specific coaching points for the one-on-one
5. Questions to ask the rep

Keep it concise and actionable. Use bullet points.`;

    const summary = await generateContent(prompt);
    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
