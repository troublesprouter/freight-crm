import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

// GET /api/users — list reps in the organization
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    const query: any = { organizationId: session.user.organizationId, isActive: true };
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
