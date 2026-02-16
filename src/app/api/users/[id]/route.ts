import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireSession } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const user = await User.findById(id).select('-passwordHash').lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  delete body.passwordHash;
  const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-passwordHash').lean();
  return NextResponse.json(user);
}
