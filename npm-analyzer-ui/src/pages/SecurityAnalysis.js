import React, { useState } from 'react';
import PackageSearch from '../components/PackageSearch';
import LoadingSpinner from '../components/LoadingSpinner';

const SecurityAnalysisPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSearch = (packageName) => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="security-analysis-page">
      <div className="page-header">
        <h1>Security Analysis</h1>
        <p>Scan packages for vulnerabilities and security issues</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Search Package</h2>
        </div>
        <PackageSearch onSearch={handleSearch} />
      </div>

      {loading && <LoadingSpinner message="Scanning for vulnerabilities..." />}

      <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.7 }}>🛡️</div>
        <h2>Security Scanner</h2>
        <p>Enter a package name to check for known vulnerabilities and security advisories</p>
      </div>
    </div>
  );
};

export default SecurityAnalysisPage;