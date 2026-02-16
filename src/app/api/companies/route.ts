import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// GET /api/companies — list companies for org
export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner'); // 'me' | 'cold' | repId
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: any = { organizationId: session.user.organizationId };

    if (owner === 'me') {
      query.ownerRepId = session.user.id;
    } else if (owner === 'cold') {
      query.ownerRepId = null;
      query.status = { $ne: 'released' };
    } else if (owner) {
      query.ownerRepId = owner;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }
    if (tag) {
      query.tags = tag;
    }

    const [companies, total] = await Promise.all([
      Company.find(query).sort({ nextFollowUp: 1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Company.countDocuments(query),
    ]);

    return NextResponse.json({ companies, total, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

// POST /api/companies — create a new company
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    await dbConnect();
    const body = await req.json();

    const company = await Company.create({
      ...body,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
