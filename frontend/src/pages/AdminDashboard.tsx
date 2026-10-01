import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../api';
import type { AdminDashboardResponse } from '../types';

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button onClick={fetchDashboard} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
        <button 
          onClick={fetchDashboard} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
          <h2 className="text-gray-500 font-medium">Pending Confessions</h2>
          <p className="text-4xl font-bold mt-2">{data.pendingConfessions}</p>
          <Link to="/admin/moderation" className="text-blue-600 hover:underline mt-4 block text-sm">Review Queue &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
          <h2 className="text-gray-500 font-medium">Flagged Pending</h2>
          <p className="text-4xl font-bold mt-2">{data.flaggedPendingConfessions}</p>
          <Link to="/admin/moderation?status=PENDING" className="text-blue-600 hover:underline mt-4 block text-sm">View Flagged &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-orange-500">
          <h2 className="text-gray-500 font-medium">Pending Reports</h2>
          <p className="text-4xl font-bold mt-2">{data.pendingReports}</p>
          <Link to="/admin/reports" className="text-blue-600 hover:underline mt-4 block text-sm">Manage Reports &rarr;</Link>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-gray-500">
          <h2 className="text-gray-500 font-medium">Hidden Confessions</h2>
          <p className="text-4xl font-bold mt-2">{data.hiddenConfessions}</p>
          <Link to="/admin/hidden" className="text-blue-600 hover:underline mt-4 block text-sm">View Hidden &rarr;</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Recent Activity</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent moderation activity.</p>
            ) : (
              <ul className="divide-y">
                {data.recentActivity.map((act, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-gray-800">{act.action}</span>
                      <span className="text-sm text-gray-500 ml-2">on {act.targetType} #{act.targetId}</span>
                      {act.username && <span className="text-sm text-gray-500 ml-2">by {act.username}</span>}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
        
        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">State Overview</h2>
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Published</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{data.publishedConfessions}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-yellow-700 font-medium">Pending</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">{data.pendingConfessions}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Hidden</span>
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">{data.hiddenConfessions}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-red-700 font-medium">Rejected</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold">{data.rejectedConfessions}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Pending Flags</h2>
            {Object.keys(data.flagCounts).length === 0 ? (
              <p className="text-gray-500">No flagged pending confessions.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(data.flagCounts).map(([flag, count]) => (
                  <li key={flag} className="flex justify-between text-sm">
                    <span className="font-medium">{flag}</span>
                    <span className="text-red-600 font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Pending Categories</h2>
            {Object.keys(data.categoryCounts).length === 0 ? (
              <p className="text-gray-500">No pending confessions.</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(data.categoryCounts).map(([cat, count]) => (
                  <li key={cat} className="flex justify-between text-sm">
                    <span className="text-gray-700">{cat}</span>
                    <span className="font-bold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
