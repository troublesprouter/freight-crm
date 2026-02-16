'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COMMODITY_OPTIONS, EQUIPMENT_OPTIONS, GEOGRAPHY_OPTIONS, PIPELINE_STAGES } from '@/lib/constants';
import Link from 'next/link';
import { Filter, X } from 'lucide-react';

const SAVED_FILTERS = [
  { label: 'All reefer prospects', params: { equipment: 'Reefer' } },
  { label: 'Inactive customers', params: { status: 'inactive_customer' } },
  { label: 'Flatbed in Midwest', params: { equipment: 'Flatbed/open deck', geography: 'Midwest' } },
  { label: 'No activity 14+ days', params: { stale: '14' } },
  { label: 'Quoting / Bidding', params: { status: 'quoting' } },
  { label: 'Food & beverage', params: { commodity: 'Food & beverage' } },
];

export default function SmartFiltersPage() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (f?: any) => {
    const activeFilters = f || filters;
    setLoading(true);
    const params = new URLSearchParams();
    if (activeFilters.commodity) params.set('commodity', activeFilters.commodity);
    if (activeFilters.equipment) params.set('equipment', activeFilters.equipment);
    if (activeFilters.geography) params.set('geography', activeFilters.geography);
    if (activeFilters.status) params.set('status', activeFilters.status);
    if (activeFilters.search) params.set('search', activeFilters.search);
    const res = await fetch(`/api/companies?${params.toString()}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const applySavedFilter = (params: any) => {
    setFilters(params);
    runSearch(params);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Smart Filters</h1>

      {/* Saved filters */}
      <div className="flex flex-wrap gap-2">
        {SAVED_FILTERS.map((sf, i) => (
          <Button key={i} variant="outline" size="sm" onClick={() => applySavedFilter(sf.params)}>
            <Filter className="h-3 w-3 mr-1" /> {sf.label}
          </Button>
        ))}
      </div>

      {/* Custom filter */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Custom Filter</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Company name..."
                value={filters.search || ''}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Commodity</Label>
              <Select value={filters.commodity || ''} onValueChange={v => setFilters({ ...filters, commodity: v })}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_clear">Any</SelectItem>
                  {COMMODITY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Equipment</Label>
              <Select value={filters.equipment || ''} onValueChange={v => setFilters({ ...filters, equipment: v })}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_clear">Any</SelectItem>
                  {EQUIPMENT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Geography</Label>
              <Select value={filters.geography || ''} onValueChange={v => setFilters({ ...filters, geography: v })}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_clear">Any</SelectItem>
                  {GEOGRAPHY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Stage</Label>
              <Select value={filters.status || ''} onValueChange={v => setFilters({ ...filters, status: v })}>
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any_clear">Any</SelectItem>
                  {PIPELINE_STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => runSearch()} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
            <Button variant="ghost" onClick={() => { setFilters({}); setResults([]); }}><X className="h-4 w-4 mr-1" /> Clear</Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-3">{results.length} results</p>
          <div className="space-y-2">
            {results.map(c => (
              <Link key={c._id} href={`/company/${c._id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{PIPELINE_STAGES.find(s => s.key === c.status)?.label}</Badge>
                        {c.equipmentTypes?.map((e: string) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
                        {c.geography?.map((g: string) => <Badge key={g} variant="outline" className="text-[10px]">{g}</Badge>)}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{c.totalTouches || 0} touches</p>
                      <p className="text-xs text-muted-foreground">{c.discoveryProgress || 0}% discovered</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
