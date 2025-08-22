package kanda.springframework.msscbrewery.web.model;

/**
 * Export format enumeration for connection string output
 */
public enum ExportFormat {
    CONNECTION_STRING("connection-string", "Standard Connection String"),
    ENV_FILE("env", "Environment Variables (.env)"),
    JSON("json", "JSON Configuration"),
    YAML("yaml", "YAML Configuration"),
    XML("xml", "XML Configuration"),
    PROPERTIES("properties", "Java Properties"),
    DOCKER_ENV("docker-env", "Docker Environment Variables"),
    KUBERNETES_SECRET("k8s-secret", "Kubernetes Secret YAML"),
    DOCKER_COMPOSE("docker-compose", "Docker Compose Environment"),
    TERRAFORM("terraform", "Terraform Configuration"),
    ANSIBLE("ansible", "Ansible Variables"),
    SPRING_BOOT("spring-boot", "Spring Boot application.properties"),
    DJANGO("django", "Django settings.py"),
    RAILS("rails", "Rails database.yml"),
    LARAVEL("laravel", "Laravel .env"),
    NODEJS_CONFIG("nodejs", "Node.js Configuration Object");
    
    private final String value;
    private final String displayName;
    
    ExportFormat(String value, String displayName) {
        this.value = value;
        this.displayName = displayName;
    }
    
    public String getValue() {
        return value;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}