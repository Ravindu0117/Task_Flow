import { cn } from '@/lib/utils';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin', sz, className)}
    />
  );
}
