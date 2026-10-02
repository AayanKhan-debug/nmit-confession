import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import { Input, Button } from '../components/ui';

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
      <div className="w-full max-w-md bg-[#111827]/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-white/10 p-6 sm:p-10 transition-colors">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-[11px] font-bold uppercase tracking-wider border border-violet-500/30">
              Staff Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2 font-heading">
              Moderator Workstation
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Restricted access for student moderators and staff
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-start gap-3 text-xs animate-in fade-in duration-150"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Staff Username
            </label>
            <Input
              id="username"
              type="text"
              placeholder="Enter staff username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4 text-violet-400" />}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
              leftIcon={<Lock className="w-4 h-4 text-violet-400" />}
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
              className="w-full justify-center min-h-[48px] text-sm"
            >
              Sign In to Workstation
            </Button>
          </div>
        </form>

        {/* Return to Public Feed */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
