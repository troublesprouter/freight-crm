'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft, Phone, Mail, Calendar, MessageSquare, User, Plus, Trash2, Clock, Building2, Tag, Globe, MapPin,
} from 'lucide-react';
import Link from 'next/link';
import LogCallDialog from '@/components/LogCallDialog';

const statusColors: Record<string, string> = {
  cold: 'bg-blue-100 text-blue-800',
  warm: 'bg-yellow-100 text-yellow-800',
  hot: 'bg-red-100 text-red-800',
  quoting: 'bg-purple-100 text-purple-800',
  onboarded: 'bg-green-100 text-green-800',
  active: 'bg-emerald-100 text-emerald-800',
  released: 'bg-gray-100 text-gray-800',
};

const outcomeLabels: Record<string, string> = {
  no_answer: 'No Answer',
  voicemail: 'Voicemail',
  connected: 'Connected',
  meeting_booked: 'Meeting Booked',
};

const activityIcons: Record<string, any> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: MessageSquare,
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [logCallOpen, setLogCallOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', title: '', phone: '', email: '' });
  const [noteText, setNoteText] = useState('');
  const [editQualOpen, setEditQualOpen] = useState(false);
  const [qualification, setQualification] = useState({ lanes: '', commodities: '', equipmentTypes: '', estWeeklyLoads: 0 });
  const [tags, setTags] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');

  const fetchData = useCallback(async () => {
    const [compRes, contRes, actRes] = await Promise.all([
      fetch(`/api/companies/${id}`),
      fetch(`/api/contacts?companyId=${id}`),
      fetch(`/api/activities?companyId=${id}&limit=50`),
    ]);
    const [compData, contData, actData] = await Promise.all([
      compRes.json(), contRes.json(), actRes.json(),
    ]);
    setCompany(compData);
    setContacts(contData);
    setActivities(actData);
    if (compData.qualification) {
      setQualification({
        lanes: compData.qualification.lanes?.join(', ') || '',
        commodities: compData.qualification.commodities?.join(', ') || '',
        equipmentTypes: compData.qualification.equipmentTypes?.join(', ') || '',
        estWeeklyLoads: compData.qualification.estWeeklyLoads || 0,
      });
    }
    setTags(compData.tags?.join(', ') || '');
    setNextFollowUp(compData.nextFollowUp ? new Date(compData.nextFollowUp).toISOString().split('T')[0] : '');
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRelease = async () => {
    if (!confirm('Release this lead back to the cold bucket?')) return;
    await fetch(`/api/companies/${id}/release`, { method: 'POST' });
    router.push('/dashboard');
  };

  const handleAddContact = async () => {
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newContact, companyId: id }),
    });
    setNewContact({ name: '', title: '', phone: '', email: '' });
    setAddContactOpen(false);
    fetchData();
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${contactId}`, { method: 'DELETE' });
    fetchData();
  };

  const handleAddNote = async () => {
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: id, type: 'note', notes: noteText }),
    });
    setNoteText('');
    setAddNoteOpen(false);
    fetchData();
  };

  const handleStatusChange = async (status: string) => {
    await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setEditStatusOpen(false);
    fetchData();
  };

  const handleSaveQualification = async () => {
    await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qualification: {
          lanes: qualification.lanes.split(',').map(s => s.trim()).filter(Boolean),
          commodities: qualification.commodities.split(',').map(s => s.trim()).filter(Boolean),
          equipmentTypes: qualification.equipmentTypes.split(',').map(s => s.trim()).filter(Boolean),
          estWeeklyLoads: qualification.estWeeklyLoads,
        },
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      }),
    });
    setEditQualOpen(false);
    fetchData();
  };

  if (!company) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{company.name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {company.industry && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company.industry}</span>}
                    {company.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.address}</span>}
                    {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary"><Globe className="h-3 w-3" />{company.website}</a>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[company.status] || ''} onClick={() => setEditStatusOpen(true)} style={{ cursor: 'pointer' }}>
                    {company.status}
                  </Badge>
                  {company.ownerRepId && (
                    <Button variant="outline" size="sm" onClick={handleRelease}>Release</Button>
                  )}
                </div>
              </div>
              <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                <span>Touches: <strong>{company.totalTouches}</strong></span>
                <span>Last contact: <strong>{company.lastContactDate ? new Date(company.lastContactDate).toLocaleDateString() : 'Never'}</strong></span>
                {company.ownedSince && <span>Owned since: <strong>{new Date(company.ownedSince).toLocaleDateString()}</strong></span>}
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Contacts</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddContactOpen(true)}>
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts yet.</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((c: any) => (
                    <div key={c._id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <User className="h-8 w-8 text-muted-foreground p-1 bg-muted rounded-full" />
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {c.phone && <a href={`tel:${c.phone}`} className="text-primary">{c.phone}</a>}
                        {c.email && <a href={`mailto:${c.email}`} className="text-primary">{c.email}</a>}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(c._id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Activity Timeline</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setLogCallOpen(true)}><Phone className="h-3 w-3 mr-1" /> Log Call</Button>
                <Button size="sm" variant="outline" onClick={() => setAddNoteOpen(true)}><MessageSquare className="h-3 w-3 mr-1" /> Note</Button>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((a: any) => {
                    const Icon = activityIcons[a.type] || MessageSquare;
                    return (
                      <div key={a._id} className="flex gap-3">
                        <div className="mt-1">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">{a.type}</span>
                            {a.outcome && <Badge variant="secondary" className="text-xs">{outcomeLabels[a.outcome] || a.outcome}</Badge>}
                            {a.durationSeconds > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(a.durationSeconds / 60)}:{(a.durationSeconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          {a.notes && <p className="text-sm text-muted-foreground mt-1">{a.notes}</p>}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(a.timestamp).toLocaleString()}
                            {a.contactId?.name && ` · ${a.contactId.name}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Qualification</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setEditQualOpen(true)}>Edit</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Lanes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {company.qualification?.lanes?.length ? company.qualification.lanes.map((l: string) => (
                    <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Commodities</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {company.qualification?.commodities?.length ? company.qualification.commodities.map((c: string) => (
                    <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Equipment</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {company.qualification?.equipmentTypes?.length ? company.qualification.equipmentTypes.map((e: string) => (
                    <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Est. Weekly Loads</p>
                <p className="text-sm font-medium">{company.qualification?.estWeeklyLoads || 0}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {company.tags?.length ? company.tags.map((t: string) => (
                    <Badge key={t} variant="outline" className="text-xs"><Tag className="h-2 w-2 mr-1" />{t}</Badge>
                  )) : <span className="text-xs text-muted-foreground">None</span>}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Next Follow-up</p>
                <p className="text-sm font-medium">{company.nextFollowUp ? new Date(company.nextFollowUp).toLocaleDateString() : 'Not set'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <LogCallDialog open={logCallOpen} onOpenChange={setLogCallOpen} leads={[company]} onLogged={fetchData} preselectedCompanyId={company._id} />

      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} /></div>
            <div><Label>Title</Label><Input value={newContact.title} onChange={e => setNewContact({ ...newContact, title: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={newContact.email} onChange={e => setNewContact({ ...newContact, email: e.target.value })} /></div>
            <Button onClick={handleAddContact} className="w-full">Add Contact</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Note</DialogTitle></DialogHeader>
          <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} placeholder="Write your note..." />
          <Button onClick={handleAddNote} className="w-full">Save Note</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={editStatusOpen} onOpenChange={setEditStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Change Status</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {['cold', 'warm', 'hot', 'quoting', 'onboarded', 'active'].map(s => (
              <Button key={s} variant={company.status === s ? 'default' : 'outline'} onClick={() => handleStatusChange(s)} className="capitalize">
                {s}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editQualOpen} onOpenChange={setEditQualOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Qualification & Tags</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Lanes (comma separated)</Label><Input value={qualification.lanes} onChange={e => setQualification({ ...qualification, lanes: e.target.value })} placeholder="SE → MW, NE → SE" /></div>
            <div><Label>Commodities (comma separated)</Label><Input value={qualification.commodities} onChange={e => setQualification({ ...qualification, commodities: e.target.value })} placeholder="Produce, Electronics" /></div>
            <div><Label>Equipment Types (comma separated)</Label><Input value={qualification.equipmentTypes} onChange={e => setQualification({ ...qualification, equipmentTypes: e.target.value })} placeholder="Dry Van, Reefer, Flatbed" /></div>
            <div><Label>Est. Weekly Loads</Label><Input type="number" value={qualification.estWeeklyLoads} onChange={e => setQualification({ ...qualification, estWeeklyLoads: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Tags (comma separated)</Label><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="priority, food-grade" /></div>
            <div><Label>Next Follow-up</Label><Input type="date" value={nextFollowUp} onChange={e => setNextFollowUp(e.target.value)} /></div>
            <Button onClick={handleSaveQualification} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
