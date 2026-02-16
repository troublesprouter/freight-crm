import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();
  await dbConnect();
  const { id } = await params;
  const { stage } = await req.json();
  const company = await Company.findByIdAndUpdate(id, { status: stage }, { new: true }).lean();
  return NextResponse.json(company);
}
