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
      <section className="p-6 sm:p-7 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Operational Worklist</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white font-heading">
            Moderation Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Review pending submissions, inspect automated screening flags, and take decisive actions.
          </p>
        </div>

        {/* Quick Console Links */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/dashboard"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a2234] border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-violet-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/reports"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a2234] border border-white/10 text-slate-300 hover:text-rose-400 hover:bg-white/5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Reports</span>
          </Link>
          <Link
            to="/admin/hidden"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a2234] border border-white/10 text-slate-300 hover:text-purple-400 hover:bg-white/5 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span>Hidden</span>
          </Link>
        </div>
      </section>

      {/* Dense Filter Toolbar */}
      <section className="p-5 sm:p-6 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-xl">
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div>
              <label htmlFor="status" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer min-h-[44px]"
              >
                <option value="PENDING">PENDING</option>
                <option value="HIDDEN">HIDDEN</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer min-h-[44px]"
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
              <label htmlFor="flag" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                Screening Flag
              </label>
              <select
                id="flag"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer min-h-[44px]"
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
              <label htmlFor="sort" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                Order
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer min-h-[44px]"
              >
                <option value="priority">Priority Flagged</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            <div>
              <label htmlFor="from" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                From Date
              </label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="to" className="block mb-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                To Date
              </label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-white/15 font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/10">
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

            <span className="text-xs text-slate-400 font-medium">
              Showing <strong className="text-white">{confessions.length}</strong> of {totalElements} items
            </span>
          </div>
        </form>
      </section>

      {/* Queue Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <ErrorState
          title="Moderation queue unavailable"
          message={error}
          onRetry={fetchQueue}
        />
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
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
                className={`p-5 sm:p-6 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border transition-all ${
                  hasFlags || hasReports
                    ? 'border-l-4 border-l-rose-500 border-white/10'
                    : 'border-white/10'
                }`}
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400">#{c.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {c.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px] font-semibold">
                      {c.category.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(c.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>

                    {hasReports && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>{c.reportCount} report{c.reportCount === 1 ? '' : 's'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Screening Flags */}
                {hasFlags && (
                  <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-wrap items-center gap-2 text-xs text-rose-300">
                    <Flag className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                    <span className="font-bold text-[11px] uppercase tracking-wider mr-1">Automated Flags:</span>
                    {c.screeningFlags!.map((f) => (
                      <span
                        key={f}
                        title={c.flagExplanations?.[f] || f}
                        className="px-2.5 py-0.5 rounded-full bg-[#111827] border border-rose-500/40 font-semibold text-[11px] text-rose-300"
                      >
                        {f.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confession Title & Content */}
                {c.title && (
                  <h3 className="text-base font-bold text-white mb-2 tracking-tight font-heading">
                    {c.title}
                  </h3>
                )}
                <p className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed mb-4 break-words">
                  {c.content}
                </p>

                {/* Moderation Actions Bar */}
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                  {isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionLoadingId === c.id}
                      isLoading={actionLoadingId === c.id}
                      onClick={() => handleApprove(c.id)}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Approve to Feed
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    disabled={actionLoadingId === c.id}
                    onClick={(e) => handleOpenReject(c.id, e)}
                    leftIcon={<X className="w-4 h-4" />}
                  >
                    Reject
                  </Button>

                  {isHidden && (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={actionLoadingId === c.id}
                      onClick={() => handleRestore(c.id)}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
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
          className="flex items-center justify-between p-4 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-lg"
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

          <span className="text-xs font-semibold text-slate-300">
            Page <strong className="text-white">{page + 1}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
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
          <label htmlFor="rejectReason" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Rejection Justification
          </label>
          <input
            id="rejectReason"
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Audit log reason (e.g. Harassment, Doxxing)..."
            className="w-full px-4 py-3 rounded-2xl bg-[#111827] border border-white/15 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
          />
        </div>
      </Modal>
    </div>
  );
}
