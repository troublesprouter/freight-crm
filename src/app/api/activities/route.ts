import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/lib/models/Activity';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// GET /api/activities
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const repId = searchParams.get('repId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { organizationId: session.user.organizationId };
    if (companyId) query.companyId = companyId;
    if (repId) query.repId = repId;
    if (type) query.type = type;

    const activities = await Activity.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('contactId', 'name')
      .populate('companyId', 'name')
      .lean();

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/activities — log an activity
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const body = await req.json();

    const activity = await Activity.create({
      ...body,
      repId: session.user.id,
      organizationId: session.user.organizationId,
      timestamp: body.timestamp || new Date(),
    });

    // Update company stats
    if (body.companyId) {
      await Company.findByIdAndUpdate(body.companyId, {
        $set: { lastContactDate: new Date() },
        $inc: { totalTouches: 1 },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
