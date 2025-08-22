package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.ConnectionStringRequest;
import kanda.springframework.msscbrewery.web.model.ConnectionStringResponse;
import java.util.List;
import java.util.Map;

/**
 * Service interface for database connection string generation and management
 */
public interface ConnectionStringService {

    /**
     * Generate connection string and related configurations
     */
    ConnectionStringResponse generateConnectionString(ConnectionStringRequest request);

    /**
     * Validate connection parameters and format
     */
    Map<String, Object> validateConnection(ConnectionStringRequest request);

    /**
     * Perform mock connection test for UI feedback
     */
    Map<String, Object> testConnection(ConnectionStringRequest request);

    /**
     * Export connection string in specified format
     */
    Map<String, String> exportConnection(ConnectionStringRequest request, String format);

    /**
     * Get database templates and presets
     */
    Map<String, Object> getTemplates();

    /**
     * Get supported databases configuration
     */
    Map<String, Object> getSupportedDatabases();

    /**
     * Generate code snippets for various programming languages
     */
    Map<String, String> generateCodeSnippets(ConnectionStringRequest request, List<String> languages);

    /**
     * Perform security analysis and recommendations
     */
    Map<String, Object> performSecurityCheck(ConnectionStringRequest request);

    /**
     * Generate cloud provider specific configurations
     */
    Map<String, Object> generateCloudConfig(ConnectionStringRequest request, String provider);
}