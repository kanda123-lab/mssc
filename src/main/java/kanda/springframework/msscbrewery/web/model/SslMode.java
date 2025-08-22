package kanda.springframework.msscbrewery.web.model;

/**
 * SSL Mode enumeration for database connections
 */
public enum SslMode {
    DISABLE("disable", "No SSL encryption"),
    ALLOW("allow", "SSL if available, fallback to non-SSL"),
    PREFER("prefer", "SSL preferred, fallback to non-SSL"),
    REQUIRE("require", "SSL required, fail if unavailable"),
    VERIFY_CA("verify-ca", "SSL required with CA verification"),
    VERIFY_FULL("verify-full", "SSL required with full certificate verification");
    
    private final String value;
    private final String description;
    
    SslMode(String value, String description) {
        this.value = value;
        this.description = description;
    }
    
    public String getValue() {
        return value;
    }
    
    public String getDescription() {
        return description;
    }
}