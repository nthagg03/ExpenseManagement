import { useNavigate } from 'react-router-dom';

function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem('current_user') || 'null',
      );
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();

  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email ||
    'Người dùng';

  const handleLogout = () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn đăng xuất không?',
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');

    navigate('/login', {
      replace: true,
    });
  };

  return (
    <header className="app-topbar">
      <button
        type="button"
        className="btn btn-light d-lg-none"
        onClick={onToggleSidebar}
        aria-label="Mở menu"
      >
        <i className="bi bi-list fs-4" />
      </button>

      <div className="d-none d-md-block">
        <div className="fw-semibold">
          Xin chào, {displayName}
        </div>

        <small className="text-muted">
          Chúc bạn có một ngày tài chính hiệu quả.
        </small>
      </div>

      <div className="dropdown ms-auto">
        <button
          className="btn btn-light border dropdown-toggle d-flex align-items-center gap-2"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: 36,
              height: 36,
            }}
          >
            {String(displayName).charAt(0).toUpperCase()}
          </div>

          <span className="d-none d-sm-inline text-truncate">
            {displayName}
          </span>
        </button>

        <ul className="dropdown-menu dropdown-menu-end shadow border-0">
          <li>
            <div className="dropdown-item-text">
              <div className="fw-semibold">
                {displayName}
              </div>

              {currentUser?.email && (
                <small className="text-muted">
                  {currentUser.email}
                </small>
              )}
            </div>
          </li>

          <li>
            <hr className="dropdown-divider" />
          </li>

          <li>
            <button
              type="button"
              className="dropdown-item text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Topbar;