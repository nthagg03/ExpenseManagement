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
        className="topbar-menu-btn d-lg-none"
        onClick={onToggleSidebar}
        aria-label="Mở menu"
      >
        <i className="bi bi-list" />
      </button>

      <div className="topbar-greeting d-none d-md-block">
        <div className="topbar-greeting-title">
          Xin chào, <strong>{displayName}</strong> 👋
        </div>
        <div className="topbar-greeting-sub">
          Chúc bạn có một ngày tài chính hiệu quả.
        </div>
      </div>

      <div className="ms-auto dropdown">
        <button
          className="topbar-user-btn dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <div className="topbar-avatar">
            {String(displayName).charAt(0).toUpperCase()}
          </div>

          <span className="d-none d-sm-inline topbar-user-name">
            {displayName}
          </span>

          <i className="bi bi-chevron-down topbar-chevron" />
        </button>

        <ul className="dropdown-menu dropdown-menu-end topbar-dropdown shadow border-0">
          <li className="topbar-dropdown-header">
            <div className="topbar-dropdown-avatar">
              {String(displayName).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="topbar-dropdown-name">{displayName}</div>
              {currentUser?.email && (
                <div className="topbar-dropdown-email">
                  {currentUser.email}
                </div>
              )}
            </div>
          </li>

          <li><hr className="dropdown-divider my-1" /></li>

          <li>
            <button
              type="button"
              className="dropdown-item topbar-logout-btn"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right" />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Topbar;