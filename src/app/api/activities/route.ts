import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  const repId = url.searchParams.get('repId');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const filter: any = { organizationId: (session.user as any).organizationId };
  if (companyId) filter.companyId = companyId;
  if (repId) filter.repId = repId;
  const activities = await Activity.find(filter)
    .populate('contactId', 'name')
    .populate('companyId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const activity = await Activity.create({
    ...body,
    repId: body.repId || (session.user as any).id,
    organizationId: (session.user as any).organizationId,
  });

  // Update company last activity and total touches
  if (body.companyId) {
    await Company.findByIdAndUpdate(body.companyId, {
      lastActivityDate: new Date(),
      $inc: { totalTouches: 1 },
    });
  }

  return NextResponse.json(activity, { status: 201 });
}
