import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrendingConfessions } from '../api';
import type { Confession } from '../types';
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Trophy
} from 'lucide-react';

import {
  CategoryChip,
  SkeletonCard,
  EmptyState,
  ErrorState,
  Button
} from '../components/ui';
import ConfessionCard from '../components/ConfessionCard';
import { ALL_CATEGORY_KEYS } from '../utils/categoryTheme';

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner with Dark Neon Sticker Style */}
      <section className="rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/20 via-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-bold tracking-wide uppercase select-none shadow-sm">
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span>Campus Leaderboard</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
            Trending Confessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            Ranked dynamically by total community reactions (❤️ 😂 🥺 🔥) over the past 7 days.
          </p>
        </div>

        {/* Category Carousel Filter */}
        <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {ALL_CATEGORY_KEYS.map(cat => (
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
            icon={<Trophy className="w-8 h-8 text-pink-400" />}
            title="Quiet week on campus"
            description="No confessions meet the 7-day trending threshold for this category. React to confessions on the feed to boost them to the leaderboard!"
            actionLabel="Browse Feed"
            onAction={() => { window.location.href = '/'; }}
          />
        ) : (
          <div className="space-y-5">
            {confessions.map((c, idx) => {
              const rank = pageParam * 20 + idx + 1;
              return (
                <ConfessionCard
                  key={c.id}
                  confession={c}
                  showRanking={rank}
                />
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <nav
            aria-label="Trending pagination"
            className="flex items-center justify-between p-4 rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 shadow-lg mt-6"
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

            <span className="text-xs font-semibold text-slate-300">
              Page <strong className="text-white">{pageParam + 1}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong>
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
