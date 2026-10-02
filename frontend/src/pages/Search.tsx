import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchConfessions } from '../api';
import type { Confession } from '../types';
import {
  Search as SearchIcon,
  X,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Sparkles
} from 'lucide-react';

import {
  Input,
  Button,
  SkeletonCard,
  EmptyState,
  ErrorState
} from '../components/ui';
import ConfessionCard from '../components/ConfessionCard';
import { ALL_CATEGORY_KEYS } from '../utils/categoryTheme';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'ALL';
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
      const cat = category === 'ALL' ? undefined : category;
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
    setInputCategory('ALL');
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <section className="rounded-[24px] bg-[#111827]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 via-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-12 -mt-12" />

        <div className="relative z-10 space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold tracking-wide uppercase select-none shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Campus Archive Search</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
            Search Confessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Search across all approved confessions by keywords, topics, exams, hostel rants, or professors.
          </p>
        </div>

        {/* Large Obvious Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                id="search-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Search keywords, topics, hostel rants..."
                maxLength={100}
                leftIcon={<SearchIcon className="w-4 h-4 text-cyan-400" />}
                rightIcon={
                  inputQuery ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      aria-label="Clear search input"
                      className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null
                }
                className="w-full text-base"
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
                className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#111827] border border-white/15 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
              >
                {ALL_CATEGORY_KEYS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
                  </option>
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
        <div className="flex items-center justify-between text-xs text-slate-300 px-2 font-medium">
          <span>
            Results for: <strong className="text-white">"{queryParam}"</strong>
            {typeof totalElements === 'number' && (
              <span className="ml-1 text-slate-400">({totalElements} found)</span>
            )}
          </span>

          {categoryParam !== 'ALL' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[11px] font-bold">
              Category: {categoryParam.replace('_', ' ')}
            </span>
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
              icon={<FileQuestion className="w-8 h-8 text-cyan-400" />}
              title="No confessions found"
              description="No confessions matched your search keywords. Try searching for different terms or switch to 'All Categories'."
              actionLabel="Clear Search"
              onAction={handleClear}
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
              aria-label="Search pagination"
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
      )}
    </div>
  );
}
