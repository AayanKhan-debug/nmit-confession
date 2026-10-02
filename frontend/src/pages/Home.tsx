import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import {
  MessageSquareOff,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Flame,
  Calendar,
  Sparkles
} from 'lucide-react';

import {
  CategoryChip,
  Modal,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Toast,
  Button
} from '../components/ui';
import ConfessionCard from '../components/ConfessionCard';
import { ALL_CATEGORY_KEYS } from '../utils/categoryTheme';

export default function Home() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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
    }, 4000);
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

  // User's reacted confessions map: confessionId -> reactionType
  const [reactedConfessions, setReactedConfessions] = useState<Record<number, 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE'>>(() => {
    try {
      const saved = sessionStorage.getItem('nmit_reacted_confessions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const recordReactionState = (id: number, type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => {
    setReactedConfessions(prev => {
      const updated = { ...prev, [id]: type };
      try {
        sessionStorage.setItem('nmit_reacted_confessions', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleReaction = async (id: number, type: 'LOVE' | 'FUNNY' | 'SAD' | 'FIRE') => {
    if (reactingId || reactedConfessions[id]) return;
    setReactingId(id);
    setActiveReactionKey(`${id}-${type}`);
    try {
      await api.post(`/confessions/${id}/reactions`, { type });
      recordReactionState(id, type);
      showToast('Your reaction was recorded!', 'success');
      await fetchConfessions();
    } catch (err: any) {
      if (err.response?.status === 409) {
        recordReactionState(id, type);
        showToast("You've already reacted to this confession.", 'info');
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

      {/* Hero Section: Dark Neon Sticker Campus Hero */}
      <section className="rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-violet-600/20 via-pink-600/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-cyan-600/15 via-transparent to-transparent rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

        <div className="relative z-10 space-y-4">
          {/* Sticker Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs font-bold tracking-wide uppercase shadow-sm select-none">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>NMIT Campus Confidential</span>
          </div>

          {/* Hero Typography */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-heading leading-tight">
            Say it.{' '}
            <span className="gradient-text-neon drop-shadow-sm">
              Stay anonymous.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
            Your campus. Your thoughts. No names attached. Drop your stories, hostel rants, crushes, and unspoken confessions freely.
          </p>

          {/* Quick Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/submit"
              className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-extrabold text-white bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 hover:from-violet-500 hover:via-pink-500 hover:to-indigo-500 active:scale-95 shadow-lg shadow-violet-600/35 hover:shadow-violet-600/50 border border-white/25 transition-all duration-150 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Drop a Confession</span>
            </Link>

            <Link
              to="/trending"
              className="min-h-[44px] inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-150 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-pink-400" />
              <span>Trending</span>
            </Link>

            <Link
              to="/daily"
              className="min-h-[44px] inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-150 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Daily Pick</span>
            </Link>
          </div>
        </div>

        {/* Category Sticker Chips Carousel Filter */}
        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {ALL_CATEGORY_KEYS.map(cat => (
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

      {/* Error State */}
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
          icon={<MessageSquareOff className="w-8 h-8 text-violet-400" />}
          title="Nothing here yet 👀"
          description={
            selectedCategory !== 'ALL'
              ? `No approved confessions found in "${selectedCategory.replace('_', ' ')}" yet. Be the first to drop one!`
              : 'Be the first to drop a confession on campus.'
          }
          actionLabel="Drop a Confession"
          onAction={() => { window.location.href = '/submit'; }}
        />
      )}

      {/* Confessions Stream */}
      {!loading && !error && confessions.length > 0 && (
        <div className="space-y-5">
          {confessions.map((c) => (
            <ConfessionCard
              key={c.id}
              confession={c}
              onReaction={handleReaction}
              onReport={handleOpenReport}
              isReacting={reactingId === c.id}
              activeReactionKey={activeReactionKey}
              userReaction={reactedConfessions[c.id]}
              hasReacted={!!reactedConfessions[c.id]}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-between p-4 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-lg"
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

          <span className="text-xs font-semibold text-slate-300">
            Page <strong className="text-white">{page + 1}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong>
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
        description="Help maintain a safe and respectful campus environment. Select a reason to flag this confession for staff review."
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
          <label htmlFor="reportReason" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Flag Reason
          </label>
          <select
            id="reportReason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#111827] border border-white/15 text-sm font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer min-h-[44px]"
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
