import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Package Analysis
  async analyzePackage(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/analyze/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async analyzePackageJson(packageJsonContent) {
    try {
      const response = await this.client.post('/npm/analyze/package-json', packageJsonContent, {
        headers: { 'Content-Type': 'text/plain' }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadPackageJson(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.client.post('/npm/analyze/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async analyzeBatch(packageNames) {
    try {
      const response = await this.client.post('/npm/analyze/batch', packageNames);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Dependency Analysis
  async getDependencyTree(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/dependency-tree/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bundle Analysis
  async getBundleSize(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/bundle-size/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Security Analysis
  async getSecurityInfo(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/security/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Alternatives
  async getAlternatives(packageName) {
    try {
      const response = await this.client.get(`/npm/alternatives/${packageName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Optimization Suggestions
  async getOptimizations(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/optimizations/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Package Comparison
  async comparePackages(packageNames) {
    try {
      const response = await this.client.post('/npm/compare', packageNames);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search
  async searchPackages(query, limit = 10) {
    try {
      const response = await this.client.get('/npm/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Package Info
  async getPackageInfo(packageName) {
    try {
      const response = await this.client.get(`/npm/package-info/${packageName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDownloadStats(packageName) {
    try {
      const response = await this.client.get(`/npm/download-stats/${packageName}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reports
  async generatePdfReport(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/reports/pdf/${packageName}`, {
        params: { version },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateCsvReport(packageNames) {
    try {
      const response = await this.client.post('/npm/reports/csv', packageNames, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateJsonReport(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/reports/json/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateMarkdownReport(packageName, version = 'latest') {
    try {
      const response = await this.client.get(`/npm/reports/markdown/${packageName}`, {
        params: { version }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async generateComparisonPdf(packageNames) {
    try {
      const response = await this.client.post('/npm/reports/comparison/pdf', packageNames, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return new Error(`Server Error: ${error.response.status} - ${error.response.statusText}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network Error: No response from server');
    } else {
      // Something else happened
      return new Error(`Error: ${error.message}`);
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;