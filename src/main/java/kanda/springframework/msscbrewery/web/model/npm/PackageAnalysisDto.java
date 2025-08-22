package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@Jacksonized
public class PackageAnalysisDto {
    private String packageName;
    private String version;
    private String description;
    private String author;
    private String license;
    private String homepage;
    private String repository;
    private LocalDateTime lastPublished;
    
    private BundleSizeInfo bundleSize;
    private DependencyInfo dependencies;
    private SecurityInfo security;
    private MaintenanceInfo maintenance;
    private PopularityInfo popularity;
    
    private List<AlternativePackage> alternatives;
    private List<OptimizationSuggestion> optimizations;
    private List<VersionInfo> versionHistory;
    
    @Data
    @Builder
    @Jacksonized
    public static class BundleSizeInfo {
        private long uncompressed;
        private long gzipped;
        private long brotli;
        private Map<String, Long> breakdown;
        private boolean treeshakable;
        private String bundleAnalysisUrl;
    }
    
    @Data
    @Builder
    @Jacksonized
    public static class DependencyInfo {
        private int dependenciesCount;
        private int devDependenciesCount;
        private int peerDependenciesCount;
        private List<DependencyNode> dependencyTree;
        private List<String> circularDependencies;
        private List<String> duplicateDependencies;
        private List<VersionConflict> versionConflicts;
    }
    
    @Data
    @Builder
    @Jacksonized
    public static class SecurityInfo {
        private int vulnerabilityCount;
        private List<SecurityVulnerability> vulnerabilities;
        private boolean hasDeprecatedDependencies;
        private List<String> deprecatedPackages;
        private String licenseCompatibility;
    }
    
    @Data
    @Builder
    @Jacksonized
    public static class MaintenanceInfo {
        private LocalDateTime lastCommit;
        private int openIssues;
        private int closedIssues;
        private int contributors;
        private double maintenanceScore;
        private boolean activelyMaintained;
    }
    
    @Data
    @Builder
    @Jacksonized
    public static class PopularityInfo {
        private long weeklyDownloads;
        private long monthlyDownloads;
        private int githubStars;
        private int githubForks;
        private int npmScore;
        private double qualityScore;
        private double popularityScore;
    }
}