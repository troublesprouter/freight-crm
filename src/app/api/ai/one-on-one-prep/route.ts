import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Activity from '@/lib/models/Activity';
import Company from '@/lib/models/Company';
import { gemini } from '@/lib/gemini';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const repId = url.searchParams.get('repId');
  if (!repId) return NextResponse.json({ error: 'repId required' }, { status: 400 });

  const rep = await User.findById(repId).lean();
  if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 });

  const recentActivities = await Activity.find({ repId }).sort({ timestamp: -1 }).limit(30).lean();
  const companies = await Company.find({ ownerRepId: repId }).lean();

  const hotLeads = companies.filter(c => ['qualifying', 'quoting'].includes(c.status));
  const stale = companies.filter(c => (c.daysSinceLastActivity || 0) > 14);

  const summary = `
Rep: ${rep.name}
Role: ${rep.role}, Hired: ${new Date(rep.hireDate).toLocaleDateString()}
Active Prospects: ${companies.filter(c => !['active_customer', 'inactive_customer'].includes(c.status)).length}
Active Customers: ${companies.filter(c => c.status === 'active_customer').length}
Recent calls (last 30 activities): ${recentActivities.filter(a => a.type?.includes('call')).length} calls
Hot leads (qualifying/quoting): ${hotLeads.map(c => `${c.name} (${c.status}, ${c.totalTouches} touches, ${c.discoveryProgress}% discovered)`).join(', ')}
Stale prospects (14+ days): ${stale.map(c => `${c.name} (${c.daysSinceLastActivity}d)`).join(', ')}
Recent activity notes: ${recentActivities.slice(0, 5).map(a => a.notes).filter(Boolean).join(' | ')}
  `.trim();

  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `You are a freight brokerage sales manager preparing for a one-on-one coaching session. Based on this rep's data, generate a brief coaching prep summary. Include: 1) Key wins this week, 2) Areas of concern, 3) Specific companies to discuss and why, 4) Suggested action items. Keep it concise and actionable.\n\n${summary}` }]
      }],
    });

    return NextResponse.json({ prep: response.text });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
