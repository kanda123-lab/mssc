import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/analyze', label: 'Package Analysis', icon: '🔍' },
    { path: '/dependencies', label: 'Dependency Tree', icon: '🌳' },
    { path: '/security', label: 'Security Analysis', icon: '🛡️' },
    { path: '/bundle', label: 'Bundle Analysis', icon: '📦' },
    { path: '/compare', label: 'Compare Packages', icon: '⚖️' },
    { path: '/reports', label: 'Reports', icon: '📄' }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;