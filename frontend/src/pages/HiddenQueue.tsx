import { useEffect, useState, useRef, type MouseEvent } from 'react';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import { Link } from 'react-router-dom';
import {
  EyeOff,
  RotateCcw,
  X,
  Clock,
  ArrowLeft
} from 'lucide-react';
import {
  Button,
  Modal,
  Toast,
  Skeleton,
  EmptyState,
  ErrorState
} from '../components/ui';

export default function HiddenQueue() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title?: string; message: string } | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  // Reject modal
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('Violates community policy');
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
      const res = await api.get<PageResponse<Confession>>('/admin/moderation/hidden?page=0&size=20');
      setConfessions(res.data.content);
    } catch {
      setError('Unauthorized or failed to load hidden queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleRestore = async (id: number) => {
    if (actionId) return;
    setActionId(id);
    try {
      await api.post(`/admin/moderation/confessions/${id}/restore`);
      showToast(`Confession #${id} restored and published to public feed!`, 'success', 'Restored');
      await fetchQueue();
    } catch {
      showToast('Error restoring confession. Please try again.', 'error', 'Action Failed');
    } finally {
      setActionId(null);
    }
  };

  const handleOpenReject = (id: number, e: MouseEvent<HTMLButtonElement>) => {
    rejectTriggerRef.current = e.currentTarget;
    setRejectingId(id);
    setRejectReason('Permanently removed after safety review');
  };

  const handleCloseReject = () => {
    setRejectingId(null);
    setTimeout(() => {
      rejectTriggerRef.current?.focus();
    }, 50);
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setActionId(rejectingId);
    try {
      await api.post(`/admin/moderation/confessions/${rejectingId}/reject`, { reason: rejectReason });
      showToast(`Confession #${rejectingId} permanently rejected.`, 'info', 'Rejected');
      handleCloseReject();
      await fetchQueue();
    } catch {
      showToast('Error rejecting confession.', 'error', 'Action Failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider select-none">
            <EyeOff className="w-3.5 h-3.5 text-purple-400" />
            <span>Quarantine Bin</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white font-heading">
            Hidden Confessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Submissions hidden automatically by report threshold or manually quarantined.
          </p>
        </div>

        <Link
          to="/admin/moderation"
          className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#1a2234] border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Mod Queue</span>
        </Link>
      </section>

      {/* Content Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-[24px]" />
          <Skeleton className="h-44 w-full rounded-[24px]" />
        </div>
      ) : error ? (
        <ErrorState
          title="Quarantine bin unavailable"
          message={error}
          onRetry={fetchQueue}
        />
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={<EyeOff className="w-8 h-8 text-purple-400" />}
          title="Zero quarantined confessions"
          description="There are currently no hidden or quarantined confessions in this queue."
        />
      ) : (
        <div className="space-y-4">
          {confessions.map((c) => (
            <article
              key={c.id}
              className="p-5 sm:p-6 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-l-4 border-l-purple-500 border-white/10 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-400">#{c.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                    HIDDEN
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px] font-semibold">
                    {c.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(c.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {c.title && (
                <h3 className="text-base font-bold text-white mb-2 tracking-tight font-heading">
                  {c.title}
                </h3>
              )}
              <p className="text-slate-200 whitespace-pre-wrap text-sm leading-relaxed mb-4 break-words">
                {c.content}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={actionId === c.id}
                  isLoading={actionId === c.id}
                  onClick={() => handleRestore(c.id)}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Restore to Feed
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionId === c.id}
                  onClick={(e) => handleOpenReject(c.id, e)}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Reject Permanently
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectingId !== null}
        onClose={handleCloseReject}
        title={`Permanently Reject Confession #${rejectingId}`}
        description="This action will permanently withdraw the confession. Specify a reason for the moderation audit log."
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
              isLoading={actionId === rejectingId}
              onClick={handleConfirmReject}
            >
              Confirm Permanent Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label htmlFor="rejectReason" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Audit Reason
          </label>
          <input
            id="rejectReason"
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#111827] border border-white/15 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
          />
        </div>
      </Modal>
    </div>
  );
}
