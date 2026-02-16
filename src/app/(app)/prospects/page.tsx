'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PIPELINE_STAGES } from '@/lib/constants';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function ProspectsPage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [claiming, setClaiming] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ activeProspects: 0, leadCap: 150 });

  const fetchData = () => {
    if (!session) return;
    fetch(`/api/companies?unowned=true${search ? `&search=${search}` : ''}`)
      .then(r => r.json())
      .then(d => setCompanies(Array.isArray(d) ? d : []));
    fetch(`/api/metrics?repId=${(session.user as any).id}`)
      .then(r => r.json())
      .then(d => setMetrics(prev => ({ ...prev, ...d })));
  };

  useEffect(() => { fetchData(); }, [session, search]);

  const claimCompany = async (companyId: string) => {
    setClaiming(companyId);
    const res = await fetch(`/api/companies/${companyId}/claim`, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to claim');
    }
    setClaiming(null);
    fetchData();
  };

  const addCompany = async () => {
    if (!newName) return;
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, ownerRepId: (session?.user as any).id, ownedSince: new Date(), status: 'new_researching' }),
    });
    setNewName('');
    setShowAdd(false);
    fetchData();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospect Pool</h1>
          <p className="text-sm text-muted-foreground">Unclaimed companies anyone can call — claim to add to your pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {metrics.activeProspects} / {metrics.leadCap} active
          </Badge>
          <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> Add Company</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          className="pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {companies.map(c => (
          <Card key={c._id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {c.equipmentTypes?.length > 0 && <Badge variant="outline" className="text-xs">{c.equipmentTypes.join(', ')}</Badge>}
                  {c.geography?.length > 0 && <Badge variant="secondary" className="text-xs">{c.geography.join(', ')}</Badge>}
                  {c.commodityTypes?.length > 0 && <span className="text-xs text-muted-foreground">{c.commodityTypes.slice(0, 2).join(', ')}</span>}
                </div>
                {c.releasedAt && (
                  <p className="text-xs text-muted-foreground mt-1">Released {new Date(c.releasedAt).toLocaleDateString()}</p>
                )}
              </div>
              <Button size="sm" onClick={() => claimCompany(c._id)} disabled={claiming === c._id}>
                {claiming === c._id ? 'Claiming...' : 'Claim'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {companies.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No unclaimed companies found</p>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Company</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Company Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Acme Shipping Co." /></div>
            <Button onClick={addCompany} disabled={!newName} className="w-full">Add to My Pipeline</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
