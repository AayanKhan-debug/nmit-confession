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
          <label htmlFor="title" className="block mb-1 font-medium">Title (Optional)</label>
          <input id="title" type="text" maxLength={120} value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" aria-describedby="title-counter" />
          <div id="title-counter" className="text-right text-xs text-gray-500" aria-live="polite">{120 - title.length} characters remaining</div>
        </div>
        <div>
          <label htmlFor="content" className="block mb-1 font-medium">Content (Required)</label>
          <textarea id="content" required minLength={10} maxLength={2000} value={content} onChange={e => setContent(e.target.value)} className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none" aria-describedby="content-counter" />
          <div id="content-counter" className="text-right text-xs text-gray-500" aria-live="polite">{2000 - content.length} characters remaining</div>
        </div>
        <div>
          <label htmlFor="category" className="block mb-1 font-medium">Category</label>
          <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="CAMPUS_LIFE">Campus Life</option>
            <option value="ACADEMICS">Academics</option>
            <option value="RELATIONSHIPS">Relationships</option>
            <option value="FUNNY">Funny</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <button type="submit" disabled={status === 'Submitting...'} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50">
          {status === 'Submitting...' ? 'Submitting...' : 'Submit Anonymously'}
        </button>
      </form>
      {status && status !== 'Submitting...' && (
        <div role="alert" className={`mt-4 p-3 text-center font-medium rounded ${status.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {status}
        </div>
      )}
    </div>
  );
}
