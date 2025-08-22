import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-circle"></div>
      <span className="spinner-message">{message}</span>
    </div>
  );
};

export default LoadingSpinner;