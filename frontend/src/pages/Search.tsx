import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchConfessions } from '../api';
import type { Confession } from '../types';
import {
  Search as SearchIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion
} from 'lucide-react';

import {
  Badge,
  Input,
  Button,
  SkeletonCard,
  EmptyState,
  ErrorState
} from '../components/ui';

const CATEGORIES = [
  { value: 'All', label: 'All Categories' },
  { value: 'CAMPUS_LIFE', label: 'Campus Life' },
  { value: 'ADVICE', label: 'Advice' },
  { value: 'RANT', label: 'Rant' },
  { value: 'FUNNY', label: 'Funny' },
  { value: 'CRUSH', label: 'Crushes' },
  { value: 'OTHER', label: 'Other Topics' }
];

const CATEGORY_BADGE_VARIANTS: Record<string, { variant: 'violet' | 'pink' | 'blue' | 'success' | 'warning' | 'default'; label: string; emoji: string }> = {
  CAMPUS_LIFE: { variant: 'blue', label: 'Campus Life', emoji: '🏫' },
  ADVICE: { variant: 'success', label: 'Advice', emoji: '💡' },
  RANT: { variant: 'pink', label: 'Rant', emoji: '🗣️' },
  FUNNY: { variant: 'warning', label: 'Funny', emoji: '😂' },
  CRUSH: { variant: 'pink', label: 'Crush', emoji: '💖' },
  OTHER: { variant: 'default', label: 'Other', emoji: '🔮' },
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [inputCategory, setInputCategory] = useState(categoryParam);

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(!!queryParam);

  useEffect(() => {
    if (queryParam.trim()) {
      executeSearch(queryParam, categoryParam, pageParam);
    } else {
      setConfessions([]);
      setHasSearched(false);
      setTotalElements(null);
    }
  }, [queryParam, categoryParam, pageParam]);

  const executeSearch = async (q: string, category: string, page: number) => {
    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const cat = category === 'All' ? undefined : category;
      const res = await searchConfessions(q, page, 20, cat);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements ?? res.data.content.length);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid search query.');
      } else {
        setError('Failed to fetch search results from campus database.');
      }
      setConfessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    setSearchParams({
      q: inputQuery.trim(),
      category: inputCategory,
      page: '0'
    });
  };

  const handleClear = () => {
    setInputQuery('');
    setInputCategory('All');
    setSearchParams({});
    setConfessions([]);
    setHasSearched(false);
    setTotalElements(null);
    setError('');
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({
      q: queryParam,
      category: categoryParam,
      page: newPage.toString()
    });
  };

  const calculateTotalReactions = (c: Confession) => {
    const r = c.reactions || {};
    return (r.LOVE ?? c.reactionLoveCount ?? 0) +
           (r.FUNNY ?? c.reactionFunnyCount ?? 0) +
           (r.SAD ?? c.reactionSadCount ?? 0) +
           (r.FIRE ?? c.reactionFireCount ?? 0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden">
        <div className="space-y-2 mb-6">
          <Badge variant="blue" dot size="sm">
            Campus Archive Search
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Search Confessions
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Explore past campus confessions by keywords, topics, exams, hostels, or professors.
          </p>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                id="search-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search keywords, topics, hostel rants..."
                maxLength={100}
                leftIcon={<SearchIcon className="w-4 h-4 text-[var(--text-muted)]" />}
                rightIcon={
                  inputQuery ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      aria-label="Clear search input"
                      className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null
                }
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                id="category-select"
                aria-label="Filter search results by category"
                value={inputCategory}
                onChange={(e) => {
                  setInputCategory(e.target.value);
                  if (inputQuery.trim()) {
                    setSearchParams({
                      q: inputQuery.trim(),
                      category: e.target.value,
                      page: '0'
                    });
                  }
                }}
                className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputQuery.trim() || loading}
                className="shrink-0"
              >
                Search
              </Button>
            </div>
          </div>
        </form>
      </section>

      {/* Results Header Meta */}
      {hasSearched && (
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] px-2">
          <span>
            Results for: <strong className="text-[var(--text-primary)]">"{queryParam}"</strong>
            {typeof totalElements === 'number' && (
              <span className="ml-1 text-[var(--text-muted)]">({totalElements} found)</span>
            )}
          </span>

          {categoryParam !== 'All' && (
            <Badge variant="violet" size="sm">
              Category: {categoryParam.replace('_', ' ')}
            </Badge>
          )}
        </div>
      )}

      {/* Results Stream Area */}
      {hasSearched && (
        <div>
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <ErrorState
              title="Search query error"
              message={error}
              onRetry={() => executeSearch(queryParam, categoryParam, pageParam)}
            />
          ) : confessions.length === 0 ? (
            <EmptyState
              icon={<FileQuestion className="w-8 h-8 text-[var(--text-muted)]" />}
              title="No matching confessions found"
              description="No confessions matched your search keywords. Try searching for different terms or switch to 'All Categories'."
              actionLabel="Clear Filters"
              onAction={handleClear}
            />
          ) : (
            <div className="space-y-4">
              {confessions.map((c) => {
                const badgeMeta = CATEGORY_BADGE_VARIANTS[c.category] || CATEGORY_BADGE_VARIANTS.OTHER;
                const totalRx = calculateTotalReactions(c);
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

                    <p className="text-[var(--text-secondary)] whitespace-pre-wrap text-sm sm:text-base leading-relaxed mb-4">
                      {c.content}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span>{totalRx} community reactions</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav
              aria-label="Search pagination"
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
      )}
    </div>
  );
}
