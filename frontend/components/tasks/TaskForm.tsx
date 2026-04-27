'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Task, Priority, TaskStatus } from '@/types';

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

interface FormErrors {
  title?: string;
  description?: string;
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Save Task' }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status || 'TODO');
  const [priority, setPriority] = useState<Priority>(initial?.priority || 'MEDIUM');
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? initial.dueDate.split('T')[0] : ''
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.length > 200) errs.title = 'Title must be under 200 characters';
    if (description && description.length > 2000) errs.description = 'Description must be under 2000 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
    } catch (err: unknown) {
      const e = err as { error?: string; details?: { message: string }[] };
      setApiError(e?.details?.[0]?.message || e?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {apiError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {apiError}
        </div>
      )}

      <Input
        label="Title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        error={errors.title}
        placeholder="What needs to be done?"
        autoFocus
        maxLength={200}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-muted)]">Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Add details (optional)"
          rows={3}
          maxLength={2000}
          className="resize-none"
          aria-describedby={errors.description ? 'desc-error' : undefined}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p id="desc-error" role="alert" className="text-xs text-red-400">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-muted)]">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-muted)]">Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} loading={loading}>{submitLabel}</Button>
      </div>
    </div>
  );
}
