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
  Badge,
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
      <section className="p-5 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="violet" dot size="sm">
              <span className="flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Quarantine Bin</span>
              </span>
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Hidden Confessions
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Submissions hidden automatically by report threshold or manually quarantined.
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

      {/* Content Stream */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <ErrorState
          title="Quarantine bin unavailable"
          message={error}
          onRetry={fetchQueue}
        />
      ) : confessions.length === 0 ? (
        <EmptyState
          icon={<EyeOff className="w-8 h-8 text-[var(--text-muted)]" />}
          title="Zero quarantined confessions"
          description="There are currently no hidden or quarantined confessions in this queue."
        />
      ) : (
        <div className="space-y-4">
          {confessions.map((c) => (
            <article
              key={c.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-l-4 border-l-purple-500 border-[var(--border-subtle)] shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[var(--text-muted)]">#{c.id}</span>
                  <Badge variant="violet" size="sm">
                    HIDDEN
                  </Badge>
                  <Badge variant="default" size="sm">
                    {c.category.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(c.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>

              {c.title && (
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5 tracking-tight">
                  {c.title}
                </h3>
              )}
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm leading-relaxed mb-4">
                {c.content}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={actionId === c.id}
                  isLoading={actionId === c.id}
                  onClick={() => handleRestore(c.id)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore to Feed
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionId === c.id}
                  onClick={(e) => handleOpenReject(c.id, e)}
                  leftIcon={<X className="w-3.5 h-3.5" />}
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
          <label htmlFor="rejectReason" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Audit Reason
          </label>
          <input
            id="rejectReason"
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </Modal>
    </div>
  );
}
