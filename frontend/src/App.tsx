import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/moderation" element={<ModQueue />} />
          <Route path="/admin/hidden" element={<HiddenQueue />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
