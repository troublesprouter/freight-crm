import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Load from '@/lib/models/Load';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const repId = url.searchParams.get('repId');
  const filter: any = { organizationId: (session.user as any).organizationId };
  if (repId) filter.repId = repId;
  const loads = await Load.find(filter).sort({ pickupDate: -1 }).limit(100).lean();
  return NextResponse.json(loads);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const load = await Load.create({
    ...body,
    repId: body.repId || (session.user as any).id,
    organizationId: (session.user as any).organizationId,
  });
  return NextResponse.json(load, { status: 201 });
}
