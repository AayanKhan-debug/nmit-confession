import { useState } from 'react';
import api from '../api';

export default function Submit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('CAMPUS_LIFE');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
      await api.post('/confessions', { title: title || undefined, content, category });
      setStatus('Your confession has been submitted anonymously and is awaiting moderation.');
      setTitle('');
      setContent('');
    } catch (err: any) {
      setStatus('Error: ' + (err.response?.data?.message || 'Failed to submit'));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-6">Submit Confession</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title (Optional)</label>
          <input type="text" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block mb-1">Content (Required)</label>
          <textarea required minLength={10} maxLength={2000} value={content} onChange={e => setContent(e.target.value)} className="w-full border p-2 rounded h-32" />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded">
            <option value="CAMPUS_LIFE">Campus Life</option>
            <option value="ACADEMICS">Academics</option>
            <option value="RELATIONSHIPS">Relationships</option>
            <option value="FUNNY">Funny</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit Anonymously</button>
      </form>
      {status && <p className="mt-4 text-center font-medium">{status}</p>}
    </div>
  );
}
