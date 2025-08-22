import React from 'react';
import { useNavigate } from 'react-router-dom';

const RecentAnalyses = ({ packages = [] }) => {
  const navigate = useNavigate();
  
  // Mock data for demonstration
  const mockPackages = [
    { name: 'react', version: '18.2.0', analyzedAt: '2 hours ago', size: '42.2 KB' },
    { name: 'lodash', version: '4.17.21', analyzedAt: '1 day ago', size: '69.9 KB' },
    { name: 'axios', version: '1.4.0', analyzedAt: '2 days ago', size: '13.3 KB' },
    { name: 'moment', version: '2.29.4', analyzedAt: '3 days ago', size: '67.9 KB' }
  ];

  const recentPackages = packages.length > 0 ? packages : mockPackages;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Recent Analyses</h2>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/reports')}
        >
          View All
        </button>
      </div>
      
      {recentPackages.length > 0 ? (
        <div className="recent-list">
          {recentPackages.map((pkg, index) => (
            <div 
              key={index}
              className="recent-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < recentPackages.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/analyze/${pkg.name}`)}
            >
              <div>
                <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  {pkg.name}@{pkg.version}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {pkg.analyzedAt}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {pkg.size}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }}>📊</div>
          <p>No recent analyses found</p>
        </div>
      )}
    </div>
  );
};

export default RecentAnalyses;