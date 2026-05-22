import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        {/* Mobile menu button */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed', top: '16px', left: '16px', zIndex: 30,
            display: 'none'
          }}
          id="mobile-menu-btn"
        >
          <HiOutlineMenuAlt2 size={22} />
        </button>
        <Outlet />
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          .sidebar-overlay { display: block !important; }
        }
      `}</style>
    </div>
  );
}

export default Layout;
