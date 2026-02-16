import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Load from '@/lib/models/Load';
import { requireSession } from '@/lib/session';

export async function GET() {
  const session = await requireSession();
  await dbConnect();
  const orgId = (session.user as any).organizationId;

  const reps = await User.find({ organizationId: orgId }).lean();

  const results = await Promise.all(reps.map(async (rep) => {
    const allLoads = await Load.find({ repId: rep._id }).lean();
    const totalGP = allLoads.reduce((s, l) => s + (l.grossProfit || 0), 0);
    const monthsEmployed = Math.max(1, Math.ceil((Date.now() - new Date(rep.hireDate).getTime()) / (30 * 86400000)));
    const totalSalaryPaid = monthsEmployed * rep.salaryMonthly;
    const netPL = totalGP - totalSalaryPaid;
    const breakEvenMonths = totalGP > 0 ? Math.ceil(totalSalaryPaid / (totalGP / monthsEmployed)) : null;

    return {
      _id: rep._id,
      name: rep.name,
      role: rep.role,
      hireDate: rep.hireDate,
      monthsEmployed,
      totalSalaryPaid,
      totalGP,
      netPL,
      breakEvenMonths,
    };
  }));

  return NextResponse.json(results);
}
