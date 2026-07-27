
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/management.css';

const initialForm = { name: '', description: '' };
const gradients = [
  'linear-gradient(135deg,#4f46e5,#06b6d4)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#f43f5e,#8b5cf6)',
];

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get('/categories');
      setCategories(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh mục.');
    }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await fetchCategories(); setLoading(false); })();
  }, [fetchCategories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  }, [categories, search]);

  const reset = () => { setForm(initialForm); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    if (!form.name.trim()) return setError('Vui lòng nhập tên danh mục.');
    if (form.name.trim().length > 100) return setError('Tên danh mục tối đa 100 ký tự.');
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      };
      if (editingId) {
        await axiosClient.patch(`/categories/${editingId}`, payload);
        setMessage('Cập nhật danh mục thành công.');
      } else {
        await axiosClient.post('/categories', payload);
        setMessage('Thêm danh mục thành công.');
      }
      reset();
      await fetchCategories();
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể lưu danh mục.');
    } finally { setSubmitting(false); }
  };

  const edit = (category) => {
    setForm({ name: category.name || '', description: category.description || '' });
    setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (category) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`)) return;
    try {
      await axiosClient.delete(`/categories/${category.id}`);
      if (editingId === category.id) reset();
      setMessage('Xóa danh mục thành công.');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa danh mục đang được sử dụng.');
    }
  };

  return (
    <div className="em-page">
      <div className="em-page-header">
        <div>
          <p className="em-page-eyebrow">Category workspace</p>
          <h1 className="em-page-title">Quản lý danh mục</h1>
          <p className="em-page-subtitle">Tổ chức các khoản thu, chi và ngân sách theo nhóm rõ ràng.</p>
        </div>
        <span className="em-pill"><i className="bi bi-folder2-open" /> {categories.length} danh mục</span>
      </div>

      {message && <div className="em-alert em-alert-success"><i className="bi bi-check-circle-fill" />{message}</div>}
      {error && <div className="em-alert em-alert-danger"><i className="bi bi-exclamation-triangle-fill" />{error}</div>}

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="em-card em-form-card">
            <div className="em-section-title">
              <div className="em-section-icon" style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)' }}>
                <i className={`bi ${editingId ? 'bi-pencil-fill' : 'bi-plus-lg'}`} />
              </div>
              <div><h3>{editingId ? 'Cập nhật danh mục' : 'Danh mục mới'}</h3><p>Tạo nhóm dữ liệu dễ nhận biết.</p></div>
            </div>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="em-label">Tên danh mục *</label>
                <input className="em-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} placeholder="Ví dụ: Ăn uống" />
              </div>
              <div className="mb-3">
                <label className="em-label">Mô tả</label>
                <textarea className="em-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={255} placeholder="Mô tả ngắn cho danh mục..." />
              </div>
              <button className="em-button em-button-primary w-100" disabled={submitting}>
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm danh mục'}
              </button>
              {editingId && <button type="button" className="em-button em-button-soft w-100 mt-2" onClick={reset}>Hủy chỉnh sửa</button>}
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="em-card">
            <div className="em-toolbar">
              <div><h3>Thư viện danh mục</h3><div className="text-muted small">{filtered.length} kết quả</div></div>
              <div className="em-search"><i className="bi bi-search" /><input className="em-input" placeholder="Tìm tên hoặc mô tả..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
            {loading ? <div className="em-loading"><div className="spinner-border text-primary" /></div> :
              filtered.length === 0 ? <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-folder2-open" /></div>Chưa có danh mục phù hợp.</div> :
              <div className="em-category-grid">
                {filtered.map((category, index) => (
                  <div className="em-category-card" key={category.id}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="em-category-icon" style={{ background: gradients[index % gradients.length] }}>
                        {(category.name || '?').trim().charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between gap-2">
                          <div>
                            <div className="fw-bold">{category.name}</div>
                            <div className="text-muted" style={{ fontSize: 11.5 }}>Mã #{category.id}</div>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="em-icon-button" onClick={() => edit(category)}><i className="bi bi-pencil" /></button>
                            <button className="em-icon-button danger" onClick={() => remove(category)}><i className="bi bi-trash3" /></button>
                          </div>
                        </div>
                        <p className="text-muted small mt-3 mb-0">{category.description || 'Chưa có mô tả cho danh mục này.'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
