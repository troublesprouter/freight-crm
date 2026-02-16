'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import { DISCOVERY_QUESTIONS } from '@/lib/constants';

interface Props {
  companyId: string;
  open: boolean;
  onClose: () => void;
}

export default function DiscoverySidebar({ companyId, open, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/discovery?companyId=${companyId}`)
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        if (Array.isArray(data)) data.forEach((a: any) => { map[a.questionId] = a.answer; });
        setAnswers(map);
      });
  }, [companyId, open]);

  const saveAnswer = async (questionId: string, answer: string) => {
    setSaving(questionId);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    await fetch('/api/discovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, questionId, answer }),
    });
    setSaving(null);
  };

  const categories = [...new Set(DISCOVERY_QUESTIONS.map(q => q.category))];
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Discovery Questions</SheetTitle>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${(answeredCount / DISCOVERY_QUESTIONS.length) * 100}%` }} />
            </div>
            <span className="text-sm text-muted-foreground">{answeredCount} / {DISCOVERY_QUESTIONS.length}</span>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="text-sm font-semibold mb-3">{cat}</h3>
              <div className="space-y-3">
                {DISCOVERY_QUESTIONS.filter(q => q.category === cat).map(q => {
                  const answered = !!answers[q.id];
                  return (
                    <div key={q.id} className="space-y-1">
                      <div className="flex items-start gap-2">
                        {answered ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm">{q.question}</span>
                      </div>
                      <Input
                        placeholder="Answer..."
                        className="ml-6 text-sm"
                        value={answers[q.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        onBlur={e => {
                          if (e.target.value !== (answers[q.id] || '')) {
                            saveAnswer(q.id, e.target.value);
                          } else if (e.target.value) {
                            saveAnswer(q.id, e.target.value);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
