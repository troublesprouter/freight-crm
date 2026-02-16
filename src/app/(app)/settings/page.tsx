'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Copy, Check, UserPlus } from 'lucide-react';

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [settings, setSettings] = useState({
    leadCap: 150,
    cooldownDays: 7,
    commissionPct: 25,
    baseSalary: 4000,
    podThreshold: 4000,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/organization').then(r => r.json()).then(data => {
      setOrg(data);
      if (data.settings) {
        setSettings({
          leadCap: data.settings.leadCap || 150,
          cooldownDays: data.settings.cooldownDays || 7,
          commissionPct: data.settings.commissionPct || 25,
          baseSalary: data.settings.baseSalary || 4000,
          podThreshold: data.settings.podThreshold || 4000,
        });
      }
    });
    fetch('/api/users').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setUsers(data);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/organization', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: { ...org?.settings, ...settings } }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const copyInviteCode = () => {
    if (org?.inviteCode) {
      navigator.clipboard.writeText(org.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const res = await fetch('/api/users');
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><SettingsIcon className="h-6 w-6" /> Settings</h1>

      {/* Invite Code */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Organization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Organization Name</Label>
            <p className="text-lg font-medium">{org?.name || 'Loading...'}</p>
          </div>
          <div>
            <Label>Invite Code</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="bg-muted px-3 py-2 rounded text-sm font-mono">{org?.inviteCode || '...'}</code>
              <Button variant="outline" size="sm" onClick={copyInviteCode}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Share this code with new team members to join your organization.</p>
          </div>
        </CardContent>
      </Card>

      {/* Lead Pool Settings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Lead Pool</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lead Cap per Rep</Label>
              <Input type="number" value={settings.leadCap} onChange={e => setSettings({ ...settings, leadCap: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-muted-foreground mt-1">Max active leads per rep</p>
            </div>
            <div>
              <Label>Cooldown Days</Label>
              <Input type="number" value={settings.cooldownDays} onChange={e => setSettings({ ...settings, cooldownDays: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-muted-foreground mt-1">Days before released lead is available</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Settings */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Commission & Compensation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Commission %</Label>
              <Input type="number" value={settings.commissionPct} onChange={e => setSettings({ ...settings, commissionPct: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Base Salary (monthly)</Label>
              <Input type="number" value={settings.baseSalary} onChange={e => setSettings({ ...settings, baseSalary: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>Pod Threshold (weekly GP)</Label>
              <Input type="number" value={settings.podThreshold} onChange={e => setSettings({ ...settings, podThreshold: parseInt(e.target.value) || 0 })} />
              <p className="text-xs text-muted-foreground mt-1">GP/week for pod eligibility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg">
        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
      </Button>

      {/* Team Members */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Team Members</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="rep">Rep</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Badge variant="secondary">Stage {u.stage}</Badge>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-sm text-muted-foreground">No team members yet. Share the invite code to add reps.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
