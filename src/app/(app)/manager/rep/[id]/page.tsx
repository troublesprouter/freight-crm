'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Phone, Clock, DollarSign, TrendingDown, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

const stageNames: Record<number, string> = {
  1: 'Training', 2: 'Activity Only', 3: 'Activity + Talk Time', 4: 'Activity + TT + Revenue', 5: 'Graduated',
};

function MiniSparkline({ data, color = 'blue' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 120, h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function ManagerRepDetailPage() {
  const { id } = useParams();
  const [rep, setRep] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [hotLeads, setHotLeads] = useState<any[]>([]);
  const [dayMetrics, setDayMetrics] = useState<any>(null);
  const [weekMetrics, setWeekMetrics] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [repRes, weeklyRes, dayRes, weekRes, leadsRes] = await Promise.all([
      fetch(`/api/users/${id}`),
      fetch(`/api/metrics/weekly?repId=${id}&weeks=4`),
      fetch(`/api/metrics?repId=${id}&period=day`),
      fetch(`/api/metrics?repId=${id}&period=week`),
      fetch(`/api/companies?owner=${id}&limit=200`),
    ]);
    const [repData, weeklyD, dayData, weekData, leadsData] = await Promise.all([
      repRes.json(), weeklyRes.json(), dayRes.json(), weekRes.json(), leadsRes.json(),
    ]);
    setRep(repData);
    setWeeklyData(Array.isArray(weeklyD) ? weeklyD : []);
    setDayMetrics(dayData);
    setWeekMetrics(weekData);

    // Hot leads: sort by recent activity + talk time
    const companies = leadsData.companies || [];
    const sorted = companies.sort((a: any, b: any) => {
      const aScore = (a.totalTouches || 0) + (a.lastContactDate ? 1 : 0);
      const bScore = (b.totalTouches || 0) + (b.lastContactDate ? 1 : 0);
      return bScore - aScore;
    });
    setHotLeads(sorted.slice(0, 10));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/one-on-one-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repId: id }),
      });
      const data = await res.json();
      setAiSummary(data.summary || 'Could not generate summary.');
    } catch {
      setAiSummary('Error generating summary.');
    }
    setAiLoading(false);
  };

  const handleStageChange = async (stage: string) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: parseInt(stage) }),
    });
    fetchData();
  };

  // At-risk check: 2+ weeks declining
  const isAtRisk = weeklyData.length >= 3 &&
    weeklyData[weeklyData.length - 1]?.calls < weeklyData[weeklyData.length - 2]?.calls &&
    weeklyData[weeklyData.length - 2]?.calls < weeklyData[weeklyData.length - 3]?.calls;

  if (!rep) return <div className="p-6">Loading...</div>;

  const daysInStage = Math.floor((Date.now() - new Date(rep.hireDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Link href="/manager/team" className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Team
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {rep.name}
            {isAtRisk && <Badge variant="destructive" className="ml-2"><AlertTriangle className="h-3 w-3 mr-1" />At Risk</Badge>}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{rep.email}</span>
            <Badge variant="secondary">{stageNames[rep.stage]}</Badge>
            <span>{daysInStage} days since hire</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={rep.stage?.toString()} onValueChange={handleStageChange}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Change stage" /></SelectTrigger>
            <SelectContent>
              {Object.entries(stageNames).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* This Week's Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calls Today</p>
                <p className="text-3xl font-bold">{dayMetrics?.calls || 0}</p>
              </div>
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calls This Week</p>
                <p className="text-3xl font-bold">{weekMetrics?.calls || 0}</p>
              </div>
              <MiniSparkline data={weeklyData.map(w => w.calls)} color="#3b82f6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Talk Time (Week)</p>
                <p className="text-3xl font-bold">{weekMetrics?.talkTimeMinutes || 0}<span className="text-lg">m</span></p>
              </div>
              <MiniSparkline data={weeklyData.map(w => w.talkTimeMinutes)} color="#8b5cf6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">GP This Week</p>
                <p className="text-3xl font-bold">${weekMetrics?.grossProfit?.toLocaleString() || 0}</p>
              </div>
              <MiniSparkline data={weeklyData.map(w => w.grossProfit)} color="#22c55e" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">4-Week Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Week</th>
                  <th className="text-right py-2">Calls</th>
                  <th className="text-right py-2">Talk Time</th>
                  <th className="text-right py-2">GP</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((w: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{new Date(w.weekStart).toLocaleDateString()}</td>
                    <td className="text-right py-2">{w.calls}</td>
                    <td className="text-right py-2">{w.talkTimeMinutes}m</td>
                    <td className="text-right py-2">${w.grossProfit?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Leads */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Hot Leads ({hotLeads.length})</CardTitle></CardHeader>
          <CardContent>
            {hotLeads.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active leads.</p>
            ) : (
              <div className="space-y-2">
                {hotLeads.map((lead: any) => (
                  <Link key={lead._id} href={`/leads/${lead._id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Touches: {lead.totalTouches} · Last: {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">{lead.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* One-on-One Prep */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">One-on-One Prep</CardTitle>
            <Button size="sm" onClick={handleGenerateSummary} disabled={aiLoading}>
              <Sparkles className="h-3 w-3 mr-1" />
              {aiLoading ? 'Generating...' : 'Generate'}
            </Button>
          </CardHeader>
          <CardContent>
            {aiSummary ? (
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{aiSummary}</div>
            ) : (
              <p className="text-sm text-muted-foreground">Click Generate to create an AI-powered coaching summary for your next one-on-one with {rep.name}.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
