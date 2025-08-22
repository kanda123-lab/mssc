package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Request DTO for database connection string generation
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionStringRequest {
    
    private DatabaseType databaseType;
    private String host;
    private Integer port;
    private String database;
    private String schema;
    private String username;
    private String password;
    private String serviceName; // Oracle specific
    private String instanceName; // SQL Server specific
    private String authSource; // MongoDB specific
    private String filePath; // SQLite specific
    
    // SSL and Security Settings
    private SslMode sslMode;
    private String sslCert;
    private String sslKey;
    private String sslRootCert;
    private Boolean verifyServerCertificate;
    private Boolean useEncryption;
    
    // Connection Pool Settings
    private Integer minPoolSize;
    private Integer maxPoolSize;
    private Integer connectionTimeout;
    private Integer commandTimeout;
    private Integer idleTimeout;
    private Integer maxLifetime;
    
    // Advanced Options
    private String charset;
    private String collation;
    private String timezone;
    private Boolean autoReconnect;
    private Boolean allowMultipleQueries;
    private String applicationName;
    private String workstation;
    
    // NoSQL specific (MongoDB, Redis, Elasticsearch)
    private String replicaSet;
    private Boolean readPreference;
    private Integer readConcernLevel;
    private Integer writeConcernLevel;
    private String authMechanism;
    private Boolean retryWrites;
    
    // Cassandra specific
    private String datacenter;
    private String keyspace;
    private Integer consistencyLevel;
    
    // Additional custom parameters
    private Map<String, String> additionalParams;
    
    // Export preferences
    private Boolean maskPassword;
    private Boolean includeComments;
    private Boolean useEnvironmentVariables;
}