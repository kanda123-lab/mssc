package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.PackageAnalysisDto;
import kanda.springframework.msscbrewery.web.model.npm.SecurityVulnerability;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityAnalysisServiceImpl implements SecurityAnalysisService {

    private final NpmRegistryService npmRegistryService;

    @Override
    public Mono<PackageAnalysisDto.SecurityInfo> analyzeSecurityIssues(String packageName, String version) {
        log.debug("Analyzing security issues for: {}@{}", packageName, version);
        
        return Mono.zip(
                npmRegistryService.getSecurityAdvisories(packageName),
                npmRegistryService.isPackageDeprecated(packageName),
                checkLicenseCompatibility(packageName, version)
        ).map(tuple -> {
            List<SecurityVulnerability> vulnerabilities = tuple.getT1();
            Boolean isDeprecated = tuple.getT2();
            String licenseCompatibility = tuple.getT3();
            
            return PackageAnalysisDto.SecurityInfo.builder()
                    .vulnerabilityCount(vulnerabilities.size())
                    .vulnerabilities(vulnerabilities)
                    .hasDeprecatedDependencies(isDeprecated)
                    .deprecatedPackages(isDeprecated ? List.of(packageName) : List.of())
                    .licenseCompatibility(licenseCompatibility)
                    .build();
        });
    }

    private Mono<String> checkLicenseCompatibility(String packageName, String version) {
        return npmRegistryService.getPackageInfo(packageName)
                .map(packageInfo -> {
                    Object license = packageInfo.get("license");
                    if (license instanceof String) {
                        return checkLicenseType((String) license);
                    }
                    return "unknown";
                })
                .onErrorReturn("unknown");
    }

    private String checkLicenseType(String license) {
        if (license == null) return "unknown";
        
        license = license.toLowerCase();
        
        if (license.contains("mit") || license.contains("bsd") || license.contains("apache")) {
            return "permissive";
        } else if (license.contains("gpl") || license.contains("copyleft")) {
            return "copyleft";
        } else if (license.contains("proprietary") || license.contains("commercial")) {
            return "proprietary";
        } else {
            return "other";
        }
    }
}