import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTrendingConfessions } from '../api';
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

export default function Trending() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category') || 'All';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [inputCategory, setInputCategory] = useState(categoryParam);

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
      const cat = category === 'All' ? undefined : category;
      const res = await getTrendingConfessions(page, 20, cat);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError('Failed to fetch trending confessions.');
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

  const calculateTotalReactions = (c: Confession) => {
    const r = c.reactions || {};
    return (r.LOVE || 0) + (r.FUNNY || 0) + (r.SAD || 0) + (r.FIRE || 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Trending Confessions</h1>
      <p className="text-gray-600 mb-8">Popular in the last 7 days</p>

      <div className="bg-white p-6 rounded shadow mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Filter</label>
          <select
            value={inputCategory}
            onChange={(e) => {
              setInputCategory(e.target.value);
              setSearchParams({
                category: e.target.value,
                page: '0'
              });
            }}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading trending confessions...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        ) : confessions.length === 0 ? (
          <div className="bg-white p-8 rounded shadow text-center text-gray-500">
            No trending confessions found.
          </div>
        ) : (
          <div className="space-y-6">
            {confessions.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded shadow border">
                {c.title && <h2 className="text-xl font-semibold mb-2">{c.title}</h2>}
                <p className="text-gray-800 whitespace-pre-wrap mb-4">{c.content}</p>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>{c.category} &bull; {calculateTotalReactions(c)} reactions</span>
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
    </div>
  );
}

