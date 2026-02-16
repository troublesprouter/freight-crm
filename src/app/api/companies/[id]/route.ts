import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const company = await Company.findById(id).lean();
  if (!company) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(company);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const company = await Company.findByIdAndUpdate(id, body, { new: true }).lean();
  return NextResponse.json(company);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  await Company.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
