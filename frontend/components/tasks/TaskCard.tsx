'use client';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, GripVertical, Calendar, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [deleting, setDeleting] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleDelete = async () => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try { await onDelete(task.id); } finally { setDeleting(false); }
  };

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex gap-3',
        'transition-shadow duration-150 hover:shadow-lg hover:shadow-black/20 hover:border-slate-600',
        'animate-slide-in',
        isDragging && 'opacity-50 shadow-2xl scale-[1.02] z-50',
        task.status === 'DONE' && 'opacity-60'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="flex-shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity mt-0.5 touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Priority dot */}
      <div className="flex-shrink-0 mt-1.5">
        <div className={cn(
          'w-2 h-2 rounded-full',
          task.priority === 'HIGH' && 'bg-red-400',
          task.priority === 'MEDIUM' && 'bg-amber-400',
          task.priority === 'LOW' && 'bg-slate-500',
        )} aria-label={`Priority: ${task.priority}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-[var(--text)] leading-snug truncate',
          task.status === 'DONE' && 'line-through text-[var(--text-muted)]'
        )}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-2.5">
          <Badge value={task.status} />
          {task.dueDate && (
            <span className={cn(
              'inline-flex items-center gap-1 text-xs',
              overdue ? 'text-red-400' : 'text-[var(--text-muted)]'
            )}>
              {overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(task)}
          aria-label={`Edit ${task.title}`}
          className="p-1.5"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          loading={deleting}
          aria-label={`Delete ${task.title}`}
          className="p-1.5"
        >
          {!deleting && <Trash2 className="w-3.5 h-3.5" />}
        </Button>
      </div>
    </div>
  );
}
