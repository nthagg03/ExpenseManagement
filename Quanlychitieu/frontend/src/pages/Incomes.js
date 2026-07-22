import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { formatCurrency } from '../utils/formatCurrency';

const initialForm = {
  description: '',
  amount: '',
  incomeDate: new Date().toISOString().slice(0, 10),
  categoryId: '',
};

function incomes() {
  const [incomes, setincomes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

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

  const fetchincomes = useCallback(async () => {
    try {
      const response = await axiosClient.get('/incomes');

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setincomes(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách Khoản thu:', err);
      setError(
        err.response?.data?.message ||
          'Không thể tải danh sách Khoản thu.',
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
      console.error('Lỗi lấy danh mục:', err);
      setError(
        err.response?.data?.message ||
          'Không thể tải danh sách danh mục.',
      );
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      await Promise.all([fetchincomes(), fetchCategories()]);

      setLoading(false);
    };

    loadData();
  }, [fetchincomes, fetchCategories]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!form.description.trim()) {
      setError('Vui lòng nhập nội dung Khoản thu.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Số tiền phải lớn hơn 0.');
      return;
    }

    if (!form.incomeDate) {
      setError('Vui lòng chọn Ngày thu.');
      return;
    }

    if (!form.categoryId) {
      setError('Vui lòng chọn danh mục.');
      return;
    }

    const userId = getCurrentUserId();

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      incomeDate: form.incomeDate,
      categoryId: Number(form.categoryId),
    };

    if (userId) {
      payload.userId = Number(userId);
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await axiosClient.patch(`/incomes/${editingId}`, payload);
        setMessage('Cập nhật Khoản thu thành công.');
      } else {
        await axiosClient.post('/incomes', payload);
        setMessage('Thêm Khoản thu thành công.');
      }

      resetForm();
      await fetchincomes();
    } catch (err) {
      console.error('Lỗi lưu Khoản thu:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể lưu Khoản thu.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (income) => {
    const categoryId =
      income.categoryId ||
      income.category?.id ||
      '';

    setForm({
      description: income.description || '',
      amount: income.amount || '',
      incomeDate: income.incomeDate
        ? String(income.incomeDate).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      categoryId: String(categoryId),
    });

    setEditingId(income.id);
    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa Khoản thu này không?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await axiosClient.delete(`/incomes/${id}`);

      setMessage('Xóa Khoản thu thành công.');

      if (editingId === id) {
        resetForm();
      }

      await fetchincomes();
    } catch (err) {
      console.error('Lỗi xóa Khoản thu:', err);

      setError(
        err.response?.data?.message ||
          'Không thể xóa Khoản thu.',
      );
    }
  };

  const getCategoryName = (income) => {
    if (typeof income.category === 'string') {
      return income.category;
    }

    if (income.category?.name) {
      return income.category.name;
    }

    if (income.category?.categoryName) {
      return income.category.categoryName;
    }

    const categoryId =
      income.categoryId ||
      income.category?.id;

    const category = categories.find(
      (item) => Number(item.id) === Number(categoryId),
    );

    return (
      category?.name ||
      category?.categoryName ||
      'Chưa phân loại'
    );
  };

  const displayCurrency = (amount) => {
    if (typeof formatCurrency === 'function') {
      return formatCurrency(Number(amount || 0));
    }

    return `${Number(amount || 0).toLocaleString('vi-VN')} ₫`;
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý thu nhập</h2>
          <p className="text-muted mb-0">
            Thêm, sửa và theo dõi các Khoản thu của bạn.
          </p>
        </div>
      </div>

      {message && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {message}

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
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}

          <button
            type="button"
            className="btn-close"
            aria-label="Đóng"
            onClick={() => setError('')}
          />
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">
            {editingId ? 'Cập nhật Khoản thu' : 'Thêm Khoản thu'}
          </h5>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label
                  htmlFor="description"
                  className="form-label"
                >
                  Nội dung chi
                </label>

                <input
                  id="description"
                  name="description"
                  type="text"
                  className="form-control"
                  placeholder="Ví dụ: Lương tháng"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-2">
                <label
                  htmlFor="amount"
                  className="form-label"
                >
                  Số tiền
                </label>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="1"
                  step="1"
                  className="form-control"
                  placeholder="50000"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-2">
                <label
                  htmlFor="incomeDate"
                  className="form-label"
                >
                  Ngày thu
                </label>

                <input
                  id="incomeDate"
                  name="incomeDate"
                  type="date"
                  className="form-control"
                  value={form.incomeDate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 col-md-4">
                <label
                  htmlFor="categoryId"
                  className="form-label"
                >
                  Danh mục
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  className="form-select"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name ||
                        category.categoryName ||
                        `Danh mục ${category.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Đang lưu...'
                    : editingId
                      ? 'Lưu thay đổi'
                      : 'Thêm Khoản thu'}
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
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">
              Danh sách Khoản thu
            </h5>

            <span className="badge text-bg-secondary">
              {incomes.length} khoản
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                role="status"
              >
                <span className="visually-hidden">
                  Đang tải...
                </span>
              </div>
            </div>
          ) : incomes.length === 0 ? (
            <div className="alert alert-light text-center mb-0">
              Chưa có Khoản thu nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Nội dung</th>
                    <th>Danh mục</th>
                    <th>Ngày thu</th>
                    <th className="text-end">Số tiền</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {incomes.map((income, index) => (
                    <tr key={income.id}>
                      <td>{index + 1}</td>

                      <td>{income.description}</td>

                      <td>
                        <span className="badge text-bg-light">
                          {getCategoryName(income)}
                        </span>
                      </td>

                      <td>
                        {income.incomeDate
                          ? new Date(
                              income.incomeDate,
                            ).toLocaleDateString('vi-VN')
                          : ''}
                      </td>

                      <td className="text-end fw-semibold text-danger">
                        {displayCurrency(income.amount)}
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(income)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(income.id)
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default incomes;