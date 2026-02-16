import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  await dbConnect();
  const users = await User.find({ organizationId: (session.user as any).organizationId })
    .select('-passwordHash')
    .lean();
  return NextResponse.json(users);
}
