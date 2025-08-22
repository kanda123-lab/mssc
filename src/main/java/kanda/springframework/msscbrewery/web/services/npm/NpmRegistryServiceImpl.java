package kanda.springframework.msscbrewery.web.services.npm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kanda.springframework.msscbrewery.web.model.npm.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NpmRegistryServiceImpl implements NpmRegistryService {

    private final WebClient npmClient;
    private final WebClient bundlephobiaClient;
    private final WebClient githubClient;
    private final ObjectMapper objectMapper;

    @Value("${npm.registry.url:https://registry.npmjs.org}")
    private String npmRegistryUrl;
    
    @Value("${bundlephobia.api.url:https://bundlephobia.com/api}")
    private String bundlephobiaUrl;
    
    @Value("${github.api.url:https://api.github.com}")
    private String githubApiUrl;

    public NpmRegistryServiceImpl(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.npmClient = webClientBuilder.baseUrl("https://registry.npmjs.org").build();
        this.bundlephobiaClient = webClientBuilder.baseUrl("https://bundlephobia.com/api").build();
        this.githubClient = webClientBuilder.baseUrl("https://api.github.com").build();
        this.objectMapper = objectMapper;
    }

    @Override
    @Cacheable(value = "packageInfo", key = "#packageName")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getPackageInfo(String packageName) {
        log.debug("Fetching package info for: {}", packageName);
        
        return npmClient.get()
                .uri("/{packageName}", packageName)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .timeout(Duration.ofSeconds(10))
                .doOnError(WebClientResponseException.class, ex -> 
                    log.error("Error fetching package info for {}: {}", packageName, ex.getMessage()))
                .onErrorReturn(Collections.emptyMap());
    }

    @Override
    @Cacheable(value = "packageVersionInfo", key = "#packageName + ':' + #version")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getPackageVersionInfo(String packageName, String version) {
        log.debug("Fetching package version info for: {}@{}", packageName, version);
        
        return npmClient.get()
                .uri("/{packageName}/{version}", packageName, version)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .timeout(Duration.ofSeconds(10))
                .doOnError(WebClientResponseException.class, ex -> 
                    log.error("Error fetching package version info for {}@{}: {}", packageName, version, ex.getMessage()))
                .onErrorReturn(Collections.emptyMap());
    }

    @Override
    @Cacheable(value = "packageSearch", key = "#query + ':' + #limit")
    public Mono<List<String>> searchPackages(String query, int limit) {
        log.debug("Searching packages with query: {} (limit: {})", query, limit);
        
        return npmClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/-/v1/search")
                        .queryParam("text", query)
                        .queryParam("size", limit)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> objects = (List<Map<String, Object>>) response.get("objects");
                    return objects.stream()
                            .map(obj -> {
                                Map<String, Object> packageInfo = (Map<String, Object>) obj.get("package");
                                return (String) packageInfo.get("name");
                            })
                            .collect(Collectors.toList());
                })
                .timeout(Duration.ofSeconds(10))
                .doOnError(ex -> log.error("Error searching packages: {}", ex.getMessage()))
                .onErrorReturn(Collections.emptyList());
    }

    @Override
    @Cacheable(value = "downloadStats", key = "#packageName")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getPackageDownloadStats(String packageName) {
        log.debug("Fetching download stats for: {}", packageName);
        
        return WebClient.create("https://api.npmjs.org")
                .get()
                .uri("/downloads/point/last-month/{packageName}", packageName)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .timeout(Duration.ofSeconds(10))
                .doOnError(ex -> log.error("Error fetching download stats for {}: {}", packageName, ex.getMessage()))
                .onErrorReturn(Collections.emptyMap());
    }

    @Override
    @Cacheable(value = "securityAdvisories", key = "#packageName")
    @SuppressWarnings("unchecked")
    public Mono<List<SecurityVulnerability>> getSecurityAdvisories(String packageName) {
        log.debug("Fetching security advisories for: {}", packageName);
        
        return WebClient.create("https://api.npmjs.org")
                .get()
                .uri("/advisories/quick/{packageName}", packageName)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .map(this::parseSecurityAdvisories)
                .timeout(Duration.ofSeconds(10))
                .doOnError(ex -> log.error("Error fetching security advisories for {}: {}", packageName, ex.getMessage()))
                .onErrorReturn(Collections.emptyList());
    }

    @Override
    @Cacheable(value = "bundleInfo", key = "#packageName + ':' + #version")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getBundleInfo(String packageName, String version) {
        log.debug("Fetching bundle info for: {}@{}", packageName, version);
        
        return bundlephobiaClient.get()
                .uri("/size?package={packageName}@{version}", packageName, version)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .timeout(Duration.ofSeconds(15))
                .doOnError(ex -> log.error("Error fetching bundle info for {}@{}: {}", packageName, version, ex.getMessage()))
                .onErrorReturn(Map.of(
                    "size", 0,
                    "gzip", 0,
                    "error", "Bundle analysis unavailable"
                ));
    }

    @Override
    @Cacheable(value = "packageVersions", key = "#packageName")
    public Mono<List<String>> getPackageVersions(String packageName) {
        log.debug("Fetching versions for: {}", packageName);
        
        return getPackageInfo(packageName)
                .map(packageInfo -> {
                    Map<String, Object> versions = (Map<String, Object>) packageInfo.get("versions");
                    if (versions != null) {
                        return new ArrayList<>(versions.keySet());
                    }
                    return Collections.<String>emptyList();
                });
    }

    @Override
    @Cacheable(value = "githubInfo", key = "#repositoryUrl")
    @SuppressWarnings("unchecked")
    public Mono<Map<String, Object>> getGitHubInfo(String repositoryUrl) {
        log.debug("Fetching GitHub info for: {}", repositoryUrl);
        
        String repoPath = extractGitHubRepoPath(repositoryUrl);
        if (repoPath == null) {
            return Mono.just(Collections.emptyMap());
        }
        
        return githubClient.get()
                .uri("/repos/{repoPath}", repoPath)
                .retrieve()
                .bodyToMono(Map.class)
                .map(rawMap -> (Map<String, Object>) rawMap)
                .timeout(Duration.ofSeconds(10))
                .doOnError(ex -> log.error("Error fetching GitHub info for {}: {}", repositoryUrl, ex.getMessage()))
                .onErrorReturn(Collections.emptyMap());
    }

    @Override
    @Cacheable(value = "similarPackages", key = "#packageName")
    public Mono<List<AlternativePackage>> getSimilarPackages(String packageName) {
        log.debug("Finding similar packages for: {}", packageName);
        
        return getPackageInfo(packageName)
                .flatMap(packageInfo -> {
                    String description = (String) packageInfo.get("description");
                    if (description != null && description.length() > 10) {
                        String searchQuery = extractKeywords(description);
                        return searchPackages(searchQuery, 10);
                    }
                    return Mono.just(Collections.<String>emptyList());
                })
                .flatMap(similarPackageNames -> 
                    Mono.fromCallable(() -> 
                        similarPackageNames.stream()
                            .filter(name -> !name.equals(packageName))
                            .limit(5)
                            .map(this::createSimpleAlternative)
                            .collect(Collectors.toList())
                    )
                );
    }

    @Override
    @Cacheable(value = "packageDeprecation", key = "#packageName")
    public Mono<Boolean> isPackageDeprecated(String packageName) {
        log.debug("Checking deprecation status for: {}", packageName);
        
        return getPackageInfo(packageName)
                .map(packageInfo -> {
                    Map<String, Object> versions = (Map<String, Object>) packageInfo.get("versions");
                    if (versions != null) {
                        for (Object versionInfo : versions.values()) {
                            if (versionInfo instanceof Map) {
                                Map<String, Object> versionMap = (Map<String, Object>) versionInfo;
                                if (versionMap.containsKey("deprecated")) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                });
    }

    private List<SecurityVulnerability> parseSecurityAdvisories(Map<String, Object> advisories) {
        List<SecurityVulnerability> vulnerabilities = new ArrayList<>();
        
        for (Map.Entry<String, Object> entry : advisories.entrySet()) {
            if (entry.getValue() instanceof Map) {
                Map<String, Object> advisory = (Map<String, Object>) entry.getValue();
                
                SecurityVulnerability vulnerability = SecurityVulnerability.builder()
                        .id((String) advisory.get("id"))
                        .title((String) advisory.get("title"))
                        .description((String) advisory.get("overview"))
                        .severity((String) advisory.get("severity"))
                        .cve((String) advisory.get("cve"))
                        .affectedVersions((String) advisory.get("vulnerable_versions"))
                        .patchedVersions((String) advisory.get("patched_versions"))
                        .recommendation((String) advisory.get("recommendation"))
                        .build();
                
                vulnerabilities.add(vulnerability);
            }
        }
        
        return vulnerabilities;
    }

    private String extractGitHubRepoPath(String repositoryUrl) {
        if (repositoryUrl == null) return null;
        
        String[] patterns = {
            "https://github.com/",
            "git+https://github.com/",
            "git://github.com/",
            "ssh://git@github.com/"
        };
        
        for (String pattern : patterns) {
            if (repositoryUrl.startsWith(pattern)) {
                String path = repositoryUrl.substring(pattern.length());
                if (path.endsWith(".git")) {
                    path = path.substring(0, path.length() - 4);
                }
                return path;
            }
        }
        
        return null;
    }

    private String extractKeywords(String description) {
        String[] words = description.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")
                .split("\\s+");
        
        Set<String> commonWords = Set.of("a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were");
        
        return Arrays.stream(words)
                .filter(word -> word.length() > 3 && !commonWords.contains(word))
                .limit(3)
                .collect(Collectors.joining(" "));
    }

    private AlternativePackage createSimpleAlternative(String packageName) {
        return AlternativePackage.builder()
                .name(packageName)
                .description("Alternative package")
                .migrationDifficulty("moderate")
                .recommendation("Consider as alternative")
                .build();
    }
}