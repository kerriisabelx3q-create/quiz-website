import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

function QuizForm() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/public/config');
        setConfig(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage to pass to Quiz
    localStorage.setItem('quizUserInfo', JSON.stringify(formData));
    navigate(`/quiz/${categoryId}`);
  };

  if (loading) return <div className="container" style={{textAlign: 'center'}}>Đang tải cấu hình...</div>;

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Thông Tin Bắt Buộc</h2>
        <form onSubmit={handleSubmit}>
          {config?.formFields?.map((field, idx) => (
            <div key={idx} className="input-group">
              <label>{field.label} {field.required && <span style={{color: 'var(--danger)'}}>*</span>}</label>
              <input
                type={field.type}
                name={field.name}
                className="input-field"
                required={field.required}
                onChange={handleChange}
                placeholder={`Nhập ${field.label.toLowerCase()}...`}
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Bắt đầu làm bài</button>
        </form>
      </div>
    </div>
  );
}

export default QuizForm;
