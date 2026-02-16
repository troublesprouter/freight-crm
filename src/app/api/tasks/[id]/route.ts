import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { requireSession } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  if (body.status === 'completed') body.completedAt = new Date();
  const task = await Task.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json(task);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  await Task.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
