import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/lib/models/Task';
import { requireSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const url = new URL(req.url);
  const repId = url.searchParams.get('repId') || (session.user as any).id;
  const status = url.searchParams.get('status');
  const filter: any = { organizationId: (session.user as any).organizationId, repId };
  if (status) filter.status = status;
  const tasks = await Task.find(filter)
    .populate('companyId', 'name status')
    .populate('contactId', 'name')
    .sort({ dueDate: 1 })
    .lean();
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  await dbConnect();
  const body = await req.json();
  const task = await Task.create({
    ...body,
    repId: body.repId || (session.user as any).id,
    organizationId: (session.user as any).organizationId,
  });
  return NextResponse.json(task, { status: 201 });
}
