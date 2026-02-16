import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  await dbConnect();
  const { id } = await params;
  const userId = (session.user as any).id;

  const user = await User.findById(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Count active prospects (stages 1-6 only)
  const activeCount = await Company.countDocuments({
    ownerRepId: userId,
    status: { $in: ['new_researching', 'cold_outreach', 'engaged', 'qualifying', 'quoting', 'onboarding'] },
  });

  if (activeCount >= user.leadCap) {
    return NextResponse.json(
      { error: `At capacity (${activeCount}/${user.leadCap}). Release a prospect first.` },
      { status: 400 }
    );
  }

  const company = await Company.findByIdAndUpdate(
    id,
    { ownerRepId: userId, ownedSince: new Date(), status: 'new_researching' },
    { new: true }
  );

  return NextResponse.json(company);
}
