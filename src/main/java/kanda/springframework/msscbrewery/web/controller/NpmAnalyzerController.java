package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.npm.*;
import kanda.springframework.msscbrewery.web.services.npm.PackageAnalysisService;
import kanda.springframework.msscbrewery.web.services.npm.NpmRegistryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/npm")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "file://"})
public class NpmAnalyzerController {

    private final PackageAnalysisService packageAnalysisService;
    private final NpmRegistryService npmRegistryService;

    @GetMapping("/analyze/{packageName}")
    public Mono<ResponseEntity<PackageAnalysisDto>> analyzePackage(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Analyzing package: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzePackage(packageName, version)
                .map(analysis -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(analysis))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @PostMapping("/analyze/package-json")
    public Mono<ResponseEntity<PackageAnalysisDto>> analyzePackageJson(
            @RequestBody String packageJsonContent) {
        
        log.info("Analyzing package.json content");
        
        return packageAnalysisService.analyzePackageJson(packageJsonContent)
                .map(analysis -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(analysis))
                .onErrorReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
    }

    @PostMapping("/analyze/upload")
    public Mono<ResponseEntity<PackageAnalysisDto>> uploadPackageJson(
            @RequestParam("file") MultipartFile file) {
        
        log.info("Analyzing uploaded package.json file: {}", file.getOriginalFilename());
        
        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            return packageAnalysisService.analyzePackageJson(content)
                    .map(analysis -> ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(analysis))
                    .onErrorReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
        } catch (IOException e) {
            log.error("Error reading uploaded file: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());
        }
    }

    @PostMapping("/analyze/batch")
    public Mono<ResponseEntity<List<PackageAnalysisDto>>> analyzeBatch(
            @RequestBody List<String> packageNames) {
        
        log.info("Analyzing {} packages in batch", packageNames.size());
        
        return packageAnalysisService.analyzeMultiplePackages(packageNames)
                .map(analyses -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(analyses))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/dependency-tree/{packageName}")
    public Mono<ResponseEntity<DependencyNode>> getDependencyTree(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Building dependency tree for: {}@{}", packageName, version);
        
        return packageAnalysisService.buildDependencyTree(packageName, version)
                .map(tree -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(tree))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/bundle-size/{packageName}")
    public Mono<ResponseEntity<PackageAnalysisDto.BundleSizeInfo>> getBundleSize(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Analyzing bundle size for: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzeBundleSize(packageName, version)
                .map(bundleInfo -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(bundleInfo))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/security/{packageName}")
    public Mono<ResponseEntity<PackageAnalysisDto.SecurityInfo>> getSecurityInfo(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Analyzing security for: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzeSecurityIssues(packageName, version)
                .map(securityInfo -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(securityInfo))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/alternatives/{packageName}")
    public Mono<ResponseEntity<List<AlternativePackage>>> getAlternatives(
            @PathVariable String packageName) {
        
        log.info("Finding alternatives for: {}", packageName);
        
        return packageAnalysisService.findAlternatives(packageName)
                .map(alternatives -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(alternatives))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/optimizations/{packageName}")
    public Mono<ResponseEntity<List<OptimizationSuggestion>>> getOptimizations(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Getting optimization suggestions for: {}@{}", packageName, version);
        
        return packageAnalysisService.getOptimizationSuggestions(packageName, version)
                .map(suggestions -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(suggestions))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @PostMapping("/compare")
    public Mono<ResponseEntity<Map<String, PackageAnalysisDto>>> comparePackages(
            @RequestBody List<String> packageNames) {
        
        log.info("Comparing {} packages", packageNames.size());
        
        return packageAnalysisService.comparePackages(packageNames)
                .map(comparison -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(comparison))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/search")
    public Mono<ResponseEntity<List<String>>> searchPackages(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Searching packages with query: {} (limit: {})", query, limit);
        
        return npmRegistryService.searchPackages(query, limit)
                .map(results -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(results))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/package-info/{packageName}")
    public Mono<ResponseEntity<Map<String, Object>>> getPackageInfo(
            @PathVariable String packageName) {
        
        log.info("Getting package info for: {}", packageName);
        
        return npmRegistryService.getPackageInfo(packageName)
                .map(info -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(info))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }

    @GetMapping("/download-stats/{packageName}")
    public Mono<ResponseEntity<Map<String, Object>>> getDownloadStats(
            @PathVariable String packageName) {
        
        log.info("Getting download stats for: {}", packageName);
        
        return npmRegistryService.getPackageDownloadStats(packageName)
                .map(stats -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(stats))
                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
    }
}