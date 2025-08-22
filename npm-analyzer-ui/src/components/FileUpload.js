import React, { useState, useRef } from 'react';
import apiService from '../services/api';
import './FileUpload.css';

const FileUpload = ({ onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => 
      file.name === 'package.json' || file.type === 'application/json'
    );
    
    if (jsonFile) {
      uploadFile(jsonFile);
    } else {
      setError('Please upload a package.json file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    if (file.size > 1024 * 1024) { // 1MB limit
      setError('File size must be less than 1MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const analysis = await apiService.uploadPackageJson(file);
      onUpload(analysis);
    } catch (error) {
      setError(error.message || 'Failed to analyze package.json');
    } finally {
      setUploading(false);
    }
  };

  const handleTextUpload = () => {
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Paste your package.json content here...';
    textarea.style.cssText = `
      width: 100%;
      height: 300px;
      padding: 12px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      background: var(--bg-primary);
      color: var(--text-primary);
      resize: vertical;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: var(--bg-primary);
      padding: 24px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
    `;

    const title = document.createElement('h3');
    title.textContent = 'Paste package.json Content';
    title.style.marginBottom = '16px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      margin-top: 16px;
      justify-content: flex-end;
    `;

    const analyzeBtn = document.createElement('button');
    analyzeBtn.textContent = 'Analyze';
    analyzeBtn.className = 'btn btn-primary';
    analyzeBtn.onclick = async () => {
      const content = textarea.value.trim();
      if (content) {
        try {
          setUploading(true);
          const analysis = await apiService.analyzePackageJson(content);
          onUpload(analysis);
          document.body.removeChild(modal);
        } catch (error) {
          setError(error.message || 'Failed to analyze package.json');
        } finally {
          setUploading(false);
        }
      }
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(cancelBtn);
    buttonContainer.appendChild(analyzeBtn);
    
    content.appendChild(title);
    content.appendChild(textarea);
    content.appendChild(buttonContainer);
    modal.appendChild(content);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };

    document.body.appendChild(modal);
    textarea.focus();
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-status">
            <div className="spinner"></div>
            <span>Analyzing package.json...</span>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <p><strong>Click to browse</strong> or drag & drop</p>
              <p className="upload-subtitle">Upload your package.json file</p>
            </div>
          </div>
        )}
      </div>

      <div className="upload-actions">
        <button
          className="btn btn-secondary"
          onClick={handleTextUpload}
          disabled={uploading}
        >
          📝 Paste Content
        </button>
      </div>

      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;