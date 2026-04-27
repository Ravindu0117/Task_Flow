'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckSquare, Eye, EyeOff, Check, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function PwRule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={cn('flex items-center gap-1.5 text-xs', met ? 'text-emerald-400' : 'text-[var(--text-muted)]')}>
      {met ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3 opacity-50" />}
      {label}
    </li>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.length > 100) errs.name = 'Name too long';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!rules.length || !rules.upper || !rules.number)
      errs.password = 'Password does not meet all requirements';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await register(email, password, name.trim());
      router.push('/dashboard');
    } catch (err: unknown) {
      const e = err as { error?: string };
      setApiError(e?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[var(--brand)] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-sky-900/40">
            <CheckSquare className="w-6 h-6 text-slate-900" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Create your account</h1>
          <p className="text-[var(--text-muted)] mt-1 text-sm">Get started with TaskFlow — it&apos;s free</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl">
          {apiError && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              placeholder="Jane Doe"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-muted)]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby="pw-rules"
                  style={{ paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p role="alert" className="text-xs text-red-400">{errors.password}</p>}
              {password && (
                <ul id="pw-rules" className="flex flex-col gap-1 mt-1" aria-label="Password requirements">
                  <PwRule met={rules.length} label="At least 8 characters" />
                  <PwRule met={rules.upper} label="One uppercase letter" />
                  <PwRule met={rules.number} label="One number" />
                </ul>
              )}
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
              Create account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--brand)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
