import React, { useState } from 'react';
import api from '../api';

function Contact() {
  const [formData, setFormData] = useState({ senderInfo: '', content: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/public/message', formData);
      setStatus('success');
      setFormData({ senderInfo: '', content: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Liên Hệ Admin</h2>
        {status === 'success' && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}>Gửi tin nhắn thành công!</div>}
        {status === 'error' && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>Lỗi khi gửi, vui lòng thử lại!</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Tên / Email của bạn</label>
            <input 
              type="text" 
              className="input-field" 
              value={formData.senderInfo}
              onChange={(e) => setFormData({...formData, senderInfo: e.target.value})}
              required 
            />
          </div>
          <div className="input-group">
            <label>Nội dung tin nhắn</label>
            <textarea 
              className="input-field" 
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required 
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === 'sending'}>
            {status === 'sending' ? 'Đang gửi...' : 'Gửi Tin Nhắn'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
