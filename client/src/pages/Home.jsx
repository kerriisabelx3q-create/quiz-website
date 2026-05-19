import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, Clock, AlertCircle, Download } from 'lucide-react';

function CategoryCard({ cat }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.get(`/public/documents/${cat.id}`).then(res => setDocs(res.data)).catch(console.error);
  }, [cat.id]);

  return (
    <div className="glass-panel quiz-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div onClick={() => navigate(`/form/${cat.id}`)} style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <BookOpen color="#4F46E5" size={24} />
          <h3 style={{ margin: 0, color: 'white' }}>{cat.name}</h3>
        </div>
        <p style={{ marginBottom: '1rem' }}>{cat.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <Clock size={16} />
          <span>Khoảng {cat.questionLimit} câu hỏi</span>
        </div>
      </div>
      
      {docs.length > 0 && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tài liệu tham khảo:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {docs.map(d => (
              <a 
                key={d.id} 
                href={`/${d.filePath}`} 
                target="_blank" 
                rel="noreferrer"
                download
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--primary)', textDecoration: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Download size={14} /> {d.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/public/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="container" style={{textAlign: 'center'}}>Đang tải...</div>;

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Khám Phá Các Phần Thi</h1>
        <p>Chọn một chủ đề bên dưới để bắt đầu bài thi trắc nghiệm của bạn.</p>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <AlertCircle /> Hiện tại chưa có bài thi nào. Vui lòng quay lại sau!
        </div>
      ) : (
        <div className="grid-cards">
          {categories.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      )}
    </div>
  );
}

export default Home;
