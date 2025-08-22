package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.PackageAnalysisDto;
import reactor.core.publisher.Mono;

public interface SecurityAnalysisService {
    Mono<PackageAnalysisDto.SecurityInfo> analyzeSecurityIssues(String packageName, String version);
}