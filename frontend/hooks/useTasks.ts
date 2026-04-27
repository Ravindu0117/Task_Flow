'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Task } from '@/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { tasks } = await api.getTasks();
      setTasks(tasks);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e?.error || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (data: Partial<Task>) => {
    const { task } = await api.createTask(data);
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    const { task } = await api.updateTask(id, data);
    setTasks(prev => prev.map(t => t.id === id ? task : t));
    return task;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    await api.reorderTasks(orderedIds);
    const { tasks: refreshed } = await api.getTasks();
    setTasks(refreshed);
  }, []);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask, reorderTasks };
}
