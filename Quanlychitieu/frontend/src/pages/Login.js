import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', form);

      localStorage.setItem(
        'access_token',
        response.data.access_token,
      );

      localStorage.setItem(
        'current_user',
        JSON.stringify({
          username: form.username,
        }),
      );

      navigate('/');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Đăng nhập thất bại',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <i className="bi bi-wallet2" />
          </div>

          <div>
            <h2>Expense Management</h2>
            <p>Đăng nhập để quản lý tài chính</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            {Array.isArray(error) ? error.join(', ') : error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">
              Tên đăng nhập
            </label>

            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Nhập username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Mật khẩu
            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;