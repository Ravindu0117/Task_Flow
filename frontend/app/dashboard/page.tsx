'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/hooks/useTasks';
import { Navbar } from '@/components/layout/Navbar';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { Task, TaskStatus, Priority } from '@/types';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { tasks, loading, error, createTask, updateTask, deleteTask, reorderTasks } = useTasks();

  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  // Stats
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const highPriority = tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length;

  const hasFilters = search || filterStatus !== 'ALL' || filterPriority !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">
              Good {getGreeting()}, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">
              {done} of {total} tasks completed
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="md">
            <Plus className="w-4 h-4" />
            New task
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: total, color: 'text-[var(--text)]' },
            { label: 'In Progress', value: inProgress, color: 'text-sky-400' },
            { label: 'Completed', value: done, color: 'text-emerald-400' },
            { label: 'High Priority', value: highPriority, color: 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" aria-hidden />
            <input
              type="search"
              placeholder="Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
              aria-label="Search tasks"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" aria-hidden />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              className="w-full sm:w-auto"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            aria-label="Filter by priority"
            className="w-full sm:w-auto"
          >
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} aria-label="Clear filters">
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">Clear</span>
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Task list */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={setEditTask}
          onDelete={deleteTask}
          onReorder={reorderTasks}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
          search={search}
        />
      </main>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Task">
        <TaskForm
          onSubmit={async (data) => {
            await createTask(data);
            setShowCreate(false);
          }}
          onCancel={() => setShowCreate(false)}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        {editTask && (
          <TaskForm
            initial={editTask}
            onSubmit={async (data) => {
              await updateTask(editTask.id, data);
              setEditTask(null);
            }}
            onCancel={() => setEditTask(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
