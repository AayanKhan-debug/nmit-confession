import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/login', { username, password });
      navigate('/admin/moderation');
    } catch (err: any) {
      setError('Invalid credentials or unauthorized');
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-8 rounded shadow mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input id="username" type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input id="password" type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">Login</button>
      </form>
      {error && (
        <div role="alert" className="mt-4 p-3 bg-red-100 text-red-800 rounded text-center text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
