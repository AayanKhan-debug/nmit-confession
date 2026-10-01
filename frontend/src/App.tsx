import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Login from './pages/Login';
import ModQueue from './pages/ModQueue';
import HiddenQueue from './pages/HiddenQueue';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/moderation" element={<ModQueue />} />
          <Route path="/admin/hidden" element={<HiddenQueue />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
