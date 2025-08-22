import React from 'react';

const DependencyTree = ({ dependencies }) => {
  if (!dependencies) {
    return (
      <div className="text-center p-6">
        <p>No dependency data available</p>
      </div>
    );
  }

  return (
    <div className="dependency-tree">
      <div className="grid grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Dependency Summary</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Production Dependencies:</span>
              <strong>{dependencies.dependenciesCount || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Dev Dependencies:</span>
              <strong>{dependencies.devDependenciesCount || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Peer Dependencies:</span>
              <strong>{dependencies.peerDependenciesCount || 0}</strong>
            </div>
          </div>
        </div>
        
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Dependency Health</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Circular Dependencies:</span>
              <strong style={{ color: dependencies.circularDependencies?.length > 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
                {dependencies.circularDependencies?.length || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Duplicate Dependencies:</span>
              <strong style={{ color: dependencies.duplicateDependencies?.length > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
                {dependencies.duplicateDependencies?.length || 0}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Version Conflicts:</span>
              <strong style={{ color: dependencies.versionConflicts?.length > 0 ? 'var(--error-color)' : 'var(--success-color)' }}>
                {dependencies.versionConflicts?.length || 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Dependency Tree Visualization */}
      {dependencies.dependencyTree && dependencies.dependencyTree.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Dependency Tree</h3>
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
              Interactive dependency tree visualization would appear here
            </p>
            <div style={{ color: 'var(--text-secondary)' }}>
              📦 {dependencies.dependencyTree[0]?.name || 'root'}
              <div style={{ marginLeft: '20px', marginTop: '8px' }}>
                {Array.from({ length: Math.min(dependencies.dependenciesCount || 0, 5) }, (_, i) => (
                  <div key={i}>├── dependency-{i + 1}</div>
                ))}
                {(dependencies.dependenciesCount || 0) > 5 && (
                  <div>└── ... {(dependencies.dependenciesCount || 0) - 5} more dependencies</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyTree;