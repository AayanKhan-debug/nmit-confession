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
        <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border p-2 rounded" />
        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900">Login</button>
      </form>
      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
    </div>
  );
}
