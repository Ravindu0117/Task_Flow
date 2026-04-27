import { cn } from '@/lib/utils';

const variants = {
  TODO: 'bg-slate-700 text-slate-300',
  IN_PROGRESS: 'bg-sky-900/60 text-sky-300',
  DONE: 'bg-emerald-900/60 text-emerald-300',
  LOW: 'bg-slate-700/80 text-slate-400',
  MEDIUM: 'bg-amber-900/60 text-amber-300',
  HIGH: 'bg-red-900/60 text-red-300',
};

const labels = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export function Badge({ value }: { value: keyof typeof variants }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[value])}>
      {labels[value]}
    </span>
  );
}
