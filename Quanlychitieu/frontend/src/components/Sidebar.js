import { NavLink, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-wallet2" />
        <span>Expense App</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" end>
          <i className="bi bi-grid" />
          Dashboard
        </NavLink>

        <NavLink to="/expenses">
          <i className="bi bi-cash-stack" />
          Chi tiêu
        </NavLink>

        <NavLink to="/incomes">
          <i className="bi bi-graph-up-arrow" />
          Thu nhập
        </NavLink>

        <NavLink to="/categories">
          <i className="bi bi-tags" />
          Danh mục
        </NavLink>

        <NavLink to="/budgets">
          <i className="bi bi-pie-chart" />
          Ngân sách
        </NavLink>
      </nav>

      <button className="sidebar-logout" onClick={logout}>
        <i className="bi bi-box-arrow-left" />
        Đăng xuất
      </button>
    </aside>
  );
}

export default Sidebar;