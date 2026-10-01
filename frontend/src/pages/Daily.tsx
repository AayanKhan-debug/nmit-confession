import { useState, useEffect } from 'react';
import { getDailyConfession } from '../api';
import type { Confession } from '../types';

export default function Daily() {
  const [confession, setConfession] = useState<Confession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    executeLoad();
  }, []);

  const executeLoad = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await getDailyConfession();
      setConfession(res.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setConfession(null); // Empty state
      } else {
        setError('Failed to fetch the Confession of the Day.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalReactions = (c: Confession) => {
    const r = c.reactions || {};
    return (r.LOVE || 0) + (r.FUNNY || 0) + (r.SAD || 0) + (r.FIRE || 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Confession of the Day</h1>
      <p className="text-gray-600 mb-8">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading today's confession...</div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={executeLoad} className="px-4 py-2 bg-red-200 hover:bg-red-300 rounded text-red-900 text-sm font-medium">Retry</button>
          </div>
        ) : !confession ? (
          <div className="bg-white p-8 rounded shadow text-center text-gray-500">
            No Confession of the Day is available today.
          </div>
        ) : (
          <div className="bg-white p-8 rounded shadow border">
            {confession.title && <h2 className="text-2xl font-semibold mb-4">{confession.title}</h2>}
            <p className="text-gray-800 whitespace-pre-wrap mb-6 text-lg">{confession.content}</p>
            <div className="text-sm text-gray-500 flex justify-between border-t pt-4">
              <span>Category: {confession.category}</span>
              <span>{calculateTotalReactions(confession)} reactions</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

