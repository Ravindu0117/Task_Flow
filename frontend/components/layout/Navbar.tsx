'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { LogOut, User, CheckSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[var(--brand)] rounded-lg flex items-center justify-center">
            <CheckSquare className="w-4.5 h-4.5 text-slate-900" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight text-[var(--text)]">TaskFlow</span>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-[var(--text)]">{user.name}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              loading={loggingOut}
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
