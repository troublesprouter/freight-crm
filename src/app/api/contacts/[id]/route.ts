import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/lib/models/Contact';
import { requireSession } from '@/lib/session';

// PUT /api/contacts/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const contact = await Contact.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: body },
      { new: true }
    ).lean();
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    await Contact.findOneAndDelete({ _id: id, organizationId: session.user.organizationId });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
