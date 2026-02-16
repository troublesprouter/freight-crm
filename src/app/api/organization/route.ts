import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Organization from '@/lib/models/Organization';
import { requireSession } from '@/lib/session';

// GET /api/organization
export async function GET() {
  try {
    const session = await requireSession();
    await dbConnect();
    const org = await Organization.findById(session.user.organizationId).lean();
    if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/organization
export async function PUT(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.user.role === 'rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const body = await req.json();
    const org = await Organization.findByIdAndUpdate(
      session.user.organizationId,
      { $set: body },
      { new: true }
    ).lean();
    return NextResponse.json(org);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
