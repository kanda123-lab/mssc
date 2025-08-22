import React from 'react';

const BundleChart = ({ bundleSize }) => {
  if (!bundleSize) {
    return (
      <div className="text-center p-6">
        <p>No bundle size data available</p>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bundle-chart">
      <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Uncompressed Size</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
            {formatBytes(bundleSize.uncompressed)}
          </div>
        </div>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Gzipped Size</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
            {formatBytes(bundleSize.gzipped)}
          </div>
        </div>
      </div>
      
      <div className="info-panel" style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '6px' }}>
        <h4 style={{ marginBottom: '12px' }}>Bundle Information</h4>
        <div style={{ display: 'grid', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tree-shakable:</span>
            <span className={`badge ${bundleSize.treeshakable ? 'badge-success' : 'badge-warning'}`}>
              {bundleSize.treeshakable ? 'Yes' : 'No'}
            </span>
          </div>
          {bundleSize.bundleAnalysisUrl && (
            <div style={{ marginTop: '12px' }}>
              <a 
                href={bundleSize.bundleAnalysisUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Detailed Analysis
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BundleChart;