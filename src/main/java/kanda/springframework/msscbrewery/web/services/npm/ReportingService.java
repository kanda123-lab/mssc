package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.PackageAnalysisDto;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

public interface ReportingService {
    
    Mono<byte[]> generatePdfReport(PackageAnalysisDto analysis);
    
    Mono<byte[]> generateCsvReport(List<PackageAnalysisDto> analyses);
    
    Mono<String> generateJsonReport(PackageAnalysisDto analysis);
    
    Mono<byte[]> generateComparisonReport(Map<String, PackageAnalysisDto> comparison);
    
    Mono<String> generateMarkdownReport(PackageAnalysisDto analysis);
}