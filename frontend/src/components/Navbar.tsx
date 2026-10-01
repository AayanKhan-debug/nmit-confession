import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800">NMIT Confessions</Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900">Feed</Link>
          <Link to="/submit" className="text-gray-600 hover:text-gray-900">Submit</Link>
          <Link to="/admin/moderation" className="text-gray-600 hover:text-gray-900">Mod Queue</Link>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800">Logout</button>
        </div>
      </div>
    </nav>
  );
}
