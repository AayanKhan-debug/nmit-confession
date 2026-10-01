import { useEffect, useState } from 'react';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import { Link } from 'react-router-dom';

export default function ModQueue() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await api.get<PageResponse<Confession>>('/admin/moderation/confessions?status=PENDING&page=0&size=20');
      setConfessions(res.data.content);
    } catch (err: any) {
      setError('Unauthorized or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/moderation/confessions/${id}/approve`);
      fetchQueue();
    } catch (e) { alert("Error approving"); }
  };

  const handleReject = async (id: number) => {
    const reason = prompt("Rejection Reason:");
    if (!reason) return;
    try {
      await api.post(`/admin/moderation/confessions/${id}/reject`, { reason });
      fetchQueue();
    } catch (e) { alert("Error rejecting"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Moderation Queue (PENDING)</h1>
        <Link to="/admin/hidden" className="text-blue-600 hover:underline">View Hidden Queue</Link>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {confessions.map(c => (
          <div key={c.id} className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
            {c.title && <h3 className="font-bold">{c.title}</h3>}
            <p className="whitespace-pre-wrap my-2">{c.content}</p>
            <div className="text-sm text-gray-600 mb-2">Category: {c.category} | Created: {new Date(c.createdAt).toLocaleString()}</div>
            {c.screeningFlags && c.screeningFlags.length > 0 && (
               <div className="text-red-500 text-sm mb-2">Flags: {c.screeningFlags.join(', ')}</div>
            )}
            <div className="space-x-2 mt-4">
              <button onClick={() => handleApprove(c.id)} className="bg-green-600 text-white px-4 py-1 rounded">Approve</button>
              <button onClick={() => handleReject(c.id)} className="bg-red-600 text-white px-4 py-1 rounded">Reject</button>
            </div>
          </div>
        ))}
        {!loading && confessions.length === 0 && <p>No pending confessions.</p>}
      </div>
    </div>
  );
}
