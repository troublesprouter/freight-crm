'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

export default function CommissionPage() {
  const { data: session } = useSession();
  const [org, setOrg] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [teamData, setTeamData] = useState<any[]>([]);
  const isManager = session?.user?.role === 'admin' || session?.user?.role === 'manager';

  useEffect(() => {
    fetch('/api/organization').then(r => r.json()).then(setOrg);
    fetch('/api/metrics/weekly?weeks=12').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setWeeklyData(data);
    });
    if (isManager) {
      fetch('/api/metrics/team').then(r => r.json()).then(data => {
        if (Array.isArray(data)) setTeamData(data);
      });
    }
  }, [isManager]);

  const commissionPct = org?.settings?.commissionPct || 25;
  const baseSalary = org?.settings?.baseSalary || 4000;
  const podThreshold = org?.settings?.podThreshold || 4000;
  const weeklySalary = baseSalary / 4;

  // Trailing 12-week GP
  const totalGP12 = weeklyData.reduce((s, w) => s + (w.grossProfit || 0), 0);
  const trailing12Avg = weeklyData.length ? Math.round(totalGP12 / weeklyData.length) : 0;

  // This week
  const thisWeekGP = weeklyData.length ? weeklyData[weeklyData.length - 1]?.grossProfit || 0 : 0;
  const thisWeekCommission = Math.max(0, thisWeekGP * (commissionPct / 100) - weeklySalary);
  const gpToCoverSalary = Math.ceil(weeklySalary / (commissionPct / 100));
  const salaryPct = Math.min(100, (thisWeekGP / gpToCoverSalary) * 100);

  // Monthly totals
  const last4Weeks = weeklyData.slice(-4);
  const monthGP = last4Weeks.reduce((s, w) => s + (w.grossProfit || 0), 0);
  const monthCommission = Math.max(0, monthGP * (commissionPct / 100) - baseSalary);

  // Pod eligibility
  const isPodEligible = trailing12Avg >= podThreshold;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="h-6 w-6" /> Commission & Pods</h1>

      {/* Commission Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">GP to Cover Salary</p>
            <p className="text-3xl font-bold">${gpToCoverSalary.toLocaleString()}<span className="text-lg">/wk</span></p>
            <p className="text-xs text-muted-foreground mt-1">At {commissionPct}% commission, ${baseSalary}/mo salary</p>
            <Progress value={salaryPct} className="mt-3" />
            <p className="text-xs mt-1 text-muted-foreground">
              {salaryPct >= 100 ? 'Salary covered! Earning commission.' : `${Math.round(salaryPct)}% to salary coverage`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-3xl font-bold">${thisWeekGP.toLocaleString()} <span className="text-lg">GP</span></p>
            <p className="text-sm text-green-600 font-medium mt-1">
              Commission: ${thisWeekCommission.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-3xl font-bold">${monthGP.toLocaleString()} <span className="text-lg">GP</span></p>
            <p className="text-sm text-green-600 font-medium mt-1">
              Commission: ${monthCommission.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Breakdown */}
      <Card>
        <CardHeader><CardTitle className="text-lg">12-Week GP History</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {weeklyData.map((w: any, i: number) => {
              const maxGP = Math.max(...weeklyData.map((x: any) => x.grossProfit || 0), 1);
              const height = ((w.grossProfit || 0) / maxGP) * 100;
              const isAboveThreshold = (w.grossProfit || 0) >= gpToCoverSalary;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${isAboveThreshold ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`$${(w.grossProfit || 0).toLocaleString()}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>12 weeks ago</span>
            <span>This week</span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span>Trailing 12-week avg: <strong>${trailing12Avg.toLocaleString()}/wk</strong></span>
            <Badge variant={isPodEligible ? 'default' : 'secondary'}>
              {isPodEligible ? 'Pod Eligible' : 'Not Pod Eligible'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pod Eligibility (manager view) */}
      {isManager && teamData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Pod Eligibility (Team)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamData.map((rep: any) => {
                const eligible = rep.trailing12WeekAvg >= podThreshold;
                return (
                  <div key={rep._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{rep.name}</p>
                      <p className="text-xs text-muted-foreground">
                        12-wk avg: ${rep.trailing12WeekAvg?.toLocaleString()}/wk
                      </p>
                    </div>
                    <Badge variant={eligible ? 'default' : 'secondary'}>
                      {eligible ? 'Pod Eligible' : `$${(podThreshold - rep.trailing12WeekAvg).toLocaleString()} to go`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
