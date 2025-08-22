import React from 'react';
import './Header.css';

const Header = ({ onToggleSidebar, onToggleDarkMode, darkMode }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        <div className="header-title">
          <h1>NPM Package Analyzer</h1>
          <span className="header-subtitle">Comprehensive bundle analysis & dependency management</span>
        </div>
      </div>
      <div className="header-right">
        <button className="theme-toggle" onClick={onToggleDarkMode}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default Header;