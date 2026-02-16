'use client';

import { useEffect, useState, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PIPELINE_STAGES, CONTACT_ROLES, CALL_OUTCOMES, DISCOVERY_QUESTIONS } from '@/lib/constants';
import { Phone, Mail, MessageSquare, Clock, ArrowLeft, CheckCircle2, Circle, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PreCallScreen({ params }: { params: Promise<{ id: string; contactId: string }> }) {
  const { id, contactId } = use(params);
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({});
  const [logging, setLogging] = useState(false);
  const [callForm, setCallForm] = useState({ outcome: '', durationSeconds: 0, notes: '', followUpDate: '', followUpNote: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${id}`).then(r => r.json()).then(setCompany);
    fetch(`/api/contacts/${contactId}`).then(r => r.json()).then(setContact);
    fetch(`/api/activities?companyId=${id}&limit=10`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
    fetch(`/api/deals?companyId=${id}`).then(r => r.json()).then(d => setDeals(Array.isArray(d) ? d : []));
    fetch(`/api/discovery?companyId=${id}`).then(r => r.json()).then(data => {
      const map: Record<string, string> = {};
      if (Array.isArray(data)) data.forEach((a: any) => { map[a.questionId] = a.answer; });
      setDiscoveryAnswers(map);
    });
  }, [id, contactId]);

  const handleLogCall = async () => {
    setSaving(true);
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: id,
        contactId,
        type: 'call_outbound',
        outcome: callForm.outcome,
        durationSeconds: callForm.durationSeconds,
        notes: callForm.notes,
      }),
    });
    if (callForm.followUpDate) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Follow up with ${contact?.name} at ${company?.name}`,
          notes: callForm.followUpNote,
          dueDate: callForm.followUpDate,
          companyId: id,
          contactId,
          triggerSource: 'manual',
        }),
      });
    }
    setSaving(false);
    setLogging(false);
    setCallForm({ outcome: '', durationSeconds: 0, notes: '', followUpDate: '', followUpNote: '' });
    // Refresh activities
    fetch(`/api/activities?companyId=${id}&limit=10`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
  };

  const unansweredQuestions = DISCOVERY_QUESTIONS.filter(q => !discoveryAnswers[q.id]);
  const stageLabel = PIPELINE_STAGES.find(s => s.key === company?.status)?.label || '';

  if (!company || !contact) return <div className="p-6">Loading pre-call screen...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href={`/company/${id}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to {company.name}
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Relationship context */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" /> {contact.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{contact.title}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {CONTACT_ROLES.find(r => r.key === contact.role)?.label}
              </Badge>
              {contact.phone && <p className="mt-2 text-sm"><Phone className="h-3 w-3 inline mr-1" />{contact.phone}</p>}
              {contact.email && <p className="text-sm"><Mail className="h-3 w-3 inline mr-1" />{contact.email}</p>}
              {contact.bestTimeToReach && <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-1" />Best: {contact.bestTimeToReach}</p>}
              {contact.preferredContactMethod && <p className="text-xs text-muted-foreground">Prefers: {contact.preferredContactMethod}</p>}
            </CardContent>
          </Card>

          {/* Personal details — prominently displayed */}
          {(contact.personalKids || contact.personalSportsTeam || contact.personalHobbies || contact.personalPastJobs || contact.personalNotes) && (
            <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Personal Rapport</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                {contact.personalKids && <p>👨‍👧 <strong>Kids:</strong> {contact.personalKids}</p>}
                {contact.personalSportsTeam && <p>🏈 <strong>Sports:</strong> {contact.personalSportsTeam}</p>}
                {contact.personalHobbies && <p>🎯 <strong>Hobbies:</strong> {contact.personalHobbies}</p>}
                {contact.personalPastJobs && <p>💼 <strong>Past work:</strong> {contact.personalPastJobs}</p>}
                {contact.personalNotes && <p>📝 {contact.personalNotes}</p>}
              </CardContent>
            </Card>
          )}

          {/* Last 5 interactions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Interactions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {activities.slice(0, 5).map(a => (
                <div key={a._id} className="text-sm border-l-2 border-accent pl-3 py-1">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{a.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()}</span>
                  </div>
                  {a.outcome && <Badge variant="outline" className="text-[10px]">{a.outcome}</Badge>}
                  {a.durationSeconds > 0 && <span className="text-xs text-muted-foreground ml-1">{Math.round(a.durationSeconds / 60)}m</span>}
                  {a.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.notes}</p>}
                </div>
              ))}
              {activities.length === 0 && <p className="text-xs text-muted-foreground">First contact — no history yet</p>}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Business context */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{company.name}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge>{stageLabel}</Badge>
                {company.discoveryProgress > 0 && <Badge variant="secondary">{company.discoveryProgress}% discovered</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><span className="text-muted-foreground">Commodities:</span><br/>{company.commodityTypes?.join(', ') || '—'}</div>
                <div><span className="text-muted-foreground">Equipment:</span><br/>{company.equipmentTypes?.join(', ') || '—'}</div>
                <div><span className="text-muted-foreground">Volume:</span><br/>{company.weeklyTruckloadVolume || '—'} loads/wk</div>
                <div><span className="text-muted-foreground">Freight Mgmt:</span><br/>{company.managesFreightVia || '—'}</div>
                <div><span className="text-muted-foreground">Geography:</span><br/>{company.geography?.join(', ') || '—'}</div>
                {company.hasRFP && <div><span className="text-muted-foreground">RFP:</span><br/>{company.rfpCycle} {company.rfpNextDate ? `— ${new Date(company.rfpNextDate).toLocaleDateString()}` : ''}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Open deals / quotes */}
          {deals.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Open Deals</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {deals.map(d => (
                  <div key={d._id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{d.lanes || d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.equipmentType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600">${d.estimatedWeeklyGP}/wk</p>
                      <Badge variant="outline" className="text-[10px]">{PIPELINE_STAGES.find(s => s.key === d.stage)?.label}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Unanswered discovery questions */}
          {unansweredQuestions.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Ask Next ({unansweredQuestions.length} remaining)</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                {unansweredQuestions.slice(0, 5).map(q => (
                  <div key={q.id} className="flex items-start gap-2 text-sm">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{q.question}</span>
                  </div>
                ))}
                {unansweredQuestions.length > 5 && (
                  <p className="text-xs text-muted-foreground ml-5">+{unansweredQuestions.length - 5} more</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-background border-t p-4">
        {!logging ? (
          <div className="max-w-7xl mx-auto flex gap-3">
            <Button onClick={() => setLogging(true)} className="flex-1"><Phone className="h-4 w-4 mr-2" /> Log Call</Button>
            <Button variant="outline"><Mail className="h-4 w-4 mr-2" /> Email <Badge variant="secondary" className="ml-1 text-[10px]">Coming Soon</Badge></Button>
            <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Note</Button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <Select value={callForm.outcome} onValueChange={v => setCallForm(f => ({ ...f, outcome: v }))}>
                <SelectTrigger><SelectValue placeholder="Outcome" /></SelectTrigger>
                <SelectContent>{CALL_OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="Minutes" min={0} value={callForm.durationSeconds / 60 || ''} onChange={e => setCallForm(f => ({ ...f, durationSeconds: Math.round(Number(e.target.value) * 60) }))} />
              <Input type="date" value={callForm.followUpDate} onChange={e => setCallForm(f => ({ ...f, followUpDate: e.target.value }))} placeholder="Follow-up date" />
              <Input value={callForm.followUpNote} onChange={e => setCallForm(f => ({ ...f, followUpNote: e.target.value }))} placeholder="Follow-up note" />
            </div>
            <div className="flex gap-3">
              <Textarea value={callForm.notes} onChange={e => setCallForm(f => ({ ...f, notes: e.target.value }))} placeholder="Call notes..." rows={2} className="flex-1" />
              <div className="flex flex-col gap-2">
                <Button onClick={handleLogCall} disabled={saving || !callForm.outcome}>{saving ? 'Saving...' : 'Save'}</Button>
                <Button variant="ghost" size="sm" onClick={() => setLogging(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
