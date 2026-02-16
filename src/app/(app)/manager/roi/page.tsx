'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, DollarSign, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const stageNames: Record<number, string> = {
  1: 'Training', 2: 'Activity Only', 3: 'Activity + Talk Time', 4: 'Activity + TT + Rev', 5: 'Graduated',
};

export default function HiringROIPage() {
  const [data, setData] = useState<any>({ reps: [], classes: {} });

  useEffect(() => {
    fetch('/api/metrics/roi').then(r => r.json()).then(setData);
  }, []);

  const totalInvested = data.reps?.reduce((s: number, r: any) => s + r.totalSalaryPaid, 0) || 0;
  const totalReturned = data.reps?.reduce((s: number, r: any) => s + r.totalGP, 0) || 0;
  const totalNet = totalReturned - totalInvested;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6" /> Hiring ROI</h1>
        <p className="text-sm text-muted-foreground">Track your investment in reps and their return</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Invested</p>
            <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Salaries paid to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total GP Generated</p>
            <p className="text-3xl font-bold text-green-600">${totalReturned.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Net P&L</p>
            <p className={`text-3xl font-bold ${totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalNet >= 0 ? '+' : ''}${totalNet.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-rep table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Per-Rep Investment</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Months</TableHead>
                <TableHead className="text-right">Salary Paid</TableHead>
                <TableHead className="text-right">GP Generated</TableHead>
                <TableHead className="text-right">Net P&L</TableHead>
                <TableHead className="text-right">Monthly GP</TableHead>
                <TableHead className="text-right">Break-even</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.reps || []).map((rep: any) => (
                <TableRow key={rep._id}>
                  <TableCell>
                    <Link href={`/manager/rep/${rep._id}`} className="font-medium hover:underline">{rep.name}</Link>
                    <p className="text-xs text-muted-foreground">{rep.isActive ? '' : '(inactive)'}</p>
                  </TableCell>
                  <TableCell><Badge variant="secondary">{stageNames[rep.stage]}</Badge></TableCell>
                  <TableCell>{rep.monthsSinceHire}</TableCell>
                  <TableCell className="text-right">${rep.totalSalaryPaid.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-green-600">${rep.totalGP.toLocaleString()}</TableCell>
                  <TableCell className={`text-right font-medium ${rep.netPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {rep.netPL >= 0 ? '+' : ''}${rep.netPL.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">${rep.monthlyGP.toLocaleString()}/mo</TableCell>
                  <TableCell className="text-right">
                    {rep.breakEvenMonths ? `~${rep.breakEvenMonths}mo` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cohort view */}
      {Object.keys(data.classes || {}).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Training Classes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(data.classes || {}).map(([className, reps]: [string, any]) => {
              const active = reps.filter((r: any) => r.isActive).length;
              const totalInv = reps.reduce((s: number, r: any) => s + r.totalSalaryPaid, 0);
              const totalRet = reps.reduce((s: number, r: any) => s + r.totalGP, 0);
              return (
                <div key={className} className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{className}</h3>
                    <Badge variant="secondary">{active}/{reps.length} active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invested</p>
                      <p className="font-medium">${totalInv.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Returned</p>
                      <p className="font-medium text-green-600">${totalRet.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net</p>
                      <p className={`font-medium ${totalRet - totalInv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {totalRet - totalInv >= 0 ? '+' : ''}${(totalRet - totalInv).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
