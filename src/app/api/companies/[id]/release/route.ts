import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// POST /api/companies/[id]/release — release a lead back to cold bucket
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;

    const company = await Company.findOneAndUpdate(
      {
        _id: id,
        organizationId: session.user.organizationId,
        ownerRepId: session.user.id,
      },
      {
        $set: {
          ownerRepId: null,
          ownedSince: null,
          status: 'released',
          releasedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!company) {
      return NextResponse.json({ error: 'Lead not found or not owned by you' }, { status: 400 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
