'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';

export default function CommissionPage() {
  const { data: session } = useSession();
  const [reps, setReps] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);

  useEffect(() => {
    fetch('/api/metrics/team').then(r => r.json()).then(d => setReps(Array.isArray(d) ? d : []));
    fetch('/api/organization').then(r => r.json()).then(setOrg);
  }, []);

  const commPct = org?.settings?.commissionPct || 25;
  const baseSalary = org?.settings?.baseSalary || 4000;
  const threshold = org?.settings?.commissionThreshold || 4000;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Commission Tracking</h1>
      </div>

      <Card>
        <CardContent className="pt-4 text-sm space-y-1">
          <p>Commission rate: <strong>{commPct}%</strong></p>
          <p>Base salary: <strong>${baseSalary.toLocaleString()}/mo</strong></p>
          <p>Threshold: Need <strong>${threshold.toLocaleString()}/wk GP</strong> to cover salary before commission kicks in</p>
          <p className="text-xs text-muted-foreground mt-2">At {commPct}% commission, ${threshold}/wk GP = ${Math.round(threshold * commPct / 100)}/wk earned</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Per-Rep Commission</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Rep</th>
                <th className="pb-2 font-medium text-right">GP This Month</th>
                <th className="pb-2 font-medium text-right">GP This Week</th>
                <th className="pb-2 font-medium text-center">To Threshold</th>
                <th className="pb-2 font-medium text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody>
              {reps.map(r => {
                const weeklyGP = r.gpThisWeek || 0;
                const aboveThreshold = Math.max(0, weeklyGP - threshold);
                const commission = aboveThreshold * commPct / 100;
                const pctToThreshold = Math.min(100, (weeklyGP / threshold) * 100);
                return (
                  <tr key={r._id} className="border-b">
                    <td className="py-3 font-medium">{r.name}</td>
                    <td className="py-3 text-right">${(r.gpThisMonth || 0).toLocaleString()}</td>
                    <td className="py-3 text-right">${weeklyGP.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div
                            className={`rounded-full h-2 ${pctToThreshold >= 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                            style={{ width: `${pctToThreshold}%` }}
                          />
                        </div>
                        <span className="text-xs">{Math.round(pctToThreshold)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-green-600">
                      {commission > 0 ? `$${commission.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Phone & Email Integration</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm">VoIP integration (RingCentral, Aircall, Dialpad) and email sync (Gmail, Outlook) will be available in V2.</p>
              <p className="text-sm mt-1">For now, log calls and emails manually from the company page.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
