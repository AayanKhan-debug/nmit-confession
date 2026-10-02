import { useState, useEffect } from 'react';
import { getDailyArchive, getWeeklyArchive, getMonthlyArchive } from '../api';
import type { Confession } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Archive as ArchiveIcon,
  Inbox
} from 'lucide-react';

import {
  Button,
  SkeletonCard,
  EmptyState,
  ErrorState
} from '../components/ui';
import ConfessionCard from '../components/ConfessionCard';

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
      {/* Archives Header Banner */}
      <section className="rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 via-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        <div className="relative z-10 space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-wide uppercase select-none shadow-sm">
            <ArchiveIcon className="w-3.5 h-3.5 text-purple-400" />
            <span>Time Capsule</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
            Campus Archives
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Travel back in time through past confessions organized by calendar day, academic week, or month.
          </p>
        </div>

        {/* Period Selector Tabs & Controls */}
        <div className="space-y-4 relative z-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#0B0F19]/80 border border-white/10">
            {(['day', 'week', 'month'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setViewType(type);
                  setPage(0);
                  setCurrentDate(new Date());
                }}
                className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  viewType === type
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Date Navigation Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <span className="font-extrabold text-sm sm:text-base text-white text-center px-2 font-heading tracking-wide">
              {viewType === 'day' &&
                currentDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              {viewType === 'week' && `Academic Week ${week} · ${isoYear}`}
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
            icon={<Inbox className="w-8 h-8 text-purple-400" />}
            title="No confessions recorded for this period"
            description="The selected day, week, or month has no stored confessions. Use the navigation buttons above to travel to an active date."
          />
        ) : (
          <div className="space-y-5">
            {confessions.map((c) => (
              <ConfessionCard
                key={c.id}
                confession={c}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav
            aria-label="Archives pagination"
            className="flex items-center justify-between p-4 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-lg mt-6"
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
      </div>
    </div>
  );
}
