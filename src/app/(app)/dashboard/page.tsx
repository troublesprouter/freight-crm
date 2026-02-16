'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Phone, Clock, DollarSign, AlertTriangle, CheckCircle2, Building2, Plus } from 'lucide-react';
import LogCallDialog from '@/components/LogCallDialog';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ callsToday: 0, talkTimeToday: 0, gpThisWeek: 0, activeProspects: 0, leadCap: 150 });
  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [inactiveCustomers, setInactiveCustomers] = useState<any[]>([]);
  const [showLogCall, setShowLogCall] = useState(false);

  useEffect(() => {
    if (!session) return;
    const userId = (session.user as any).id;

    // Fetch tasks
    fetch(`/api/tasks?repId=${userId}&status=pending`)
      .then(r => r.json())
      .then(data => setTasks(Array.isArray(data) ? data : []));

    // Fetch metrics
    fetch(`/api/metrics?repId=${userId}`)
      .then(r => r.json())
      .then(data => setMetrics(prev => ({ ...prev, ...data })));

    // Fetch hot leads (stages 4-5)
    fetch(`/api/companies?owner=${userId}&status=qualifying`)
      .then(r => r.json())
      .then(data => {
        const leads = Array.isArray(data) ? data : [];
        setHotLeads(leads.slice(0, 5));
      });

    // Fetch inactive customers
    fetch(`/api/companies?owner=${userId}&status=inactive_customer`)
      .then(r => r.json())
      .then(data => setInactiveCustomers(Array.isArray(data) ? data.slice(0, 5) : []));
  }, [session]);

  const todayTasks = tasks.filter(t => {
    const due = new Date(t.dueDate);
    const today = new Date();
    return due.toDateString() === today.toDateString();
  });
  const overdueTasks = tasks.filter(t => {
    const due = new Date(t.dueDate);
    return due < new Date() && t.status !== 'completed';
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Good morning, {session?.user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Button onClick={() => setShowLogCall(true)}>
          <Phone className="h-4 w-4 mr-2" /> Log Call
        </Button>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Calls Today</div>
            <div className="text-3xl font-bold">{metrics.callsToday}</div>
            <div className="text-xs text-muted-foreground">Target: 100</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Talk Time</div>
            <div className="text-3xl font-bold">{metrics.talkTimeToday}<span className="text-sm font-normal">m</span></div>
            <div className="text-xs text-muted-foreground">Target: 45m</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">GP This Week</div>
            <div className="text-3xl font-bold text-green-600">${metrics.gpThisWeek.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Active Prospects</div>
            <div className="text-3xl font-bold">{metrics.activeProspects}</div>
            <div className="text-xs text-muted-foreground">/ {metrics.leadCap} cap</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-muted-foreground">Calls to Target</div>
            <div className="text-3xl font-bold text-orange-500">{Math.max(0, 100 - metrics.callsToday)}</div>
            <div className="text-xs text-muted-foreground">remaining</div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Cap Bar */}
      <Card>
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pipeline Capacity</span>
            <span className="text-sm text-muted-foreground">{metrics.activeProspects} / {metrics.leadCap}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all"
              style={{ width: `${Math.min(100, (metrics.activeProspects / metrics.leadCap) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" /> Overdue ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {overdueTasks.slice(0, 5).map(t => (
                <div key={t._id} className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950/20">
                  <div>
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.companyId?.name}</p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {Math.ceil((Date.now() - new Date(t.dueDate).getTime()) / 86400000)}d overdue
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Today's Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Today&apos;s Tasks ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks due today</p>}
            {todayTasks.slice(0, 8).map(t => (
              <div key={t._id} className="flex items-center justify-between p-2 rounded hover:bg-accent">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.companyId?.name}</p>
                </div>
                {t.dueTime && <span className="text-xs text-muted-foreground">{t.dueTime}</span>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Hot Leads */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hotLeads.length === 0 && <p className="text-sm text-muted-foreground">No hot leads yet — keep qualifying!</p>}
            {hotLeads.map(c => (
              <Link key={c._id} href={`/company/${c._id}`} className="flex items-center justify-between p-2 rounded hover:bg-accent block">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.equipmentTypes?.join(', ')}</p>
                </div>
                <Badge variant="secondary">{c.status?.replace('_', ' ')}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Wins — Inactive Customers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Quick Wins — Reactivate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inactiveCustomers.length === 0 && <p className="text-sm text-muted-foreground">No inactive customers</p>}
            {inactiveCustomers.map(c => (
              <Link key={c._id} href={`/company/${c._id}`} className="flex items-center justify-between p-2 rounded hover:bg-accent block">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.daysSinceLastActivity}d since last activity</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {showLogCall && <LogCallDialog open={showLogCall} onClose={() => setShowLogCall(false)} />}
    </div>
  );
}
