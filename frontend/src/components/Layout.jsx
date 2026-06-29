import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Layers
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get active page name based on path
  const getPageName = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/projects/')) return 'Project Workspace';
    if (path === '/projects') return 'Projects';
    if (path === '/tasks') return 'Tasks';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    return 'TaskFlow Pro';
  };

  // Helper to construct avatar path
  const getAvatarUrl = () => {
    if (user?.avatar) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
      return `${baseUrl.replace('/api', '')}/uploads/${user.avatar}`;
    }
    // Fallback to initial avatar generator
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff&bold=true`;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={20} /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="app-container">
      {/* Mobile Menu Button */}
      <div style={{ display: 'none' }} className="mobile-toggle-bar">
        {/* Managed responsively via CSS toggles or inline styles for quick execution */}
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Layers size={26} style={{ color: 'var(--primary)' }} />
          <span>TaskFlow Pro</span>
        </div>

        <ul className="sidebar-menu">
          {navItems.map((item) => (
            <li key={item.name} className="sidebar-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
          <li className="sidebar-item" style={{ marginTop: 'auto' }}>
            <button 
              onClick={handleLogout} 
              className="sidebar-link" 
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </li>
        </ul>

        {/* User Mini Profile */}
        <div className="sidebar-profile">
          <img 
            src={getAvatarUrl()} 
            alt={user?.name || 'User Avatar'} 
            className="avatar" 
          />
          <div style={{ overflow: 'hidden' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.name}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="main-content">
        <header className="header">
          <div className="flex-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon"
              style={{ display: window.innerWidth <= 768 ? 'block' : 'none', background: 'none', border: 'none' }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{getPageName()}</h1>
          </div>
          
          <div className="flex-center">
            <div style={{ textAlign: 'right', display: window.innerWidth <= 768 ? 'none' : 'block' }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>Welcome back,</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.name}</p>
            </div>
            <img 
              src={getAvatarUrl()} 
              alt={user?.name || 'User Avatar'} 
              className="avatar" 
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </header>

        {/* Children Render Area */}
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
