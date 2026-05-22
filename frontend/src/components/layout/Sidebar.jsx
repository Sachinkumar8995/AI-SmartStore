import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiOutlineViewGrid, 
  HiOutlineCube, 
  HiOutlineSparkles, 
  HiOutlineLightBulb,
  HiOutlineChartBar, 
  HiOutlineExclamationCircle,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineShoppingBag
} from 'react-icons/hi';

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { section: 'Overview' },
    { path: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
    { section: 'Customer View' },
    { path: '/shop', icon: HiOutlineShoppingBag, label: 'Customer Store' },
    { section: 'Management' },
    { path: '/products', icon: HiOutlineCube, label: 'Products' },
    { path: '/inventory', icon: HiOutlineExclamationCircle, label: 'Inventory' },
    { section: 'AI Tools' },
    { path: '/ai-content', icon: HiOutlineSparkles, label: 'AI Content' },
    { path: '/ai-suggestions', icon: HiOutlineLightBulb, label: 'AI Suggestions' },
    { section: 'Analytics' },
    { path: '/dashboard', icon: HiOutlineChartBar, label: 'Sales Analytics' },
  ];


  return (
    <>
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, display: 'none'
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">🧠</div>
          <div>
            <h1>SmartStore</h1>
            <span>AI Commerce Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section-title">{item.section}</div>;
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="icon" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
            }}>
              <HiOutlineUser />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{user?.name || 'Admin'}</span>
                <span style={{
                  fontSize: '0.58rem',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  background: user?.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: user?.role === 'admin' ? '#a5b4fc' : '#93c5fd',
                  border: user?.role === 'admin' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: user?.role === 'admin' ? '0 0 10px rgba(99, 102, 241, 0.2)' : '0 0 10px rgba(59, 130, 246, 0.2)',
                  letterSpacing: '0.05em'
                }}>{user?.role || 'admin'}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.storeName || 'Store'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>
            <HiOutlineLogout /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
