'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PIPELINE_STAGES } from '@/lib/constants';
import Link from 'next/link';

export default function PipelinePage() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  const fetchCompanies = useCallback(() => {
    if (!session) return;
    const userId = (session.user as any).id;
    fetch(`/api/companies?owner=${userId}`)
      .then(r => r.json())
      .then(d => setCompanies(Array.isArray(d) ? d : []));
  }, [session]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleDragStart = (e: React.DragEvent, companyId: string) => {
    setDragging(companyId);
    e.dataTransfer.setData('text/plain', companyId);
  };

  const handleDrop = async (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    const companyId = e.dataTransfer.getData('text/plain');
    if (!companyId) return;
    setDragging(null);
    // Optimistic update
    setCompanies(prev => prev.map(c => c._id === companyId ? { ...c, status: stage } : c));
    await fetch(`/api/companies/${companyId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.key] = companies.filter(c => c.status === stage.key);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        <div className="text-sm text-muted-foreground">
          {companies.filter(c => !['active_customer', 'inactive_customer'].includes(c.status)).length} active prospects
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 160px)' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageCompanies = grouped[stage.key] || [];
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-64"
              onDrop={e => handleDrop(e, stage.key)}
              onDragOver={handleDragOver}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">{stage.label}</h3>
                <Badge variant="secondary" className="text-xs">{stageCompanies.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[100px] bg-accent/30 rounded-lg p-2">
                {stageCompanies.map(c => (
                  <Link key={c._id} href={`/company/${c._id}`}>
                    <Card
                      draggable
                      onDragStart={e => handleDragStart(e, c._id)}
                      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
                        dragging === c._id ? 'opacity-50' : ''
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        {c.equipmentTypes?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {c.equipmentTypes.slice(0, 2).join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {c.discoveryProgress > 0 && (
                            <div className="flex items-center gap-1">
                              <div className="w-12 bg-secondary rounded-full h-1.5">
                                <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${c.discoveryProgress}%` }} />
                              </div>
                              <span className="text-[10px] text-muted-foreground">{c.discoveryProgress}%</span>
                            </div>
                          )}
                          {c.totalTouches > 0 && (
                            <span className="text-[10px] text-muted-foreground">{c.totalTouches} touches</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
