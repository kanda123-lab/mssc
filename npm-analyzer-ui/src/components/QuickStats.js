import React from 'react';

const QuickStats = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Quick Stats</h2>
      </div>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div className="stat-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>25</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Packages Analyzed</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>150MB</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Bundle Size Saved</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>12</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Security Issues Found</div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info-color)' }}>8</div>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Alternatives Suggested</div>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;