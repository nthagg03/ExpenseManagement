function Topbar() {
  const user = JSON.parse(localStorage.getItem('current_user') || '{}');

  return (
    <header className="topbar">
      <div>
        <h5 className="mb-0">Hệ thống quản lý chi tiêu</h5>
        <small className="text-muted">
          Theo dõi thu nhập, chi tiêu và ngân sách
        </small>
      </div>

      <div className="topbar-user">
        <div className="avatar">
          {(user.username || 'U').charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>{user.username || 'Người dùng'}</strong>
          <div className="small text-muted">{user.email || ''}</div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;