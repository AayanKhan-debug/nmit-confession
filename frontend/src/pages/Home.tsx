import { useEffect, useState } from 'react';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import { Heart, Smile, Frown, Flame, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');

  const fetchConfessions = async () => {
    setLoading(true);
    setError('');
    try {
      const url = category ? `/confessions?category=${category}&page=${page}` : `/confessions?page=${page}`;
      const res = await api.get<PageResponse<Confession>>(url);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError('Failed to load confessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, [page, category]);

  const handleReaction = async (id: number, type: string) => {
    try {
      await api.post(`/confessions/${id}/reactions`, { reactionType: type });
      fetchConfessions();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("You have already reacted to this confession.");
      } else {
        alert("An error occurred while reacting.");
      }
    }
  };

  const handleReport = async (id: number) => {
    const reason = prompt("Enter report reason (e.g., SPAM, HARASSMENT, OTHER):", "OTHER");
    if (!reason) return;
    try {
      await api.post(`/confessions/${id}/reports`, { reason });
      alert("Report submitted successfully.");
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("You have already reported this confession.");
      } else if (err.response?.status === 429) {
        alert("You are reporting too fast. Try again later.");
      } else {
        alert("Failed to submit report.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Public Feed</h1>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} className="border p-2 rounded">
          <option value="">All Categories</option>
          <option value="CAMPUS_LIFE">Campus Life</option>
          <option value="ACADEMICS">Academics</option>
          <option value="RELATIONSHIPS">Relationships</option>
          <option value="FUNNY">Funny</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && confessions.length === 0 && <p>No confessions found.</p>}

      <div className="space-y-6">
        {confessions.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-lg shadow">
            {c.title && <h2 className="text-xl font-semibold mb-2">{c.title}</h2>}
            <p className="text-gray-800 whitespace-pre-wrap mb-4">{c.content}</p>
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{c.category}</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex space-x-4 border-t pt-4">
              <button onClick={() => handleReaction(c.id, 'LOVE')} className="flex items-center space-x-1 hover:text-red-500"><Heart size={16} /><span>{c.reactionLoveCount}</span></button>
              <button onClick={() => handleReaction(c.id, 'FUNNY')} className="flex items-center space-x-1 hover:text-yellow-500"><Smile size={16} /><span>{c.reactionFunnyCount}</span></button>
              <button onClick={() => handleReaction(c.id, 'SAD')} className="flex items-center space-x-1 hover:text-blue-500"><Frown size={16} /><span>{c.reactionSadCount}</span></button>
              <button onClick={() => handleReaction(c.id, 'FIRE')} className="flex items-center space-x-1 hover:text-orange-500"><Flame size={16} /><span>{c.reactionFireCount}</span></button>
              <button onClick={() => handleReport(c.id)} className="flex items-center space-x-1 text-red-400 hover:text-red-600 ml-auto"><AlertTriangle size={16} /><span>Report</span></button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
