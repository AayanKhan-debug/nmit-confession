import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  MessageSquarePlus,
  Flame,
  Calendar,
  Search,
  Archive,
  ShieldAlert,
  LayoutDashboard,
  EyeOff,
  LogOut,
  Shield,
  Sparkles,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const isAdminActive = location.pathname.startsWith('/admin');

  // Close admin dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setIsAdminDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      setIsAdminDropdownOpen(false);
      navigate('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsAdminDropdownOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `min-h-[44px] inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
      isActive
        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm shadow-violet-500/20 font-bold'
        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `min-h-[44px] flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/85 backdrop-blur-md border-b border-white/10 text-slate-100 shadow-md transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo with Neon Sticker Style */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-violet-400 rounded-2xl p-1.5 shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-pink-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 group-hover:scale-105 group-hover:rotate-1 transition-transform shrink-0 border border-white/20">
              <Sparkles size={22} className="fill-white/25" />
            </div>
            <div className="flex flex-col whitespace-nowrap shrink-0">
              <span className="text-lg font-black tracking-tight leading-none text-white group-hover:text-violet-400 transition-colors font-heading">
                NMIT Confessions
              </span>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">
                Anonymous Campus Voice
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Sticker Pills) */}
          <nav className="hidden lg:flex items-center space-x-1.5" aria-label="Main Navigation">
            <NavLink to="/" end className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/daily" className={navLinkClass}>
              Daily
            </NavLink>
            <NavLink to="/trending" className={navLinkClass}>
              Trending
            </NavLink>
            <NavLink to="/search" className={navLinkClass}>
              Search
            </NavLink>
            <NavLink to="/archives" className={navLinkClass}>
              Archives
            </NavLink>

            {/* Authenticated Staff Links */}
            {user && (
              <>
                {/* Full inline admin navigation at xl (1280px+) */}
                <div className="hidden xl:flex items-center space-x-1.5 pl-3 ml-2 border-l border-white/10 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full px-2.5 py-1 mr-1 whitespace-nowrap shrink-0">
                    {user.role}
                  </span>
                  <NavLink to="/admin/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/moderation" className={navLinkClass}>
                    Mod Queue
                  </NavLink>
                  <NavLink to="/admin/reports" className={navLinkClass}>
                    Reports
                  </NavLink>
                  <NavLink to="/admin/hidden" className={navLinkClass}>
                    Hidden
                  </NavLink>
                </div>

                {/* Compact admin dropdown navigation at lg (1024px-1279px) */}
                <div className="flex xl:hidden pl-2.5 ml-1 border-l border-white/10 relative shrink-0" ref={adminDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsAdminDropdownOpen(prev => !prev)}
                    aria-expanded={isAdminDropdownOpen}
                    aria-haspopup="true"
                    className={`min-h-[44px] inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isAdminActive
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <ShieldAlert size={15} className="text-amber-400" />
                    <span>Admin</span>
                    <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5">
                      {user.role}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAdminDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#111827] shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      role="menu"
                    >
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`min-h-[44px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/dashboard'
                            ? 'bg-violet-500/20 text-violet-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <LayoutDashboard size={15} className="text-violet-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/moderation"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`min-h-[44px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/moderation'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <ShieldAlert size={15} className="text-amber-400" />
                        <span>Mod Queue</span>
                      </Link>
                      <Link
                        to="/admin/reports"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`min-h-[44px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/reports'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <AlertTriangle size={15} className="text-rose-400" />
                        <span>Reports</span>
                      </Link>
                      <Link
                        to="/admin/hidden"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`min-h-[44px] flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/hidden'
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <EyeOff size={15} className="text-purple-400" />
                        <span>Hidden Queue</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Desktop Right Actions: Theme + Floating Confess CTA */}
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            <ThemeToggle />

            {/* Floating Sticker Confess Button */}
            <Link
              to="/submit"
              className="min-h-[44px] inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 hover:from-violet-500 hover:via-pink-500 hover:to-indigo-500 active:scale-95 shadow-md shadow-violet-600/30 hover:shadow-lg hover:shadow-violet-600/40 border border-white/20 transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquarePlus size={16} />
              <span className="hidden xl:inline tracking-wide">Confess Anonymously</span>
              <span className="xl:hidden tracking-wide">Confess</span>
            </Link>

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[44px] inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Logout admin session"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="min-h-[44px] text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-full transition-colors flex items-center space-x-1.5 whitespace-nowrap shrink-0"
                title="Staff login"
              >
                <Shield size={14} className="text-violet-400" />
                <span>Staff</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger & Actions */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />

            <Link
              to="/submit"
              className="min-h-[44px] inline-flex items-center px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-pink-600 active:scale-95 shadow-sm shadow-violet-500/25 border border-white/20"
            >
              <MessageSquarePlus size={14} className="mr-1.5" />
              <span>Submit</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400 flex items-center justify-center cursor-pointer"
              aria-expanded={isOpen}
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden border-b border-white/10 bg-[#111827]/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              <span>Public Feed</span>
            </NavLink>
            <NavLink to="/daily" onClick={closeMenu} className={mobileNavLinkClass}>
              <Calendar size={16} className="text-violet-400" />
              <span>Confession of the Day</span>
            </NavLink>
            <NavLink to="/trending" onClick={closeMenu} className={mobileNavLinkClass}>
              <Flame size={16} className="text-pink-400" />
              <span>Trending Confessions</span>
            </NavLink>
            <NavLink to="/search" onClick={closeMenu} className={mobileNavLinkClass}>
              <Search size={16} className="text-cyan-400" />
              <span>Search Database</span>
            </NavLink>
            <NavLink to="/archives" onClick={closeMenu} className={mobileNavLinkClass}>
              <Archive size={16} className="text-slate-400" />
              <span>Historical Archives</span>
            </NavLink>
          </div>

          {/* Theme switcher on mobile */}
          <div className="pt-2 px-1 flex items-center justify-between border-t border-white/10">
            <span className="text-xs font-semibold text-slate-400">Theme</span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Mobile Admin Section */}
          {user ? (
            <div className="pt-3 border-t border-white/10 space-y-1">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Moderator Space
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5">
                  {user.role} ({user.username})
                </span>
              </div>
              <NavLink to="/admin/dashboard" onClick={closeMenu} className={mobileNavLinkClass}>
                <LayoutDashboard size={16} className="text-violet-400" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/moderation" onClick={closeMenu} className={mobileNavLinkClass}>
                <ShieldAlert size={16} className="text-amber-400" />
                <span>Mod Queue</span>
              </NavLink>
              <NavLink to="/admin/reports" onClick={closeMenu} className={mobileNavLinkClass}>
                <AlertTriangle size={16} className="text-rose-400" />
                <span>Reports</span>
              </NavLink>
              <NavLink to="/admin/hidden" onClick={closeMenu} className={mobileNavLinkClass}>
                <EyeOff size={16} className="text-purple-400" />
                <span>Hidden Confessions</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full min-h-[44px] flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out ({user.username})</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10">
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="min-h-[44px] flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                <Shield size={14} className="text-violet-400" />
                <span>Staff & Moderator Portal</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
