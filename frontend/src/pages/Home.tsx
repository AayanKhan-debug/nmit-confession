import { useEffect, useState } from 'react';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import {
  Heart,
  Smile,
  Frown,
  Flame,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  MessageSquareOff
} from 'lucide-react';

import {
  Badge,
  CategoryChip,
  Modal,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Toast,
  Button
} from '../components/ui';

const CATEGORY_BADGE_VARIANTS: Record<string, { variant: 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'default'; label: string; emoji: string }> = {
  CAMPUS_LIFE: { variant: 'blue', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { variant: 'success', label: 'Advice', emoji: '💡' },
  RANT: { variant: 'pink', label: 'Rant', emoji: '🗣️' },
  FUNNY: { variant: 'warning', label: 'Funny', emoji: '😂' },
  CRUSH: { variant: 'pink', label: 'Crush', emoji: '💖' },
  OTHER: { variant: 'default', label: 'Other', emoji: '🔮' },
};

export default function Home() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Notification toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title?: string; message: string } | null>(null);
  const [reactingId, setReactingId] = useState<number | null>(null);
  const [activeReactionKey, setActiveReactionKey] = useState<string | null>(null);

  // Reporting modal state
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('OTHER');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const fetchConfessions = async () => {
    setLoading(true);
    setError('');
    try {
      const url = selectedCategory !== 'ALL'
        ? `/confessions?category=${selectedCategory}&page=${page}`
        : `/confessions?page=${page}`;
      const res = await api.get<PageResponse<Confession>>(url);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Unable to load confessions from the server. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [page, selectedCategory]);

  const getReactionCount = (c: Confession, type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => {
    const r = c.reactions || {};
    return r[type] ?? (c as any)[`reaction${type.charAt(0) + type.slice(1).toLowerCase()}Count`] ?? 0;
  };

  const handleReaction = async (id: number, type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => {
    if (reactingId) return;
    setReactingId(id);
    setActiveReactionKey(`${id}-${type}`);
    try {
      await api.post(`/confessions/${id}/reactions`, { type });
      showToast('Your reaction was recorded!', 'success');
      await fetchConfessions();
    } catch (err: any) {
      if (err.response?.status === 409) {
        showToast('You have already reacted to this confession.', 'info');
      } else {
        showToast('Unable to react right now. Please try again.', 'error');
      }
    } finally {
      setReactingId(null);
      setActiveReactionKey(null);
    }
  };

  const handleOpenReport = (id: number) => {
    setReportingId(id);
    setReportReason('OTHER');
  };

  const handleConfirmReport = async () => {
    if (!reportingId) return;
    setIsSubmittingReport(true);
    try {
      await api.post(`/confessions/${reportingId}/reports`, { reason: reportReason });
      showToast('Confession reported for staff review. Thank you for keeping campus safe.', 'success', 'Report Received');
      setReportingId(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        showToast('You have already reported this confession.', 'info');
      } else if (err.response?.status === 429) {
        showToast('You are reporting too fast. Please try again later.', 'error');
      } else {
        showToast('Failed to submit report. Please try again.', 'error');
      }
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const categoriesList = ['ALL', 'CAMPUS_LIFE', 'ADVICE', 'RANT', 'FUNNY', 'CRUSH', 'OTHER'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Hero Header Card */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 via-pink-500/5 to-transparent rounded-bl-full pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 space-y-2">
          <Badge variant="violet" dot size="sm">
            Campus Confessions
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Community Feed
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Real campus thoughts, advice, hostelite rants, and unspoken stories. 100% anonymous &amp; community moderated.
          </p>
        </div>

        {/* Category Filter Chips Carousel */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categoriesList.map(cat => (
              <CategoryChip
                key={cat}
                categoryKey={cat}
                selected={selectedCategory === cat}
                onSelectCategory={(key) => {
                  setSelectedCategory(key);
                  setPage(0);
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Error state */}
      {error && !loading && (
        <ErrorState
          title="Could not load feed"
          message={error}
          onRetry={fetchConfessions}
        />
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && confessions.length === 0 && (
        <EmptyState
          icon={<MessageSquareOff className="w-8 h-8" />}
          title="Silence in the corridors..."
          description={
            selectedCategory !== 'ALL'
              ? `No approved confessions found in the "${selectedCategory.replace('_', ' ')}" category yet.`
              : 'No confessions published yet. Be the first to break the silence!'
          }
          actionLabel="Drop a Confession"
          onAction={() => { window.location.href = '/submit'; }}
        />
      )}

      {/* Confessions Stream */}
      {!loading && !error && confessions.length > 0 && (
        <div className="space-y-5">
          {confessions.map((c) => {
            const badgeMeta = CATEGORY_BADGE_VARIANTS[c.category] || CATEGORY_BADGE_VARIANTS.OTHER;
            return (
              <article
                key={c.id}
                className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--border-focus)] transition-all duration-200"
              >
                {/* Meta Top: Category Pill & Timestamp (NO author persona) */}
                <div className="flex items-center justify-between mb-3.5">
                  <Badge variant={badgeMeta.variant} size="sm">
                    <span className="mr-1">{badgeMeta.emoji}</span>
                    <span>{badgeMeta.label}</span>
                  </Badge>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <time dateTime={c.createdAt}>
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>

                {/* Confession Title */}
                {c.title && (
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] mb-2.5 leading-snug">
                    {c.title}
                  </h2>
                )}

                {/* Confession Body */}
                <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm sm:text-base leading-relaxed mb-6">
                  {c.content}
                </p>

                {/* Action Footer: Reactions & Report */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  {/* Reaction Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* LOVE */}
                    <button
                      type="button"
                      onClick={() => handleReaction(c.id, 'LOVE')}
                      disabled={reactingId === c.id}
                      aria-label={`React with Love (${getReactionCount(c, 'LOVE')})`}
                      className={`group min-h-[40px] px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95 disabled:opacity-50 ${
                        activeReactionKey === `${c.id}-LOVE`
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 font-bold scale-105'
                          : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-rose-500 hover:border-rose-500/30'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 group-hover:scale-125 transition-transform motion-reduce:transform-none" />
                      <span>{getReactionCount(c, 'LOVE')}</span>
                    </button>

                    {/* FUNNY */}
                    <button
                      type="button"
                      onClick={() => handleReaction(c.id, 'FUNNY')}
                      disabled={reactingId === c.id}
                      aria-label={`React with Haha (${getReactionCount(c, 'FUNNY')})`}
                      className={`group min-h-[40px] px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95 disabled:opacity-50 ${
                        activeReactionKey === `${c.id}-FUNNY`
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 font-bold scale-105'
                          : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/30'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5 text-amber-500 group-hover:scale-125 transition-transform motion-reduce:transform-none" />
                      <span>{getReactionCount(c, 'FUNNY')}</span>
                    </button>

                    {/* SAD */}
                    <button
                      type="button"
                      onClick={() => handleReaction(c.id, 'SAD')}
                      disabled={reactingId === c.id}
                      aria-label={`React with Sad (${getReactionCount(c, 'SAD')})`}
                      className={`group min-h-[40px] px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95 disabled:opacity-50 ${
                        activeReactionKey === `${c.id}-SAD`
                          ? 'bg-sky-500/20 border-sky-500/40 text-sky-500 font-bold scale-105'
                          : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-500 hover:border-sky-500/30'
                      }`}
                    >
                      <Frown className="w-3.5 h-3.5 text-sky-500 group-hover:scale-125 transition-transform motion-reduce:transform-none" />
                      <span>{getReactionCount(c, 'SAD')}</span>
                    </button>

                    {/* FIRE */}
                    <button
                      type="button"
                      onClick={() => handleReaction(c.id, 'FIRE')}
                      disabled={reactingId === c.id}
                      aria-label={`React with Fire (${getReactionCount(c, 'FIRE')})`}
                      className={`group min-h-[40px] px-3 py-1.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95 disabled:opacity-50 ${
                        activeReactionKey === `${c.id}-FIRE`
                          ? 'bg-orange-500/20 border-orange-500/40 text-orange-500 font-bold scale-105'
                          : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-orange-500 hover:border-orange-500/30'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500 group-hover:scale-125 transition-transform motion-reduce:transform-none" />
                      <span>{getReactionCount(c, 'FIRE')}</span>
                    </button>
                  </div>

                  {/* Report Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenReport(c.id)}
                    aria-label="Report this confession"
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs"
        >
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
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
            onClick={() => setPage(p => p + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </nav>
      )}

      {/* Accessible Report Modal */}
      <Modal
        isOpen={reportingId !== null}
        onClose={() => setReportingId(null)}
        title="Report Confession"
        description="Help maintain a safe and respectful campus environment. Select a reason to flag this confession for moderation."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportingId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isSubmittingReport}
              onClick={handleConfirmReport}
            >
              Submit Report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label htmlFor="reportReason" className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Flag Reason
          </label>
          <select
            id="reportReason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="SPAM">Spam or Irrelevant</option>
            <option value="HARASSMENT">Harassment or Bullying</option>
            <option value="HATE_SPEECH">Hate Speech</option>
            <option value="MISINFORMATION">Misinformation</option>
            <option value="OTHER">Other Violation</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}
