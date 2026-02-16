'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CALL_OUTCOMES } from '@/lib/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  companyId?: string;
  contactId?: string;
}

export default function LogCallDialog({ open, onClose, companyId, contactId }: Props) {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({
    companyId: companyId || '',
    contactId: contactId || '',
    type: 'call_outbound' as string,
    outcome: '',
    durationSeconds: 0,
    notes: '',
    followUpDate: '',
    followUpNote: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    const userId = (session.user as any).id;
    fetch(`/api/companies?owner=${userId}`)
      .then(r => r.json())
      .then(d => setCompanies(Array.isArray(d) ? d : []));
  }, [session]);

  useEffect(() => {
    if (!form.companyId) return;
    fetch(`/api/contacts?companyId=${form.companyId}`)
      .then(r => r.json())
      .then(d => setContacts(Array.isArray(d) ? d : []));
  }, [form.companyId]);

  const handleSave = async () => {
    if (!form.companyId || !form.outcome) return;
    setSaving(true);
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: form.companyId,
          contactId: form.contactId || undefined,
          type: form.type,
          outcome: form.outcome,
          durationSeconds: form.durationSeconds,
          notes: form.notes,
        }),
      });

      // Create follow-up task if specified
      if (form.followUpDate) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Follow up with ${companies.find(c => c._id === form.companyId)?.name || 'company'}`,
            notes: form.followUpNote,
            dueDate: form.followUpDate,
            companyId: form.companyId,
            contactId: form.contactId || undefined,
            triggerSource: 'manual',
          }),
        });
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Call</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!companyId && (
            <div>
              <Label>Company</Label>
              <Select value={form.companyId} onValueChange={v => setForm(f => ({ ...f, companyId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {contacts.length > 0 && (
            <div>
              <Label>Contact</Label>
              <Select value={form.contactId} onValueChange={v => setForm(f => ({ ...f, contactId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>
                  {contacts.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name} — {c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Direction</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="call_outbound">Outbound</SelectItem>
                  <SelectItem value="call_inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Outcome</Label>
              <Select value={form.outcome} onValueChange={v => setForm(f => ({ ...f, outcome: v }))}>
                <SelectTrigger><SelectValue placeholder="Outcome" /></SelectTrigger>
                <SelectContent>
                  {CALL_OUTCOMES.map(o => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min={0}
              value={form.durationSeconds / 60}
              onChange={e => setForm(f => ({ ...f, durationSeconds: Math.round(Number(e.target.value) * 60) }))}
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Call notes..."
              rows={3}
            />
          </div>

          <div className="border-t pt-3 space-y-3">
            <p className="text-sm font-medium">Schedule Follow-up</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
              </div>
              <div>
                <Label>Note to self</Label>
                <Input value={form.followUpNote} onChange={e => setForm(f => ({ ...f, followUpNote: e.target.value }))} placeholder="What to discuss" />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving || !form.companyId || !form.outcome} className="w-full">
            {saving ? 'Saving...' : 'Log Call & Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
