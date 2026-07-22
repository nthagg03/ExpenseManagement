import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';

const initialForm = {
  name: '',
  description: '',
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setError('');

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
      await fetchCategories();
      setLoading(false);
    };

    loadData();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || '';
      const description = category.description?.toLowerCase() || '';

      return name.includes(keyword) || description.includes(keyword);
    });
  }, [categories, searchKeyword]);

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

    setMessage('');
    setError('');

    const categoryName = form.name.trim();
    const categoryDescription = form.description.trim();

    if (!categoryName) {
      setError('Vui lòng nhập tên danh mục.');
      return;
    }

    if (categoryName.length > 100) {
      setError('Tên danh mục không được vượt quá 100 ký tự.');
      return;
    }

    if (categoryDescription.length > 255) {
      setError('Mô tả không được vượt quá 255 ký tự.');
      return;
    }

    const payload = {
      name: categoryName,
      description: categoryDescription || undefined,
    };

    try {
      setSubmitting(true);

      if (editingId) {
        await axiosClient.patch(`/categories/${editingId}`, payload);
        setMessage('Cập nhật danh mục thành công.');
      } else {
        await axiosClient.post('/categories', payload);
        setMessage('Thêm danh mục thành công.');
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage || 'Không thể lưu danh mục.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name || '',
      description: category.description || '',
    });

    setEditingId(category.id);
    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setError('');

      await axiosClient.delete(`/categories/${category.id}`);

      if (editingId === category.id) {
        resetForm();
      }

      setMessage('Xóa danh mục thành công.');
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);

      const responseMessage = err.response?.data?.message;

      setError(
        Array.isArray(responseMessage)
          ? responseMessage.join(', ')
          : responseMessage ||
              'Không thể xóa danh mục. Danh mục có thể đang được sử dụng.',
      );
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Quản lý danh mục</h2>

          <p className="text-muted mb-0">
            Tạo và quản lý các nhóm thu nhập, chi tiêu trong hệ thống.
          </p>
        </div>

        <div className="d-flex gap-2">
          <span className="badge rounded-pill text-bg-primary px-3 py-2">
            Tổng: {categories.length}
          </span>

          <span className="badge rounded-pill text-bg-light border px-3 py-2">
            Hiển thị: {filteredCategories.length}
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
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                  style={{
                    width: 48,
                    height: 48,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {editingId ? '✎' : '+'}
                </div>

                <div>
                  <h5 className="fw-bold mb-1">
                    {editingId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
                  </h5>

                  <p className="text-muted small mb-0">
                    {editingId
                      ? 'Chỉnh sửa thông tin danh mục đã chọn.'
                      : 'Tạo danh mục mới cho thu nhập hoặc chi tiêu.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Tên danh mục
                    <span className="text-danger ms-1">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Ví dụ: Ăn uống"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                  />

                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Tên ngắn gọn, dễ nhận biết.
                    </small>

                    <small className="text-muted">
                      {form.name.length}/100
                    </small>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="form-label fw-semibold"
                  >
                    Mô tả
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    className="form-control"
                    placeholder="Ví dụ: Các khoản chi cho ăn sáng, ăn trưa..."
                    rows="5"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={255}
                  />

                  <div className="text-end mt-1">
                    <small className="text-muted">
                      {form.description.length}/255
                    </small>
                  </div>
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
                        : 'Thêm danh mục'}
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
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h5 className="fw-bold mb-1">Danh sách danh mục</h5>

                  <p className="text-muted small mb-0">
                    Quản lý tất cả danh mục hiện có trong hệ thống.
                  </p>
                </div>

                <div
                  className="input-group"
                  style={{
                    maxWidth: 320,
                  }}
                >
                  <span className="input-group-text bg-white">⌕</span>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm danh mục..."
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
                    <span className="visually-hidden">Đang tải...</span>
                  </div>

                  <p className="text-muted mt-3 mb-0">
                    Đang tải danh sách danh mục...
                  </p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-5">
                  <div
                    className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: 72,
                      height: 72,
                      fontSize: 30,
                    }}
                  >
                    📁
                  </div>

                  <h6 className="fw-bold">
                    {searchKeyword
                      ? 'Không tìm thấy danh mục phù hợp'
                      : 'Chưa có danh mục nào'}
                  </h6>

                  <p className="text-muted mb-0">
                    {searchKeyword
                      ? 'Hãy thử tìm kiếm bằng từ khóa khác.'
                      : 'Hãy thêm danh mục đầu tiên bằng biểu mẫu bên trái.'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: 70 }}>STT</th>
                        <th>Tên danh mục</th>
                        <th>Mô tả</th>
                        <th
                          className="text-center"
                          style={{ width: 180 }}
                        >
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCategories.map((category, index) => (
                        <tr key={category.id}>
                          <td className="text-muted">{index + 1}</td>

                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                                style={{
                                  width: 42,
                                  height: 42,
                                  flexShrink: 0,
                                }}
                              >
                                {category.name
                                  ? category.name
                                      .trim()
                                      .charAt(0)
                                      .toUpperCase()
                                  : '?'}
                              </div>

                              <div>
                                <div className="fw-semibold">
                                  {category.name}
                                </div>

                                <small className="text-muted">
                                  Mã danh mục: #{category.id}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            {category.description ? (
                              <span>{category.description}</span>
                            ) : (
                              <span className="text-muted fst-italic">
                                Chưa có mô tả
                              </span>
                            )}
                          </td>

                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary px-3"
                                onClick={() => handleEdit(category)}
                              >
                                Sửa
                              </button>

                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger px-3"
                                onClick={() => handleDelete(category)}
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
      </div>
    </div>
  );
}

export default Categories;