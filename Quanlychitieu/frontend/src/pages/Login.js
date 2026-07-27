import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
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
      const response = await axiosClient.post(
        '/auth/login',
        form,
      );

      localStorage.setItem(
        'access_token',
        response.data.access_token,
      );

      localStorage.setItem(
        'current_user',
        JSON.stringify(response.data.user),
      );

      navigate('/');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Left Side Hero Banner */}
        <div className="auth-hero">
          <div className="auth-hero-glow" />

          <div className="auth-hero-brand">
            <div className="auth-hero-logo">
              <i className="bi bi-wallet2" />
            </div>
            <h3>Expense Manager</h3>
          </div>

          <div className="auth-hero-content">
            <div className="auth-hero-tagline">
              <i className="bi bi-stars" /> Giải pháp tài chính cá nhân
            </div>

            <h1 className="auth-hero-title">
              Quản Lý Chi Tiêu<br />Thông Minh & Hiệu Quả
            </h1>

            <p className="auth-hero-desc">
              Theo dõi dòng tiền, kiểm soát ngân sách và tối ưu hóa tài chính của bạn một cách dễ dàng và trực quan.
            </p>

            <div className="auth-hero-features">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-pie-chart-fill" />
                </div>
                <div className="auth-feature-text">
                  <strong>Báo cáo trực quan</strong>
                  <span>Phân tích chi tiêu qua biểu đồ tự động</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-shield-check" />
                </div>
                <div className="auth-feature-text">
                  <strong>Bảo mật cao</strong>
                  <span>Dữ liệu giao dịch luôn được mã hóa an toàn</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-hero-footer">
            © 2026 Expense Management. All rights reserved.
          </div>
        </div>

        {/* Right Side Form Card */}
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Đăng nhập</h2>
            <p>Vui lòng nhập thông tin để truy cập hệ thống</p>
          </div>

          {error && (
            <div className="auth-alert">
              <i className="bi bi-exclamation-triangle-fill" />
              <div>{Array.isArray(error) ? error.join(', ') : error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Tên đăng nhập</label>
              <div className="auth-input-group">
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <i className="bi bi-person auth-input-icon" />
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label mb-0">Mật khẩu</label>
              </div>
              <div className="auth-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <i className="bi bi-lock auth-input-icon" />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  aria-label="Toggle password visibility"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-auth-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            Chưa có tài khoản?{' '}
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;