'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Circle, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', notes: '', dueDate: '', priority: 'medium' });

  const fetchTasks = () => {
    if (!session) return;
    fetch(`/api/tasks?repId=${(session.user as any).id}`)
      .then(r => r.json())
      .then(d => setTasks(Array.isArray(d) ? d : []));
  };

  useEffect(() => { fetchTasks(); }, [session]);

  const completeTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    });
    fetchTasks();
  };

  const addTask = async () => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowAdd(false);
    setForm({ title: '', notes: '', dueDate: '', priority: 'medium' });
    fetchTasks();
  };

  const now = new Date();
  const overdue = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < now);
  const today = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate).toDateString() === now.toDateString());
  const upcoming = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) > now && new Date(t.dueDate).toDateString() !== now.toDateString());
  const completed = tasks.filter(t => t.status === 'completed');

  const renderTask = (t: any) => (
    <div key={t._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent">
      <button onClick={() => completeTask(t._id)} className="mt-0.5">
        {t.status === 'completed' ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${t.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
        {t.notes && <p className="text-xs text-muted-foreground mt-0.5">{t.notes}</p>}
        <div className="flex items-center gap-2 mt-1">
          {t.companyId?.name && (
            <Link href={`/company/${t.companyId._id}`} className="text-xs text-primary hover:underline">{t.companyId.name}</Link>
          )}
          <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
          {t.triggerSource !== 'manual' && <Badge variant="secondary" className="text-[10px]">{t.triggerSource.replace(/_/g, ' ')}</Badge>}
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(t.dueDate).toLocaleDateString()}</span>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" /> New Task</Button>
      </div>

      {overdue.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" /> Overdue ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>{overdue.map(renderTask)}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today ({today.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {today.length === 0 && <p className="text-sm text-muted-foreground p-3">No tasks due today</p>}
          {today.map(renderTask)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upcoming ({upcoming.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground p-3">No upcoming tasks</p>}
          {upcoming.map(renderTask)}
        </CardContent>
      </Card>

      {completed.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Completed ({completed.length})</CardTitle>
          </CardHeader>
          <CardContent>{completed.slice(0, 10).map(renderTask)}</CardContent>
        </Card>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addTask} disabled={!form.title || !form.dueDate} className="w-full">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
