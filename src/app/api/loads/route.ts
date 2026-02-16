import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Load from '@/lib/models/Load';
import { requireSession } from '@/lib/session';

// GET /api/loads
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const repId = searchParams.get('repId') || session.user.id;

    const loads = await Load.find({
      organizationId: session.user.organizationId,
      repId,
    }).sort({ pickupDate: -1 }).limit(100).lean();

    return NextResponse.json(loads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/loads
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const body = await req.json();
    const load = await Load.create({
      ...body,
      repId: body.repId || session.user.id,
      grossProfit: (body.revenue || 0) - (body.carrierCost || 0),
      organizationId: session.user.organizationId,
    });
    return NextResponse.json(load, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
