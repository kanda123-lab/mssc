package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.npm.PackageAnalysisDto;
import kanda.springframework.msscbrewery.web.services.npm.PackageAnalysisService;
import kanda.springframework.msscbrewery.web.services.npm.ReportingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/npm/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "file://"})
public class NpmReportingController {

    private final PackageAnalysisService packageAnalysisService;
    private final ReportingService reportingService;

    @GetMapping("/pdf/{packageName}")
    public Mono<ResponseEntity<byte[]>> generatePdfReport(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Generating PDF report for: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzePackage(packageName, version)
                .flatMap(reportingService::generatePdfReport)
                .map(pdf -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + packageName + "-analysis.pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdf))
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @PostMapping("/csv")
    public Mono<ResponseEntity<byte[]>> generateCsvReport(@RequestBody List<String> packageNames) {
        log.info("Generating CSV report for {} packages", packageNames.size());
        
        return packageAnalysisService.analyzeMultiplePackages(packageNames)
                .flatMap(reportingService::generateCsvReport)
                .map(csv -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"package-analysis.csv\"")
                        .contentType(MediaType.parseMediaType("text/csv"))
                        .body(csv))
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/json/{packageName}")
    public Mono<ResponseEntity<String>> generateJsonReport(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Generating JSON report for: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzePackage(packageName, version)
                .flatMap(reportingService::generateJsonReport)
                .map(json -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + packageName + "-analysis.json\"")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(json))
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @GetMapping("/markdown/{packageName}")
    public Mono<ResponseEntity<String>> generateMarkdownReport(
            @PathVariable String packageName,
            @RequestParam(defaultValue = "latest") String version) {
        
        log.info("Generating Markdown report for: {}@{}", packageName, version);
        
        return packageAnalysisService.analyzePackage(packageName, version)
                .flatMap(reportingService::generateMarkdownReport)
                .map(markdown -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + packageName + "-analysis.md\"")
                        .contentType(MediaType.TEXT_PLAIN)
                        .body(markdown))
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }

    @PostMapping("/comparison/pdf")
    public Mono<ResponseEntity<byte[]>> generateComparisonPdf(@RequestBody List<String> packageNames) {
        log.info("Generating comparison PDF for {} packages", packageNames.size());
        
        return packageAnalysisService.comparePackages(packageNames)
                .flatMap(reportingService::generateComparisonReport)
                .map(pdf -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"package-comparison.pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(pdf))
                .onErrorReturn(ResponseEntity.internalServerError().build());
    }
}