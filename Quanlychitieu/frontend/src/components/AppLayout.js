import { useEffect, useState } from 'react';
import {
  Outlet,
  useLocation,
} from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

import './AppLayout.css';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const location = useLocation();

  const handleToggleSidebar = () => {
    setSidebarOpen((previousState) => {
      return !previousState;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    handleCloseSidebar();
  }, [location.pathname]);

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleCloseSidebar();
      }
    };

    document.addEventListener(
      'keydown',
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscapeKey,
      );
    };
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add(
        'sidebar-body-locked',
      );
    } else {
      document.body.classList.remove(
        'sidebar-body-locked',
      );
    }

    return () => {
      document.body.classList.remove(
        'sidebar-body-locked',
      );
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-wrapper ${
          sidebarOpen ? 'sidebar-open' : ''
        }`}
      >
        <Sidebar
          onNavigate={handleCloseSidebar}
        />
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
        <Topbar
          onToggleSidebar={
            handleToggleSidebar
          }
          sidebarOpen={sidebarOpen}
        />

        <main className="app-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          © {new Date().getFullYear()} Expense
          Management
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;