import React from 'react';

const AlternativesPanel = ({ alternatives, currentPackage }) => {
  if (!alternatives || alternatives.length === 0) {
    return (
      <div className="text-center p-6">
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>🔄</div>
        <h3>No Alternatives Found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>No alternative packages were found for {currentPackage}</p>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const getMigrationDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'var(--success-color)';
      case 'moderate': return 'var(--warning-color)';
      case 'hard': return '#f97316';
      case 'very_hard': return 'var(--error-color)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="alternatives-panel">
      <div style={{ marginBottom: '24px' }}>
        <h3>Alternative Packages for {currentPackage}</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
          Consider these alternatives that offer similar functionality
        </p>
      </div>

      <div className="alternatives-grid" style={{ display: 'grid', gap: '20px' }}>
        {alternatives.map((alt, index) => (
          <div key={index} className="alternative-card" style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            background: 'var(--bg-primary)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{alt.name}</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
                  {alt.description || 'No description available'}
                </p>
              </div>
              <span 
                className="badge"
                style={{
                  background: `${getMigrationDifficultyColor(alt.migrationDifficulty)}20`,
                  color: getMigrationDifficultyColor(alt.migrationDifficulty),
                  textTransform: 'capitalize',
                  flexShrink: 0,
                  marginLeft: '12px'
                }}
              >
                {alt.migrationDifficulty || 'Unknown'} Migration
              </span>
            </div>

            <div className="alternative-stats" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div className="stat-item" style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatBytes(alt.bundleSize)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bundle Size</div>
              </div>
              
              <div className="stat-item" style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatNumber(alt.weeklyDownloads)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weekly DL</div>
              </div>
              
              <div className="stat-item" style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {formatNumber(alt.githubStars)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stars</div>
              </div>
              
              <div className="stat-item" style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {alt.qualityScore ? `${(alt.qualityScore * 100).toFixed(0)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Quality</div>
              </div>
            </div>

            {alt.recommendation && (
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '6px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Recommendation:</strong> {alt.recommendation}
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <a 
                href={`https://www.npmjs.com/package/${alt.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                View on NPM
              </a>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => window.location.href = `/analyze/${alt.name}`}
              >
                Analyze Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativesPanel;