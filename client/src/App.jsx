import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import QuizForm from './pages/QuizForm';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Contact from './pages/Contact';
import LibraryPage from './pages/LibraryPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { BrainCircuit, Menu, X } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
        <BrainCircuit size={28} color="#4F46E5" style={{ flexShrink: 0 }} />
        <span className="brand-text">Bổ sung, ôn tập kiến thức nghiệp vụ</span>
      </Link>
      
      <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
        {mobileMenuOpen ? <X size={28} color="white" /> : <Menu size={28} color="white" />}
      </button>

      <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
        <Link to="/library" onClick={() => setMobileMenuOpen(false)}>Kho tài liệu</Link>
        <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Liên hệ</Link>
        <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ flex: 1, padding: '2rem 0' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/form/:categoryId" element={<QuizForm />} />
          <Route path="/quiz/:categoryId" element={<Quiz />} />
          <Route path="/result" element={<Result />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/library" element={<LibraryPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
