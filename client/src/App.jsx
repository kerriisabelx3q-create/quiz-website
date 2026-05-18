import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import QuizForm from './pages/QuizForm';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { BrainCircuit } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <BrainCircuit size={28} color="#4F46E5" />
        <span>Bổ sung, ôn tập kiến thức nghiệp vụ</span>
      </Link>
      <div className="nav-links">
        <Link to="/">Trang chủ</Link>
        <Link to="/contact">Liên hệ</Link>
        <Link to="/admin">Admin</Link>
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
