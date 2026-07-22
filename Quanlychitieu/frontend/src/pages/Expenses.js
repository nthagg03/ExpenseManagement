import { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { formatCurrency } from '../utils/formatCurrency';

const initialForm = {
  description: '',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  categoryId: '',
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
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

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axiosClient.get('/expenses');

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      setExpenses(data);
    } catch (err) {
      console.error('Lỗi lấy danh sách khoản chi:', err);
      setError(
        err.response?.data?.message ||
          'Không thể tải danh sách khoản chi.',
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

      await Promise.all([fetchExpenses(), fetchCategories()]);

      setLoading(false);
    };

    loadData();
  }, [fetchExpenses, fetchCategories]);

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
      setError('Vui lòng nhập nội dung khoản chi.');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Số tiền phải lớn hơn 0.');
      return;
    }

    if (!form.expenseDate) {
      setError('Vui lòng chọn ngày chi.');
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
      expenseDate: form.expenseDate,
      categoryId: Number(form.categoryId),
    };

    if (userId) {
      payload.userId = Number(userId);
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await axiosClient.patch(`/expenses/${editingId}`, payload);
        setMessage('Cập nhật khoản chi thành công.');
      } else {
        await axiosClient.post('/expenses', payload);
        setMessage('Thêm khoản chi thành công.');
      }

      resetForm();
      await fetchExpenses();
    } catch (err) {
      console.error('Lỗi lưu khoản chi:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể lưu khoản chi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    const categoryId =
      expense.categoryId ||
      expense.category?.id ||
      '';

    setForm({
      description: expense.description || '',
      amount: expense.amount || '',
      expenseDate: expense.expenseDate
        ? String(expense.expenseDate).slice(0, 10)
        : new Date().toISOString().slice(0, 10),
      categoryId: String(categoryId),
    });

    setEditingId(expense.id);
    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn xóa khoản chi này không?',
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setMessage('');

      await axiosClient.delete(`/expenses/${id}`);

      setMessage('Xóa khoản chi thành công.');

      if (editingId === id) {
        resetForm();
      }

      await fetchExpenses();
    } catch (err) {
      console.error('Lỗi xóa khoản chi:', err);

      setError(
        err.response?.data?.message ||
          'Không thể xóa khoản chi.',
      );
    }
  };

  const getCategoryName = (expense) => {
    if (typeof expense.category === 'string') {
      return expense.category;
    }

    if (expense.category?.name) {
      return expense.category.name;
    }

    if (expense.category?.categoryName) {
      return expense.category.categoryName;
    }

    const categoryId =
      expense.categoryId ||
      expense.category?.id;

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
          <h2 className="mb-1">Quản lý chi tiêu</h2>
          <p className="text-muted mb-0">
            Thêm, sửa và theo dõi các khoản chi của bạn.
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
            {editingId ? 'Cập nhật khoản chi' : 'Thêm khoản chi'}
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
                  placeholder="Ví dụ: Ăn sáng"
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
                  htmlFor="expenseDate"
                  className="form-label"
                >
                  Ngày chi
                </label>

                <input
                  id="expenseDate"
                  name="expenseDate"
                  type="date"
                  className="form-control"
                  value={form.expenseDate}
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
                      : 'Thêm khoản chi'}
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
              Danh sách khoản chi
            </h5>

            <span className="badge text-bg-secondary">
              {expenses.length} khoản
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
          ) : expenses.length === 0 ? (
            <div className="alert alert-light text-center mb-0">
              Chưa có khoản chi nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Nội dung</th>
                    <th>Danh mục</th>
                    <th>Ngày chi</th>
                    <th className="text-end">Số tiền</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {expenses.map((expense, index) => (
                    <tr key={expense.id}>
                      <td>{index + 1}</td>

                      <td>{expense.description}</td>

                      <td>
                        <span className="badge text-bg-light">
                          {getCategoryName(expense)}
                        </span>
                      </td>

                      <td>
                        {expense.expenseDate
                          ? new Date(
                              expense.expenseDate,
                            ).toLocaleDateString('vi-VN')
                          : ''}
                      </td>

                      <td className="text-end fw-semibold text-success">
                        {displayCurrency(expense.amount)}
                      </td>

                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEdit(expense)}
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(expense.id)
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

export default Expenses;