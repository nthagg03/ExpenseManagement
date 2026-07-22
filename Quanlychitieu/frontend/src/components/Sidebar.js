import { NavLink } from 'react-router-dom';

const menuItems = [
  {
    path: '/',
    label: 'Tổng quan',
    icon: 'bi-grid',
    end: true,
  },
  {
    path: '/expenses',
    label: 'Chi tiêu',
    icon: 'bi-credit-card',
  },
  {
    path: '/incomes',
    label: 'Thu nhập',
    icon: 'bi-wallet2',
  },
  {
    path: '/categories',
    label: 'Danh mục',
    icon: 'bi-folder2-open',
  },
  {
    path: '/budgets',
    label: 'Ngân sách',
    icon: 'bi-bullseye',
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
          <div className="brand-subtitle">Quản lý tài chính</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="sidebar-label">MENU CHÍNH</div>

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
        <div className="small text-white-50">
          Expense Management
        </div>

        <div className="small text-white-50">
          Phiên bản 1.0
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;