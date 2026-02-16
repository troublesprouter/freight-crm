import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireSession } from '@/lib/session';

// GET /api/contacts?companyId=xxx
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    const query: any = { organizationId: session.user.organizationId };
    if (companyId) query.companyId = companyId;

    const contacts = await Contact.find(query).lean();
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/contacts
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const body = await req.json();
    const contact = await Contact.create({
      ...body,
      organizationId: session.user.organizationId,
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
