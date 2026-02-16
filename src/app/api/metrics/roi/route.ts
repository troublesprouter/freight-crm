import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Load from '@/lib/models/Load';
import { requireSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireSession();
    if (session.user.role === 'rep') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await dbConnect();

    const reps = await User.find({
      organizationId: session.user.organizationId,
      role: 'rep',
    }).select('-passwordHash').lean();

    const now = new Date();

    const roiData = await Promise.all(
      reps.map(async (rep: any) => {
        const hireDate = new Date(rep.hireDate);
        const monthsSinceHire = Math.max(1, Math.ceil((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

        const loads = await Load.find({
          repId: rep._id,
          organizationId: session.user.organizationId,
        }).select('grossProfit pickupDate').lean();

        const totalGP = loads.reduce((s: number, l: any) => s + (l.grossProfit || 0), 0);
        const totalSalaryPaid = (rep.salaryMonthly || 4000) * monthsSinceHire;
        const netPL = totalGP - totalSalaryPaid;

        // Monthly GP for breakeven projection
        const monthlyGP = totalGP / monthsSinceHire;
        const monthlySalary = rep.salaryMonthly || 4000;
        const breakEvenMonths = monthlyGP > 0 ? Math.ceil(totalSalaryPaid / monthlyGP) : null;

        return {
          _id: rep._id,
          name: rep.name,
          email: rep.email,
          hireDate: rep.hireDate,
          stage: rep.stage,
          trainingClass: rep.trainingClass || 'Unassigned',
          isActive: rep.isActive,
          monthsSinceHire,
          totalGP,
          totalSalaryPaid,
          netPL,
          monthlyGP: Math.round(monthlyGP),
          breakEvenMonths,
        };
      })
    );

    // Group by training class
    const classes: Record<string, any[]> = {};
    roiData.forEach(r => {
      const cls = r.trainingClass;
      if (!classes[cls]) classes[cls] = [];
      classes[cls].push(r);
    });

    return NextResponse.json({ reps: roiData, classes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
