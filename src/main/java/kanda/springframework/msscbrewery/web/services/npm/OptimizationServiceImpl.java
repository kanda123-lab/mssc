package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.OptimizationSuggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OptimizationServiceImpl implements OptimizationService {

    private final NpmRegistryService npmRegistryService;

    @Override
    public Mono<List<OptimizationSuggestion>> generateSuggestions(String packageName, String version) {
        log.debug("Generating optimization suggestions for: {}@{}", packageName, version);
        
        return Mono.zip(
                npmRegistryService.getBundleInfo(packageName, version),
                npmRegistryService.getPackageInfo(packageName),
                npmRegistryService.getSimilarPackages(packageName)
        ).map(tuple -> {
            Map<String, Object> bundleInfo = tuple.getT1();
            Map<String, Object> packageInfo = tuple.getT2();
            
            List<OptimizationSuggestion> suggestions = new ArrayList<>();
            
            // Bundle size optimization
            long bundleSize = getLongValue(bundleInfo, "size", 0L);
            if (bundleSize > 100_000) { // > 100KB
                suggestions.add(OptimizationSuggestion.builder()
                        .type(OptimizationSuggestion.Type.BUNDLE_SPLITTING.getValue())
                        .title("Large Bundle Size")
                        .description("This package has a large bundle size (" + formatBytes(bundleSize) + "). Consider code splitting or finding lighter alternatives.")
                        .impact(OptimizationSuggestion.Impact.HIGH.getValue())
                        .potentialSavings(bundleSize / 2) // Estimated 50% savings
                        .difficulty("medium")
                        .recommendation("Implement code splitting or dynamic imports")
                        .codeExample("import('./large-module').then(module => { /* use module */ });")
                        .build());
            }
            
            // Tree-shaking suggestion
            boolean hasEsModules = getBooleanValue(bundleInfo, "hasJSModule", false);
            if (!hasEsModules) {
                suggestions.add(OptimizationSuggestion.builder()
                        .type(OptimizationSuggestion.Type.TREE_SHAKING.getValue())
                        .title("Enable Tree Shaking")
                        .description("This package doesn't support ES modules, which limits tree-shaking effectiveness.")
                        .impact(OptimizationSuggestion.Impact.MEDIUM.getValue())
                        .potentialSavings(bundleSize / 4) // Estimated 25% savings
                        .difficulty("low")
                        .recommendation("Look for ES module alternatives or use specific imports")
                        .codeExample("import { specificFunction } from '" + packageName + "/lib/specific';")
                        .build());
            }
            
            // Dynamic import suggestion
            if (bundleSize > 50_000) {
                suggestions.add(OptimizationSuggestion.builder()
                        .type(OptimizationSuggestion.Type.DYNAMIC_IMPORT.getValue())
                        .title("Consider Dynamic Imports")
                        .description("This package could benefit from dynamic imports to reduce initial bundle size.")
                        .impact(OptimizationSuggestion.Impact.MEDIUM.getValue())
                        .potentialSavings(bundleSize)
                        .difficulty("low")
                        .recommendation("Load this package only when needed")
                        .codeExample("const " + toCamelCase(packageName) + " = await import('" + packageName + "');")
                        .build());
            }
            
            // Version update suggestion
            suggestions.add(OptimizationSuggestion.builder()
                    .type(OptimizationSuggestion.Type.VERSION_UPDATE.getValue())
                    .title("Check for Updates")
                    .description("Ensure you're using the latest version for performance improvements and security fixes.")
                    .impact(OptimizationSuggestion.Impact.LOW.getValue())
                    .potentialSavings(0L)
                    .difficulty("low")
                    .recommendation("Update to the latest stable version")
                    .codeExample("npm update " + packageName)
                    .build());
            
            return suggestions;
        });
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }

    private String toCamelCase(String packageName) {
        String[] parts = packageName.replace("@", "").replace("/", "-").split("-");
        StringBuilder result = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            result.append(Character.toUpperCase(parts[i].charAt(0)))
                    .append(parts[i].substring(1));
        }
        return result.toString();
    }

    private long getLongValue(Map<String, Object> map, String key, long defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
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