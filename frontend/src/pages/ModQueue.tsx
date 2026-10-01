import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { getModerationQueue } from '../api';
import type { Confession } from '../types';

export default function ModQueue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for total elements and pages
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Local state for filter form
  const [status, setStatus] = useState(searchParams.get('status') || 'PENDING');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [flag, setFlag] = useState(searchParams.get('flag') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'priority');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = 20;

  const fetchQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const pStatus = searchParams.get('status') || 'PENDING';
      const pCategory = searchParams.get('category') || undefined;
      const pFlag = searchParams.get('flag') || undefined;
      const pFrom = searchParams.get('from') || undefined;
      const pTo = searchParams.get('to') || undefined;
      const pSort = searchParams.get('sort') || 'priority';
      
      const res = await getModerationQueue(page, size, pStatus, pCategory, pFlag, pFrom, pTo, pSort);
      setConfessions(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Unauthorized or failed to load. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [searchParams]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    if (flag) params.set('flag', flag);
    if (sort) params.set('sort', sort);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', '0'); // Reset page
    setSearchParams(params);
  };

  const handleClear = () => {
    setStatus('PENDING');
    setCategory('');
    setFlag('');
    setSort('priority');
    setFrom('');
    setTo('');
    setSearchParams(new URLSearchParams({ status: 'PENDING', page: '0' }));
  };

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

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Moderation Queue</h1>
        <div className="space-x-4">
            <Link to="/admin/reports" className="text-blue-600 hover:underline">Manage Reports</Link>
            <Link to="/admin/hidden" className="text-blue-600 hover:underline">View Hidden Queue</Link>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <form onSubmit={handleApply} className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label htmlFor="status" className="block mb-1 font-semibold">Status</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="PENDING">PENDING</option>
              <option value="HIDDEN">HIDDEN</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block mb-1 font-semibold">Category</label>
            <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All</option>
              <option value="CRUSH">Crush</option>
              <option value="FUNNY">Funny</option>
              <option value="ADVICE">Advice</option>
              <option value="RANT">Rant</option>
              <option value="CAMPUS_LIFE">Campus Life</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="flag" className="block mb-1 font-semibold">Flag</label>
            <select id="flag" value={flag} onChange={e => setFlag(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All</option>
              <option value="PERSONAL_INFORMATION">Personal Info</option>
              <option value="PROFANITY">Profanity</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="SENSITIVE_CONTENT">Sensitive Content</option>
              <option value="SUSPICIOUS_LINK">Suspicious Link</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="block mb-1 font-semibold">Sort</label>
            <select id="sort" value={sort} onChange={e => setSort(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="priority">Priority (Flags/Reports First)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
          <div>
            <label htmlFor="from" className="block mb-1 font-semibold">From (Start)</label>
            <input id="from" type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label htmlFor="to" className="block mb-1 font-semibold">To (Exclusive)</label>
            <input id="to" type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="col-span-2 md:col-span-3 flex space-x-2 mt-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Apply Filters</button>
            <button type="button" onClick={handleClear} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400">Clear</button>
          </div>
        </form>
      </div>

      {loading && <div className="text-center py-4">Loading queue...</div>}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchQueue} className="bg-red-200 px-3 py-1 rounded hover:bg-red-300">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-4">
            {confessions.map(c => (
              <div key={c.id} className="bg-white p-4 rounded shadow border-l-4 border-yellow-500">
                {c.title && <h3 className="font-bold">{c.title}</h3>}
                <p className="whitespace-pre-wrap my-2">{c.content}</p>
                <div className="text-sm text-gray-600 mb-2">
                  Category: {c.category} | Created: {new Date(c.createdAt).toLocaleString()} | Reports: {c.reportCount ?? 0}
                </div>
                {c.screeningFlags && c.screeningFlags.length > 0 && (
                   <div className="text-red-500 text-sm mb-2 font-semibold">
                     Flags: {c.screeningFlags.map(f => (
                       <span key={f} title={c.flagExplanations?.[f]} className="mr-2 border-b border-dashed border-red-500 cursor-help">
                         {f}
                       </span>
                     ))}
                   </div>
                )}
                
                {status !== 'PUBLISHED' && status !== 'REJECTED' && (
                  <div className="space-x-2 mt-4 border-t pt-3">
                    {c.status === 'PENDING' && (
                      <button onClick={() => handleApprove(c.id)} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Approve</button>
                    )}
                    <button onClick={() => handleReject(c.id)} className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700">Reject</button>
                    {c.status === 'HIDDEN' && (
                      <button onClick={async () => {
                          try {
                            await api.post(`/admin/moderation/confessions/${c.id}/restore`);
                            fetchQueue();
                          } catch (e) { alert("Error restoring"); }
                        }} 
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Restore
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {confessions.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white shadow rounded">
                No confessions match the selected filters.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 0}
                className="px-4 py-2 border rounded disabled:opacity-50 bg-white">
                Previous
              </button>
              <span>Page {page + 1} of {totalPages} ({totalElements} total)</span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page >= totalPages - 1}
                className="px-4 py-2 border rounded disabled:opacity-50 bg-white">
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
