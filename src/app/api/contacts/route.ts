import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const companyId = url.searchParams.get('companyId');
  const filter: any = {};
  if (companyId) filter.companyId = companyId;
  const contacts = await Contact.find(filter).sort({ isPrimary: -1, name: 1 }).lean();
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const contact = await Contact.create({
    ...body,
    organizationId: (session.user as any).organizationId,
  });
  return NextResponse.json(contact, { status: 201 });
}
