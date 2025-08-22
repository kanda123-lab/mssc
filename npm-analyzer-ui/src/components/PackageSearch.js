import React, { useState, useRef, useEffect } from 'react';
import apiService from '../services/api';
import './PackageSearch.css';

const PackageSearch = ({ onSearch, placeholder = "Search NPM packages..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPackages = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await apiService.searchPackages(searchQuery, 8);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search requests
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchPackages(value);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (packageName) => {
    setQuery(packageName);
    setShowSuggestions(false);
    onSearch(packageName);
    setQuery('');
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="package-search" ref={inputRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="search-button" disabled={!query.trim()}>
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <span className="search-icon">🔍</span>
            )}
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          <ul className="suggestions-list">
            {suggestions.map((packageName, index) => (
              <li
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(packageName)}
              >
                <span className="package-icon">📦</span>
                <span className="package-name">{packageName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PackageSearch;