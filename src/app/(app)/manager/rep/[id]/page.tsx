'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PIPELINE_STAGES } from '@/lib/constants';
import Link from 'next/link';
import { ArrowLeft, Phone, Clock, DollarSign, Building2, TrendingUp } from 'lucide-react';

export default function ManagerRepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rep, setRep] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/users/${id}`).then(r => r.json()).then(setRep);
    fetch(`/api/activities?repId=${id}&limit=50`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
    fetch(`/api/companies?owner=${id}`).then(r => r.json()).then(d => setCompanies(Array.isArray(d) ? d : []));
  }, [id]);

  if (!rep) return <div className="p-6">Loading...</div>;

  const hotLeads = companies.filter(c => ['qualifying', 'quoting'].includes(c.status));
  const staleLeads = companies.filter(c => c.daysSinceLastActivity > 14 && !['active_customer', 'inactive_customer'].includes(c.status));

  // Quick metrics
  const calls = activities.filter(a => a.type === 'call_outbound' || a.type === 'call_inbound');
  const totalTalkTime = calls.reduce((s, a) => s + (a.durationSeconds || 0), 0);
  const avgDiscovery = companies.length > 0
    ? Math.round(companies.reduce((s, c) => s + (c.discoveryProgress || 0), 0) / companies.length)
    : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link href="/manager/team" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Team
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{rep.name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{rep.role} · Hired {new Date(rep.hireDate).toLocaleDateString()}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/api/ai/one-on-one-prep?repId=${id}`} target="_blank">Generate 1:1 Prep</Link>
        </Button>
      </div>

      {/* Quick metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Calls (recent)</div>
            <div className="text-2xl font-bold">{calls.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Talk Time</div>
            <div className="text-2xl font-bold">{Math.round(totalTalkTime / 60)}m</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Active Prospects</div>
            <div className="text-2xl font-bold">{companies.filter(c => !['active_customer', 'inactive_customer'].includes(c.status)).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Avg Discovery</div>
            <div className="text-2xl font-bold">{avgDiscovery}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Customers</div>
            <div className="text-2xl font-bold">{companies.filter(c => c.status === 'active_customer').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hot leads */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Hot Leads ({hotLeads.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {hotLeads.map(c => (
              <Link key={c._id} href={`/company/${c._id}`} className="block p-2 rounded hover:bg-accent">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Badge variant="outline" className="text-xs">{PIPELINE_STAGES.find(s => s.key === c.status)?.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.totalTouches} touches · {c.discoveryProgress}% discovered</p>
              </Link>
            ))}
            {hotLeads.length === 0 && <p className="text-sm text-muted-foreground">No hot leads</p>}
          </CardContent>
        </Card>

        {/* Stale leads / at-risk */}
        <Card className={staleLeads.length > 3 ? 'border-red-200' : ''}>
          <CardHeader className="pb-2"><CardTitle className="text-base">Stale Prospects ({staleLeads.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {staleLeads.slice(0, 10).map(c => (
              <Link key={c._id} href={`/company/${c._id}`} className="block p-2 rounded hover:bg-accent">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">{c.name}</p>
                  <Badge variant="destructive" className="text-xs">{c.daysSinceLastActivity}d</Badge>
                </div>
              </Link>
            ))}
            {staleLeads.length === 0 && <p className="text-sm text-muted-foreground">No stale prospects</p>}
          </CardContent>
        </Card>
      </div>

      {/* All prospects */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">All Prospects ({companies.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Company</th>
                  <th className="pb-2 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Touches</th>
                  <th className="pb-2 font-medium">Discovery</th>
                  <th className="pb-2 font-medium">Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c._id} className="border-b hover:bg-accent/50">
                    <td className="py-2">
                      <Link href={`/company/${c._id}`} className="hover:underline">{c.name}</Link>
                    </td>
                    <td className="py-2">
                      <Badge variant="outline" className="text-xs">{PIPELINE_STAGES.find(s => s.key === c.status)?.label}</Badge>
                    </td>
                    <td className="py-2">{c.totalTouches}</td>
                    <td className="py-2">{c.discoveryProgress}%</td>
                    <td className="py-2 text-muted-foreground">{c.lastActivityDate ? new Date(c.lastActivityDate).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
