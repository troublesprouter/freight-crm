import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/lib/models/Organization';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  await dbConnect();
  const org = await Organization.findById((session.user as any).organizationId).lean();
  return NextResponse.json(org);
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const org = await Organization.findByIdAndUpdate(
    (session.user as any).organizationId,
    body,
    { new: true }
  ).lean();
  return NextResponse.json(org);
}
