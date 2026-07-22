import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((previousState) => !previousState);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      <div
        className={`sidebar-wrapper ${
          sidebarOpen ? 'sidebar-open' : ''
        }`}
      >
        <Sidebar />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={handleCloseSidebar}
          aria-label="Đóng menu"
        />
      )}

      <div className="app-main">
        <Topbar onToggleSidebar={handleToggleSidebar} />

        <main className="app-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          © {new Date().getFullYear()} Expense Management
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;