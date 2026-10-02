import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../api';
import type { AdminDashboardResponse } from '../types';
import {
  RotateCcw,
  Clock,
  Flag,
  AlertTriangle,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Badge, Button, ErrorState, Skeleton } from '../components/ui';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load operational dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12">
        <ErrorState
          title="Workstation Offline"
          message={error}
          onRetry={fetchDashboard}
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Workstation Top Header */}
      <section className="p-5 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="violet" dot size="sm">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Moderation Console</span>
              </span>
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Operational Dashboard
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Live queue counters, screening flag rates, and auditable staff actions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchDashboard}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          className="shrink-0 self-start sm:self-auto"
        >
          Refresh Console
        </Button>
      </section>

      {/* Primary Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Review */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-amber-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Pending Review</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-[var(--text-primary)] my-3">
            {data.pendingConfessions}
          </p>
          <Link
            to="/admin/moderation"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Open Mod Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Flagged by Automated Screening */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-rose-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Safety Flagged</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Flag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-[var(--text-primary)] my-3">
            {data.flaggedPendingConfessions}
          </p>
          <Link
            to="/admin/moderation?status=PENDING&sort=priority"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <span>Prioritize Flagged</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pending User Reports */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-orange-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Active Reports</span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-[var(--text-primary)] my-3">
            {data.pendingReports}
          </p>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
          >
            <span>Resolve Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quarantined / Hidden */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-purple-500/40 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Quarantined</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight text-[var(--text-primary)] my-3">
            {data.hiddenConfessions}
          </p>
          <Link
            to="/admin/hidden"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            <span>Quarantine Bin</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Operational Streams: Audit Activity & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Audit Activity Log */}
        <section className="lg:col-span-2 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                Recent Audit Trail
              </h2>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Verified administrative records</span>
          </div>

          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-8 text-center">Zero administrative actions logged.</p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {data.recentActivity.map((act, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{act.action.replace('_', ' ')}</span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {act.targetType} #{act.targetId}
                      </span>
                    </div>
                    {act.username && (
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Staff: <strong className="text-[var(--text-primary)]">{act.username}</strong>
                      </p>
                    )}
                  </div>

                  <span className="text-[11px] text-[var(--text-muted)] shrink-0 ml-3">
                    {new Date(act.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sidebars: Lifecycle totals & flag frequency */}
        <div className="space-y-6">
          {/* Confession Lifecycle Totals */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
              Lifecycle Breakdown
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Published to Feed</span>
                </span>
                <span className="font-bold">{data.publishedConfessions}</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Queue</span>
                </span>
                <span className="font-bold">{data.pendingConfessions}</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <span className="flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Quarantined</span>
                </span>
                <span className="font-bold">{data.hiddenConfessions}</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejected</span>
                </span>
                <span className="font-bold">{data.rejectedConfessions}</span>
              </div>
            </div>
          </div>

          {/* Pending Flag Breakdown */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] pb-2 border-b border-[var(--border-subtle)]">
              Screening Flag Counts
            </h3>
            {Object.keys(data.flagCounts).length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">Zero automated flags pending.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {Object.entries(data.flagCounts).map(([flg, count]) => (
                  <div key={flg} className="flex justify-between items-center text-[var(--text-secondary)] font-medium">
                    <span>{flg.replace('_', ' ')}</span>
                    <Badge variant="danger" size="sm">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
