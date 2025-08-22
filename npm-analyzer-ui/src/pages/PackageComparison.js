import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const PackageComparisonPage = () => {
  const [packages, setPackages] = useState(['']);
  const [loading, setLoading] = useState(false);

  const addPackage = () => {
    setPackages([...packages, '']);
  };

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const updatePackage = (index, value) => {
    const updated = [...packages];
    updated[index] = value;
    setPackages(updated);
  };

  const comparePackages = () => {
    const validPackages = packages.filter(pkg => pkg.trim());
    if (validPackages.length < 2) return;
    
    setLoading(true);
    // Simulate loading
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="package-comparison-page">
      <div className="page-header">
        <h1>Package Comparison</h1>
        <p>Compare multiple packages side by side</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Add Packages to Compare</h2>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          {packages.map((pkg, index) => (
            <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                placeholder={`Package ${index + 1} name...`}
                value={pkg}
                onChange={(e) => updatePackage(index, e.target.value)}
              />
              {packages.length > 1 && (
                <button 
                  className="btn btn-error btn-sm"
                  onClick={() => removePackage(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={addPackage}>
              Add Package
            </button>
            <button 
              className="btn btn-primary"
              onClick={comparePackages}
              disabled={packages.filter(pkg => pkg.trim()).length < 2}
            >
              Compare Packages
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner message="Comparing packages..." />}

      <div className="empty-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px', opacity: 0.7 }}>⚖️</div>
        <h2>Package Comparison Tool</h2>
        <p>Add at least 2 packages to compare their features, bundle sizes, and metrics</p>
      </div>
    </div>
  );
};

export default PackageComparisonPage;