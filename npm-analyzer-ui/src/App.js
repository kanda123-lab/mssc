import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PackageAnalysis from './pages/PackageAnalysis';
import DependencyTree from './pages/DependencyTree';
import SecurityAnalysis from './pages/SecurityAnalysis';
import BundleAnalysis from './pages/BundleAnalysis';
import PackageComparison from './pages/PackageComparison';
import Reports from './pages/Reports';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        <Header 
          onToggleSidebar={toggleSidebar} 
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />
        <div className="app-body">
          <Sidebar isOpen={sidebarOpen} />
          <main className={`main-content ${sidebarOpen ? 'with-sidebar' : ''}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analyze" element={<PackageAnalysis />} />
              <Route path="/analyze/:packageName" element={<PackageAnalysis />} />
              <Route path="/dependencies" element={<DependencyTree />} />
              <Route path="/dependencies/:packageName" element={<DependencyTree />} />
              <Route path="/security" element={<SecurityAnalysis />} />
              <Route path="/security/:packageName" element={<SecurityAnalysis />} />
              <Route path="/bundle" element={<BundleAnalysis />} />
              <Route path="/bundle/:packageName" element={<BundleAnalysis />} />
              <Route path="/compare" element={<PackageComparison />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;