import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);

    try {
      await axiosClient.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      alert('Đăng ký tài khoản thành công! Hãy đăng nhập để bắt đầu.');
      navigate('/login');
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Đăng ký thất bại. Vui lòng thử lại sau.',
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
              <i className="bi bi-person-plus-fill" /> Tham gia cùng chúng tôi
            </div>

            <h1 className="auth-hero-title">
              Tạo Tài Khoản<br />Quản Lý Chi Tiêu
            </h1>

            <p className="auth-hero-desc">
              Bắt đầu hành trình tự do tài chính của bạn ngay hôm nay chỉ với vài bước đăng ký đơn giản.
            </p>

            <div className="auth-hero-features">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-lightning-charge-fill" />
                </div>
                <div className="auth-feature-text">
                  <strong>Khởi đầu nhanh chóng</strong>
                  <span>Thiết lập tài khoản & danh mục chi tiêu trong 1 phút</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <div className="auth-feature-text">
                  <strong>Tối ưu hóa ngân sách</strong>
                  <span>Nhận cảnh báo chi tiêu vượt ngưỡng thông minh</span>
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
            <h2>Đăng ký tài khoản</h2>
            <p>Điền thông tin bên dưới để tạo tài khoản mới</p>
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
                  placeholder="Tên đăng nhập"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <i className="bi bi-person auth-input-icon" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Địa chỉ Email</label>
              <div className="auth-input-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="email@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <i className="bi bi-envelope auth-input-icon" />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
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

            <div className="mb-4">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className="auth-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <i className="bi bi-shield-lock auth-input-icon" />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                  aria-label="Toggle confirm password visibility"
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
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
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký ngay</span>
                  <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </form>

          <div className="auth-form-footer">
            Đã có tài khoản?{' '}
            <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;