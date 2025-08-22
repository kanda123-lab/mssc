import React from 'react';

const SecurityPanel = ({ security }) => {
  if (!security) {
    return (
      <div className="text-center p-6">
        <p>No security data available</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'var(--error-color)';
      case 'high': return '#f97316';
      case 'moderate': return 'var(--warning-color)';
      case 'low': return 'var(--info-color)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="security-panel">
      {/* Security Overview */}
      <div className="grid grid-3" style={{ gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: security.vulnerabilityCount > 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
            {security.vulnerabilityCount}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Vulnerabilities</div>
        </div>
        
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {security.licenseCompatibility || 'Unknown'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>License Type</div>
        </div>
        
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: security.hasDeprecatedDependencies ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {security.hasDeprecatedDependencies ? 'Yes' : 'No'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Deprecated Deps</div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      {security.vulnerabilities && security.vulnerabilities.length > 0 && (
        <div className="vulnerabilities-section">
          <h3 style={{ marginBottom: '16px' }}>Security Vulnerabilities</h3>
          <div className="vulnerabilities-list" style={{ display: 'grid', gap: '12px' }}>
            {security.vulnerabilities.map((vuln, index) => (
              <div 
                key={index} 
                className="vulnerability-item" 
                style={{ 
                  padding: '16px', 
                  border: `1px solid ${getSeverityColor(vuln.severity)}`, 
                  borderRadius: '6px',
                  background: `${getSeverityColor(vuln.severity)}10`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{vuln.title || vuln.id}</h4>
                  <span 
                    className="badge"
                    style={{ 
                      background: `${getSeverityColor(vuln.severity)}20`,
                      color: getSeverityColor(vuln.severity),
                      textTransform: 'uppercase'
                    }}
                  >
                    {vuln.severity}
                  </span>
                </div>
                {vuln.description && (
                  <p style={{ color: 'var(--text-secondary)', margin: '8px 0', fontSize: '14px' }}>
                    {vuln.description}
                  </p>
                )}
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {vuln.cve && <span style={{ marginRight: '16px' }}>CVE: {vuln.cve}</span>}
                  {vuln.cvssScore && <span>CVSS: {vuln.cvssScore}</span>}
                </div>
                {vuln.recommendation && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '14px' }}>
                    <strong>Recommendation:</strong> {vuln.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deprecated Packages */}
      {security.deprecatedPackages && security.deprecatedPackages.length > 0 && (
        <div className="deprecated-section" style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Deprecated Dependencies</h3>
          <div className="deprecated-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {security.deprecatedPackages.map((pkg, index) => (
              <span key={index} className="badge badge-warning">
                {pkg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* No Issues State */}
      {security.vulnerabilityCount === 0 && !security.hasDeprecatedDependencies && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--success-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h3>No Security Issues Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>This package appears to be secure with no known vulnerabilities.</p>
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;