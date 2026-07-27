
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/management.css';

const today = new Date().toISOString().slice(0, 10);
const initialForm = { amount: '', startDate: today, endDate: today, categoryId: '' };
const money = (value) => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await axiosClient.get('/budgets');
      setBudgets(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải ngân sách.');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get('/categories');
      setCategories(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh mục.');
    }
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); await Promise.all([fetchBudgets(), fetchCategories()]); setLoading(false); })();
  }, [fetchBudgets, fetchCategories]);

  const totalBudget = useMemo(
    () => budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [budgets],
  );

  const categoryName = useCallback((item) => {
    if (item.category?.name) return item.category.name;
    return categories.find((c) => Number(c.id) === Number(item.categoryId))?.name || 'Chưa xác định';
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return budgets;
    return budgets.filter((item) =>
      categoryName(item).toLowerCase().includes(q) ||
      String(item.amount || '').includes(q)
    );
  }, [budgets, search, categoryName]);

  const reset = () => { setForm(initialForm); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setMessage(''); setError('');
    if (!form.categoryId) return setError('Vui lòng chọn danh mục.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Hạn mức phải lớn hơn 0.');
    if (!form.startDate || !form.endDate) return setError('Vui lòng nhập đầy đủ thời gian.');
    if (new Date(form.startDate) > new Date(form.endDate)) return setError('Ngày bắt đầu không được sau ngày kết thúc.');

    try {
      setSubmitting(true);
      const payload = {
        amount: Number(form.amount),
        startDate: form.startDate,
        endDate: form.endDate,
        categoryId: Number(form.categoryId),
      };
      if (editingId) {
        await axiosClient.patch(`/budgets/${editingId}`, payload);
        setMessage('Cập nhật ngân sách thành công.');
      } else {
        await axiosClient.post('/budgets', payload);
        setMessage('Thêm ngân sách thành công.');
      }
      reset();
      await fetchBudgets();
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể lưu ngân sách.');
    } finally { setSubmitting(false); }
  };

  const edit = (item) => {
    setForm({
      amount: item.amount || '',
      startDate: item.startDate ? String(item.startDate).slice(0,10) : today,
      endDate: item.endDate ? String(item.endDate).slice(0,10) : today,
      categoryId: String(item.categoryId || item.category?.id || ''),
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (item) => {
    if (!window.confirm(`Xóa ngân sách ${money(item.amount)}?`)) return;
    try {
      await axiosClient.delete(`/budgets/${item.id}`);
      if (editingId === item.id) reset();
      setMessage('Xóa ngân sách thành công.');
      await fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa ngân sách.');
    }
  };

  return (
    <div className="em-page">
      <div className="em-page-header">
        <div>
          <p className="em-page-eyebrow">Budget planning</p>
          <h1 className="em-page-title">Quản lý ngân sách</h1>
          <p className="em-page-subtitle">Thiết lập hạn mức chi tiêu theo danh mục và thời gian.</p>
        </div>
        <div className="em-hero-actions">
          <span className="em-pill"><i className="bi bi-bullseye" /> {budgets.length} ngân sách</span>
          <span className="em-pill">Tổng {money(totalBudget)}</span>
        </div>
      </div>

      {message && <div className="em-alert em-alert-success"><i className="bi bi-check-circle-fill" />{message}</div>}
      {error && <div className="em-alert em-alert-danger"><i className="bi bi-exclamation-triangle-fill" />{error}</div>}

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="em-card em-form-card">
            <div className="em-section-title">
              <div className="em-section-icon" style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)' }}>
                <i className={`bi ${editingId ? 'bi-pencil-fill' : 'bi-bullseye'}`} />
              </div>
              <div><h3>{editingId ? 'Cập nhật ngân sách' : 'Ngân sách mới'}</h3><p>Đặt mục tiêu rõ ràng cho từng danh mục.</p></div>
            </div>
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="em-label">Danh mục *</label>
                <select className="em-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="em-label">Hạn mức *</label>
                <input className="em-input" type="number" min="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="5000000" />
                {form.amount && <div className="em-money-income mt-2 small">{money(form.amount)}</div>}
              </div>
              <div className="row g-3">
                <div className="col-6"><label className="em-label">Ngày bắt đầu *</label><input className="em-input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                <div className="col-6"><label className="em-label">Ngày kết thúc *</label><input className="em-input" type="date" min={form.startDate} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
              <button className="em-button em-button-primary w-100 mt-4" disabled={submitting}>
                {submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm ngân sách'}
              </button>
              {editingId && <button type="button" className="em-button em-button-soft w-100 mt-2" onClick={reset}>Hủy chỉnh sửa</button>}
            </form>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="em-card">
            <div className="em-toolbar">
              <div><h3>Danh sách ngân sách</h3><div className="text-muted small">Theo dõi các hạn mức đang áp dụng</div></div>
              <div className="em-search"><i className="bi bi-search" /><input className="em-input" placeholder="Tìm theo danh mục..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </div>
            {loading ? <div className="em-loading"><div className="spinner-border text-primary" /></div> :
              filtered.length === 0 ? <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-bullseye" /></div>Chưa có ngân sách phù hợp.</div> :
              <div className="em-budget-grid">
                {filtered.map((item, index) => (
                  <div className="em-budget-card" key={item.id}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div className="d-flex gap-3">
                        <div className="em-category-icon" style={{ background: index % 2 ? 'linear-gradient(135deg,#10b981,#06b6d4)' : 'linear-gradient(135deg,#4f46e5,#8b5cf6)' }}>
                          <i className="bi bi-bullseye" />
                        </div>
                        <div>
                          <div className="text-muted small">Danh mục</div>
                          <div className="fw-bold">{categoryName(item)}</div>
                        </div>
                      </div>
                      <span className="em-pill">#{item.id}</span>
                    </div>
                    <div className="mt-3 mb-2 text-muted small">Hạn mức</div>
                    <div className="fs-4 fw-bold" style={{ color: '#4f46e5' }}>{money(item.amount)}</div>
                    <div className="em-progress my-3"><span style={{ width: '100%' }} /></div>
                    <div className="d-flex justify-content-between text-muted" style={{ fontSize: 11.5 }}>
                      <span>{new Date(item.startDate).toLocaleDateString('vi-VN')}</span>
                      <i className="bi bi-arrow-right" />
                      <span>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="d-flex gap-2 mt-3">
                      <button className="em-button em-button-soft flex-grow-1" onClick={() => edit(item)}><i className="bi bi-pencil" /> Sửa</button>
                      <button className="em-button em-button-soft flex-grow-1" style={{ color: '#f43f5e' }} onClick={() => remove(item)}><i className="bi bi-trash3" /> Xóa</button>
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

export default Budgets;
