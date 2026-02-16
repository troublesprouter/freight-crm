'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function ColdBucketPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [poolCount, setPoolCount] = useState(0);
  const [leadCap, setLeadCap] = useState(150);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', address: '', website: '', industry: '' });
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [myLeads, setMyLeads] = useState<any[]>([]);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [coldRes, metricsRes, orgRes] = await Promise.all([
      fetch(`/api/companies?owner=cold&search=${encodeURIComponent(search)}`),
      fetch('/api/metrics?period=day'),
      fetch('/api/organization'),
    ]);
    const [coldData, metricsData, orgData] = await Promise.all([
      coldRes.json(), metricsRes.json(), orgRes.json(),
    ]);
    setLeads(coldData.companies || []);
    setTotal(coldData.total || 0);
    setPoolCount(metricsData.poolCount || 0);
    setLeadCap(orgData.settings?.leadCap || 150);
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClaim = async (companyId: string) => {
    if (poolCount >= leadCap) {
      setPendingClaimId(companyId);
      const myRes = await fetch('/api/companies?owner=me&limit=200');
      const myData = await myRes.json();
      // Sort by least contacted
      const sorted = (myData.companies || []).sort((a: any, b: any) => (a.totalTouches || 0) - (b.totalTouches || 0));
      setMyLeads(sorted);
      setReleaseModalOpen(true);
      return;
    }

    setClaimingId(companyId);
    await fetch(`/api/companies/${companyId}/claim`, { method: 'POST' });
    setClaimingId(null);
    fetchData();
  };

  const handleReleaseAndClaim = async (releaseId: string) => {
    await fetch(`/api/companies/${releaseId}/release`, { method: 'POST' });
    if (pendingClaimId) {
      await fetch(`/api/companies/${pendingClaimId}/claim`, { method: 'POST' });
    }
    setReleaseModalOpen(false);
    setPendingClaimId(null);
    fetchData();
  };

  const handleAddLead = async () => {
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    });
    setNewLead({ name: '', address: '', website: '', industry: '' });
    setAddLeadOpen(false);
    fetchData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cold Bucket</h1>
          <p className="text-sm text-muted-foreground">{total} unowned leads · Your pool: {poolCount}/{leadCap}</p>
        </div>
        <Button onClick={() => setAddLeadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {leads.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No leads found. Add some to the cold bucket!</CardContent></Card>
        ) : (
          leads.map((lead: any) => (
            <Card key={lead._id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <Link href={`/leads/${lead._id}`} className="flex-1">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-8 w-8 text-muted-foreground p-1.5 bg-muted rounded-lg" />
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.industry || 'Unknown industry'}
                          {lead.address && ` · ${lead.address}`}
                        </p>
                        {lead.releasedAt && (
                          <p className="text-xs text-muted-foreground">Released {new Date(lead.releasedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    {lead.tags?.length > 0 && lead.tags.slice(0, 2).map((t: string) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => handleClaim(lead._id)}
                      disabled={claimingId === lead._id}
                    >
                      {claimingId === lead._id ? 'Claiming...' : 'Claim'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Lead Dialog */}
      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Company Name *</Label><Input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} placeholder="Acme Logistics" /></div>
            <div><Label>Industry</Label><Input value={newLead.industry} onChange={e => setNewLead({ ...newLead, industry: e.target.value })} placeholder="Freight / Manufacturing / Food" /></div>
            <div><Label>Address</Label><Input value={newLead.address} onChange={e => setNewLead({ ...newLead, address: e.target.value })} placeholder="Chicago, IL" /></div>
            <div><Label>Website</Label><Input value={newLead.website} onChange={e => setNewLead({ ...newLead, website: e.target.value })} placeholder="https://acme.com" /></div>
            <Button onClick={handleAddLead} className="w-full" disabled={!newLead.name}>Add to Cold Bucket</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Release & Claim Dialog */}
      <Dialog open={releaseModalOpen} onOpenChange={setReleaseModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>You&apos;re at {poolCount}/{leadCap}. Release a lead to claim this one.</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Sorted by least contacted — consider releasing these:</p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {myLeads.slice(0, 15).map((lead: any) => (
              <div key={lead._id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Touches: {lead.totalTouches} · Last: {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleReleaseAndClaim(lead._id)}>
                  Release
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
