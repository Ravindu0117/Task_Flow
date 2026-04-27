'use client';
import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Spinner } from '@/components/ui/Spinner';
import { ClipboardList } from 'lucide-react';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => Promise<void>;
  filterStatus: string;
  filterPriority: string;
  search: string;
}

export function TaskList({ tasks, loading, onEdit, onDelete, onReorder, filterStatus, filterPriority, search }: TaskListProps) {
  const [items, setItems] = useState<Task[]>(tasks);

  // Sync external task changes
  if (JSON.stringify(tasks.map(t => t.id)) !== JSON.stringify(items.map(t => t.id)) ||
      JSON.stringify(tasks.map(t => t.updatedAt)) !== JSON.stringify(items.map(t => t.updatedAt))) {
    setItems(tasks);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(t => t.id === active.id);
    const newIndex = items.findIndex(t => t.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);
    await onReorder(reordered.map(t => t.id));
  }, [items, onReorder]);

  // Filter + search
  const filtered = items.filter(t => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !(t.description?.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] animate-fade-in">
        <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-lg font-medium">
          {search || filterStatus !== 'ALL' || filterPriority !== 'ALL'
            ? 'No tasks match your filters'
            : 'No tasks yet — create your first!'}
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={filtered.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2.5">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
