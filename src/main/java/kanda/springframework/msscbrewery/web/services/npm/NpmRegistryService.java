package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

public interface NpmRegistryService {
    
    Mono<Map<String, Object>> getPackageInfo(String packageName);
    
    Mono<Map<String, Object>> getPackageVersionInfo(String packageName, String version);
    
    Mono<List<String>> searchPackages(String query, int limit);
    
    Mono<Map<String, Object>> getPackageDownloadStats(String packageName);
    
    Mono<List<SecurityVulnerability>> getSecurityAdvisories(String packageName);
    
    Mono<Map<String, Object>> getBundleInfo(String packageName, String version);
    
    Mono<List<String>> getPackageVersions(String packageName);
    
    Mono<Map<String, Object>> getGitHubInfo(String repositoryUrl);
    
    Mono<List<AlternativePackage>> getSimilarPackages(String packageName);
    
    Mono<Boolean> isPackageDeprecated(String packageName);
}