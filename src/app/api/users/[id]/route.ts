import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

// GET /api/users/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { id } = await params;
    const user = await User.findOne({
      _id: id,
      organizationId: session.user.organizationId,
    }).select('-passwordHash').lean();
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (session.user.role === 'rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    delete body.passwordHash;
    delete body.email;

    const user = await User.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: body },
      { new: true }
    ).select('-passwordHash').lean();

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
