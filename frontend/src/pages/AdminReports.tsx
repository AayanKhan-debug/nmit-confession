import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAdminReports, resolveAdminReport } from '../api';
import type { AdminReport } from '../types';

export default function AdminReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState(searchParams.get('status') || 'PENDING');
  const [reason, setReason] = useState(searchParams.get('reason') || '');
  const [confessionStatus, setConfessionStatus] = useState(searchParams.get('confessionStatus') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');
  
  const page = parseInt(searchParams.get('page') || '0', 10);
  const size = 20;

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const pStatus = searchParams.get('status') || 'PENDING';
      const pReason = searchParams.get('reason') || undefined;
      const pConfStatus = searchParams.get('confessionStatus') || undefined;
      const pFrom = searchParams.get('from') || undefined;
      const pTo = searchParams.get('to') || undefined;
      const pSort = searchParams.get('sort') || 'newest';
      
      const res = await getAdminReports(page, size, pStatus, pReason, pConfStatus, pFrom, pTo, pSort);
      setReports(res.data.content);
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
    fetchReports();
  }, [searchParams]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (reason) params.set('reason', reason);
    if (confessionStatus) params.set('confessionStatus', confessionStatus);
    if (sort) params.set('sort', sort);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', '0');
    setSearchParams(params);
  };

  const handleClear = () => {
    setStatus('PENDING');
    setReason('');
    setConfessionStatus('');
    setSort('newest');
    setFrom('');
    setTo('');
    setSearchParams(new URLSearchParams({ status: 'PENDING', page: '0' }));
  };

  const handleResolve = async (id: number) => {
    try {
      await resolveAdminReport(id);
      fetchReports();
    } catch (e: any) { 
        alert(e.response?.data?.message || "Error resolving report"); 
    }
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
        <h1 className="text-2xl font-bold">Report Management</h1>
        <Link to="/admin/moderation" className="text-blue-600 hover:underline">Back to Mod Queue</Link>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <form onSubmit={handleApply} className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <label htmlFor="status" className="block mb-1 font-semibold">Report Status</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </div>
          <div>
            <label htmlFor="reason" className="block mb-1 font-semibold">Report Reason</label>
            <select id="reason" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All</option>
              <option value="SPAM">Spam</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="INAPPROPRIATE">Inappropriate</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="confessionStatus" className="block mb-1 font-semibold">Confession Status</label>
            <select id="confessionStatus" value={confessionStatus} onChange={e => setConfessionStatus(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="HIDDEN">HIDDEN</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort" className="block mb-1 font-semibold">Sort</label>
            <select id="sort" value={sort} onChange={e => setSort(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="reason">By Reason</option>
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

      {loading && <div className="text-center py-4">Loading reports...</div>}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchReports} className="bg-red-200 px-3 py-1 rounded hover:bg-red-300">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className="bg-white p-4 rounded shadow border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-red-600">Report: {r.reason} ({r.status})</h3>
                  <div className="text-xs text-gray-500">
                    Reported: {new Date(r.createdAt).toLocaleString()}
                    {r.resolvedAt && <span> | Resolved: {new Date(r.resolvedAt).toLocaleString()}</span>}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                  <div className="font-semibold mb-1">
                    Confession #{r.confessionId} - {r.confessionStatus} - {r.confessionCategory}
                  </div>
                  {r.confessionTitle && <div className="font-medium">{r.confessionTitle}</div>}
                  <p className="whitespace-pre-wrap mt-1">{r.confessionContent}</p>
                </div>
                
                {r.status === 'PENDING' && (
                  <div className="space-x-2 mt-2 border-t pt-2">
                    <button onClick={() => handleResolve(r.id)} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Resolve</button>
                  </div>
                )}
              </div>
            ))}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white shadow rounded">
                No reports match the selected filters.
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
