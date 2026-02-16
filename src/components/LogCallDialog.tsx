'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Clock, Square } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leads: any[];
  onLogged: () => void;
  preselectedCompanyId?: string;
  preselectedContactId?: string;
}

export default function LogCallDialog({ open, onOpenChange, leads, onLogged, preselectedCompanyId, preselectedContactId }: Props) {
  const [companyId, setCompanyId] = useState(preselectedCompanyId || '');
  const [contactId, setContactId] = useState(preselectedContactId || '');
  const [contacts, setContacts] = useState<any[]>([]);
  const [outcome, setOutcome] = useState('no_answer');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualDuration, setManualDuration] = useState('');

  useEffect(() => {
    if (preselectedCompanyId) setCompanyId(preselectedCompanyId);
    if (preselectedContactId) setContactId(preselectedContactId);
  }, [preselectedCompanyId, preselectedContactId]);

  useEffect(() => {
    if (companyId) {
      fetch(`/api/contacts?companyId=${companyId}`).then(r => r.json()).then(setContacts);
    }
  }, [companyId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerStart) {
      interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - timerStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerStart]);

  const startTimer = () => {
    setTimerStart(Date.now());
    setTimerRunning(true);
  };

  const stopTimer = () => {
    setTimerRunning(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!companyId) return;
    setLoading(true);
    const finalDuration = manualDuration ? parseInt(manualDuration) * 60 : duration;
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId,
        contactId: contactId || undefined,
        type: 'call',
        durationSeconds: finalDuration,
        outcome,
        notes,
      }),
    });
    setLoading(false);
    setCompanyId('');
    setContactId('');
    setOutcome('no_answer');
    setNotes('');
    setDuration(0);
    setTimerRunning(false);
    setTimerStart(null);
    setManualDuration('');
    onOpenChange(false);
    onLogged();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" /> Log Call
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company</Label>
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
              <SelectContent>
                {leads.map((l: any) => (
                  <SelectItem key={l._id} value={l._id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label>Contact</Label>
              <Select value={contactId} onValueChange={setContactId}>
                <SelectTrigger><SelectValue placeholder="Select contact (optional)" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c: any) => (
                    <SelectItem key={c._id} value={c._id}>{c.name} {c.title && `(${c.title})`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-3">
              {timerRunning ? (
                <Button type="button" variant="destructive" size="sm" onClick={stopTimer}>
                  <Square className="h-3 w-3 mr-1" /> Stop
                </Button>
              ) : (
                <Button type="button" variant="outline" size="sm" onClick={startTimer}>
                  <Clock className="h-3 w-3 mr-1" /> Start Timer
                </Button>
              )}
              <span className="text-2xl font-mono font-bold">{formatTime(duration)}</span>
              <span className="text-muted-foreground text-sm">or</span>
              <Input type="number" placeholder="min" className="w-20" value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="meeting_booked">Meeting Booked</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Quick notes..." rows={3} />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={loading || !companyId}>
            {loading ? 'Logging...' : 'Log Call'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
