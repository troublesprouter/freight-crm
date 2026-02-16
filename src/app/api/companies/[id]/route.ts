import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// GET /api/companies/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    const company = await Company.findOne({ _id: id, organizationId: session.user.organizationId }).lean();
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/companies/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const company = await Company.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: body },
      { new: true }
    ).lean();
    if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(company);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/companies/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    await Company.findOneAndDelete({ _id: id, organizationId: session.user.organizationId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
