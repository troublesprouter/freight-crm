'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

export default function ROIPage() {
  const [reps, setReps] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/metrics/roi').then(r => r.json()).then(d => setReps(Array.isArray(d) ? d : []));
  }, []);

  const totalInvested = reps.reduce((s, r) => s + r.totalSalaryPaid, 0);
  const totalReturned = reps.reduce((s, r) => s + r.totalGP, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Hiring ROI</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Total Invested</div>
            <div className="text-2xl font-bold text-red-600">${totalInvested.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Total GP Returned</div>
            <div className="text-2xl font-bold text-green-600">${totalReturned.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Net P&L</div>
            <div className={`text-2xl font-bold ${totalReturned - totalInvested >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalReturned - totalInvested).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Per-Rep P&L</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Rep</th>
                <th className="pb-2 font-medium">Hired</th>
                <th className="pb-2 font-medium">Months</th>
                <th className="pb-2 font-medium text-right">Salary Paid</th>
                <th className="pb-2 font-medium text-right">GP Generated</th>
                <th className="pb-2 font-medium text-right">Net P&L</th>
                <th className="pb-2 font-medium text-center">Break-even</th>
              </tr>
            </thead>
            <tbody>
              {reps.map(r => (
                <tr key={r._id} className="border-b">
                  <td className="py-2 font-medium">{r.name}</td>
                  <td className="py-2 text-muted-foreground">{new Date(r.hireDate).toLocaleDateString()}</td>
                  <td className="py-2">{r.monthsEmployed}</td>
                  <td className="py-2 text-right text-red-600">${r.totalSalaryPaid.toLocaleString()}</td>
                  <td className="py-2 text-right text-green-600">${r.totalGP.toLocaleString()}</td>
                  <td className={`py-2 text-right font-medium ${r.netPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${r.netPL.toLocaleString()}
                  </td>
                  <td className="py-2 text-center">
                    {r.breakEvenMonths ? (
                      <Badge variant={r.breakEvenMonths <= r.monthsEmployed ? 'default' : 'outline'}>
                        ~{r.breakEvenMonths}mo
                      </Badge>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
