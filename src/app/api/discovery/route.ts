import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DiscoveryAnswer from '@/lib/models/DiscoveryAnswer';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';
import { DISCOVERY_QUESTIONS } from '@/lib/constants';

export async function GET(req: NextRequest) {
  await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });
  const answers = await DiscoveryAnswer.find({ companyId }).lean();
  return NextResponse.json(answers);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const { companyId, questionId, answer } = await req.json();

  const existing = await DiscoveryAnswer.findOne({ companyId, questionId });
  if (existing) {
    existing.answer = answer;
    existing.answeredBy = (session.user as any).id;
    existing.answeredAt = new Date();
    await existing.save();
  } else {
    await DiscoveryAnswer.create({
      companyId,
      questionId,
      answer,
      answeredBy: (session.user as any).id,
      organizationId: (session.user as any).organizationId,
    });
  }

  // Auto-fill company fields where applicable
  const q = DISCOVERY_QUESTIONS.find((q) => q.id === questionId);
  if (q?.autoFillField && answer) {
    await Company.findByIdAndUpdate(companyId, { [q.autoFillField]: answer });
  }

  // Update discovery progress
  const total = DISCOVERY_QUESTIONS.length;
  const answered = await DiscoveryAnswer.countDocuments({ companyId });
  const pct = Math.round((answered / total) * 100);
  await Company.findByIdAndUpdate(companyId, { discoveryProgress: pct });

  return NextResponse.json({ success: true, progress: pct });
}
