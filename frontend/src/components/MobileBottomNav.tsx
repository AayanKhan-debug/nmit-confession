import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  MessageSquare,
  Calendar,
  Flame,
  Search,
  Archive,
  MessageSquarePlus
} from 'lucide-react';

export const MobileBottomNav = () => {

  const location = useLocation();
  const isSubmitPage = location.pathname === '/submit';
  const isAdminPage = location.pathname.startsWith('/admin');

  // Only show on mobile screens
  return (
    <aside aria-label="Mobile Navigation" className="lg:hidden">
      {/* Floating Quick Confess Action (hidden on submit & admin pages) */}
      {!isSubmitPage && !isAdminPage && (
        <div className="fixed bottom-20 right-4 z-40 animate-in fade-in zoom-in duration-200">
          <Link
            to="/submit"
            aria-label="Post an anonymous confession"
            className="flex items-center gap-2 px-4 py-3 min-h-[48px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span className="tracking-wide">Confess</span>
          </Link>
        </div>
      )}

      {/* Fixed Bottom Tab Bar */}
      <nav
        aria-label="Bottom Navigation Bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] pb-[env(safe-area-inset-bottom)] shadow-lg"
      >
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
          {/* Feed */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Feed</span>
          </NavLink>

          {/* Daily */}
          <NavLink
            to="/daily"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span>Daily</span>
          </NavLink>

          {/* Trending */}
          <NavLink
            to="/trending"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-pink-600 dark:text-pink-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <Flame className="w-5 h-5 mb-0.5" />
            <span>Trending</span>
          </NavLink>

          {/* Search */}
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <Search className="w-5 h-5 mb-0.5" />
            <span>Search</span>
          </NavLink>

          {/* Archives */}
          <NavLink
            to="/archives"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl py-1 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }`
            }
          >
            <Archive className="w-5 h-5 mb-0.5" />
            <span>Archives</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default MobileBottomNav;
