package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

public interface PackageAnalysisService {
    
    Mono<PackageAnalysisDto> analyzePackage(String packageName, String version);
    
    Mono<PackageAnalysisDto> analyzePackageJson(String packageJsonContent);
    
    Mono<List<PackageAnalysisDto>> analyzeMultiplePackages(List<String> packageNames);
    
    Mono<DependencyNode> buildDependencyTree(String packageName, String version);
    
    Mono<List<OptimizationSuggestion>> getOptimizationSuggestions(String packageName, String version);
    
    Mono<List<AlternativePackage>> findAlternatives(String packageName);
    
    Mono<PackageAnalysisDto.BundleSizeInfo> analyzeBundleSize(String packageName, String version);
    
    Mono<PackageAnalysisDto.SecurityInfo> analyzeSecurityIssues(String packageName, String version);
    
    Mono<Map<String, PackageAnalysisDto>> comparePackages(List<String> packageNames);
}