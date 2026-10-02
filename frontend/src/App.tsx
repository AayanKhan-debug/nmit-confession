import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Login from './pages/Login';
import ModQueue from './pages/ModQueue';
import HiddenQueue from './pages/HiddenQueue';
import AdminReports from './pages/AdminReports';
import AdminDashboard from './pages/AdminDashboard';
import Archives from './pages/Archives';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Daily from './pages/Daily';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col antialiased selection:bg-violet-600 selection:text-white relative overflow-x-hidden">
            {/* Ambient Background Neon Blobs (Very subtle, blurred, non-intrusive) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
              {/* Violet blob top-left */}
              <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />
              {/* Pink blob mid-right */}
              <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-pink-600/8 blur-[130px]" />
              {/* Cyan blob bottom-left */}
              <div className="absolute -bottom-40 left-1/4 w-[32rem] h-96 rounded-full bg-cyan-600/8 blur-[140px]" />
            </div>

            {/* Sticky Navigation Header */}
            <Navbar />

            {/* Main Application Container */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-12 relative z-10">
              <Routes>
                {/* Public Student Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/archives" element={<Archives />} />
                <Route path="/search" element={<Search />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/daily" element={<Daily />} />
                <Route path="/admin/login" element={<Login />} />

                {/* Protected Staff Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/moderation"
                  element={
                    <ProtectedRoute>
                      <ModQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/hidden"
                  element={
                    <ProtectedRoute>
                      <HiddenQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute>
                      <AdminReports />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-6 mb-16 lg:mb-0 border-t border-white/10 bg-[#0B0F19]/80 backdrop-blur-md text-center text-xs text-slate-400 relative z-10">
              <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>&copy; {new Date().getFullYear()} NMIT Confessions &bull; Unofficial Campus Voice</p>
                <p className="text-slate-500">100% Anonymous &bull; Zero Logged IPs &bull; Student Moderated</p>
              </div>
            </footer>

            {/* Mobile Fixed Navigation Bar */}
            <MobileBottomNav />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
