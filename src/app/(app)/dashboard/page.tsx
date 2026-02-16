'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Phone, Clock, DollarSign, Plus, ArrowRight } from 'lucide-react';
import LogCallDialog from '@/components/LogCallDialog';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<any>({ calls: 0, talkTimeMinutes: 0, grossProfit: 0, poolCount: 0 });
  const [weekMetrics, setWeekMetrics] = useState<any>({ calls: 0, talkTimeMinutes: 0, grossProfit: 0 });
  const [leads, setLeads] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [logCallOpen, setLogCallOpen] = useState(false);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!session) return;
    const [dayRes, weekRes, leadsRes, orgRes] = await Promise.all([
      fetch('/api/metrics?period=day'),
      fetch('/api/metrics?period=week'),
      fetch('/api/companies?owner=me&limit=200'),
      fetch('/api/organization'),
    ]);
    const [dayData, weekData, leadsData, orgData] = await Promise.all([
      dayRes.json(), weekRes.json(), leadsRes.json(), orgRes.json(),
    ]);
    setMetrics(dayData);
    setWeekMetrics(weekData);
    setOrg(orgData);
    const allLeads = leadsData.companies || [];
    setLeads(allLeads);

    // Today's tasks: leads with follow-ups due today or past
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const tasks = allLeads.filter((l: any) => l.nextFollowUp && new Date(l.nextFollowUp) <= today);
    setTodayTasks(tasks);
  }, [session]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const leadCap = org?.settings?.leadCap || 150;
  const poolPct = (metrics.poolCount / leadCap) * 100;
  const dailyTarget = 100;
  const callsRemaining = Math.max(0, dailyTarget - metrics.calls);

  // Stale leads (no contact in 3+ weeks)
  const threeWeeksAgo = new Date();
  threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
  const staleCount = leads.filter((l) => !l.lastContactDate || new Date(l.lastContactDate) < threeWeeksAgo).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Scorecard Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Calls Today</p>
                <p className="text-3xl font-bold">{metrics.calls}</p>
                <p className="text-xs text-muted-foreground">{callsRemaining > 0 ? `${callsRemaining} to target` : 'Target hit!'}</p>
              </div>
            </div>
            <Progress value={Math.min(100, (metrics.calls / dailyTarget) * 100)} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Talk Time Today</p>
                <p className="text-3xl font-bold">{metrics.talkTimeMinutes}<span className="text-lg">m</span></p>
                <p className="text-xs text-muted-foreground">Week: {weekMetrics.talkTimeMinutes}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GP This Week</p>
                <p className="text-3xl font-bold">${weekMetrics.grossProfit?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-lg font-bold text-orange-600">{metrics.poolCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">My Pool</p>
                <p className="text-3xl font-bold">{metrics.poolCount}<span className="text-lg text-muted-foreground">/{leadCap}</span></p>
                {staleCount > 0 && <p className="text-xs text-red-500">{staleCount} stale leads</p>}
              </div>
            </div>
            <Progress value={poolPct} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setLogCallOpen(true)} size="lg">
          <Phone className="h-4 w-4 mr-2" />
          Log Call
        </Button>
        <Link href="/cold-bucket">
          <Button variant="outline" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Prospect
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Follow-ups ({todayTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No follow-ups scheduled for today.</p>
            ) : (
              <div className="space-y-2">
                {todayTasks.slice(0, 10).map((lead: any) => (
                  <Link key={lead._id} href={`/leads/${lead._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.industry || 'No industry'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{lead.status}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Pool */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Lead Pool</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leads in your pool. <Link href="/cold-bucket" className="text-primary underline">Start prospecting</Link></p>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 10).map((lead: any) => (
                  <Link key={lead._id} href={`/leads/${lead._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Touches: {lead.totalTouches} · Last: {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <Badge variant={lead.status === 'hot' ? 'destructive' : lead.status === 'warm' ? 'default' : 'secondary'} className="text-xs">
                      {lead.status}
                    </Badge>
                  </Link>
                ))}
                {leads.length > 10 && (
                  <p className="text-xs text-center text-muted-foreground pt-2">
                    +{leads.length - 10} more leads
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LogCallDialog open={logCallOpen} onOpenChange={setLogCallOpen} leads={leads} onLogged={fetchData} />
    </div>
  );
}
