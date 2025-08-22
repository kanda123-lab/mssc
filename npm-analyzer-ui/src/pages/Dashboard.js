import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PackageSearch from '../components/PackageSearch';
import FileUpload from '../components/FileUpload';
import QuickStats from '../components/QuickStats';
import RecentAnalyses from '../components/RecentAnalyses';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentPackages, setRecentPackages] = useState([]);

  const handlePackageSearch = (packageName) => {
    navigate(`/analyze/${packageName}`);
  };

  const handleFileUpload = (analysis) => {
    // Handle uploaded package.json analysis
    console.log('Analysis:', analysis);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Analyze NPM packages for bundle size, dependencies, security, and optimization opportunities</p>
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Analysis</h2>
            <p className="card-subtitle">Start analyzing a package or upload package.json</p>
          </div>
          
          <div className="quick-actions">
            <div className="action-section">
              <h3>Search Package</h3>
              <PackageSearch onSearch={handlePackageSearch} />
            </div>
            
            <div className="action-divider">
              <span>OR</span>
            </div>
            
            <div className="action-section">
              <h3>Upload package.json</h3>
              <FileUpload onUpload={handleFileUpload} />
            </div>
          </div>
        </div>

        {/* Stats and Recent Analyses */}
        <div className="dashboard-grid">
          <div className="grid-item">
            <QuickStats />
          </div>
          
          <div className="grid-item">
            <RecentAnalyses packages={recentPackages} />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card" onClick={() => navigate('/dependencies')}>
            <div className="feature-icon">🌳</div>
            <h3>Dependency Tree</h3>
            <p>Visualize and analyze your package dependency hierarchy</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/security')}>
            <div className="feature-icon">🛡️</div>
            <h3>Security Scan</h3>
            <p>Check for vulnerabilities and security issues</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/bundle')}>
            <div className="feature-icon">📦</div>
            <h3>Bundle Analysis</h3>
            <p>Analyze bundle size and optimization opportunities</p>
          </div>
          
          <div className="feature-card" onClick={() => navigate('/compare')}>
            <div className="feature-icon">⚖️</div>
            <h3>Compare Packages</h3>
            <p>Side-by-side comparison of multiple packages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;