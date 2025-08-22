package kanda.springframework.msscbrewery.web.model;

/**
 * Enumeration of supported database types for connection string generation
 */
public enum DatabaseType {
    // Relational Databases
    MYSQL("mysql", "MySQL/MariaDB", 3306),
    POSTGRESQL("postgresql", "PostgreSQL", 5432),
    MSSQL("sqlserver", "Microsoft SQL Server", 1433),
    ORACLE("oracle", "Oracle Database", 1521),
    SQLITE("sqlite", "SQLite", null),
    MARIADB("mariadb", "MariaDB", 3306),
    
    // NoSQL Databases
    MONGODB("mongodb", "MongoDB", 27017),
    REDIS("redis", "Redis", 6379),
    CASSANDRA("cassandra", "Apache Cassandra", 9042),
    ELASTICSEARCH("elasticsearch", "Elasticsearch", 9200),
    
    // Other Databases
    H2("h2", "H2 Database", null),
    HSQLDB("hsqldb", "HSQLDB", null),
    FIREBIRD("firebird", "Firebird", 3050),
    INFORMIX("informix", "IBM Informix", 1526),
    DB2("db2", "IBM DB2", 50000);
    
    private final String protocol;
    private final String displayName;
    private final Integer defaultPort;
    
    DatabaseType(String protocol, String displayName, Integer defaultPort) {
        this.protocol = protocol;
        this.displayName = displayName;
        this.defaultPort = defaultPort;
    }
    
    public String getProtocol() {
        return protocol;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public Integer getDefaultPort() {
        return defaultPort;
    }
    
    public boolean isRelational() {
        return this == MYSQL || this == POSTGRESQL || this == MSSQL || 
               this == ORACLE || this == SQLITE || this == MARIADB || 
               this == H2 || this == HSQLDB || this == FIREBIRD || 
               this == INFORMIX || this == DB2;
    }
    
    public boolean isNoSQL() {
        return this == MONGODB || this == REDIS || this == CASSANDRA || 
               this == ELASTICSEARCH;
    }
    
    public boolean requiresFile() {
        return this == SQLITE || this == H2 || this == HSQLDB;
    }
    
    public boolean supportsSSL() {
        return this != SQLITE && this != H2 && this != HSQLDB;
    }
    
    public boolean supportsConnectionPooling() {
        return isRelational() || this == MONGODB || this == CASSANDRA;
    }
}