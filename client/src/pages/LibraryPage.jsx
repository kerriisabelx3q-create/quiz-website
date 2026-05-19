import React, { useEffect, useState } from 'react';
import api from '../api';
import { FileText, Download, Search, BookOpen } from 'lucide-react';

const FILE_ICONS = {
  PDF: '📄', DOCX: '📝', DOC: '📝',
  XLSX: '📊', XLS: '📊', PPTX: '📑', PPT: '📑', TXT: '🗒️'
};

function LibraryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Tất cả');

  useEffect(() => {
    api.get('/public/library')
      .then(res => setItems(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['Tất cả', ...new Set(items.map(i => i.category || 'Chung'))];

  const filtered = items.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'Tất cả' || item.category === filterCat;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="container" style={{ textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Kho Tài Liệu Tham Khảo</h1>
        <p>Tổng hợp các tài liệu nghiệp vụ dành cho cán bộ, nhân viên.</p>
      </div>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm tài liệu..."
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className="btn"
              style={{
                background: filterCat === cat ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: 'white',
                border: `1px solid ${filterCat === cat ? 'var(--primary)' : 'var(--surface-border)'}`,
                padding: '0.5rem 1rem'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách tài liệu */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p>Không tìm thấy tài liệu nào.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {filtered.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{FILE_ICONS[item.fileType] || '📁'}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, color: 'white', lineHeight: 1.4 }}>{item.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', marginTop: '0.25rem', display: 'inline-block' }}>
                    {item.category || 'Chung'}
                  </span>
                </div>
              </div>

              {item.description && (
                <p style={{ fontSize: '0.9rem', margin: 0 }}>{item.description}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {item.fileType} • {item.fileSize}
                </span>
                <a
                  href={`/${item.filePath}`}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', textDecoration: 'none' }}
                >
                  <Download size={16} /> Tải xuống
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LibraryPage;
