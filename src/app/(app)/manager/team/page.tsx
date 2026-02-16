'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, ArrowUpDown } from 'lucide-react';

const stageNames: Record<number, string> = {
  1: 'Training',
  2: 'Activity Only',
  3: 'Activity + Talk Time',
  4: 'Activity + TT + Rev',
  5: 'Graduated',
};

const stageTargets: Record<number, any> = {
  2: { weeklyCalls: 400 },
  3: { weeklyCalls: 400, weeklyTalkTimeMinutes: 225 },
  4: { weeklyCalls: 400, weeklyGP: 625 },
  5: { weeklyGP: 4000 },
};

function getColor(value: number, target: number) {
  if (!target) return '';
  const pct = value / target;
  if (pct >= 1) return 'text-green-600 font-bold';
  if (pct >= 0.8) return 'text-yellow-600';
  return 'text-red-600';
}

export default function TeamOverviewPage() {
  const [reps, setReps] = useState<any[]>([]);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('/api/metrics/team').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setReps(data);
    });
  }, []);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...reps].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av || 0) - (bv || 0);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  // Summary stats
  const totalReps = reps.length;
  const totalWeekGP = reps.reduce((s, r) => s + (r.weekGP || 0), 0);
  const totalWeekCalls = reps.reduce((s, r) => s + (r.weekCalls || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Team Overview</h1>
          <p className="text-sm text-muted-foreground">{totalReps} reps · ${totalWeekGP.toLocaleString()} GP this week · {totalWeekCalls} calls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map(stage => {
          const count = reps.filter(r => r.stage === stage).length;
          if (count === 0) return null;
          return (
            <Card key={stage}>
              <CardContent className="pt-4 pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{stageNames[stage]}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { key: 'name', label: 'Rep' },
                  { key: 'stage', label: 'Stage' },
                  { key: 'weekCalls', label: 'Calls (Week)' },
                  { key: 'weekTalkTimeMinutes', label: 'Talk Time' },
                  { key: 'weekGP', label: 'GP (Week)' },
                  { key: 'trailing12WeekAvg', label: 'GP (12-wk Avg)' },
                  { key: 'poolCount', label: 'Pool' },
                ].map(col => (
                  <TableHead key={col.key} className="cursor-pointer" onClick={() => toggleSort(col.key)}>
                    <div className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((rep: any) => {
                const targets = stageTargets[rep.stage] || {};
                return (
                  <TableRow key={rep._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rep.name}</p>
                        <p className="text-xs text-muted-foreground">{rep.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stageNames[rep.stage] || `S${rep.stage}`}</Badge>
                    </TableCell>
                    <TableCell className={getColor(rep.weekCalls, targets.weeklyCalls)}>
                      {rep.weekCalls}{targets.weeklyCalls ? `/${targets.weeklyCalls}` : ''}
                    </TableCell>
                    <TableCell className={getColor(rep.weekTalkTimeMinutes, targets.weeklyTalkTimeMinutes)}>
                      {rep.weekTalkTimeMinutes}m
                    </TableCell>
                    <TableCell className={getColor(rep.weekGP, targets.weeklyGP)}>
                      ${rep.weekGP?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell>${rep.trailing12WeekAvg?.toLocaleString() || 0}/wk</TableCell>
                    <TableCell>{rep.poolCount}</TableCell>
                    <TableCell>
                      <Link href={`/manager/rep/${rep._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reps found. Invite team members from Settings.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
