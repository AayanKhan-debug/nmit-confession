import { useEffect, useState } from 'react';
import api from '../api';
import type { Confession, PageResponse } from '../types';
import { Link } from 'react-router-dom';

export default function HiddenQueue() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = async () => {
    try {
      const res = await api.get<PageResponse<Confession>>('/admin/moderation/hidden?page=0&size=20');
      setConfessions(res.data.content);
    } catch (err: any) {
      setError('Unauthorized or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleRestore = async (id: number) => {
    try {
      await api.post(`/admin/moderation/confessions/${id}/restore`);
      fetchQueue();
    } catch (e) { alert("Error restoring"); }
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
        <h1 className="text-2xl font-bold">Hidden Queue (Reported)</h1>
        <Link to="/admin/moderation" className="text-blue-600 hover:underline">Back to Mod Queue</Link>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="space-y-4">
        {confessions.map(c => (
          <div key={c.id} className="bg-white p-4 rounded shadow border-l-4 border-red-500">
            {c.title && <h3 className="font-bold">{c.title}</h3>}
            <p className="whitespace-pre-wrap my-2">{c.content}</p>
            <div className="text-sm text-gray-600 mb-2">Category: {c.category} | Created: {new Date(c.createdAt).toLocaleString()}</div>
            <div className="space-x-2 mt-4">
              <button onClick={() => handleRestore(c.id)} className="bg-blue-600 text-white px-4 py-1 rounded">Restore (Publish)</button>
              <button onClick={() => handleReject(c.id)} className="bg-red-600 text-white px-4 py-1 rounded">Reject Permanently</button>
            </div>
          </div>
        ))}
        {!loading && confessions.length === 0 && <p>No hidden confessions.</p>}
      </div>
    </div>
  );
}
