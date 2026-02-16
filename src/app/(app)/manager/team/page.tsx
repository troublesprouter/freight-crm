'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users } from 'lucide-react';

function statusColor(value: number, green: number, yellow: number) {
  if (value >= green) return 'text-green-600';
  if (value >= yellow) return 'text-yellow-600';
  return 'text-red-600';
}

export default function TeamOverviewPage() {
  const [reps, setReps] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/metrics/team').then(r => r.json()).then(d => setReps(Array.isArray(d) ? d : []));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Team Overview</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium">Rep</th>
              <th className="pb-3 font-medium text-center">Calls/Day</th>
              <th className="pb-3 font-medium text-center">Talk Time/Day</th>
              <th className="pb-3 font-medium text-center">GP This Week</th>
              <th className="pb-3 font-medium text-center">GP This Month</th>
              <th className="pb-3 font-medium text-center">Onboarded</th>
              <th className="pb-3 font-medium text-center">Pipeline</th>
              <th className="pb-3 font-medium text-center">Discovery %</th>
              <th className="pb-3 font-medium text-center">Pipeline $</th>
            </tr>
          </thead>
          <tbody>
            {reps.map(rep => (
              <tr key={rep._id} className="border-b hover:bg-accent/50">
                <td className="py-3">
                  <Link href={`/manager/rep/${rep._id}`} className="font-medium hover:underline">{rep.name}</Link>
                  <p className="text-xs text-muted-foreground capitalize">{rep.role}</p>
                </td>
                <td className={`py-3 text-center font-medium ${statusColor(rep.callsPerDay, 100, 80)}`}>
                  {rep.callsPerDay}
                </td>
                <td className={`py-3 text-center font-medium ${statusColor(rep.talkTimePerDay, 45, 30)}`}>
                  {rep.talkTimePerDay}m
                </td>
                <td className={`py-3 text-center font-medium ${statusColor(rep.gpThisWeek, 4000, 2000)}`}>
                  ${rep.gpThisWeek.toLocaleString()}
                </td>
                <td className="py-3 text-center">${rep.gpThisMonth.toLocaleString()}</td>
                <td className="py-3 text-center">{rep.customersOnboarded}</td>
                <td className="py-3 text-center">
                  <Badge variant="outline">{rep.activeProspects}</Badge>
                </td>
                <td className="py-3 text-center">{rep.avgDiscovery}%</td>
                <td className="py-3 text-center text-green-600">${rep.pipelineValue.toLocaleString()}/wk</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
