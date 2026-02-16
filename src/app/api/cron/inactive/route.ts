import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import Task from '@/lib/models/Task';
import Organization from '@/lib/models/Organization';

// This can be called periodically to detect inactive customers
// In production, connect to a Vercel cron or external scheduler
export async function GET() {
  await dbConnect();

  const orgs = await Organization.find().lean();

  for (const org of orgs) {
    const warningDays = org.settings?.inactiveWarningDays || 30;
    const autoMoveDays = org.settings?.inactiveAutoMoveDays || 60;
    const now = new Date();

    // Auto-move active customers with no activity for 60+ days to inactive
    const cutoff60 = new Date(now.getTime() - autoMoveDays * 86400000);
    const inactiveCompanies = await Company.find({
      organizationId: org._id,
      status: 'active_customer',
      $or: [
        { lastActivityDate: { $lt: cutoff60 } },
        { lastActivityDate: null, createdAt: { $lt: cutoff60 } },
      ],
    });

    for (const company of inactiveCompanies) {
      await Company.findByIdAndUpdate(company._id, { status: 'inactive_customer' });
      if (company.ownerRepId) {
        await Task.create({
          title: `Reactivation call — ${company.name} moved to inactive`,
          notes: `No activity in ${autoMoveDays}+ days. This was an active customer — worth a call.`,
          dueDate: now,
          companyId: company._id,
          repId: company.ownerRepId,
          priority: 'high',
          triggerSource: 'inactive_60',
          organizationId: org._id,
        });
      }
    }

    // Warning for active customers with no activity for 30+ days
    const cutoff30 = new Date(now.getTime() - warningDays * 86400000);
    const warningCompanies = await Company.find({
      organizationId: org._id,
      status: 'active_customer',
      $or: [
        { lastActivityDate: { $lt: cutoff30, $gte: cutoff60 } },
        { lastActivityDate: null, createdAt: { $lt: cutoff30, $gte: cutoff60 } },
      ],
    });

    for (const company of warningCompanies) {
      if (!company.ownerRepId) continue;
      // Check if a warning task already exists
      const existing = await Task.findOne({
        companyId: company._id,
        triggerSource: 'inactive_30',
        status: 'pending',
      });
      if (!existing) {
        await Task.create({
          title: `Check in — ${company.name} hasn't shipped in ${warningDays} days`,
          dueDate: now,
          companyId: company._id,
          repId: company.ownerRepId,
          priority: 'medium',
          triggerSource: 'inactive_30',
          organizationId: org._id,
        });
      }
    }

    // Flag stale prospects (stages 3-5 with no activity for 7+ days)
    const cutoff7 = new Date(now.getTime() - 7 * 86400000);
    const staleProspects = await Company.find({
      organizationId: org._id,
      status: { $in: ['engaged', 'qualifying', 'quoting'] },
      $or: [
        { lastActivityDate: { $lt: cutoff7 } },
        { lastActivityDate: null, createdAt: { $lt: cutoff7 } },
      ],
    });

    for (const company of staleProspects) {
      if (!company.ownerRepId) continue;
      const existing = await Task.findOne({
        companyId: company._id,
        triggerSource: 'no_contact_7d',
        status: 'pending',
      });
      if (!existing) {
        await Task.create({
          title: `Follow up with ${company.name} — 7 days since last touch`,
          dueDate: now,
          companyId: company._id,
          repId: company.ownerRepId,
          priority: 'medium',
          triggerSource: 'no_contact_7d',
          organizationId: org._id,
        });
      }
    }
  }

  // Update daysSinceLastActivity for all companies
  const allCompanies = await Company.find({ lastActivityDate: { $ne: null } });
  for (const c of allCompanies) {
    const days = Math.floor((Date.now() - new Date(c.lastActivityDate!).getTime()) / 86400000);
    if (days !== c.daysSinceLastActivity) {
      await Company.findByIdAndUpdate(c._id, { daysSinceLastActivity: days });
    }
  }

  return NextResponse.json({ success: true });
}
