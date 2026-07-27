
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../styles/management.css';

const today = new Date().toISOString().slice(0, 10);
const initialForm = { description: '', amount: '', expenseDate: today, categoryId: '' };
const money = (value) => Number(value || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

function Expenses() {
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
      const response = await axiosClient.get('/expenses');
      setItems(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể tải danh sách khoản chi.');
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
    if (!form.description.trim()) return setError('Vui lòng nhập nội dung khoản chi.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Số tiền phải lớn hơn 0.');
    if (!form.expenseDate) return setError('Vui lòng chọn ngày.');
    if (!form.categoryId) return setError('Vui lòng chọn danh mục.');

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      expenseDate: form.expenseDate,
      categoryId: Number(form.categoryId),
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await axiosClient.patch(`/expenses/${editingId}`, payload);
        setMessage('Cập nhật khoản chi thành công.');
      } else {
        await axiosClient.post('/expenses', payload);
        setMessage('Thêm khoản chi thành công.');
      }
      reset();
      await fetchItems();
    } catch (err) {
      const m = err.response?.data?.message;
      setError(Array.isArray(m) ? m.join(', ') : m || 'Không thể lưu khoản chi.');
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (item) => {
    setForm({
      description: item.description || '',
      amount: item.amount || '',
      expenseDate: item.expenseDate ? String(item.expenseDate).slice(0,10) : today,
      categoryId: String(item.categoryId || item.category?.id || ''),
    });
    setEditingId(item.id);
    setMessage(''); setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khoản chi này không?')) return;
    try {
      await axiosClient.delete(`/expenses/${id}`);
      if (editingId === id) reset();
      setMessage('Xóa khoản chi thành công.');
      await fetchItems();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa khoản chi.');
    }
  };

  return (
    <div className="em-page">
      <div className="em-page-header">
        <div>
          <p className="em-page-eyebrow">Expense tracking</p>
          <h1 className="em-page-title">Quản lý chi tiêu</h1>
          <p className="em-page-subtitle">Thêm, chỉnh sửa và theo dõi mọi khoản chi theo từng danh mục.</p>
        </div>
        <div className="em-pill"><i className="bi bi-bar-chart-fill" /> Tổng cộng: {money(total)}</div>
      </div>

      {message && <div className="em-alert em-alert-success"><i className="bi bi-check-circle-fill" />{message}<button className="em-alert-close" onClick={() => setMessage('')}><i className="bi bi-x-lg" /></button></div>}
      {error && <div className="em-alert em-alert-danger"><i className="bi bi-exclamation-triangle-fill" />{error}<button className="em-alert-close" onClick={() => setError('')}><i className="bi bi-x-lg" /></button></div>}

      <div className="em-card em-form-card mb-4">
        <div className="em-section-title">
          <div className="em-section-icon" style={{ background: 'linear-gradient(135deg,#f43f5e,#e11d48)' }}>
            <i className={`bi ${editingId ? 'bi-pencil-fill' : 'bi-plus-lg'}`} />
          </div>
          <div><h3>{editingId ? 'Cập nhật khoản chi' : 'Thêm khoản chi mới'}</h3><p>Điền đầy đủ thông tin bên dưới.</p></div>
        </div>

        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <label className="em-label">Nội dung *</label>
              <input className="em-input" name="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Ăn uống, mua sắm..." />
            </div>
            <div className="col-12 col-md-4 col-lg-2">
              <label className="em-label">Số tiền *</label>
              <input className="em-input" type="number" min="1" name="amount" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} placeholder="500000" />
            </div>
            <div className="col-12 col-md-4 col-lg-2">
              <label className="em-label">Ngày *</label>
              <input className="em-input" type="date" name="expenseDate" value={form.expenseDate} onChange={(e) => setForm({...form, expenseDate: e.target.value})} />
            </div>
            <div className="col-12 col-md-4 col-lg-4">
              <label className="em-label">Danh mục *</label>
              <select className="em-select" value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-12 d-flex gap-2 flex-wrap">
              <button className="em-button em-button-danger" disabled={submitting}>
                {submitting ? <><span className="spinner-border spinner-border-sm" /> Đang lưu...</> : <><i className="bi bi-arrow-up-right" />{editingId ? 'Lưu thay đổi' : 'Thêm khoản chi'}</>}
              </button>
              {editingId && <button type="button" className="em-button em-button-soft" onClick={reset}>Hủy chỉnh sửa</button>}
            </div>
          </div>
        </form>
      </div>

      <div className="em-card">
        <div className="em-toolbar">
          <div><h3>Danh sách khoản chi</h3><div className="text-muted small">{filtered.length} bản ghi</div></div>
          <div className="em-search"><i className="bi bi-search" /><input className="em-input" placeholder="Tìm nội dung hoặc danh mục..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        </div>

        {loading ? <div className="em-loading"><div className="spinner-border text-primary" /></div> :
          filtered.length === 0 ? <div className="em-empty"><div className="em-empty-icon"><i className="bi bi-receipt" /></div><strong>Chưa có dữ liệu</strong><div className="mt-2">Hãy thêm khoản chi đầu tiên của bạn.</div></div> :
          <div className="em-table-wrap">
            <table className="em-table">
              <thead><tr><th>#</th><th>Nội dung</th><th>Danh mục</th><th>Ngày</th><th className="text-end">Số tiền</th><th className="text-center">Thao tác</th></tr></thead>
              <tbody>{filtered.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-muted">{index + 1}</td>
                  <td><strong>{item.description}</strong></td>
                  <td><span className="em-pill"><i className="bi bi-tag-fill" />{categoryName(item)}</span></td>
                  <td className="text-muted">{item.expenseDate ? new Date(item.expenseDate).toLocaleDateString('vi-VN') : ''}</td>
                  <td className="text-end"><span className="em-money-expense">{money(item.amount)}</span></td>
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

export default Expenses;
