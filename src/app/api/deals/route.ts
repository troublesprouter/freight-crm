import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Deal from '@/lib/models/Deal';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  const repId = url.searchParams.get('repId');
  const filter: any = { organizationId: (session.user as any).organizationId };
  if (companyId) filter.companyId = companyId;
  if (repId) filter.repId = repId;
  const deals = await Deal.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const deal = await Deal.create({
    ...body,
    repId: body.repId || (session.user as any).id,
    organizationId: (session.user as any).organizationId,
  });
  return NextResponse.json(deal, { status: 201 });
}
