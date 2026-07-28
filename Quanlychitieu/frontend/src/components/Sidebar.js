import { NavLink } from 'react-router-dom';

function Sidebar({ onNavigate }) {
  const menuItems = [
    {
      path: '/',
      label: 'Tổng quan',
      icon: 'bi-speedometer2',
      end: true,
    },
    {
      path: '/expenses',
      label: 'Chi tiêu',
      icon: 'bi-wallet2',
    },
    {
      path: '/incomes',
      label: 'Thu nhập',
      icon: 'bi-cash-stack',
    },
    {
      path: '/categories',
      label: 'Danh mục',
      icon: 'bi-tags',
    },
    {
      path: '/budgets',
      label: 'Ngân sách',
      icon: 'bi-piggy-bank',
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="bi bi-wallet2" />
        </div>

        <div>
          <div className="brand-title">
            Expense Manager
          </div>

          <div className="brand-subtitle">
            Quản lý tài chính
          </div>
        </div>
      </div>

      <div className="sidebar-label">
        Menu chính
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? 'active' : ''
              }`
            }
          >
            <i className={`bi ${item.icon}`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="brand-subtitle">
          Theo dõi chi tiêu thông minh
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;