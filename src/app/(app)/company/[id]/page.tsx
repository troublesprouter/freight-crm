'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PIPELINE_STAGES, COMMODITY_OPTIONS, EQUIPMENT_OPTIONS, VOLUME_OPTIONS, FREIGHT_MGMT_OPTIONS, RFP_CYCLE_OPTIONS, SHIPMENT_TYPE_OPTIONS, SEASON_OPTIONS, VOLUME_VS_LY_OPTIONS, GEOGRAPHY_OPTIONS, SOURCE_OPTIONS, CONTACT_ROLES } from '@/lib/constants';
import { Phone, Mail, Plus, Trash2, Edit2, ArrowLeftRight, User } from 'lucide-react';
import LogCallDialog from '@/components/LogCallDialog';
import DiscoverySidebar from '@/components/DiscoverySidebar';
import Link from 'next/link';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [company, setCompany] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showAddContact, setShowAddContact] = useState(false);
  const [showLogCall, setShowLogCall] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [contactForm, setContactForm] = useState<any>({ name: '', title: '', phone: '', email: '', role: 'other' });
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    fetch(`/api/companies/${id}`).then(r => r.json()).then(d => { setCompany(d); setForm(d); });
    fetch(`/api/contacts?companyId=${id}`).then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []));
    fetch(`/api/activities?companyId=${id}`).then(r => r.json()).then(d => setActivities(Array.isArray(d) ? d : []));
    fetch(`/api/deals?companyId=${id}`).then(r => r.json()).then(d => setDeals(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchData(); }, [id]);

  const saveCompany = async () => {
    setSaving(true);
    await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setEditing(false);
    fetchData();
  };

  const addContact = async () => {
    await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...contactForm, companyId: id }),
    });
    setShowAddContact(false);
    setContactForm({ name: '', title: '', phone: '', email: '', role: 'other' });
    fetchData();
  };

  const releaseCompany = async () => {
    if (!confirm('Release this company back to the prospect pool?')) return;
    await fetch(`/api/companies/${id}/release`, { method: 'POST' });
    fetchData();
  };

  if (!company) return <div className="p-6">Loading...</div>;

  const stageLabel = PIPELINE_STAGES.find(s => s.key === company.status)?.label || company.status;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge>{stageLabel}</Badge>
            {company.source && <Badge variant="outline">{company.source}</Badge>}
            {company.discoveryProgress > 0 && (
              <Badge variant="secondary">{company.discoveryProgress}% discovered</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDiscovery(true)}>Discovery Q&apos;s</Button>
          <Button size="sm" onClick={() => setShowLogCall(true)}><Phone className="h-4 w-4 mr-1" /> Log Call</Button>
          {company.ownerRepId && (
            <Button variant="destructive" size="sm" onClick={releaseCompany}><ArrowLeftRight className="h-4 w-4 mr-1" /> Release</Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
              <TabsTrigger value="details">Company Details</TabsTrigger>
            </TabsList>

            {/* Activity Timeline */}
            <TabsContent value="activity" className="space-y-3 mt-4">
              {activities.length === 0 && <p className="text-sm text-muted-foreground">No activity yet</p>}
              {activities.map(a => (
                <Card key={a._id}>
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      {a.type.includes('call') ? <Phone className="h-3.5 w-3.5" /> :
                       a.type.includes('email') ? <Mail className="h-3.5 w-3.5" /> :
                       <Edit2 className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{a.type.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleDateString()}</span>
                      </div>
                      {a.outcome && <Badge variant="outline" className="mt-1 text-xs">{a.outcome}</Badge>}
                      {a.durationSeconds > 0 && <span className="text-xs text-muted-foreground ml-2">{Math.round(a.durationSeconds / 60)}m</span>}
                      {a.contactId?.name && <span className="text-xs text-muted-foreground ml-2">→ {a.contactId.name}</span>}
                      {a.notes && <p className="text-sm text-muted-foreground mt-1">{a.notes}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Contacts */}
            <TabsContent value="contacts" className="mt-4">
              <div className="flex justify-end mb-3">
                <Button size="sm" onClick={() => setShowAddContact(true)}><Plus className="h-4 w-4 mr-1" /> Add Contact</Button>
              </div>
              <div className="space-y-3">
                {contacts.map(c => (
                  <Card key={c._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{c.name} {c.isPrimary && <Badge className="ml-1 text-[10px]">Primary</Badge>}</p>
                            <p className="text-sm text-muted-foreground">{c.title}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {CONTACT_ROLES.find(r => r.key === c.role)?.label || c.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {c.phone && <p>{c.phone}</p>}
                          {c.email && <p className="text-muted-foreground">{c.email}</p>}
                        </div>
                      </div>
                      {/* Personal details */}
                      {(c.personalKids || c.personalSportsTeam || c.personalHobbies) && (
                        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-xs">
                          {c.personalKids && <div><span className="text-muted-foreground">Kids:</span> {c.personalKids}</div>}
                          {c.personalSportsTeam && <div><span className="text-muted-foreground">Sports:</span> {c.personalSportsTeam}</div>}
                          {c.personalHobbies && <div><span className="text-muted-foreground">Hobbies:</span> {c.personalHobbies}</div>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Deals */}
            <TabsContent value="deals" className="mt-4 space-y-3">
              {deals.length === 0 && <p className="text-sm text-muted-foreground">No deals yet</p>}
              {deals.map(d => (
                <Card key={d._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-sm text-muted-foreground">{d.lanes} • {d.equipmentType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">${d.estimatedWeeklyGP?.toLocaleString()}/wk est.</p>
                        <Badge variant="outline">{PIPELINE_STAGES.find(s => s.key === d.stage)?.label}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Company Details (editable) */}
            <TabsContent value="details" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Company Information</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => editing ? saveCompany() : setEditing(true)}>
                    {saving ? 'Saving...' : editing ? 'Save' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Commodity Types</Label>
                      {editing ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {COMMODITY_OPTIONS.map(o => (
                            <Badge
                              key={o}
                              variant={form.commodityTypes?.includes(o) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                const arr = form.commodityTypes || [];
                                setForm({ ...form, commodityTypes: arr.includes(o) ? arr.filter((x: string) => x !== o) : [...arr, o] });
                              }}
                            >{o}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">{company.commodityTypes?.join(', ') || '—'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Equipment Types</Label>
                      {editing ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {EQUIPMENT_OPTIONS.map(o => (
                            <Badge
                              key={o}
                              variant={form.equipmentTypes?.includes(o) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                const arr = form.equipmentTypes || [];
                                setForm({ ...form, equipmentTypes: arr.includes(o) ? arr.filter((x: string) => x !== o) : [...arr, o] });
                              }}
                            >{o}</Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">{company.equipmentTypes?.join(', ') || '—'}</p>
                      )}
                    </div>
                    <div>
                      <Label>Weekly Truckload Volume</Label>
                      {editing ? (
                        <Select value={form.weeklyTruckloadVolume} onValueChange={v => setForm({ ...form, weeklyTruckloadVolume: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{VOLUME_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.weeklyTruckloadVolume || '—'}</p>}
                    </div>
                    <div>
                      <Label>Manages Freight Via</Label>
                      {editing ? (
                        <Select value={form.managesFreightVia} onValueChange={v => setForm({ ...form, managesFreightVia: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{FREIGHT_MGMT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.managesFreightVia || '—'}</p>}
                    </div>
                    <div>
                      <Label>Has RFP?</Label>
                      {editing ? (
                        <Select value={form.hasRFP ? 'yes' : 'no'} onValueChange={v => setForm({ ...form, hasRFP: v === 'yes' })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.hasRFP ? 'Yes' : 'No'}</p>}
                    </div>
                    {(company.hasRFP || form.hasRFP) && (
                      <>
                        <div>
                          <Label>RFP Cycle</Label>
                          {editing ? (
                            <Select value={form.rfpCycle} onValueChange={v => setForm({ ...form, rfpCycle: v })}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{RFP_CYCLE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                            </Select>
                          ) : <p className="text-sm">{company.rfpCycle || '—'}</p>}
                        </div>
                        <div>
                          <Label>RFP Next Date</Label>
                          {editing ? (
                            <Input type="date" value={form.rfpNextDate ? new Date(form.rfpNextDate).toISOString().split('T')[0] : ''} onChange={e => setForm({ ...form, rfpNextDate: e.target.value })} />
                          ) : <p className="text-sm">{company.rfpNextDate ? new Date(company.rfpNextDate).toLocaleDateString() : '—'}</p>}
                        </div>
                      </>
                    )}
                    <div>
                      <Label>Geography</Label>
                      {editing ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {GEOGRAPHY_OPTIONS.map(o => (
                            <Badge
                              key={o}
                              variant={form.geography?.includes(o) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs"
                              onClick={() => {
                                const arr = form.geography || [];
                                setForm({ ...form, geography: arr.includes(o) ? arr.filter((x: string) => x !== o) : [...arr, o] });
                              }}
                            >{o}</Badge>
                          ))}
                        </div>
                      ) : <p className="text-sm">{company.geography?.join(', ') || '—'}</p>}
                    </div>
                    <div>
                      <Label>Volume vs Last Year</Label>
                      {editing ? (
                        <Select value={form.volumeVsLastYear} onValueChange={v => setForm({ ...form, volumeVsLastYear: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{VOLUME_VS_LY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.volumeVsLastYear || '—'}</p>}
                    </div>
                    <div>
                      <Label>Source</Label>
                      {editing ? (
                        <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{SOURCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.source || '—'}</p>}
                    </div>
                    <div>
                      <Label>Ships on Weekends?</Label>
                      {editing ? (
                        <Select value={form.shipsOnWeekends ? 'yes' : 'no'} onValueChange={v => setForm({ ...form, shipsOnWeekends: v === 'yes' })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                        </Select>
                      ) : <p className="text-sm">{company.shipsOnWeekends ? 'Yes' : 'No'}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar — quick info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Stage</span><Badge>{stageLabel}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Touches</span><span>{company.totalTouches || 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Activity</span><span>{company.lastActivityDate ? new Date(company.lastActivityDate).toLocaleDateString() : 'Never'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discovery</span><span>{company.discoveryProgress || 0}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Added</span><span>{new Date(company.createdAt).toLocaleDateString()}</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Qualification</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Equipment:</span> {company.equipmentTypes?.join(', ') || '—'}</div>
              <div><span className="text-muted-foreground">Commodities:</span> {company.commodityTypes?.join(', ') || '—'}</div>
              <div><span className="text-muted-foreground">Volume:</span> {company.weeklyTruckloadVolume || '—'} loads/wk</div>
              <div><span className="text-muted-foreground">Geography:</span> {company.geography?.join(', ') || '—'}</div>
              <div><span className="text-muted-foreground">Freight Mgmt:</span> {company.managesFreightVia || '—'}</div>
            </CardContent>
          </Card>

          {/* Primary contact quick view */}
          {contacts.filter(c => c.isPrimary).map(c => (
            <Card key={c._id}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Primary Contact</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.title}</p>
                {c.phone && <p>{c.phone}</p>}
                {c.personalSportsTeam && <p className="text-xs">🏈 {c.personalSportsTeam}</p>}
                {c.personalKids && <p className="text-xs">👨‍👧 {c.personalKids}</p>}
                {c.personalHobbies && <p className="text-xs">🎯 {c.personalHobbies}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} /></div>
              <div><Label>Title</Label><Input value={contactForm.title} onChange={e => setContactForm({ ...contactForm, title: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} /></div>
            </div>
            <div>
              <Label>Role</Label>
              <Select value={contactForm.role} onValueChange={v => setContactForm({ ...contactForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLES.map(r => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Kids</Label><Input value={contactForm.personalKids || ''} onChange={e => setContactForm({ ...contactForm, personalKids: e.target.value })} placeholder="Names, ages" /></div>
            <div><Label>Sports Team</Label><Input value={contactForm.personalSportsTeam || ''} onChange={e => setContactForm({ ...contactForm, personalSportsTeam: e.target.value })} placeholder="Patriots, Red Sox..." /></div>
            <div><Label>Hobbies</Label><Input value={contactForm.personalHobbies || ''} onChange={e => setContactForm({ ...contactForm, personalHobbies: e.target.value })} placeholder="Fishing, golf..." /></div>
            <Button onClick={addContact} className="w-full">Add Contact</Button>
          </div>
        </DialogContent>
      </Dialog>

      {showLogCall && <LogCallDialog open={showLogCall} onClose={() => { setShowLogCall(false); fetchData(); }} companyId={id} />}
      {showDiscovery && <DiscoverySidebar companyId={id} open={showDiscovery} onClose={() => { setShowDiscovery(false); fetchData(); }} />}
    </div>
  );
}
