import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    path: '/',
    label: 'Tổng quan',
    icon: 'bi-grid-1x2-fill',
    end: true,
  },
  {
    path: '/expenses',
    label: 'Chi tiêu',
    icon: 'bi-arrow-down-circle-fill',
  },
  {
    path: '/incomes',
    label: 'Thu nhập',
    icon: 'bi-arrow-up-circle-fill',
  },
  {
    path: '/categories',
    label: 'Danh mục',
    icon: 'bi-tags-fill',
  },
  {
    path: '/budgets',
    label: 'Ngân sách',
    icon: 'bi-pie-chart-fill',
  },
];

function Sidebar() {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="bi bi-wallet2" />
        </div>

        <div>
          <div className="brand-title">Expense Manager</div>
          <div className="brand-subtitle">Quản lý tài chính cá nhân</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="sidebar-label">DÀNH CHO BẠN</div>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <i className={`bi ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="small opacity-75">
          Expense Manager v2.0
        </div>
        <div className="small opacity-50 mt-1">
          Bảo mật & Tự động
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;