import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Deal from '@/lib/models/Deal';
import { requireSession } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  if (body.estimatedWeeklyLoads && body.estimatedMarginPerLoad) {
    body.estimatedWeeklyGP = body.estimatedWeeklyLoads * body.estimatedMarginPerLoad;
  }
  const deal = await Deal.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  await Deal.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
