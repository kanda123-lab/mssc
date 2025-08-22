import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import PackageSearch from '../components/PackageSearch';
import BundleChart from '../components/BundleChart';
import SecurityPanel from '../components/SecurityPanel';
import DependencyTree from '../components/DependencyTree';
import AlternativesPanel from '../components/AlternativesPanel';
import OptimizationSuggestions from '../components/OptimizationSuggestions';
import LoadingSpinner from '../components/LoadingSpinner';
import './PackageAnalysis.css';

const PackageAnalysis = () => {
  const { packageName: urlPackageName } = useParams();
  const navigate = useNavigate();
  
  const [packageName, setPackageName] = useState(urlPackageName || '');
  const [version, setVersion] = useState('latest');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (urlPackageName) {
      setPackageName(urlPackageName);
      analyzePackage(urlPackageName, version);
    }
  }, [urlPackageName, version]);

  const analyzePackage = async (pkg, ver = 'latest') => {
    if (!pkg.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.analyzePackage(pkg, ver);
      setAnalysis(result);
      
      // Update URL if needed
      if (pkg !== urlPackageName) {
        navigate(`/analyze/${pkg}`, { replace: true });
      }
    } catch (err) {
      setError(err.message);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchPackage) => {
    setPackageName(searchPackage);
    analyzePackage(searchPackage, version);
  };

  const handleVersionChange = (newVersion) => {
    setVersion(newVersion);
    if (packageName) {
      analyzePackage(packageName, newVersion);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'bundle', label: 'Bundle Analysis', icon: '📦' },
    { id: 'dependencies', label: 'Dependencies', icon: '🌳' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'alternatives', label: 'Alternatives', icon: '🔄' },
    { id: 'optimization', label: 'Optimization', icon: '⚡' }
  ];

  return (
    <div className="package-analysis">
      {/* Search Header */}
      <div className="analysis-header">
        <h1>Package Analysis</h1>
        <div className="search-section">
          <PackageSearch 
            onSearch={handleSearch}
            placeholder="Enter package name to analyze..."
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <LoadingSpinner message="Analyzing package..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card">
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <strong>Analysis Failed</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Package Header */}
          <div className="card">
            <div className="package-header">
              <div className="package-info">
                <h2 className="package-title">
                  {analysis.packageName}
                  <span className="package-version">@{analysis.version}</span>
                </h2>
                <p className="package-description">{analysis.description}</p>
                <div className="package-meta">
                  {analysis.author && (
                    <span className="meta-item">
                      <strong>Author:</strong> {analysis.author}
                    </span>
                  )}
                  {analysis.license && (
                    <span className="meta-item">
                      <strong>License:</strong> {analysis.license}
                    </span>
                  )}
                  {analysis.homepage && (
                    <a href={analysis.homepage} target="_blank" rel="noopener noreferrer" className="meta-link">
                      🏠 Homepage
                    </a>
                  )}
                  {analysis.repository && (
                    <a href={analysis.repository} target="_blank" rel="noopener noreferrer" className="meta-link">
                      📁 Repository
                    </a>
                  )}
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stat-item">
                  <div className="stat-value">{formatBytes(analysis.bundleSize?.uncompressed)}</div>
                  <div className="stat-label">Bundle Size</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{analysis.dependencies?.dependenciesCount || 0}</div>
                  <div className="stat-label">Dependencies</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{analysis.security?.vulnerabilityCount || 0}</div>
                  <div className="stat-label">Vulnerabilities</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formatNumber(analysis.popularity?.weeklyDownloads)}</div>
                  <div className="stat-label">Weekly Downloads</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="tabs-container">
              <div className="tabs-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="overview-grid">
                      <div className="overview-section">
                        <h3>Bundle Information</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Uncompressed:</span>
                            <span className="info-value">{formatBytes(analysis.bundleSize?.uncompressed)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Gzipped:</span>
                            <span className="info-value">{formatBytes(analysis.bundleSize?.gzipped)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Tree-shakable:</span>
                            <span className={`badge ${analysis.bundleSize?.treeshakable ? 'badge-success' : 'badge-warning'}`}>
                              {analysis.bundleSize?.treeshakable ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="overview-section">
                        <h3>Popularity Metrics</h3>
                        <div className="info-grid">
                          <div className="info-item">
                            <span className="info-label">Weekly Downloads:</span>
                            <span className="info-value">{formatNumber(analysis.popularity?.weeklyDownloads)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">GitHub Stars:</span>
                            <span className="info-value">{formatNumber(analysis.popularity?.githubStars)}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">Quality Score:</span>
                            <span className="info-value">{(analysis.popularity?.qualityScore * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'bundle' && (
                  <BundleChart bundleSize={analysis.bundleSize} />
                )}

                {activeTab === 'dependencies' && (
                  <DependencyTree dependencies={analysis.dependencies} />
                )}

                {activeTab === 'security' && (
                  <SecurityPanel security={analysis.security} />
                )}

                {activeTab === 'alternatives' && (
                  <AlternativesPanel 
                    alternatives={analysis.alternatives} 
                    currentPackage={analysis.packageName}
                  />
                )}

                {activeTab === 'optimization' && (
                  <OptimizationSuggestions optimizations={analysis.optimizations} />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && !analysis && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>Ready to Analyze</h2>
          <p>Enter a package name above to start analyzing bundle size, dependencies, and security.</p>
        </div>
      )}
    </div>
  );
};

export default PackageAnalysis;