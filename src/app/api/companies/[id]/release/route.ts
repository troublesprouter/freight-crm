import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const company = await Company.findByIdAndUpdate(
    id,
    { ownerRepId: null, ownedSince: null, releasedAt: new Date(), status: 'new_researching' },
    { new: true }
  );
  return NextResponse.json(company);
}
