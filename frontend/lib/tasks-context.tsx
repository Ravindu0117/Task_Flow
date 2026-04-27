'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import type { Task } from '@/types';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getTasks();
      setTasks(res.tasks);
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createTask = async (data: Partial<Task>) => {
    const res = await api.createTask(data as Parameters<typeof api.createTask>[0]);
    setTasks((prev) => [...prev, res.task]);
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    const res = await api.updateTask(id, data as Parameters<typeof api.updateTask>[1]);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderTasks = async (orderedIds: string[]) => {
    // Optimistic update
    const reordered = orderedIds
      .map((id) => tasks.find((t) => t.id === id)!)
      .filter(Boolean)
      .map((t, i) => ({ ...t, order: i }));
    setTasks(reordered);
    await api.reorderTasks(orderedIds);
  };

  return (
    <TasksContext.Provider
      value={{ tasks, loading, error, createTask, updateTask, deleteTask, reorderTasks, refresh }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
