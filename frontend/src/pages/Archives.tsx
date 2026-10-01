import { useState, useEffect } from 'react';
import { getDailyArchive, getWeeklyArchive, getMonthlyArchive } from '../api';
import type { Confession } from '../types';

export default function Archives() {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day');
  
  // States for navigation
  const [currentDate, setCurrentDate] = useState(() => new Date());
  
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract date components
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12
  
  // ISO week approximation for JS (simplified for frontend tracking, backend enforces truth)
  const getIsoInfo = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return { week, isoYear: date.getUTCFullYear() };
  };
  
  const { week, isoYear } = getIsoInfo(currentDate);

  // Check if we are at the current period to disable 'Next' button
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
        // YYYY-MM-DD in local time
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
        setError('Failed to load archives.');
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Archives</h1>

      {/* Controls */}
      <div className="bg-white p-4 rounded shadow mb-6 space-y-4">
        <div className="flex space-x-4 border-b pb-4">
          <button 
            className={`px-4 py-2 rounded ${viewType === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => { setViewType('day'); setPage(0); setCurrentDate(new Date()); }}
          >
            Day
          </button>
          <button 
            className={`px-4 py-2 rounded ${viewType === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => { setViewType('week'); setPage(0); setCurrentDate(new Date()); }}
          >
            Week
          </button>
          <button 
            className={`px-4 py-2 rounded ${viewType === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => { setViewType('month'); setPage(0); setCurrentDate(new Date()); }}
          >
            Month
          </button>
        </div>

        <div className="flex justify-between items-center">
          <button 
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            &larr; Previous {viewType === 'day' ? 'Day' : viewType === 'week' ? 'Week' : 'Month'}
          </button>

          <span className="font-semibold text-lg">
            {viewType === 'day' && currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {viewType === 'week' && `Week ${week} · ${isoYear}`}
            {viewType === 'month' && currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>

          <button 
            onClick={handleNext}
            disabled={isNextDisabled}
            className={`px-4 py-2 rounded ${isNextDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
          >
            Next {viewType === 'day' ? 'Day' : viewType === 'week' ? 'Week' : 'Month'} &rarr;
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      ) : confessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white rounded shadow">No confessions found for this period.</div>
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

          {/* Pagination */}
          {totalPages > 1 && (
             <div className="flex justify-center space-x-2 mt-4">
              <button 
                onClick={() => setPage(p => p - 1)} 
                disabled={page === 0}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous Page
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded">
                Page {page + 1} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= totalPages - 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

