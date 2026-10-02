import { useState, useEffect } from 'react';
import { getDailyArchive, getWeeklyArchive, getMonthlyArchive } from '../api';
import type { Confession } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Archive as ArchiveIcon,
  Clock,
  Inbox
} from 'lucide-react';

import {
  Badge,
  Button,
  SkeletonCard,
  EmptyState,
  ErrorState
} from '../components/ui';

const CATEGORY_BADGE_VARIANTS: Record<string, { variant: 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'default'; label: string; emoji: string }> = {
  CAMPUS_LIFE: { variant: 'blue', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { variant: 'success', label: 'Advice', emoji: '💡' },
  RANT: { variant: 'pink', label: 'Rant', emoji: '🗣️' },
  FUNNY: { variant: 'warning', label: 'Funny', emoji: '😂' },
  CRUSH: { variant: 'pink', label: 'Crush', emoji: '💖' },
  OTHER: { variant: 'default', label: 'Other', emoji: '🔮' },
};

export default function Archives() {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const getIsoInfo = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return { week, isoYear: date.getUTCFullYear() };
  };

  const { week, isoYear } = getIsoInfo(currentDate);

  const today = new Date();
  const { week: currentWeek, isoYear: currentIsoYear } = getIsoInfo(today);

  const isToday = currentDate.toDateString() === today.toDateString();
  const isCurrentWeek = isoYear === currentIsoYear && week === currentWeek;
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  const isNextDisabled =
    (viewType === 'day' && isToday) ||
    (viewType === 'week' && isCurrentWeek) ||
    (viewType === 'month' && isCurrentMonth);

  useEffect(() => {
    loadArchive();
  }, [viewType, currentDate, page]);

  const loadArchive = async () => {
    setLoading(true);
    setError('');

    try {
      let res;
      if (viewType === 'day') {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        res = await getDailyArchive(dateStr, page);
      } else if (viewType === 'week') {
        res = await getWeeklyArchive(isoYear, week, page);
      } else {
        res = await getMonthlyArchive(year, month, page);
      }

      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Future archive periods are not available.');
      } else {
        setError('Failed to load archives from server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') newDate.setDate(newDate.getDate() - 1);
    if (viewType === 'week') newDate.setDate(newDate.getDate() - 7);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() - 1);
    setPage(0);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    if (isNextDisabled) return;
    const newDate = new Date(currentDate);
    if (viewType === 'day') newDate.setDate(newDate.getDate() + 1);
    if (viewType === 'week') newDate.setDate(newDate.getDate() + 7);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() + 1);
    setPage(0);
    setCurrentDate(newDate);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Archives Header */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
        <div className="space-y-2 mb-6">
          <Badge variant="violet" dot size="sm">
            <span className="flex items-center gap-1">
              <ArchiveIcon className="w-3.5 h-3.5 text-violet-500" />
              <span>Historical Records</span>
            </span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Campus Archives
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Look back at confessions sorted by calendar day, academic week, or month.
          </p>
        </div>

        {/* Period Selector Tabs & Controls */}
        <div className="space-y-4">
          <div className="inline-flex p-1 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            {(['day', 'week', 'month'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setViewType(type);
                  setPage(0);
                  setCurrentDate(new Date());
                }}
                className={`min-h-[40px] px-5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  viewType === type
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-bold border border-[var(--border-subtle)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <span className="font-bold text-sm sm:text-base text-[var(--text-primary)] text-center px-2">
              {viewType === 'day' &&
                currentDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              {viewType === 'week' && `Week ${week} · ${isoYear}`}
              {viewType === 'month' &&
                currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleNext}
              disabled={isNextDisabled}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      </section>

      {/* Content Stream Area */}
      <div>
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState
            title="Archive unavailable"
            message={error}
            onRetry={loadArchive}
          />
        ) : confessions.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-8 h-8 text-[var(--text-muted)]" />}
            title="No confessions found for this period"
            description="The selected day, week, or month has no stored confessions. Use the navigation buttons above to travel to an active period."
          />
        ) : (
          <div className="space-y-4">
            {confessions.map((c) => {
              const badgeMeta = CATEGORY_BADGE_VARIANTS[c.category] || CATEGORY_BADGE_VARIANTS.OTHER;
              return (
                <article
                  key={c.id}
                  className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs hover:border-[var(--border-focus)] transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3.5">
                    <Badge variant={badgeMeta.variant} size="sm">
                      <span className="mr-1">{badgeMeta.emoji}</span>
                      <span>{badgeMeta.label}</span>
                    </Badge>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {c.title && (
                    <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mb-2.5 leading-snug">
                      {c.title}
                    </h2>
                  )}

                  <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {c.content}
                  </p>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav
            aria-label="Archives pagination"
            className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs mt-6"
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
      </div>
    </div>
  );
}
