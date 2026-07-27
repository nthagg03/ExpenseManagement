
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/management.css';

const today = new Date().toISOString().slice(0, 10);
const initialForm = { description: '', amount: '', incomeDate: today, categoryId: '' };
const money = (value) => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function Incomes() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      const response = await axiosClient.get('/incomes');
      setItems(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể tải danh sách khoản thu.');
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
    (async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchCategories()]);
      setLoading(false);
    })();
  }, [fetchItems, fetchCategories]);

  const categoryName = useCallback((item) => {
    if (item.category?.name) return item.category.name;
    return categories.find((c) => Number(c.id) === Number(item.categoryId))?.name || 'Chưa phân loại';
  }, [categories]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.amount || 0), 0), [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      (item.description || '').toLowerCase().includes(q) ||
      categoryName(item).toLowerCase().includes(q)
    );
  }, [items, search, categoryName]);

  const reset = () => { setForm(initialForm); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setError(''); setMessage('');
    if (!form.description.trim()) return setError('Vui lòng nhập nội dung khoản thu.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Số tiền phải lớn hơn 0.');
    if (!form.incomeDate) return setError('Vui lòng chọn ngày.');
    if (!form.categoryId) return setError('Vui lòng chọn danh mục.');

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      incomeDate: form.incomeDate,
      categoryId: Number(form.categoryId),
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await axiosClient.patch(`/incomes/${editingId}`, payload);
        setMessage('Cập nhật khoản thu thành công.');
      } else {
        await axiosClient.post('/incomes', payload);
        setMessage('Thêm khoản thu thành công.');
      }
      reset();
      await fetchItems();
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể lưu khoản thu.');
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (item) => {
    setForm({
      description: item.description || '',
      amount: item.amount || '',
      incomeDate: item.incomeDate ? String(item.incomeDate).slice(0,10) : today,
      categoryId: String(item.categoryId || item.category?.id || ''),
    });
    setEditingId(item.id);
    setMessage(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khoản thu này không?')) return;
    try {
      await axiosClient.delete(`/incomes/${id}`);
      if (editingId === id) reset();
      setMessage('Xóa khoản thu thành công.');
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa khoản thu.');
    }
  };

  return (
    <div className="em-page">
      <div className="em-page-header">
        <div>
          <p className="em-page-eyebrow">Income tracking</p>
          <h1 className="em-page-title">Quản lý thu nhập</h1>
          <p className="em-page-subtitle">Thêm, chỉnh sửa và theo dõi mọi khoản thu theo từng danh mục.</p>
        </div>
        <div className="em-pill"><i className="bi bi-bar-chart-fill" /> Tổng cộng: {money(total)}</div>
      </div>

      {message && <div className="em-alert em-alert-success"><i className="bi bi-check-circle-fill" />{message}<button className="em-alert-close" onClick={() => setMessage('')}><i className="bi bi-x-lg" /></button></div>}
      {error && <div className="em-alert em-alert-danger"><i className="bi bi-exclamation-triangle-fill" />{error}<button className="em-alert-close" onClick={() => setError('')}><i className="bi bi-x-lg" /></button></div>}

      <div className="em-card em-form-card mb-4">
        <div className="em-section-title">
          <div className="em-section-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
            <i className={`bi ${editingId ? 'bi-pencil-fill' : 'bi-plus-lg'}`} />
          </div>
          <div><h3>{editingId ? 'Cập nhật khoản thu' : 'Thêm khoản thu mới'}</h3><p>Điền đầy đủ thông tin bên dưới.</p></div>
        </div>

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <label className="em-label">Nội dung *</label>
              <input className="em-input" name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Lương, thưởng..." />
            </div>
            <div className="col-12 col-md-4 col-lg-2">
              <label className="em-label">Số tiền *</label>
              <input className="em-input" type="number" min="1" name="amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="500000" />
            </div>
            <div className="col-12 col-md-4 col-lg-2">
              <label className="em-label">Ngày *</label>
              <input className="em-input" type="date" name="incomeDate" value={form.incomeDate} onChange={(e) => setForm({...form, incomeDate: e.target.value})} />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <label className="em-label">Danh mục *</label>
              <select className="em-select" value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-12 d-flex gap-2 flex-wrap">
              <button className="em-button em-button-success" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm" /> Đang lưu...</> : <><i className="bi bi-arrow-down-left" />{editingId ? 'Lưu thay đổi' : 'Thêm khoản thu'}</>}
              </button>
              {editingId && <button type="button" className="em-button em-button-soft" onClick={reset}>Hủy chỉnh sửa</button>}
            </div>
          </div>
        </form>
      </div>

      <div className="em-card">
        <div className="em-toolbar">
          <div><h3>Danh sách khoản thu</h3><div className="text-muted small">{filtered.length} bản ghi</div></div>
          <div className="em-search"><i className="bi bi-search" /><input className="em-input" placeholder="Tìm nội dung hoặc danh mục..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>

        {loading ? <div className="em-loading"><div className="spinner-border text-primary" /></div> :
          filtered.length === 0 ? <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-receipt" /></div><strong>Chưa có dữ liệu</strong><div className="mt-2">Hãy thêm khoản thu đầu tiên của bạn.</div></div> :
          <div className="em-table-wrap">
            <table className="em-table">
              <thead><tr><th>#</th><th>Nội dung</th><th>Danh mục</th><th>Ngày</th><th className="text-end">Số tiền</th><th className="text-center">Thao tác</th></tr></thead>
              <tbody>{filtered.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td><strong>{item.description}</strong></td>
                  <td><span className="em-pill"><i className="bi bi-tag-fill" />{categoryName(item)}</span></td>
                  <td className="text-muted">{item.incomeDate ? new Date(item.incomeDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td className="text-end"><span className="em-money-income">{money(item.amount)}</span></td>
                  <td><div className="d-flex justify-content-center gap-2">
                    <button className="em-icon-button" onClick={() => edit(item)} title="Sửa"><i className="bi bi-pencil" /></button>
                    <button className="em-icon-button danger" onClick={() => remove(item.id)} title="Xóa"><i className="bi bi-trash3" /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}

export default Incomes;
