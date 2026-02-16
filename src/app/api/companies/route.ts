import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const orgId = (session.user as any).organizationId;
  const url = new URL(req.url);
  const owner = url.searchParams.get('owner');
  const status = url.searchParams.get('status');
  const unowned = url.searchParams.get('unowned');
  const commodity = url.searchParams.get('commodity');
  const equipment = url.searchParams.get('equipment');
  const geography = url.searchParams.get('geography');
  const search = url.searchParams.get('search');

  const filter: any = { organizationId: orgId };
  if (owner) filter.ownerRepId = owner;
  if (status) filter.status = status;
  if (unowned === 'true') filter.ownerRepId = null;
  if (commodity) filter.commodityTypes = commodity;
  if (equipment) filter.equipmentTypes = equipment;
  if (geography) filter.geography = geography;
  if (search) filter.name = { $regex: search, $options: 'i' };

  const companies = await Company.find(filter).sort({ lastActivityDate: -1 }).limit(500).lean();
  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const company = await Company.create({
    ...body,
    organizationId: (session.user as any).organizationId,
  });
  return NextResponse.json(company, { status: 201 });
}
