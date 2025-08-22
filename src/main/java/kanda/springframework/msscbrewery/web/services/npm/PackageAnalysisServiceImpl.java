package kanda.springframework.msscbrewery.web.services.npm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kanda.springframework.msscbrewery.web.model.npm.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PackageAnalysisServiceImpl implements PackageAnalysisService {

    private final NpmRegistryService npmRegistryService;
    private final DependencyTreeService dependencyTreeService;
    private final SecurityAnalysisService securityAnalysisService;
    private final OptimizationService optimizationService;
    private final ObjectMapper objectMapper;

    @Override
    public Mono<PackageAnalysisDto> analyzePackage(String packageName, String version) {
        log.info("Starting analysis for package: {}@{}", packageName, version);
        
        return getBasicPackageInfo(packageName, version)
                .flatMap(basicInfo -> 
                    analyzeBundleSize(packageName, version)
                        .flatMap(bundleSize -> 
                            buildDependencyInfo(packageName, version)
                                .flatMap(dependencyInfo ->
                                    analyzeSecurityIssues(packageName, version)
                                        .map(securityInfo -> 
                                            PackageAnalysisDto.builder()
                                                    .packageName(packageName)
                                                    .version(version)
                                                    .description((String) basicInfo.get("description"))
                                                    .author(extractAuthor(basicInfo))
                                                    .license((String) basicInfo.get("license"))
                                                    .homepage((String) basicInfo.get("homepage"))
                                                    .repository(extractRepository(basicInfo))
                                                    .lastPublished(parseDateTime((String) basicInfo.get("modified")))
                                                    .bundleSize(bundleSize)
                                                    .dependencies(dependencyInfo)
                                                    .security(securityInfo)
                                                    .maintenance(PackageAnalysisDto.MaintenanceInfo.builder()
                                                            .maintenanceScore(0.0)
                                                            .activelyMaintained(false)
                                                            .build())
                                                    .popularity(PackageAnalysisDto.PopularityInfo.builder()
                                                            .weeklyDownloads(0L)
                                                            .githubStars(0)
                                                            .qualityScore(0.0)
                                                            .build())
                                                    .alternatives(List.of())
                                                    .optimizations(List.of())
                                                    .versionHistory(List.of())
                                                    .build()
                                        )
                                )
                        )
                );
    }

    @Override
    public Mono<PackageAnalysisDto> analyzePackageJson(String packageJsonContent) {
        log.info("Analyzing package.json content");
        
        try {
            JsonNode packageJson = objectMapper.readTree(packageJsonContent);
            String packageName = packageJson.get("name").asText();
            String version = packageJson.has("version") ? packageJson.get("version").asText() : "latest";
            
            return analyzePackage(packageName, version)
                    .map(analysis -> enhanceWithPackageJsonData(analysis, packageJson));
        } catch (Exception e) {
            log.error("Error parsing package.json: {}", e.getMessage());
            return Mono.error(new IllegalArgumentException("Invalid package.json format"));
        }
    }

    @Override
    public Mono<List<PackageAnalysisDto>> analyzeMultiplePackages(List<String> packageNames) {
        log.info("Analyzing {} packages", packageNames.size());
        
        return Flux.fromIterable(packageNames)
                .flatMap(packageName -> analyzePackage(packageName, "latest")
                        .onErrorResume(ex -> {
                            log.warn("Failed to analyze package {}: {}", packageName, ex.getMessage());
                            return Mono.empty();
                        }))
                .collectList();
    }

    @Override
    public Mono<DependencyNode> buildDependencyTree(String packageName, String version) {
        return dependencyTreeService.buildDependencyTree(packageName, version);
    }

    @Override
    public Mono<List<OptimizationSuggestion>> getOptimizationSuggestions(String packageName, String version) {
        return optimizationService.generateSuggestions(packageName, version);
    }

    @Override
    public Mono<List<AlternativePackage>> findAlternatives(String packageName) {
        return npmRegistryService.getSimilarPackages(packageName)
                .map(alternatives -> alternatives);
    }

    @Override
    public Mono<PackageAnalysisDto.BundleSizeInfo> analyzeBundleSize(String packageName, String version) {
        log.debug("Analyzing bundle size for: {}@{}", packageName, version);
        
        return npmRegistryService.getBundleInfo(packageName, version)
                .map(bundleInfo -> PackageAnalysisDto.BundleSizeInfo.builder()
                        .uncompressed(getLongValue(bundleInfo, "size", 0L))
                        .gzipped(getLongValue(bundleInfo, "gzip", 0L))
                        .brotli(getLongValue(bundleInfo, "brotli", 0L))
                        .treeshakable(getBooleanValue(bundleInfo, "hasJSModule", false))
                        .bundleAnalysisUrl("https://bundlephobia.com/package/" + packageName + "@" + version)
                        .breakdown(extractSizeBreakdown(bundleInfo))
                        .build());
    }

    @Override
    public Mono<PackageAnalysisDto.SecurityInfo> analyzeSecurityIssues(String packageName, String version) {
        return securityAnalysisService.analyzeSecurityIssues(packageName, version);
    }

    @Override
    public Mono<Map<String, PackageAnalysisDto>> comparePackages(List<String> packageNames) {
        log.info("Comparing {} packages", packageNames.size());
        
        return Flux.fromIterable(packageNames)
                .flatMap(packageName -> analyzePackage(packageName, "latest")
                        .map(analysis -> Map.entry(packageName, analysis)))
                .collectMap(Map.Entry::getKey, Map.Entry::getValue);
    }

    private Mono<Map<String, Object>> getBasicPackageInfo(String packageName, String version) {
        if ("latest".equals(version)) {
            return npmRegistryService.getPackageInfo(packageName);
        } else {
            return npmRegistryService.getPackageVersionInfo(packageName, version);
        }
    }

    private Mono<PackageAnalysisDto.DependencyInfo> buildDependencyInfo(String packageName, String version) {
        return buildDependencyTree(packageName, version)
                .map(tree -> PackageAnalysisDto.DependencyInfo.builder()
                        .dependenciesCount(countDependencies(tree, DependencyNode.DependencyType.PRODUCTION))
                        .devDependenciesCount(countDependencies(tree, DependencyNode.DependencyType.DEVELOPMENT))
                        .peerDependenciesCount(countDependencies(tree, DependencyNode.DependencyType.PEER))
                        .dependencyTree(List.of(tree))
                        .circularDependencies(findCircularDependencies(tree))
                        .duplicateDependencies(findDuplicateDependencies(tree))
                        .versionConflicts(findVersionConflicts(tree))
                        .build());
    }

    private Mono<PackageAnalysisDto.MaintenanceInfo> getMaintenanceInfo(String packageName) {
        return npmRegistryService.getPackageInfo(packageName)
                .flatMap(packageInfo -> {
                    String repoUrl = extractRepository(packageInfo);
                    if (repoUrl != null) {
                        return npmRegistryService.getGitHubInfo(repoUrl)
                                .map(githubInfo -> PackageAnalysisDto.MaintenanceInfo.builder()
                                        .lastCommit(parseDateTime((String) githubInfo.get("pushed_at")))
                                        .openIssues(getIntValue(githubInfo, "open_issues", 0))
                                        .contributors(0) // Would need separate API call
                                        .maintenanceScore(calculateMaintenanceScore(githubInfo))
                                        .activelyMaintained(isActivelyMaintained(githubInfo))
                                        .build());
                    } else {
                        return Mono.just(PackageAnalysisDto.MaintenanceInfo.builder()
                                .maintenanceScore(0.0)
                                .activelyMaintained(false)
                                .build());
                    }
                });
    }

    private Mono<PackageAnalysisDto.PopularityInfo> getPopularityInfo(String packageName) {
        return Mono.zip(
                npmRegistryService.getPackageDownloadStats(packageName),
                npmRegistryService.getPackageInfo(packageName)
        ).map(tuple -> {
            Map<String, Object> downloadStats = tuple.getT1();
            Map<String, Object> packageInfo = tuple.getT2();
            
            return PackageAnalysisDto.PopularityInfo.builder()
                    .weeklyDownloads(getLongValue(downloadStats, "downloads", 0L))
                    .monthlyDownloads(getLongValue(downloadStats, "downloads", 0L))
                    .githubStars(0) // Retrieved from maintenance info
                    .githubForks(0) // Would be retrieved from GitHub API
                    .npmScore(calculateNpmScore(packageInfo))
                    .qualityScore(calculateQualityScore(packageInfo))
                    .popularityScore(calculatePopularityScore(downloadStats))
                    .build();
        });
    }

    private Mono<List<VersionInfo>> getVersionHistory(String packageName) {
        return npmRegistryService.getPackageVersions(packageName)
                .map(versions -> versions.stream()
                        .limit(10) // Latest 10 versions
                        .map(version -> VersionInfo.builder()
                                .version(version)
                                .publishedDate(LocalDateTime.now()) // Would parse from version info
                                .deprecated(false) // Would check from version info
                                .hasVulnerabilities(false) // Would check from security scan
                                .changeType("unknown")
                                .build())
                        .collect(Collectors.toList()));
    }

    // Helper methods
    private String extractAuthor(Map<String, Object> packageInfo) {
        Object author = packageInfo.get("author");
        if (author instanceof String) {
            return (String) author;
        } else if (author instanceof Map) {
            return (String) ((Map<?, ?>) author).get("name");
        }
        return null;
    }

    private String extractRepository(Map<String, Object> packageInfo) {
        Object repository = packageInfo.get("repository");
        if (repository instanceof String) {
            return (String) repository;
        } else if (repository instanceof Map) {
            return (String) ((Map<?, ?>) repository).get("url");
        }
        return null;
    }

    private LocalDateTime parseDateTime(String dateTimeString) {
        if (dateTimeString == null) return null;
        try {
            return LocalDateTime.parse(dateTimeString, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }

    private PackageAnalysisDto enhanceWithPackageJsonData(PackageAnalysisDto analysis, JsonNode packageJson) {
        // Enhance analysis with additional data from package.json
        return analysis;
    }


    private int countDependencies(DependencyNode node, DependencyNode.DependencyType type) {
        if (node == null || node.getChildren() == null) return 0;
        
        return (int) node.getChildren().stream()
                .filter(child -> type.name().toLowerCase().equals(child.getDependencyType()))
                .count();
    }

    private List<String> findCircularDependencies(DependencyNode tree) {
        // Implementation for circular dependency detection
        return new ArrayList<>();
    }

    private List<String> findDuplicateDependencies(DependencyNode tree) {
        // Implementation for duplicate dependency detection
        return new ArrayList<>();
    }

    private List<VersionConflict> findVersionConflicts(DependencyNode tree) {
        // Implementation for version conflict detection
        return new ArrayList<>();
    }

    private Map<String, Long> extractSizeBreakdown(Map<String, Object> bundleInfo) {
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("main", getLongValue(bundleInfo, "size", 0L));
        return breakdown;
    }

    private double calculateMaintenanceScore(Map<String, Object> githubInfo) {
        // Calculate maintenance score based on GitHub metrics
        return 0.8;
    }

    private boolean isActivelyMaintained(Map<String, Object> githubInfo) {
        String pushedAt = (String) githubInfo.get("pushed_at");
        if (pushedAt != null) {
            LocalDateTime lastPush = parseDateTime(pushedAt);
            return lastPush != null && lastPush.isAfter(LocalDateTime.now().minusMonths(6));
        }
        return false;
    }

    private int calculateNpmScore(Map<String, Object> packageInfo) {
        return 75; // Placeholder calculation
    }

    private double calculateQualityScore(Map<String, Object> packageInfo) {
        return 0.75; // Placeholder calculation
    }

    private double calculatePopularityScore(Map<String, Object> downloadStats) {
        return 0.8; // Placeholder calculation
    }

    // Utility methods
    private long getLongValue(Map<String, Object> map, String key, long defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return defaultValue;
    }

    private int getIntValue(Map<String, Object> map, String key, int defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }

    private boolean getBooleanValue(Map<String, Object> map, String key, boolean defaultValue) {
        Object value = map.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return defaultValue;
    }
}