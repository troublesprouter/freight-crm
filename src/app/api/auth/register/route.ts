import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Organization from '@/lib/models/Organization';
import { nanoid } from '@/lib/nanoid';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, password, organizationName, inviteCode } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let organizationId: string;
    let role: 'admin' | 'manager' | 'rep' = 'rep';

    if (inviteCode) {
      const org = await Organization.findOne({ inviteCode });
      if (!org) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });
      }
      organizationId = org._id.toString();
    } else if (organizationName) {
      const org = await Organization.create({
        name: organizationName,
        inviteCode: nanoid(8),
      });
      organizationId = org._id.toString();
      role = 'admin';
    } else {
      return NextResponse.json({ error: 'Organization name or invite code required' }, { status: 400 });
    }

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      organizationId,
    });

    return NextResponse.json({ id: user._id, email: user.email, role: user.role }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
