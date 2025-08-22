package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for database connection string generation
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionStringResponse {
    
    private String connectionString;
    private String maskedConnectionString;
    private DatabaseType databaseType;
    private boolean valid;
    private List<String> validationErrors;
    private List<String> warnings;
    private List<SecurityRecommendation> securityRecommendations;
    
    // Multiple format outputs
    private Map<String, String> formats; // JSON, YAML, .env, etc.
    
    // Integration examples
    private Map<String, String> codeSnippets; // Java, Python, Node.js, etc.
    
    // Cloud provider configurations
    private Map<String, Object> cloudConfigs; // AWS RDS, Azure, GCP
    
    // Performance recommendations
    private List<PerformanceRecommendation> performanceRecommendations;
    
    // Connection testing results (mock for security)
    private TestResult testResult;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SecurityRecommendation {
        private String type; // SSL, PASSWORD, NETWORK, etc.
        private String severity; // HIGH, MEDIUM, LOW
        private String message;
        private String solution;
        private String documentation;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PerformanceRecommendation {
        private String category; // POOL, TIMEOUT, CACHE, etc.
        private String suggestion;
        private String impact; // HIGH, MEDIUM, LOW
        private String documentation;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TestResult {
        private boolean success;
        private String message;
        private long latencyMs;
        private Map<String, Object> details;
    }
}