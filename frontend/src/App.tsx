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
          <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col antialiased selection:bg-violet-500 selection:text-white transition-colors duration-200">
            <Navbar />
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-8">
              <Routes>
                {/* Public Routes */}
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
            <footer className="mt-auto py-6 mb-16 lg:mb-0 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center text-xs text-[var(--text-secondary)]">
              <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>&copy; {new Date().getFullYear()} NMIT Confessions &bull; Unofficial Student Voice</p>
                <p className="text-[var(--text-muted)]">Strictly anonymous &bull; Community moderated</p>
              </div>
            </footer>
            <MobileBottomNav />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
