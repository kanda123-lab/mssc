import React, { useState } from 'react';
import './App.css';

function App() {
  const [country, setCountry] = useState('');
  const [temperature, setTemperature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTemperature = async (countryName) => {
    if (!countryName.trim()) return;
    
    setLoading(true);
    setError('');
    setTemperature(null);

    try {
      const response = await fetch(`http://localhost:8080/api/v1/temperature/${encodeURIComponent(countryName)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTemperature(data);
    } catch (err) {
      setError(`Failed to fetch temperature: ${err.message}`);
      console.error('Error fetching temperature:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTemperature(country);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchTemperature(country);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🌡️ Real-Time Temperature Checker</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="input-group">
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter country or city name..."
              className="country-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={loading || !country.trim()}
            >
              {loading ? '🔄' : '🔍'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Fetching temperature data...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        {temperature && !loading && (
          <div className="temperature-card">
            <h2>📍 {temperature.location}</h2>
            <div className="temperature-display">
              <span className="temp-value">{temperature.temperature}°</span>
              <span className="temp-unit">{temperature.unit}</span>
            </div>
            <p className="timestamp">
              Last updated: {new Date(temperature.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        <div className="instructions">
          <p>💡 Enter a country or city name and press Enter to get real-time temperature data!</p>
        </div>
      </div>
    </div>
  );
}

export default App;