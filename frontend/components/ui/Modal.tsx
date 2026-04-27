'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-lg bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] animate-slide-up',
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--text)]">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
