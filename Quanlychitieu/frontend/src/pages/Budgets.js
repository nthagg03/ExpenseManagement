import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  amount: '',
  startDate: today,
  endDate: today,
  categoryId: '',
};

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getCurrentUserId = () => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem('current_user') || 'null',
      );

      return currentUser?.id || currentUser?.userId || null;
    } catch {
      return null;
    }
  };

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await axiosClient.get('/budgets');

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setBudgets(data);
    } catch (err) {
      console.error('Lỗi tải ngân sách:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể tải danh sách ngân sách.',
      );
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axiosClient.get('/categories');

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setCategories(data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể tải danh sách danh mục.',
      );
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      await Promise.all([fetchBudgets(), fetchCategories()]);

      setLoading(false);
    };

    loadData();
  }, [fetchBudgets, fetchCategories]);

  const filteredBudgets = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return budgets;
    }

    return budgets.filter((budget) => {
      const categoryId =
        budget.categoryId || budget.category?.id;

      const category = categories.find(
        (item) => Number(item.id) === Number(categoryId),
      );

      const categoryName =
        budget.category?.name ||
        category?.name ||
        '';

      const amount = String(budget.amount || '');

      return (
        categoryName.toLowerCase().includes(keyword) ||
        amount.includes(keyword)
      );
    });
  }, [budgets, categories, searchKeyword]);

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (total, budget) => total + Number(budget.amount || 0),
      0,
    );
  }, [budgets]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    const [year, month, day] = String(value).slice(0, 10).split('-');

    return `${day}/${month}/${year}`;
  };

  const getCategoryName = (budget) => {
    if (budget.category?.name) {
      return budget.category.name;
    }

    const category = categories.find(
      (item) =>
        Number(item.id) === Number(budget.categoryId),
    );

    return category?.name || 'Chưa xác định';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Số tiền ngân sách phải lớn hơn 0.');
      return;
    }

    if (!form.categoryId) {
      setError('Vui lòng chọn danh mục.');
      return;
    }

    if (!form.startDate) {
      setError('Vui lòng chọn ngày bắt đầu.');
      return;
    }

    if (!form.endDate) {
      setError('Vui lòng chọn ngày kết thúc.');
      return;
    }

    if (form.endDate < form.startDate) {
      setError('Ngày kết thúc không được trước ngày bắt đầu.');
      return;
    }

    const userId = getCurrentUserId();

    if (!userId) {
      setError(
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
      );
      return;
    }

    const payload = {
      amount: Number(form.amount),
      startDate: form.startDate,
      endDate: form.endDate,
      categoryId: Number(form.categoryId),
      userId: Number(userId),
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axiosClient.patch(`/budgets/${editingId}`, payload);
        setMessage('Cập nhật ngân sách thành công.');
      } else {
        await axiosClient.post('/budgets', payload);
        setMessage('Thêm ngân sách thành công.');
      }

      resetForm();
      await fetchBudgets();
    } catch (err) {
      console.error('Lỗi lưu ngân sách:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể lưu ngân sách.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget) => {
    setForm({
      amount: budget.amount || '',
      startDate: budget.startDate
        ? String(budget.startDate).slice(0, 10)
        : today,
      endDate: budget.endDate
        ? String(budget.endDate).slice(0, 10)
        : today,
      categoryId: String(
        budget.categoryId || budget.category?.id || '',
      ),
    });

    setEditingId(budget.id);
    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (budget) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ngân sách ${formatCurrency(
        budget.amount,
      )} không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setError('');

      await axiosClient.delete(`/budgets/${budget.id}`);

      if (editingId === budget.id) {
        resetForm();
      }

      setMessage('Xóa ngân sách thành công.');
      await fetchBudgets();
    } catch (err) {
      console.error('Lỗi xóa ngân sách:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể xóa ngân sách.',
      );
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý ngân sách</h2>

          <p className="text-muted mb-0">
            Thiết lập hạn mức chi tiêu theo từng danh mục và khoảng thời gian.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <span className="badge rounded-pill text-bg-primary px-3 py-2">
            {budgets.length} ngân sách
          </span>

          <span className="badge rounded-pill text-bg-success px-3 py-2">
            Tổng: {formatCurrency(totalBudget)}
          </span>
        </div>
      </div>

      {message && (
        <div
          className="alert alert-success alert-dismissible fade show shadow-sm"
          role="alert"
        >
          <strong>Thành công!</strong> {message}

          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={() => setMessage('')}
          />
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show shadow-sm"
          role="alert"
        >
          <strong>Có lỗi xảy ra!</strong> {error}

          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={() => setError('')}
          />
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary fw-bold"
                  style={{
                    width: 52,
                    height: 52,
                    fontSize: 24,
                  }}
                >
                  {editingId ? '✎' : '₫'}
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    {editingId
                      ? 'Cập nhật ngân sách'
                      : 'Tạo ngân sách mới'}
                  </h5>

                  <p className="small text-muted mb-0">
                    Nhập hạn mức và thời gian áp dụng.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="categoryId"
                    className="form-label fw-semibold"
                  >
                    Danh mục
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    className="form-select form-select-lg"
                    value={form.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">-- Chọn danh mục --</option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="amount"
                    className="form-label fw-semibold"
                  >
                    Hạn mức ngân sách
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <div className="input-group input-group-lg">
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      className="form-control"
                      placeholder="Ví dụ: 5000000"
                      value={form.amount}
                      onChange={handleChange}
                    />

                    <span className="input-group-text">VNĐ</span>
                  </div>

                  {form.amount && Number(form.amount) > 0 && (
                    <small className="text-success d-block mt-2">
                      {formatCurrency(form.amount)}
                    </small>
                  )}
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="startDate"
                    className="form-label fw-semibold"
                  >
                    Ngày bắt đầu
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="form-control"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="endDate"
                    className="form-label fw-semibold"
                  >
                    Ngày kết thúc
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="form-control"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting
                      ? 'Đang lưu...'
                      : editingId
                        ? 'Lưu thay đổi'
                        : 'Thêm ngân sách'}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Hủy chỉnh sửa
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">
                    Danh sách ngân sách
                  </h5>

                  <p className="small text-muted mb-0">
                    Theo dõi các hạn mức ngân sách đang có.
                  </p>
                </div>

                <div
                  className="input-group"
                  style={{
                    maxWidth: 320,
                  }}
                >
                  <span className="input-group-text bg-white">
                    🔍
                  </span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm theo danh mục..."
                    value={searchKeyword}
                    onChange={(event) =>
                      setSearchKeyword(event.target.value)
                    }
                  />

                  {searchKeyword && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchKeyword('')}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Đang tải...
                    </span>
                  </div>

                  <p className="text-muted mt-3 mb-0">
                    Đang tải danh sách ngân sách...
                  </p>
                </div>
              ) : filteredBudgets.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 76,
                      height: 76,
                      fontSize: 32,
                    }}
                  >
                    🎯
                  </div>

                  <h6 className="fw-bold">
                    {searchKeyword
                      ? 'Không tìm thấy ngân sách phù hợp'
                      : 'Chưa có ngân sách nào'}
                  </h6>

                  <p className="text-muted mb-0">
                    {searchKeyword
                      ? 'Hãy thử tìm bằng từ khóa khác.'
                      : 'Hãy tạo ngân sách đầu tiên bằng biểu mẫu bên trái.'}
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {filteredBudgets.map((budget) => (
                    <div
                      className="col-12 col-md-6"
                      key={budget.id}
                    >
                      <div className="card h-100 border rounded-4">
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold"
                                style={{
                                  width: 48,
                                  height: 48,
                                  flexShrink: 0,
                                }}
                              >
                                ₫
                              </div>

                              <div>
                                <div className="small text-muted">
                                  Danh mục
                                </div>

                                <h6 className="fw-bold mb-0">
                                  {getCategoryName(budget)}
                                </h6>
                              </div>
                            </div>

                            <span className="badge rounded-pill text-bg-light border">
                              #{budget.id}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="small text-muted mb-1">
                              Hạn mức
                            </div>

                            <div className="fs-4 fw-bold text-primary">
                              {formatCurrency(budget.amount)}
                            </div>
                          </div>

                          <div className="bg-light rounded-3 p-3 mb-3">
                            <div className="d-flex justify-content-between gap-3">
                              <div>
                                <div className="small text-muted">
                                  Bắt đầu
                                </div>

                                <div className="fw-semibold">
                                  {formatDate(budget.startDate)}
                                </div>
                              </div>

                              <div className="text-muted d-flex align-items-end">
                                →
                              </div>

                              <div className="text-end">
                                <div className="small text-muted">
                                  Kết thúc
                                </div>

                                <div className="fw-semibold">
                                  {formatDate(budget.endDate)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary flex-grow-1"
                              onClick={() => handleEdit(budget)}
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline-danger flex-grow-1"
                              onClick={() => handleDelete(budget)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Budgets;