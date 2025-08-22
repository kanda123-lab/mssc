import React, { useState } from 'react';
import PackageSearch from '../components/PackageSearch';
import LoadingSpinner from '../components/LoadingSpinner';

const BundleAnalysisPage = () => {
  const [loading, setLoading] = useState(false);

  const handleSearch = (packageName) => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="bundle-analysis-page">
      <div className="page-header">
        <h1>Bundle Size Analysis</h1>
        <p>Analyze bundle sizes and find optimization opportunities</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Search Package</h2>
        </div>
        <PackageSearch onSearch={handleSearch} />
      </div>

      {loading && <LoadingSpinner message="Analyzing bundle size..." />}

      <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.7 }}>📦</div>
        <h2>Bundle Size Analyzer</h2>
        <p>Enter a package name to analyze its bundle size impact and optimization potential</p>
      </div>
    </div>
  );
};

export default BundleAnalysisPage;