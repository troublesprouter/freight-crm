import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import Organization from '@/lib/models/Organization';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

// POST /api/companies/[id]/claim — claim a lead into rep's pool
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;

    // Get rep's lead cap
    const [user, org] = await Promise.all([
      User.findById(session.user.id).lean(),
      Organization.findById(session.user.organizationId).lean(),
    ]);
    if (!user || !org) return NextResponse.json({ error: 'User or org not found' }, { status: 404 });

    const leadCap = (user as any).leadCap || (org as any).settings?.leadCap || 150;

    // Count current leads
    const currentCount = await Company.countDocuments({
      ownerRepId: session.user.id,
      organizationId: session.user.organizationId,
    });

    if (currentCount >= leadCap) {
      return NextResponse.json({
        error: `You're at ${currentCount}/${leadCap}. Release a lead first.`,
        currentCount,
        leadCap,
      }, { status: 400 });
    }

    // Claim the lead
    const company = await Company.findOneAndUpdate(
      {
        _id: id,
        organizationId: session.user.organizationId,
        ownerRepId: null,
      },
      {
        $set: {
          ownerRepId: session.user.id,
          ownedSince: new Date(),
          status: 'cold',
          releasedAt: null,
        },
      },
      { new: true }
    );

    if (!company) {
      return NextResponse.json({ error: 'Lead not available or already claimed' }, { status: 400 });
    }

    return NextResponse.json({ company, currentCount: currentCount + 1, leadCap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
