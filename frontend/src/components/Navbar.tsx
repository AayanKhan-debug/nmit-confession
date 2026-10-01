import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      navigate('/admin/login');
    } catch (e) {
      console.error(e);
    }
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white shadow-sm p-4 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-gray-800" onClick={closeMenu}>NMIT Confessions</Link>
        <button 
          className="md:hidden p-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:static top-16 left-0 right-0 bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0 space-y-4 md:space-y-0 md:space-x-4 z-50`}>
          <Link to="/" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Feed</Link>
          <Link to="/daily" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Daily</Link>
          <Link to="/trending" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Trending</Link>
          <Link to="/search" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Search</Link>
          <Link to="/archives" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Archives</Link>
          <Link to="/submit" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Submit</Link>
          <Link to="/admin/moderation" className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1" onClick={closeMenu}>Mod Queue</Link>
          <button onClick={handleLogout} className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-1 text-left">Logout</button>
        </div>
      </div>
    </nav>
  );
}
