import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  const handleSetup = async () => {
    try {
      await api.post('/admin/setup', { username, password });
      alert('Tạo admin thành công, vui lòng đăng nhập');
    } catch (err) {
      alert('Không thể tạo (Có thể admin đã tồn tại)');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Đăng Nhập</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input type="text" className="input-field" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>Đăng Nhập</button>
          <button type="button" className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid var(--surface-border)', color: 'white' }} onClick={handleSetup}>Tạo tài khoản đầu tiên</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
