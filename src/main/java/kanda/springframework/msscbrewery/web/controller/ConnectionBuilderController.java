package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.ConnectionStringRequest;
import kanda.springframework.msscbrewery.web.model.ConnectionStringResponse;
import kanda.springframework.msscbrewery.web.model.ExportFormat;
import kanda.springframework.msscbrewery.web.services.ConnectionStringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Database Connection String Builder
 * Provides comprehensive database connection string generation and management
 * Supports all major databases with multiple output formats and security features
 */
@RestController
@RequestMapping("/api/v1/connection-builder")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ConnectionBuilderController {

    private final ConnectionStringService connectionStringService;

    @Autowired
    public ConnectionBuilderController(ConnectionStringService connectionStringService) {
        this.connectionStringService = connectionStringService;
    }

    /**
     * Generate connection string for specified database type
     */
    @PostMapping("/generate")
    public ResponseEntity<ConnectionStringResponse> generateConnectionString(
            @RequestBody ConnectionStringRequest request) {
        
        ConnectionStringResponse response = connectionStringService.generateConnectionString(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Validate connection string format and parameters
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateConnection(
            @RequestBody ConnectionStringRequest request) {
        
        Map<String, Object> validationResult = connectionStringService.validateConnection(request);
        return ResponseEntity.ok(validationResult);
    }

    /**
     * Test database connectivity (mock test for security)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection(
            @RequestBody ConnectionStringRequest request) {
        
        Map<String, Object> testResult = connectionStringService.testConnection(request);
        return ResponseEntity.ok(testResult);
    }

    /**
     * Export connection string in various formats
     */
    @PostMapping("/export")
    public ResponseEntity<Map<String, String>> exportConnection(
            @RequestBody Map<String, Object> exportRequest) {
        
        ConnectionStringRequest request = (ConnectionStringRequest) exportRequest.get("connection");
        String format = (String) exportRequest.get("format");
        Map<String, String> exportResult = connectionStringService.exportConnection(request, format);
        return ResponseEntity.ok(exportResult);
    }

    /**
     * Get database templates and presets
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getTemplates() {
        Map<String, Object> templates = connectionStringService.getTemplates();
        return ResponseEntity.ok(templates);
    }

    /**
     * Get supported databases and their default configurations
     */
    @GetMapping("/databases")
    public ResponseEntity<Map<String, Object>> getSupportedDatabases() {
        Map<String, Object> databases = connectionStringService.getSupportedDatabases();
        return ResponseEntity.ok(databases);
    }

    /**
     * Generate integration code snippets for various programming languages
     */
    @PostMapping("/snippets")
    public ResponseEntity<Map<String, String>> generateCodeSnippets(
            @RequestBody Map<String, Object> snippetRequest) {
        
        ConnectionStringRequest request = (ConnectionStringRequest) snippetRequest.get("connection");
        List<String> languages = (List<String>) snippetRequest.get("languages");
        Map<String, String> snippets = connectionStringService.generateCodeSnippets(request, languages);
        return ResponseEntity.ok(snippets);
    }

    /**
     * Get security recommendations for connection configuration
     */
    @PostMapping("/security-check")
    public ResponseEntity<Map<String, Object>> checkSecurity(
            @RequestBody ConnectionStringRequest request) {
        
        Map<String, Object> securityCheck = connectionStringService.performSecurityCheck(request);
        return ResponseEntity.ok(securityCheck);
    }

    /**
     * Generate cloud provider specific configurations
     */
    @PostMapping("/cloud-config")
    public ResponseEntity<Map<String, Object>> generateCloudConfig(
            @RequestBody Map<String, Object> cloudRequest) {
        
        ConnectionStringRequest request = (ConnectionStringRequest) cloudRequest.get("connection");
        String provider = (String) cloudRequest.get("provider");
        Map<String, Object> cloudConfig = connectionStringService.generateCloudConfig(request, provider);
        return ResponseEntity.ok(cloudConfig);
    }
}