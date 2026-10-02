import { useEffect, useState, useRef, type MouseEvent, type FormEvent } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getModerationQueue } from '../api';
import type { Confession } from '../types';
import {
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  AlertTriangle,
  Filter,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Flag,
  Clock,
  EyeOff
} from 'lucide-react';
import {
  Badge,
  Button,
  Modal,
  Toast,
  Skeleton,
  EmptyState,
  ErrorState
} from '../components/ui';

export default function ModQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Form filter states
  const [status, setStatus] = useState(searchParams.get('status') || 'PENDING');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [flag, setFlag] = useState(searchParams.get('flag') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'priority');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = 20;

  // Feedback notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title?: string; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Violates community guidelines');
  const rejectTriggerRef = useRef<HTMLButtonElement | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const pStatus = searchParams.get('status') || 'PENDING';
      const pCategory = searchParams.get('category') || undefined;
      const pFlag = searchParams.get('flag') || undefined;
      const pFrom = searchParams.get('from') || undefined;
      const pTo = searchParams.get('to') || undefined;
      const pSort = searchParams.get('sort') || 'priority';

      const res = await getModerationQueue(page, size, pStatus, pCategory, pFlag, pFrom, pTo, pSort);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unauthorized or failed to load moderation queue. Please check staff credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [searchParams]);

  const handleApply = (e: FormEvent) => {

    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (flag) params.set('flag', flag);
    if (sort) params.set('sort', sort);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleClear = () => {
    setStatus('PENDING');
    setCategory('');
    setFlag('');
    setSort('priority');
    setFrom('');
    setTo('');
    setSearchParams(new URLSearchParams({ status: 'PENDING', page: '0' }));
  };

  const handleApprove = async (id: number) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    try {
      await api.post(`/admin/moderation/confessions/${id}/approve`);
      showToast(`Confession #${id} approved and published to public feed!`, 'success', 'Approved');
      await fetchQueue();
    } catch {
      showToast('Unable to approve confession. Please try again.', 'error', 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenReject = (id: number, e: MouseEvent<HTMLButtonElement>) => {
    rejectTriggerRef.current = e.currentTarget;
    setRejectingId(id);
    setRejectReason('Violates community guidelines');
  };

  const handleCloseReject = () => {
    setRejectingId(null);
    // Restore focus to triggering button
    setTimeout(() => {
      rejectTriggerRef.current?.focus();
    }, 50);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setActionLoadingId(rejectingId);
    try {
      await api.post(`/admin/moderation/confessions/${rejectingId}/reject`, { reason: rejectReason });
      showToast(`Confession #${rejectingId} was rejected.`, 'info', 'Rejected');
      handleCloseReject();
      await fetchQueue();
    } catch {
      showToast('Unable to reject confession. Please try again.', 'error', 'Action Failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (actionLoadingId) return;
    setActionLoadingId(id);
    try {
      await api.post(`/admin/moderation/confessions/${id}/restore`);
      showToast(`Confession #${id} restored to public feed.`, 'success', 'Restored');
      await fetchQueue();
    } catch {
      showToast('Unable to restore confession. Please try again.', 'error', 'Action Failed');
    } finally {
      setActionLoadingId(null);
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

      {/* Header Banner */}
      <section className="p-5 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="warning" dot size="sm">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Operational Worklist</span>
              </span>
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Moderation Queue
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Review pending submissions, inspect automated screening flags, and take decisive actions.
          </p>
        </div>

        {/* Quick Console Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[40px]"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-violet-500" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-rose-500 transition-colors min-h-[40px]"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Reports</span>
          </Link>
          <Link
            to="/admin/hidden"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-purple-500 transition-colors min-h-[40px]"
          >
            <EyeOff className="w-3.5 h-3.5 text-purple-500" />
            <span>Hidden</span>
          </Link>
        </div>
      </section>

      {/* Dense Filter Toolbar */}
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
                <option value="PENDING">PENDING</option>
                <option value="HIDDEN">HIDDEN</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="">All Categories</option>
                <option value="CAMPUS_LIFE">Campus Life</option>
                <option value="ADVICE">Advice</option>
                <option value="RANT">Rant</option>
                <option value="FUNNY">Funny</option>
                <option value="CRUSH">Crush</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="flag" className="block mb-1 font-bold uppercase tracking-wider text-[11px] text-[var(--text-secondary)]">
                Screening Flag
              </label>
              <select
                id="flag"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="w-full p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer min-h-[40px]"
              >
                <option value="">All Flags</option>
                <option value="PERSONAL_INFORMATION">Personal Info</option>
                <option value="PROFANITY">Profanity</option>
                <option value="HARASSMENT">Harassment</option>
                <option value="SENSITIVE_CONTENT">Sensitive Content</option>
                <option value="SUSPICIOUS_LINK">Suspicious Link</option>
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
                <option value="priority">Priority Flagged</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
              Showing <strong className="text-[var(--text-primary)]">{confessions.length}</strong> of {totalElements} items
            </span>
          </div>
        </form>
      </section>

      {/* Queue Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Moderation queue unavailable"
          message={error}
          onRetry={fetchQueue}
        />
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
          title="Queue is completely clear"
          description="There are currently zero confessions requiring moderation under the selected filters."
        />
      ) : (
        <div className="space-y-4">
          {confessions.map((c) => {
            const isPending = c.status === 'PENDING';
            const isHidden = c.status === 'HIDDEN';
            const hasFlags = c.screeningFlags && c.screeningFlags.length > 0;
            const hasReports = (c.reportCount ?? 0) > 0;

            return (
              <article
                key={c.id}
                className={`p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border transition-all ${
                  hasFlags || hasReports
                    ? 'border-l-4 border-l-rose-500 border-[var(--border-subtle)]'
                    : 'border-[var(--border-subtle)]'
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--text-muted)]">#{c.id}</span>
                    <Badge variant={isPending ? 'warning' : 'violet'} size="sm">
                      {c.status}
                    </Badge>
                    <Badge variant="default" size="sm">
                      {c.category.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(c.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {hasReports && (
                      <Badge variant="danger" size="sm">
                        <span className="flex items-center gap-1 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{c.reportCount} report{c.reportCount === 1 ? '' : 's'}</span>
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Screening Flags */}
                {hasFlags && (
                  <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-wrap items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                    <Flag className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-[11px] uppercase tracking-wider mr-1">Automated Flags:</span>
                    {c.screeningFlags!.map((f) => (
                      <span
                        key={f}
                        title={c.flagExplanations?.[f] || f}
                        className="px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-rose-500/30 font-semibold text-[11px] text-rose-600 dark:text-rose-400"
                      >
                        {f.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confession Title & Content */}
                {c.title && (
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
                    {c.title}
                  </h3>
                )}
                <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm leading-relaxed mb-4">
                  {c.content}
                </p>

                {/* Moderation Actions Bar */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  {isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionLoadingId === c.id}
                      isLoading={actionLoadingId === c.id}
                      onClick={() => handleApprove(c.id)}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Approve to Feed
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoadingId === c.id}
                    onClick={(e) => handleOpenReject(c.id, e)}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Reject
                  </Button>

                  {isHidden && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={actionLoadingId === c.id}
                      onClick={() => handleRestore(c.id)}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Restore to Feed
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Moderation worklist pagination"
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

      {/* Reject Confirmation Dialog */}
      <Modal
        isOpen={rejectingId !== null}
        onClose={handleCloseReject}
        title={`Reject Confession #${rejectingId}`}
        description="Are you sure you want to permanently discard this confession? Enter a justification note for the audit trail."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseReject}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={actionLoadingId === rejectingId}
              onClick={handleConfirmReject}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label htmlFor="rejectReason" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Rejection Justification
          </label>
          <input
            id="rejectReason"
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Audit log reason (e.g. Harassment, Doxxing)..."
            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </Modal>
    </div>
  );
}
