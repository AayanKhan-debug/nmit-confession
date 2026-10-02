import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input, Button, Badge } from '../components/ui';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const destination = (location.state as any)?.from?.pathname || '/admin/moderation';

  useEffect(() => {
    if (user) {
      navigate('/admin/moderation', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate(destination, { replace: true });
    } catch {
      setError('Invalid administrator credentials or unauthorized.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-[var(--bg-surface)] rounded-3xl shadow-xl border border-[var(--border-subtle)] p-6 sm:p-10 transition-colors">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <Badge variant="violet" size="sm">Staff Portal</Badge>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] mt-1.5">
              Workstation Login
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Restricted access for student moderators and staff
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Staff username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4 text-[var(--text-muted)]" />}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
              className="w-full"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting || !username.trim() || !password}
              isLoading={isSubmitting}
              className="w-full justify-center"
            >
              Sign In to Workstation
            </Button>
          </div>
        </form>

        {/* Return to Public Feed */}
        <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
