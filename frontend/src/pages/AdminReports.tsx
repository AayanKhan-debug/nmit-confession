import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAdminReports, resolveAdminReport } from '../api';
import type { AdminReport } from '../types';
import {
  AlertTriangle,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft
} from 'lucide-react';
import {
  Badge,
  Button,
  Toast,
  Skeleton,
  EmptyState,
  ErrorState
} from '../components/ui';

export default function AdminReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState(searchParams.get('status') || 'PENDING');
  const [reason, setReason] = useState(searchParams.get('reason') || '');
  const [confessionStatus, setConfessionStatus] = useState(searchParams.get('confessionStatus') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = 20;

  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title?: string; message: string } | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const pStatus = searchParams.get('status') || 'PENDING';
      const pReason = searchParams.get('reason') || undefined;
      const pConfStatus = searchParams.get('confessionStatus') || undefined;
      const pFrom = searchParams.get('from') || undefined;
      const pTo = searchParams.get('to') || undefined;
      const pSort = searchParams.get('sort') || 'newest';

      const res = await getAdminReports(page, size, pStatus, pReason, pConfStatus, pFrom, pTo, pSort);
      setReports(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unauthorized or failed to load reports.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [searchParams]);

  const handleApply = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (reason) params.set('reason', reason);
    if (confessionStatus) params.set('confessionStatus', confessionStatus);
    if (sort) params.set('sort', sort);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleClear = () => {
    setStatus('PENDING');
    setReason('');
    setConfessionStatus('');
    setSort('newest');
    setFrom('');
    setTo('');
    setSearchParams(new URLSearchParams({ status: 'PENDING', page: '0' }));
  };

  const handleResolve = async (id: number) => {
    if (resolvingId) return;
    setResolvingId(id);
    try {
      await resolveAdminReport(id);
      showToast(`Report #${id} marked as resolved.`, 'success', 'Resolved');
      await fetchReports();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Error resolving report.', 'error', 'Failed');
    } finally {
      setResolvingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Top Banner */}
      <section className="p-5 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="danger" dot size="sm">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Safety & Abuse Console</span>
              </span>
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Report Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Review community incident reports, evaluate violations, and resolve flags.
          </p>
        </div>

        <Link
          to="/admin/moderation"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[40px] shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Mod Queue</span>
        </Link>
      </section>

      {/* Filter Toolbar */}
      <section className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label htmlFor="status" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="DISMISSED">DISMISSED</option>
              </select>
            </div>

            <div>
              <label htmlFor="reason" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Reason
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="">All Reasons</option>
                <option value="SPAM">Spam</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="HATE_SPEECH">Hate Speech</option>
                <option value="INAPPROPRIATE">Inappropriate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="confessionStatus" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Post Status
              </label>
              <select
                id="confessionStatus"
                value={confessionStatus}
                onChange={(e) => setConfessionStatus(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="HIDDEN">HIDDEN</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Order
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="reason">By Reason</option>
              </select>
            </div>

            <div>
              <label htmlFor="from" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                From Date
              </label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[40px]"
              />
            </div>

            <div>
              <label htmlFor="to" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                To Date
              </label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[40px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                leftIcon={<Filter className="w-3.5 h-3.5" />}
              >
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClear}
              >
                Reset
              </Button>
            </div>

            <span className="text-xs text-[var(--text-muted)] font-medium">
              Showing <strong className="text-[var(--text-primary)]">{reports.length}</strong> of {totalElements} reports
            </span>
          </div>
        </form>
      </section>

      {/* Reports Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Reports feed unavailable"
          message={error}
          onRetry={fetchReports}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8 text-emerald-500" />}
          title="Zero active reports"
          description="There are no user reports matching your current filter selection."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const isPending = r.status === 'PENDING';

            return (
              <article
                key={r.id}
                className={`p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border transition-all ${
                  isPending
                    ? 'border-l-4 border-l-rose-500 border-[var(--border-subtle)]'
                    : 'border-[var(--border-subtle)] opacity-90'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-muted)]">Report #{r.id}</span>
                    <Badge variant="danger" size="sm">
                      Flag: {r.reason}
                    </Badge>
                    <Badge variant={isPending ? 'warning' : 'success'} size="sm">
                      {r.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reported: {new Date(r.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {r.resolvedAt && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                        &bull; Resolved: {new Date(r.resolvedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Target Confession Box */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] my-3 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)]">
                    <span>Confession #{r.confessionId}</span>
                    <span>&bull;</span>
                    <span className="text-[var(--text-secondary)]">Status: {r.confessionStatus}</span>
                    <span>&bull;</span>
                    <span className="text-[var(--text-secondary)]">Category: {r.confessionCategory}</span>
                  </div>
                  {r.confessionTitle && (
                    <h4 className="font-bold text-[var(--text-primary)] text-sm">{r.confessionTitle}</h4>
                  )}
                  <p className="text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                    {r.confessionContent}
                  </p>
                </div>

                {/* Resolve Action */}
                {isPending && (
                  <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={resolvingId === r.id}
                      isLoading={resolvingId === r.id}
                      onClick={() => handleResolve(r.id)}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Reports pagination"
          className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs"
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => handlePageChange(page - 1)}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs font-medium text-[var(--text-secondary)]">
            Page <strong className="text-[var(--text-primary)]">{page + 1}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{totalPages}</strong>
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => handlePageChange(page + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
