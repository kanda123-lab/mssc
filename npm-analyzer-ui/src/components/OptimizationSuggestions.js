import React from 'react';

const OptimizationSuggestions = ({ optimizations }) => {
  if (!optimizations || optimizations.length === 0) {
    return (
      <div className="text-center p-6">
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>⚡</div>
        <h3>No Optimization Suggestions</h3>
        <p style={{ color: 'var(--text-secondary)' }}>This package appears to be well optimized!</p>
      </div>
    );
  }

  const getImpactColor = (impact) => {
    switch (impact?.toLowerCase()) {
      case 'very_high': return 'var(--error-color)';
      case 'high': return '#f97316';
      case 'medium': return 'var(--warning-color)';
      case 'low': return 'var(--info-color)';
      default: return 'var(--text-muted)';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'remove_unused': return '🗑️';
      case 'tree_shaking': return '🌳';
      case 'code_splitting': return '✂️';
      case 'dynamic_import': return '🔄';
      case 'bundle_splitting': return '📦';
      case 'alternative_package': return '🔄';
      case 'version_update': return '⬆️';
      case 'peer_dependency': return '🔗';
      default: return '⚡';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'Unknown savings';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="optimization-suggestions">
      <div style={{ marginBottom: '24px' }}>
        <h3>Optimization Suggestions</h3>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>
          Recommendations to improve your bundle size and performance
        </p>
      </div>

      <div className="suggestions-list" style={{ display: 'grid', gap: '20px' }}>
        {optimizations.map((suggestion, index) => (
          <div key={index} className="suggestion-card" style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            background: 'var(--bg-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                {getTypeIcon(suggestion.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>
                    {suggestion.title}
                  </h4>
                  <span 
                    className="badge"
                    style={{
                      background: `${getImpactColor(suggestion.impact)}20`,
                      color: getImpactColor(suggestion.impact),
                      textTransform: 'capitalize',
                      flexShrink: 0,
                      marginLeft: '12px'
                    }}
                  >
                    {suggestion.impact} Impact
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: '1.6' }}>
                  {suggestion.description}
                </p>
                
                <div className="suggestion-metrics" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Potential Savings</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>
                      {formatBytes(suggestion.potentialSavings)}
                    </div>
                  </div>
                  
                  <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Difficulty</div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {suggestion.difficulty || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {suggestion.recommendation && (
              <div style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Recommendation:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  {suggestion.recommendation}
                </p>
              </div>
            )}

            {suggestion.codeExample && (
              <div style={{
                background: '#1e293b',
                color: '#e2e8f0',
                padding: '16px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                overflow: 'auto',
                border: '1px solid #334155'
              }}>
                <div style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}>
                  Example:
                </div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {suggestion.codeExample}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'var(--bg-tertiary)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)'
      }}>
        <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>💡 Pro Tip</h4>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Implement these optimizations gradually and test your application after each change. 
          Some optimizations may require build tool configuration or code restructuring.
        </p>
      </div>
    </div>
  );
};

export default OptimizationSuggestions;