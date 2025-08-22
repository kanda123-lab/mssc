import React, { useState } from 'react';

const ReportsPage = () => {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [reportType, setReportType] = useState('pdf');

  const generateReport = () => {
    if (!selectedPackage.trim()) return;
    
    console.log(`Generating ${reportType} report for ${selectedPackage}`);
    // This would call the API service to generate reports
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Export</h1>
        <p>Generate detailed analysis reports in various formats</p>
      </div>

      <div className="grid grid-2" style={{ gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Generate Report</h2>
          </div>
          
          <div className="form-group">
            <label className="form-label">Package Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter package name..."
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Report Format</label>
            <select 
              className="form-input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="pdf">PDF Report</option>
              <option value="json">JSON Data</option>
              <option value="markdown">Markdown</option>
              <option value="csv">CSV Export</option>
            </select>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={generateReport}
            disabled={!selectedPackage.trim()}
          >
            Generate Report
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Report History</h2>
          </div>
          
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }}>📄</div>
            <h3>No Reports Generated</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Generate your first report to see it here</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Available Report Types</h2>
        </div>
        
        <div className="grid grid-2" style={{ gap: '16px' }}>
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>📄 PDF Report</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
              Comprehensive analysis report with charts and visualizations
            </p>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>📊 CSV Export</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
              Raw data export for spreadsheet analysis
            </p>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>📝 Markdown</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
              Documentation-friendly format for README files
            </p>
          </div>
          
          <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>🔗 JSON Data</h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
              Machine-readable format for API integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;