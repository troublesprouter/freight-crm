'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/organization').then(r => r.json()).then(d => { setOrg(d); setForm(d?.settings || {}); });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: form }),
    });
    setSaving(false);
  };

  if (!org) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Lead Pool</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Lead Cap (per rep)</Label>
              <Input type="number" value={form.leadCap || 150} onChange={e => setForm({ ...form, leadCap: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">Max active prospects per rep (stages 1-6)</p>
            </div>
            <div>
              <Label>Cooldown Days</Label>
              <Input type="number" value={form.cooldownDays || 7} onChange={e => setForm({ ...form, cooldownDays: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">Days before released lead can be reclaimed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Inactive Customer Detection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Warning Days</Label>
              <Input type="number" value={form.inactiveWarningDays || 30} onChange={e => setForm({ ...form, inactiveWarningDays: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">Days with no activity before warning</p>
            </div>
            <div>
              <Label>Auto-move to Inactive Days</Label>
              <Input type="number" value={form.inactiveAutoMoveDays || 60} onChange={e => setForm({ ...form, inactiveAutoMoveDays: Number(e.target.value) })} />
              <p className="text-xs text-muted-foreground mt-1">Days before auto-moving to Inactive stage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Commission</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Commission %</Label>
              <Input type="number" value={form.commissionPct || 25} onChange={e => setForm({ ...form, commissionPct: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Base Salary (monthly)</Label>
              <Input type="number" value={form.baseSalary || 4000} onChange={e => setForm({ ...form, baseSalary: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Commission Threshold (weekly GP)</Label>
              <Input type="number" value={form.commissionThreshold || 4000} onChange={e => setForm({ ...form, commissionThreshold: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Support Staff Cost (monthly)</Label>
              <Input type="number" value={form.supportStaffCost || 1000} onChange={e => setForm({ ...form, supportStaffCost: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Trailing Average Weeks</Label>
              <Input type="number" value={form.trailingAvgWeeks || 12} onChange={e => setForm({ ...form, trailingAvgWeeks: Number(e.target.value) })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Performance Benchmarks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(form.benchmarks || []).map((b: any, i: number) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <div className="text-sm font-medium">Month {b.month}</div>
                <div>
                  <Label className="text-xs">Calls/day</Label>
                  <Input type="number" value={b.callsPerDay} onChange={e => {
                    const benchmarks = [...(form.benchmarks || [])];
                    benchmarks[i] = { ...benchmarks[i], callsPerDay: Number(e.target.value) };
                    setForm({ ...form, benchmarks });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Talk time (min)</Label>
                  <Input type="number" value={b.talkTimeMinutes} onChange={e => {
                    const benchmarks = [...(form.benchmarks || [])];
                    benchmarks[i] = { ...benchmarks[i], talkTimeMinutes: Number(e.target.value) };
                    setForm({ ...form, benchmarks });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Monthly GP</Label>
                  <Input type="number" value={b.monthlyGP} onChange={e => {
                    const benchmarks = [...(form.benchmarks || [])];
                    benchmarks[i] = { ...benchmarks[i], monthlyGP: Number(e.target.value) };
                    setForm({ ...form, benchmarks });
                  }} />
                </div>
                <div>
                  <Label className="text-xs">Weekly GP</Label>
                  <Input type="number" value={b.weeklyGP} onChange={e => {
                    const benchmarks = [...(form.benchmarks || [])];
                    benchmarks[i] = { ...benchmarks[i], weeklyGP: Number(e.target.value) };
                    setForm({ ...form, benchmarks });
                  }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Integrations</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-dashed text-center">
              <p className="font-medium">Email Sync</p>
              <p className="text-sm text-muted-foreground">Gmail / Outlook</p>
              <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
            </div>
            <div className="p-4 rounded-lg border border-dashed text-center">
              <p className="font-medium">VoIP / Dialer</p>
              <p className="text-sm text-muted-foreground">RingCentral, Aircall, Dialpad</p>
              <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}
