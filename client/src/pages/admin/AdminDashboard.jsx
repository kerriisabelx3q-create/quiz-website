import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Book, FileQuestion, Settings, List, Mail, LogOut, Trash2, FileText, Upload, Pencil, X, Key, Layers, Image, CheckSquare, Square, Palette } from 'lucide-react';
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
        <button className={`admin-nav-item ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Layers size={20} /> Quản lý Chuyên đề</button>
        <button className={`admin-nav-item ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><FileQuestion size={20} /> Quản lý Câu hỏi</button>
        <button className={`admin-nav-item ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><FileText size={20} /> Tài liệu Tham khảo</button>
        <button className={`admin-nav-item ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Book size={20} /> Kho Tài liệu</button>
        <button className={`admin-nav-item ${activeTab === 'config' ? 'active' : ''}`} onClick={() => setActiveTab('config')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Settings size={20} /> Cấu hình Form</button>
        <button className={`admin-nav-item ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><List size={20} /> Kết quả Thi</button>
        <button className={`admin-nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Mail size={20} /> Hộp thư</button>
        <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Palette size={20} /> Cài đặt & Icon</button>
        <button className={`admin-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'Inter' }}><Key size={20} /> Đổi mật khẩu</button>
        <div style={{ flex: 1 }}></div>
        <button className="admin-nav-item" onClick={handleLogout} style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)', fontFamily: 'Inter' }}><LogOut size={20} /> Đăng xuất</button>
      </div>
      <div className="admin-content glass-panel" style={{ margin: '0 1rem 0 0', borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 'none' }}>
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'topics' && <TopicsManager />}
        {activeTab === 'questions' && <QuestionsManager />}
        {activeTab === 'documents' && <DocumentsManager />}
        {activeTab === 'library' && <LibraryManager />}
        {activeTab === 'config' && <ConfigManager />}
        {activeTab === 'submissions' && <SubmissionsViewer />}
        {activeTab === 'messages' && <MessagesViewer />}
        {activeTab === 'settings' && <SettingsManager />}
        {activeTab === 'account' && <AccountManager />}
      </div>
    </div>
  );
}

// --- Tab Components ---

function AccountManager() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp!');
      return;
    }
    try {
      await api.put('/admin/password', { newPassword });
      setMessage('Đổi mật khẩu thành công!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage('Đã xảy ra lỗi.');
    }
  };

  return (
    <div>
      <h2>Đổi Mật Khẩu Admin</h2>
      <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Mật khẩu mới</label>
          <input type="password" required className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" required className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        {message && <p style={{ color: message.includes('thành công') ? 'var(--success)' : 'var(--danger)' }}>{message}</p>}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Lưu thay đổi</button>
      </form>
    </div>
  );
}

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', questionLimit: 20 });
  const [editingCat, setEditingCat] = useState(null); // null = not editing

  useEffect(() => { fetchCats(); }, []);
  const fetchCats = async () => { const res = await api.get('/categories'); setCategories(res.data); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/categories', form);
    setForm({ name: '', description: '', questionLimit: 20 });
    fetchCats();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/categories/${editingCat.id}`, editingCat);
    setEditingCat(null);
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
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>{c.questionLimit}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setEditingCat({ ...c })} style={{background:'none', border:'none', color:'var(--primary)', cursor:'pointer'}}><Pencil size={18}/></button>
                  <button onClick={()=>handleDelete(c.id)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '500px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Sửa phần thi</h3>
              <button onClick={() => setEditingCat(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="input-group"><label>Tên phần thi</label><input className="input-field" required value={editingCat.name} onChange={e => setEditingCat({...editingCat, name: e.target.value})} /></div>
              <div className="input-group"><label>Mô tả</label><input className="input-field" required value={editingCat.description} onChange={e => setEditingCat({...editingCat, description: e.target.value})} /></div>
              <div className="input-group"><label>Số câu hỏi tối đa</label><input type="number" className="input-field" required value={editingCat.questionLimit} onChange={e => setEditingCat({...editingCat, questionLimit: Number(e.target.value)})} /></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--surface-border)', color: 'white' }} onClick={() => setEditingCat(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  const [selected, setSelected] = useState(new Set());

  const fetchSubs = () => api.get('/submissions').then(res => setSubs(res.data));
  useEffect(() => { fetchSubs(); }, []);

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

  const toggleSelect = (id) => {
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredSubs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredSubs.map(s => s.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`Xác nhận xóa ${selected.size} kết quả thi đã chọn?`)) return;
    await Promise.all([...selected].map(id => api.delete(`/submissions/${id}`)));
    setSelected(new Set());
    fetchSubs();
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Xác nhận XÓA TOÀN BỘ kết quả thi? Hành động này không thể hoàn tác!')) return;
    await api.delete('/submissions');
    setSelected(new Set());
    fetchSubs();
  };

  const handleExportExcel = () => {
    if (filteredSubs.length === 0) return alert('Không có dữ liệu để xuất!');
    const rows = filteredSubs.map((s, i) => {
      const userInfoFlat = Object.entries(s.userInfo || {}).reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, {});
      return {
        'STT': i + 1,
        'Thời gian': new Date(s.submittedAt).toLocaleString('vi-VN'),
        'Phần thi': s.categoryId?.name || '',
        ...userInfoFlat,
        'Điểm số': s.score,
        'Tổng câu': s.totalQuestions,
        'Tỷ lệ %': s.totalQuestions > 0 ? ((s.score / s.totalQuestions) * 100).toFixed(1) + '%' : '0%'
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ket qua thi');
    XLSX.writeFile(wb, `KetQua_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  };

  const allSelected = filteredSubs.length > 0 && selected.size === filteredSubs.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Kết quả Thi</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-success" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            📊 Xuất Excel
          </button>
          {selected.size > 0 && (
            <button className="btn btn-danger" onClick={handleDeleteSelected}>
              🗑 Xóa {selected.size} đã chọn
            </button>
          )}
          <button onClick={handleDeleteAll} style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            Xóa toàn bộ
          </button>
        </div>
      </div>

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
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} title="Chọn tất cả" />
              </th>
              <th>Thời gian</th>
              <th>Phần thi</th>
              <th>Thông tin</th>
              <th>Điểm số</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length > 0 ? filteredSubs.map(s => (
              <tr key={s.id} style={{ background: selected.has(s.id) ? 'rgba(99,102,241,0.12)' : '' }}>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} />
                </td>
                <td>{new Date(s.submittedAt).toLocaleString('vi-VN')}</td>
                <td>{s.categoryId?.name}</td>
                <td>{Object.entries(s.userInfo || {}).map(([k, v]) => <div key={k}><b>{k}:</b> {v}</div>)}</td>
                <td>
                  <strong style={{ color: s.score / s.totalQuestions >= 0.5 ? 'var(--success)' : 'var(--danger)' }}>
                    {s.score} / {s.totalQuestions}
                  </strong>
                </td>
                <td>
                  <button onClick={() => { if(window.confirm('Xóa kết quả này?')) api.delete(`/submissions/${s.id}`).then(fetchSubs); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Không tìm thấy kết quả nào</td></tr>}
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

function LibraryManager() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Chung');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => { const res = await api.get('/library'); setItems(res.data); };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('file', file);
    try {
      await api.post('/library', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTitle(''); setDescription(''); setCategory('Chung'); setFile(null);
      fetchItems();
    } catch (err) {
      const msg = err?.response?.data?.msg || 'Lỗi tải lên! Vui lòng kiểm tra lại định dạng file.';
      alert(msg);
    }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa tài liệu này?')) {
      await api.delete(`/library/${id}`);
      fetchItems();
    }
  };

  const FILE_ICONS = { PDF: '📄', DOCX: '📝', DOC: '📝', XLSX: '📊', XLS: '📊', PPTX: '📑', PPT: '📑', TXT: '🗒️' };

  return (
    <div>
      <h2>Kho Tài liệu</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Tài liệu trong kho này sẽ hiển thị ở trang <b>Kho Tài liệu</b> công khai, không gắn với phần thi cụ thể.
      </p>
      <form onSubmit={handleUpload} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tải lên tài liệu mới</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tên tài liệu *</label>
            <input required className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Quy trình nghiệp vụ 2024" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Danh mục</label>
            <input className="input-field" value={category} onChange={e => setCategory(e.target.value)} placeholder="VD: Quy trình, Biểu mẫu, Chung..." />
          </div>
        </div>
        <div className="input-group" style={{ marginTop: '1rem' }}>
          <label>Mô tả ngắn</label>
          <input className="input-field" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả nội dung tài liệu..." />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: '1rem' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>File (.pdf, .docx, .xlsx, .pptx, .txt) *</label>
            <input type="file" required className="input-field" onChange={e => setFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading} style={{ height: '42px' }}>
            {uploading ? 'Đang tải...' : <><Upload size={18} /> Tải lên</>}
          </button>
        </div>
      </form>

      <div className="table-wrapper">
        <table>
          <thead><tr><th>File</th><th>Tên tài liệu</th><th>Danh mục</th><th>Kích thước</th><th>Hành động</th></tr></thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có tài liệu nào</td></tr>}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontSize: '1.5rem' }}>{FILE_ICONS[item.fileType] || '📁'}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'white' }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.description}</div>}
                </td>
                <td><span style={{ background: 'rgba(79,70,229,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>{item.category}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.fileType} • {item.fileSize}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopicsManager() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', icon: '📚', color: '#4F46E5', displayOrder: 0 });
  const [editingTopic, setEditingTopic] = useState(null);
  const [assigningTopic, setAssigningTopic] = useState(null);
  const [selectedCatIds, setSelectedCatIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topRes, catRes] = await Promise.all([
        api.get('/topics'),
        api.get('/categories')
      ]);
      setTopics(topRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/topics', form);
      setForm({ name: '', description: '', icon: '📚', color: '#4F46E5', displayOrder: 0 });
      fetchData();
    } catch (err) {
      alert('Lỗi tạo chuyên đề!');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/topics/${editingTopic.id}`, editingTopic);
      setEditingTopic(null);
      fetchData();
    } catch (err) {
      alert('Lỗi cập nhật chuyên đề!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xác nhận xóa chuyên đề này? Các phần thi con sẽ không bị xóa.')) {
      await api.delete(`/topics/${id}`);
      fetchData();
    }
  };

  const openAssignModal = (topic) => {
    setAssigningTopic(topic);
    setSelectedCatIds(topic.Categories ? topic.Categories.map(c => c.id) : []);
  };

  const toggleCategory = (catId) => {
    setSelectedCatIds(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCatIds(categories.map(c => c.id));
  };

  const deselectAllCategories = () => {
    setSelectedCatIds([]);
  };

  const handleSaveCategories = async () => {
    try {
      await api.put(`/topics/${assigningTopic.id}/categories`, { categoryIds: selectedCatIds });
      setAssigningTopic(null);
      fetchData();
    } catch (err) {
      alert('Lỗi lưu danh sách phần thi!');
    }
  };

  return (
    <div>
      <h2>Quản lý Chuyên đề</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Ghép tùy ý các phần thi thành các Chuyên đề lớn. Một phần thi có thể thuộc nhiều chuyên đề khác nhau.
      </p>

      {/* Form tạo chuyên đề mới */}
      <form onSubmit={handleCreate} className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tạo Chuyên đề Mới</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 100px 90px auto', gap: '1rem', alignItems: 'end' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Icon</label>
            <input className="input-field" required value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="📚" style={{ textAlign: 'center', fontSize: '1.2rem' }} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Tên chuyên đề *</label>
            <input className="input-field" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Nghiệp vụ Tín dụng" />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Mô tả ngắn</label>
            <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tóm tắt nội dung..." />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Màu sắc</label>
            <input type="color" className="input-field" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ height: '42px', padding: '2px', cursor: 'pointer' }} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label>Thứ tự</label>
            <input type="number" className="input-field" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Tạo</button>
        </div>
      </form>

      {/* Danh sách chuyên đề */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
              <th>Tên chuyên đề</th>
              <th>Mô tả</th>
              <th style={{ textAlign: 'center' }}>Màu</th>
              <th style={{ textAlign: 'center' }}>Phần thi đã gán</th>
              <th style={{ textAlign: 'center' }}>Thứ tự</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {topics.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có chuyên đề nào. Hãy tạo chuyên đề đầu tiên!</td></tr>
            )}
            {topics.map(t => {
              const catCount = t.Categories ? t.Categories.length : 0;
              return (
                <tr key={t.id}>
                  <td style={{ textAlign: 'center', fontSize: '1.5rem' }}>{t.icon || '📚'}</td>
                  <td>
                    <strong style={{ color: 'white', fontSize: '1rem' }}>{t.name}</strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '250px' }}>
                    {t.description || '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.color || '#4F46E5', verticalAlign: 'middle', border: '2px solid white' }} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => openAssignModal(t)}
                      className="btn"
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.85rem',
                        background: catCount > 0 ? 'rgba(79,70,229,0.25)' : 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--surface-border)',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      📁 {catCount} phần thi (Ghép)
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>{t.displayOrder}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => setEditingTopic({ ...t })} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Topic Modal */}
      {editingTopic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '500px', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Sửa Chuyên đề</h3>
              <button onClick={() => setEditingTopic(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Icon</label>
                  <input className="input-field" required value={editingTopic.icon} onChange={e => setEditingTopic({ ...editingTopic, icon: e.target.value })} style={{ textAlign: 'center', fontSize: '1.2rem' }} />
                </div>
                <div className="input-group">
                  <label>Tên chuyên đề</label>
                  <input className="input-field" required value={editingTopic.name} onChange={e => setEditingTopic({ ...editingTopic, name: e.target.value })} />
                </div>
              </div>
              <div className="input-group">
                <label>Mô tả</label>
                <input className="input-field" value={editingTopic.description || ''} onChange={e => setEditingTopic({ ...editingTopic, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Màu sắc</label>
                  <input type="color" className="input-field" value={editingTopic.color || '#4F46E5'} onChange={e => setEditingTopic({ ...editingTopic, color: e.target.value })} style={{ height: '42px', padding: '2px', cursor: 'pointer' }} />
                </div>
                <div className="input-group">
                  <label>Thứ tự hiển thị</label>
                  <input type="number" className="input-field" value={editingTopic.displayOrder || 0} onChange={e => setEditingTopic({ ...editingTopic, displayOrder: Number(e.target.value) })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn" style={{ flex: 1, background: 'var(--surface-border)', color: 'white' }} onClick={() => setEditingTopic(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Categories Modal */}
      {assigningTopic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '600px', maxWidth: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-border)' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white' }}>
                  {assigningTopic.icon} Ghép phần thi vào: <span style={{ color: 'var(--primary)' }}>{assigningTopic.name}</span>
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Tích chọn các phần thi muốn đưa vào chuyên đề này ({selectedCatIds.length} / {categories.length} đã chọn)
                </p>
              </div>
              <button onClick={() => setAssigningTopic(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button type="button" className="btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', color: 'white' }} onClick={selectAllCategories}>
                Chọn tất cả
              </button>
              <button type="button" className="btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.08)', color: 'white' }} onClick={deselectAllCategories}>
                Bỏ chọn tất cả
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Chưa có phần thi nào trong hệ thống. Hãy tạo phần thi trước!</div>
              ) : (
                categories.map(cat => {
                  const isChecked = selectedCatIds.includes(cat.id);
                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => toggleCategory(cat.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '8px', 
                        background: isChecked ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.04)',
                        border: isChecked ? '1px solid var(--primary)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: 'white' }}>{cat.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cat.description || 'Không có mô tả'} • {cat.questionLimit} câu</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--surface-border)' }}>
              <button type="button" className="btn" style={{ flex: 1, background: 'var(--surface-border)', color: 'white' }} onClick={() => setAssigningTopic(null)}>
                Hủy
              </button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveCategories}>
                Lưu danh sách ({selectedCatIds.length} phần thi)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsManager() {
  const [currentFavicon, setCurrentFavicon] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/public/config').then(res => {
      if (res.data?.faviconUrl) {
        setCurrentFavicon(res.data.faviconUrl);
      }
    }).catch(console.error);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }
  };

  const handleUploadFavicon = async (e) => {
    e.preventDefault();
    if (!file) return alert('Vui lòng chọn ảnh icon!');
    setUploading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('favicon', file);
    try {
      const res = await api.post('/admin/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newUrl = res.data.faviconUrl;
      setCurrentFavicon(newUrl);
      setPreview(null);
      setFile(null);
      setMessage('Đã cập nhật Icon website (Favicon) thành công!');

      // Update current browser tab icon immediately
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = newUrl;
    } catch (err) {
      setMessage('Lỗi khi tải icon lên: ' + (err.response?.data?.msg || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px' }}>
      <h2>Cài đặt Giao diện & Icon (Favicon)</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Tùy chỉnh biểu tượng website (Favicon hiển thị trên tab trình duyệt và bookmark của người dùng).
      </p>

      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Icon hiện tại</label>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--surface-border)'
            }}>
              {currentFavicon ? (
                <img src={currentFavicon} alt="Favicon" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '2rem' }}>🌐</span>
              )}
            </div>
          </div>

          {preview && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '0.9rem' }}>Icon mới (Xem trước)</label>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '12px', 
                background: 'rgba(79,70,229,0.15)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed var(--primary)'
              }}>
                <img src={preview} alt="Xem trước" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleUploadFavicon}>
          <div className="input-group">
            <label>Chọn file ảnh Icon (.png, .ico, .svg, .jpg, .webp)</label>
            <input 
              type="file" 
              required 
              accept=".ico,.png,.jpg,.jpeg,.svg,.webp" 
              className="input-field" 
              onChange={handleFileChange} 
            />
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Khuyến nghị sử dụng ảnh vuông (.png hoặc .ico), kích thước 64x64px, 128x128px hoặc 256x256px.
            </p>
          </div>

          {message && (
            <p style={{ 
              color: message.includes('thành công') ? 'var(--success)' : 'var(--danger)', 
              fontWeight: 500,
              marginBottom: '1rem' 
            }}>
              {message}
            </p>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading || !file}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Upload size={18} />
            {uploading ? 'Đang lưu icon...' : 'Cập nhật Icon Website'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
