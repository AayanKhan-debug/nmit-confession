import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrendingConfessions } from '../api';
import type { Confession } from '../types';
import {
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Medal,
  Award
} from 'lucide-react';

import {
  Badge,
  CategoryChip,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Button
} from '../components/ui';

const CATEGORIES = ['ALL', 'CAMPUS_LIFE', 'ADVICE', 'RANT', 'FUNNY', 'CRUSH', 'OTHER'];

const CATEGORY_BADGE_VARIANTS: Record<string, { variant: 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'default'; label: string; emoji: string }> = {
  CAMPUS_LIFE: { variant: 'blue', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { variant: 'success', label: 'Advice', emoji: '💡' },
  RANT: { variant: 'pink', label: 'Rant', emoji: '🗣️' },
  FUNNY: { variant: 'warning', label: 'Funny', emoji: '😂' },
  CRUSH: { variant: 'pink', label: 'Crush', emoji: '💖' },
  OTHER: { variant: 'default', label: 'Other', emoji: '🔮' },
};

export default function Trending() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'ALL';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    executeLoad(categoryParam, pageParam);
  }, [categoryParam, pageParam]);

  const executeLoad = async (category: string, page: number) => {
    setLoading(true);
    setError('');

    try {
      const cat = category === 'ALL' ? undefined : category;
      const res = await getTrendingConfessions(page, 20, cat);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      setError('Failed to fetch trending confessions from the campus server.');
      setConfessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      category: categoryParam,
      page: newPage.toString()
    });
  };

  const handleCategoryChange = (newCat: string) => {
    setSearchParams({
      category: newCat,
      page: '0'
    });
  };

  const calculateTotalReactions = (c: Confession) => {
    const r = c.reactions || {};
    return (r.LOVE ?? c.reactionLoveCount ?? 0) +
           (r.FUNNY ?? c.reactionFunnyCount ?? 0) +
           (r.SAD ?? c.reactionSadCount ?? 0) +
           (r.FIRE ?? c.reactionFireCount ?? 0);
  };

  // Rank podium styles
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return {
        cardBorder: 'border-amber-400/50 shadow-md shadow-amber-500/5',
        badgeClass: 'bg-amber-400/15 text-amber-500 border border-amber-400/40',
        icon: <Trophy className="w-4 h-4 text-amber-500" />,
        label: '#1 Top Pick',
      };
    }
    if (rank === 2) {
      return {
        cardBorder: 'border-slate-300/40 dark:border-slate-600/40',
        badgeClass: 'bg-slate-200/20 text-slate-400 border border-slate-300/40',
        icon: <Medal className="w-4 h-4 text-slate-400" />,
        label: '#2 Runner Up',
      };
    }
    if (rank === 3) {
      return {
        cardBorder: 'border-amber-700/30 dark:border-amber-600/30',
        badgeClass: 'bg-amber-700/10 text-amber-700 dark:text-amber-500 border border-amber-700/30',
        icon: <Award className="w-4 h-4 text-amber-700 dark:text-amber-500" />,
        label: '#3 Bronze',
      };
    }
    return {
      cardBorder: 'border-[var(--border-subtle)]',
      badgeClass: 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
      icon: null,
      label: `#${rank}`,
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 via-orange-500/5 to-transparent rounded-bl-full pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 space-y-2">
          <Badge variant="pink" dot size="sm">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-pink-500" />
              <span>Campus Buzz</span>
            </span>
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Trending Confessions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
            Ranked by total community reactions over the past 7 days.
          </p>
        </div>

        {/* Category Carousel Filter */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map(cat => (
              <CategoryChip
                key={cat}
                categoryKey={cat}
                selected={categoryParam === cat}
                onSelectCategory={handleCategoryChange}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div>
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load trending ranking"
            message={error}
            onRetry={() => executeLoad(categoryParam, pageParam)}
          />
        ) : confessions.length === 0 ? (
          <EmptyState
            icon={<Flame className="w-8 h-8 text-pink-500" />}
            title="Quiet week on campus"
            description="No confessions meet the 7-day trending threshold for this category. React to confessions on the feed to boost them!"
            actionLabel="Browse Feed"
            onAction={() => { window.location.href = '/'; }}
          />
        ) : (
          <div className="space-y-4">
            {confessions.map((c, idx) => {
              const badgeMeta = CATEGORY_BADGE_VARIANTS[c.category] || CATEGORY_BADGE_VARIANTS.OTHER;
              const totalRx = calculateTotalReactions(c);
              const rank = pageParam * 20 + idx + 1;
              const podium = getRankBadge(rank);

              return (
                <article
                  key={c.id}
                  className={`p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border ${podium.cardBorder} shadow-xs hover:border-[var(--border-focus)] transition-all duration-200 flex flex-col sm:flex-row items-start gap-4`}
                >
                  {/* Rank Indicator Pill */}
                  <div
                    className={`inline-flex sm:flex flex-row sm:flex-col items-center justify-center min-w-[48px] px-2.5 py-1 sm:py-2 rounded-2xl text-xs font-black shrink-0 ${podium.badgeClass}`}
                  >
                    {podium.icon}
                    <span>{podium.label}</span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5 w-full">
                    <div className="flex items-center justify-between">
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
                      <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] leading-snug">
                        {c.title}
                      </h2>
                    )}

                    <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                      {c.content}
                    </p>

                    {/* Restrained fire reaction summary */}
                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>{totalRx} total reaction{totalRx === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav
            aria-label="Trending pagination"
            className="flex items-center justify-between p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs mt-6"
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={pageParam === 0}
              onClick={() => handlePageChange(pageParam - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Page <strong className="text-[var(--text-primary)]">{pageParam + 1}</strong> of{' '}
              <strong className="text-[var(--text-primary)]">{totalPages}</strong>
            </span>

            <Button
              variant="secondary"
              size="sm"
              disabled={pageParam >= totalPages - 1}
              onClick={() => handlePageChange(pageParam + 1)}
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
