import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Book, FileQuestion, Settings, List, Mail, LogOut, Trash2, FileText, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('categories');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  return (
    <div className="admin-layout animate-fade-in">
      <div className="admin-sidebar glass-panel" style={{ margin: '0 0 0 1rem', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
        <h3 style={{ padding: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)' }}>Admin Panel</h3>
        <button className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Book size={20} /> Quản lý Phần thi</button>
        <button className={`admin-nav-item ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><FileQuestion size={20} /> Quản lý Câu hỏi</button>
        <button className={`admin-nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><FileText size={20} /> Tài liệu Tham khảo</button>
        <button className={`admin-nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Settings size={20} /> Cấu hình Form</button>
        <button className={`admin-nav-item ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><List size={20} /> Kết quả Thi</button>
        <button className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Mail size={20} /> Hộp thư</button>
        <div style={{ flex: 1 }}></div>
        <button className="admin-nav-item" onClick={handleLogout} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)', fontFamily: 'Inter' }}><LogOut size={20} /> Đăng xuất</button>
      </div>
      <div className="admin-content glass-panel" style={{ margin: '0 1rem 0 0', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}>
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'questions' && <QuestionsManager />}
        {activeTab === 'documents' && <DocumentsManager />}
        {activeTab === 'config' && <ConfigManager />}
        {activeTab === 'submissions' && <SubmissionsViewer />}
        {activeTab === 'messages' && <MessagesViewer />}
      </div>
    </div>
  );
}

// --- Tab Components ---

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', questionLimit: 20 });

  useEffect(() => { fetchCats(); }, []);
  const fetchCats = async () => { const res = await api.get('/categories'); setCategories(res.data); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/categories', form);
    setForm({ name: '', description: '', questionLimit: 20 });
    fetchCats();
  };
  const handleDelete = async (id) => {
    if(window.confirm('Xóa phần thi sẽ xóa tất cả câu hỏi thuộc phần này!')) {
      await api.delete(`/categories/${id}`);
      fetchCats();
    }
  };

  return (
    <div>
      <h2>Quản lý Phần thi</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 100px auto', marginBottom: '2rem', alignItems: 'end' }}>
        <div className="input-group" style={{ marginBottom: 0 }}><label>Tên</label><input className="input-field" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /></div>
        <div className="input-group" style={{ marginBottom: 0 }}><label>Mô tả</label><input className="input-field" required value={form.description} onChange={e=>setForm({...form, description: e.target.value})} /></div>
        <div className="input-group" style={{ marginBottom: 0 }}><label>Số câu</label><input type="number" className="input-field" required value={form.questionLimit} onChange={e=>setForm({...form, questionLimit: Number(e.target.value)})} /></div>
        <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Thêm</button>
      </form>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Tên</th><th>Mô tả</th><th>Giới hạn câu hỏi</th><th>Hành động</th></tr></thead>
          <tbody>
            {categories.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.description}</td><td>{c.questionLimit}</td><td><button onClick={()=>handleDelete(c.id)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}><Trash2 size={18}/></button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QuestionsManager() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [questions, setQuestions] = useState([]);
  const [bulkText, setBulkText] = useState('');
  const [form, setForm] = useState({ content: '', options: [{label:'A',text:''}, {label:'B',text:''}, {label:'C',text:''}, {label:'D',text:''}], correctAnswer: 'A' });

  useEffect(() => { 
    api.get('/categories').then(res => { setCategories(res.data); if(res.data.length) setSelectedCat(res.data[0].id); });
  }, []);
  useEffect(() => { if(selectedCat) fetchQuestions(); }, [selectedCat]);

  const fetchQuestions = async () => { const res = await api.get(`/questions/${selectedCat}`); setQuestions(res.data); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/questions', { ...form, categoryId: selectedCat });
    setForm({ ...form, content: '', options: [{label:'A',text:''}, {label:'B',text:''}, {label:'C',text:''}, {label:'D',text:''}] });
    fetchQuestions();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const parsedQuestions = [];
        // Skip header row if exists
        const startIndex = (data[0] && String(data[0][0]).toLowerCase().includes('câu hỏi')) ? 1 : 0;
        
        for (let i = startIndex; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length < 6) continue;
          
          parsedQuestions.push({
            content: String(row[0]),
            options: [
              { label: 'A', text: String(row[1]) },
              { label: 'B', text: String(row[2]) },
              { label: 'C', text: String(row[3]) },
              { label: 'D', text: String(row[4]) }
            ],
            correctAnswer: String(row[5]).trim().toUpperCase()
          });
        }

        if (parsedQuestions.length > 0) {
          await api.post('/questions/bulk', { categoryId: selectedCat, questions: parsedQuestions });
          alert(`Đã nạp thành công ${parsedQuestions.length} câu hỏi từ Excel!`);
          fetchQuestions();
        } else {
          alert('Không tìm thấy câu hỏi hợp lệ trong file Excel. Vui lòng kiểm tra lại cấu trúc cột!');
        }
      } catch (err) {
        console.error(err);
        alert('Lỗi khi đọc file Excel!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // reset input
  };

  const handleDelete = async (id) => { await api.delete(`/questions/${id}`); fetchQuestions(); };

  return (
    <div>
      <h2>Quản lý Câu hỏi</h2>
      <div className="input-group"><label>Chọn Phần thi</label><select className="input-field" value={selectedCat} onChange={e=>setSelectedCat(e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {selectedCat && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            {/* Nhập đơn */}
            <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{fontSize:'1.1rem'}}>Thêm từng câu</h3>
              <div className="input-group"><label>Nội dung câu hỏi</label><textarea required className="input-field" value={form.content} onChange={e=>setForm({...form, content: e.target.value})} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {form.options.map((opt, i) => (
                  <div key={opt.label} className="input-group" style={{ marginBottom: 0 }}>
                    <label>Đáp án {opt.label}</label>
                    <input required className="input-field" value={opt.text} onChange={e=>{
                      const newOpts = [...form.options]; newOpts[i].text = e.target.value; setForm({...form, options: newOpts});
                    }} />
                  </div>
                ))}
              </div>
              <div className="input-group" style={{ marginTop: '1rem' }}><label>Đáp án đúng</label><select className="input-field" value={form.correctAnswer} onChange={e=>setForm({...form, correctAnswer: e.target.value})}>
                {['A','B','C','D'].map(l => <option key={l} value={l}>{l}</option>)}
              </select></div>
              <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Thêm câu hỏi</button>
            </form>

            {/* Nhập hàng loạt từ Excel */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{fontSize:'1.1rem'}}>Nạp hàng loạt từ Excel</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1rem'}}>
                File Excel cần có cấu trúc 6 cột (theo thứ tự):<br/>
                <b>Cột 1:</b> Nội dung câu hỏi<br/>
                <b>Cột 2, 3, 4, 5:</b> Nội dung đáp án A, B, C, D<br/>
                <b>Cột 6:</b> Đáp án đúng (ghi chữ A, B, C hoặc D)<br/>
                <i>(Hệ thống tự động bỏ qua dòng 1 nếu đó là dòng tiêu đề cột)</i>
              </p>
              <div className="input-group">
                <input type="file" accept=".xlsx, .xls" className="input-field" onChange={handleFileUpload} />
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead><tr><th>Câu hỏi</th><th>Đáp án đúng</th><th>Hành động</th></tr></thead>
              <tbody>
                {questions.map(q => <tr key={q.id}><td>{q.content}</td><td>{q.correctAnswer}</td><td><button onClick={()=>handleDelete(q.id)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}><Trash2 size={18}/></button></td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function DocumentsManager() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { 
    api.get('/categories').then(res => { setCategories(res.data); if(res.data.length) setSelectedCat(res.data[0].id); });
  }, []);
  useEffect(() => { if(selectedCat) fetchDocs(); }, [selectedCat]);

  const fetchDocs = async () => { const res = await api.get(`/public/documents/${selectedCat}`); setDocs(res.data); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('categoryId', selectedCat);
    formData.append('title', title);
    formData.append('file', file);
    try {
      await api.post('/documents', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setTitle(''); setFile(null);
      fetchDocs();
    } catch(err) { alert('Lỗi tải lên!'); }
    setUploading(false);
  };
  const handleDelete = async (id) => { await api.delete(`/documents/${id}`); fetchDocs(); };

  return (
    <div>
      <h2>Tài liệu Tham khảo</h2>
      <div className="input-group"><label>Chọn Phần thi</label><select className="input-field" value={selectedCat} onChange={e=>setSelectedCat(e.target.value)}>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {selectedCat && (
        <>
          <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}><label>Tên tài liệu</label><input required className="input-field" value={title} onChange={e=>setTitle(e.target.value)} /></div>
            <div className="input-group" style={{ marginBottom: 0 }}><label>File (.pdf, .docx, vv...)</label><input type="file" required className="input-field" onChange={e=>setFile(e.target.files[0])} /></div>
            <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? 'Đang tải...' : <><Upload size={18}/> Tải lên</>}</button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Tên tài liệu</th><th>Tên File</th><th>Hành động</th></tr></thead>
              <tbody>
                {docs.map(d => <tr key={d.id}><td>{d.title}</td><td>{d.filePath.split('-').pop()}</td><td><button onClick={()=>handleDelete(d.id)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}><Trash2 size={18}/></button></td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function ConfigManager() {
  const [fields, setFields] = useState([]);
  
  useEffect(() => { api.get('/config').then(res => setFields(res.data.formFields || [])); }, []);

  const handleSave = async () => { await api.put('/config', { formFields: fields }); alert('Lưu cấu hình thành công!'); };
  const addField = () => setFields([...fields, { name: '', label: '', type: 'text', required: true }]);
  const updateField = (index, key, value) => { const newFields = [...fields]; newFields[index][key] = value; setFields(newFields); };
  const removeField = (index) => { const newFields = [...fields]; newFields.splice(index, 1); setFields(newFields); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Cấu hình Form Người dùng</h2>
        <div>
          <button className="btn" onClick={addField} style={{ marginRight: '1rem', background: 'var(--surface-border)', color: 'white' }}>+ Thêm trường</button>
          <button className="btn btn-success" onClick={handleSave}>Lưu Cấu hình</button>
        </div>
      </div>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          <input placeholder="Key (VD: fullName)" className="input-field" value={f.name} onChange={e=>updateField(i, 'name', e.target.value)} />
          <input placeholder="Label (VD: Họ và Tên)" className="input-field" value={f.label} onChange={e=>updateField(i, 'label', e.target.value)} />
          <select className="input-field" value={f.type} onChange={e=>updateField(i, 'type', e.target.value)}><option value="text">Text</option><option value="number">Number</option><option value="email">Email</option></select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><input type="checkbox" checked={f.required} onChange={e=>updateField(i, 'required', e.target.checked)} /> Bắt buộc</label>
          <button onClick={()=>removeField(i)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}><Trash2 size={20}/></button>
        </div>
      ))}
    </div>
  );
}

function SubmissionsViewer() {
  const [subs, setSubs] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { api.get('/submissions').then(res => setSubs(res.data)); }, []);

  const filteredSubs = subs.filter(s => {
    let matchCat = true;
    let matchDate = true;
    if (filterCat) matchCat = s.categoryId?.name?.toLowerCase().includes(filterCat.toLowerCase());
    if (filterDate) {
      const subDate = new Date(s.submittedAt);
      const tzOffset = subDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(subDate - tzOffset)).toISOString().split('T')[0];
      matchDate = localISOTime === filterDate;
    }
    return matchCat && matchDate;
  });

  return (
    <div>
      <h2>Kết quả Thi</h2>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Lọc theo tên phần thi..." 
          className="input-field" 
          value={filterCat} 
          onChange={e => setFilterCat(e.target.value)} 
          style={{ flex: 1, minWidth: '200px' }}
        />
        <input 
          type="date" 
          className="input-field" 
          value={filterDate} 
          onChange={e => setFilterDate(e.target.value)} 
        />
        {(filterCat || filterDate) && (
          <button className="btn btn-danger" onClick={() => { setFilterCat(''); setFilterDate(''); }}>Xóa bộ lọc</button>
        )}
      </div>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Thời gian</th><th>Phần thi</th><th>Thông tin</th><th>Điểm số</th></tr></thead>
          <tbody>
            {filteredSubs.length > 0 ? filteredSubs.map(s => (
              <tr key={s.id}>
                <td>{new Date(s.submittedAt).toLocaleString('vi-VN')}</td>
                <td>{s.categoryId?.name}</td>
                <td>{Object.entries(s.userInfo || {}).map(([k,v]) => <div key={k}><b>{k}:</b> {v}</div>)}</td>
                <td><strong style={{color: 'var(--primary)'}}>{s.score} / {s.totalQuestions}</strong></td>
              </tr>
            )) : <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>Không tìm thấy kết quả nào</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MessagesViewer() {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { fetchMsgs(); }, []);
  const fetchMsgs = async () => { const res = await api.get('/messages'); setMsgs(res.data); };
  const handleDelete = async (id) => { await api.delete(`/messages/${id}`); fetchMsgs(); };
  return (
    <div>
      <h2>Hộp thư</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {msgs.map(m => (
          <div key={m.id} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div><strong>Từ:</strong> {m.senderInfo}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{new Date(m.createdAt).toLocaleString('vi-VN')}</div>
            </div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
            <button onClick={()=>handleDelete(m.id)} className="btn btn-danger" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Xóa tin</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
