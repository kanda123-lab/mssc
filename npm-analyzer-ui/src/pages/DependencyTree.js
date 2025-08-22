import React, { useState } from 'react';
import PackageSearch from '../components/PackageSearch';
import LoadingSpinner from '../components/LoadingSpinner';

const DependencyTreePage = () => {
  const [loading, setLoading] = useState(false);

  const handleSearch = (packageName) => {
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="dependency-tree-page">
      <div className="page-header">
        <h1>Dependency Tree Analyzer</h1>
        <p>Visualize and analyze package dependency hierarchies</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Search Package</h2>
        </div>
        <PackageSearch onSearch={handleSearch} />
      </div>

      {loading && <LoadingSpinner message="Building dependency tree..." />}

      <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.7 }}>🌳</div>
        <h2>Dependency Tree Visualization</h2>
        <p>Enter a package name to visualize its complete dependency hierarchy</p>
      </div>
    </div>
  );
};

export default DependencyTreePage;