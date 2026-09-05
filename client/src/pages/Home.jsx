import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { BookOpen, Clock, AlertCircle, Download, Layers } from 'lucide-react';

function CategoryCard({ cat }) {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    api.get(`/public/documents/${cat.id}`).then(res => setDocs(res.data)).catch(console.error);
  }, [cat.id]);

  return (
    <div className="glass-panel quiz-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div 
        onClick={() => navigate(`/form/${cat.id}`)} 
        style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <BookOpen color="#4F46E5" size={24} style={{ flexShrink: 0 }} />
          <h3 style={{ margin: 0, color: 'white' }}>{cat.name}</h3>
        </div>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', flex: 1 }}>{cat.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          <Clock size={16} />
          <span>Khoảng {cat.questionLimit} câu hỏi</span>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: 'auto' }}
        onClick={() => navigate(`/form/${cat.id}`)}
      >
        Vào thi ngay
      </button>
      
      {docs.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Tài liệu tham khảo:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {docs.map(d => (
              <a 
                key={d.id} 
                href={`/${d.filePath}`} 
                target="_blank" 
                rel="noreferrer"
                download
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}
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
  const [topics, setTopics] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, topicsRes] = await Promise.all([
          api.get('/public/categories'),
          api.get('/public/topics')
        ]);
        setCategories(catsRes.data);
        setTopics(topicsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container" style={{ textAlign: 'center' }}>Đang tải...</div>;

  const currentTopic = topics.find(t => t.id.toString() === activeTab.toString());
  const displayedCategories = activeTab === 'all' 
    ? categories 
    : (currentTopic?.Categories || []);

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1>Khám Phá Các Phần Thi</h1>
        <p>Chọn chuyên đề hoặc chủ đề bên dưới để bắt đầu ôn tập, làm bài thi trắc nghiệm.</p>
      </div>

      {/* Topics Tabs */}
      {topics.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap', 
          marginBottom: '2rem' 
        }}>
          <button
            onClick={() => setActiveTab('all')}
            className="glass-panel"
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '24px',
              border: activeTab === 'all' ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
              background: activeTab === 'all' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: activeTab === 'all' ? '600' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={18} />
            <span>Tất cả ({categories.length})</span>
          </button>

          {topics.map(topic => {
            const isActive = activeTab.toString() === topic.id.toString();
            const count = topic.Categories?.length || 0;
            return (
              <button
                key={topic.id}
                onClick={() => setActiveTab(topic.id.toString())}
                className="glass-panel"
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '24px',
                  border: isActive ? `2px solid ${topic.color || 'var(--primary)'}` : '1px solid var(--surface-border)',
                  background: isActive ? (topic.color || 'var(--primary)') : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: isActive ? '600' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{topic.icon || '📚'}</span>
                <span>{topic.name}</span>
                <span style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.8,
                  background: 'rgba(0,0,0,0.2)', 
                  padding: '0.1rem 0.45rem', 
                  borderRadius: '10px' 
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Topic Description banner if a specific topic is selected */}
      {currentTopic && (
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', borderLeft: `4px solid ${currentTopic.color || 'var(--primary)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{currentTopic.icon || '📚'}</span>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>Chuyên đề: {currentTopic.name}</h3>
              {currentTopic.description && (
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {currentTopic.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {displayedCategories.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '3rem 1rem' }}>
          <AlertCircle /> Hiện tại chưa có bài thi nào trong mục này. Vui lòng chọn chuyên đề khác!
        </div>
      ) : (
        <div className="grid-cards" style={{ alignItems: 'stretch' }}>
          {displayedCategories.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      )}
    </div>
  );
}

export default Home;
