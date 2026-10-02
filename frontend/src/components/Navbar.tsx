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
    `inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
      isActive
        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] text-[var(--text-primary)] shadow-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center space-x-2.5 group focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-xl p-1 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles size={20} className="fill-white/20" />
            </div>
            <div className="flex flex-col whitespace-nowrap shrink-0">
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight leading-none group-hover:text-violet-500 transition-colors">
                NMIT Confessions
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase mt-0.5">
                Anonymous Campus Voice
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
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
                <div className="hidden xl:flex items-center space-x-1 pl-3 ml-2 border-l border-[var(--border-subtle)] shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md px-1.5 py-0.5 mr-1 whitespace-nowrap shrink-0">
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
                <div className="flex xl:hidden pl-2.5 ml-1 border-l border-[var(--border-subtle)] relative shrink-0" ref={adminDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsAdminDropdownOpen(prev => !prev)}
                    aria-expanded={isAdminDropdownOpen}
                    aria-haspopup="true"
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isAdminActive
                        ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
                    }`}
                  >
                    <ShieldAlert size={14} className="text-amber-500" />
                    <span>Admin</span>
                    <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5">
                      {user.role}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-150 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>


                  {isAdminDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-[var(--bg-surface)] shadow-xl border border-[var(--border-subtle)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      role="menu"
                    >
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/dashboard'
                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                        }`}
                        role="menuitem"
                      >
                        <LayoutDashboard size={14} className="text-violet-500" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        to="/admin/moderation"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/moderation'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                        }`}
                        role="menuitem"
                      >
                        <ShieldAlert size={14} className="text-amber-500" />
                        <span>Mod Queue</span>
                      </Link>
                      <Link
                        to="/admin/reports"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/reports'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                        }`}
                        role="menuitem"
                      >
                        <AlertTriangle size={14} className="text-rose-500" />
                        <span>Reports</span>
                      </Link>
                      <Link
                        to="/admin/hidden"
                        onClick={() => setIsAdminDropdownOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                          location.pathname === '/admin/hidden'
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]'
                        }`}
                        role="menuitem"
                      >
                        <EyeOff size={14} className="text-purple-500" />
                        <span>Hidden Confessions</span>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-3 shrink-0">
            <ThemeToggle />

            <Link
              to="/submit"
              className="inline-flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 active:scale-95 shadow-sm shadow-violet-500/25 transition-all whitespace-nowrap shrink-0"
            >
              <MessageSquarePlus size={16} />
              <span className="hidden xl:inline">Confess Anonymously</span>
              <span className="xl:hidden">Confess</span>
            </Link>

            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-colors whitespace-nowrap shrink-0"
                title="Logout admin session"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] px-2.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1 whitespace-nowrap shrink-0"
                title="Staff login"
              >
                <Shield size={13} />
                <span>Staff</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />

            <Link
              to="/submit"
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 active:scale-95"
            >
              <MessageSquarePlus size={14} className="mr-1" />
              <span>Submit</span>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-violet-500"
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
        <div className="lg:hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileNavLinkClass}>
              <span>Public Feed</span>
            </NavLink>
            <NavLink to="/daily" onClick={closeMenu} className={mobileNavLinkClass}>
              <Calendar size={16} className="text-violet-500" />
              <span>Confession of the Day</span>
            </NavLink>
            <NavLink to="/trending" onClick={closeMenu} className={mobileNavLinkClass}>
              <Flame size={16} className="text-pink-500" />
              <span>Trending Confessions</span>
            </NavLink>
            <NavLink to="/search" onClick={closeMenu} className={mobileNavLinkClass}>
              <Search size={16} className="text-sky-500" />
              <span>Search Database</span>
            </NavLink>
            <NavLink to="/archives" onClick={closeMenu} className={mobileNavLinkClass}>
              <Archive size={16} className="text-[var(--text-muted)]" />
              <span>Historical Archives</span>
            </NavLink>
          </div>

          {/* Theme switcher row on mobile */}
          <div className="pt-2 px-1 flex items-center justify-between border-t border-[var(--border-subtle)]">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Theme</span>
            <ThemeToggle variant="segmented" />
          </div>

          {/* Mobile Admin Section */}
          {user ? (
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Moderator Space
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md px-1.5 py-0.5">
                  {user.role} ({user.username})
                </span>
              </div>
              <NavLink to="/admin/dashboard" onClick={closeMenu} className={mobileNavLinkClass}>
                <LayoutDashboard size={16} className="text-violet-500" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/moderation" onClick={closeMenu} className={mobileNavLinkClass}>
                <ShieldAlert size={16} className="text-amber-500" />
                <span>Mod Queue</span>
              </NavLink>
              <NavLink to="/admin/reports" onClick={closeMenu} className={mobileNavLinkClass}>
                <AlertTriangle size={16} className="text-rose-500" />
                <span>Reports</span>
              </NavLink>
              <NavLink to="/admin/hidden" onClick={closeMenu} className={mobileNavLinkClass}>
                <EyeOff size={16} className="text-purple-500" />
                <span>Hidden Confessions</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-500/10 text-left cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sign Out ({user.username})</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <Link
                to="/admin/login"
                onClick={closeMenu}
                className="flex items-center space-x-2 px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl"
              >
                <Shield size={14} />
                <span>Staff & Moderator Portal</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
