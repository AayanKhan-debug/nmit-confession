import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchConfessions } from '../api';
import type { Confession } from '../types';

const CATEGORIES = [
  'All',
  'CRUSH',
  'CONFESSION',
  'RANT',
  'CAMPUS_LIFE',
  'FUNNY',
  'OTHER'
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [inputCategory, setInputCategory] = useState(categoryParam);

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(!!queryParam);

  useEffect(() => {
    if (queryParam.trim()) {
      executeSearch(queryParam, categoryParam, pageParam);
    } else {
      setConfessions([]);
      setHasSearched(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid search query.');
      } else {
        setError('Failed to fetch search results.');
      }
      setConfessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) {
      return;
    }
    
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Confessions</h1>

      <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <div>
          <label htmlFor="search-input" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="flex space-x-2">
            <input
              id="search-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search by keyword..."
              className="flex-1 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category-select"
            value={inputCategory}
            onChange={(e) => {
              setInputCategory(e.target.value);
              // Auto-submit on category change if there is a valid query
              if (inputQuery.trim()) {
                setSearchParams({
                  q: inputQuery.trim(),
                  category: e.target.value,
                  page: '0'
                });
              }
            }}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </form>

      {hasSearched && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Searching...</div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
          ) : confessions.length === 0 ? (
            <div className="bg-white p-8 rounded shadow text-center text-gray-500">
              No matching confessions found.
            </div>
          ) : (
            <div className="space-y-6">
              {confessions.map((c) => (
                <div key={c.id} className="bg-white p-6 rounded shadow border">
                  {c.title && <h2 className="text-xl font-semibold mb-2">{c.title}</h2>}
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">{c.content}</p>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>{c.category}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  <button 
                    onClick={() => handlePageChange(pageParam - 1)} 
                    disabled={pageParam === 0}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 bg-gray-100 rounded">
                    Page {pageParam + 1} of {totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(pageParam + 1)} 
                    disabled={pageParam >= totalPages - 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

