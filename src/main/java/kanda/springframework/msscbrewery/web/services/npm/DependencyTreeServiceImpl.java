package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.DependencyNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DependencyTreeServiceImpl implements DependencyTreeService {

    private final NpmRegistryService npmRegistryService;

    @Override
    public Mono<DependencyNode> buildDependencyTree(String packageName, String version) {
        log.debug("Building dependency tree for: {}@{}", packageName, version);
        
        return buildDependencyNode(packageName, version, 0, new HashSet<>(), true);
    }

    private Mono<DependencyNode> buildDependencyNode(String packageName, String version, int depth, Set<String> visited, boolean isDirect) {
        String nodeKey = packageName + "@" + version;
        
        if (visited.contains(nodeKey) || depth > 5) { // Prevent infinite recursion and limit depth
            return Mono.just(DependencyNode.builder()
                    .name(packageName)
                    .version(version)
                    .depth(depth)
                    .isDirect(isDirect)
                    .children(Collections.emptyList())
                    .build());
        }
        
        visited.add(nodeKey);
        
        return npmRegistryService.getPackageVersionInfo(packageName, version)
                .flatMap(packageInfo -> {
                    DependencyNode.DependencyNodeBuilder nodeBuilder = DependencyNode.builder()
                            .name(packageName)
                            .version(version)
                            .resolvedVersion(version)
                            .depth(depth)
                            .isDirect(isDirect)
                            .isOptional(false);
                    
                    // Get dependencies
                    Map<String, Object> dependencies = (Map<String, Object>) packageInfo.get("dependencies");
                    if (dependencies != null && !dependencies.isEmpty() && depth < 3) { // Limit recursion depth
                        return buildChildNodes(dependencies, depth + 1, new HashSet<>(visited))
                                .map(children -> nodeBuilder
                                        .dependencyType(DependencyNode.DependencyType.PRODUCTION.name())
                                        .children(children)
                                        .build());
                    } else {
                        return Mono.just(nodeBuilder
                                .dependencyType(DependencyNode.DependencyType.PRODUCTION.name())
                                .children(Collections.emptyList())
                                .build());
                    }
                })
                .doOnError(ex -> log.warn("Failed to build dependency tree for {}@{}: {}", packageName, version, ex.getMessage()))
                .onErrorReturn(DependencyNode.builder()
                        .name(packageName)
                        .version(version)
                        .depth(depth)
                        .isDirect(isDirect)
                        .children(Collections.emptyList())
                        .build());
    }

    private Mono<List<DependencyNode>> buildChildNodes(Map<String, Object> dependencies, int depth, Set<String> visited) {
        final Map<String, Object> finalDependencies;
        if (dependencies.size() > 20) { // Limit number of dependencies to process
            finalDependencies = dependencies.entrySet().stream()
                    .limit(20)
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
        } else {
            finalDependencies = dependencies;
        }
        
        final int finalDepth = depth;
        final Set<String> finalVisited = visited;
        
        return Mono.fromCallable(() -> 
            finalDependencies.entrySet().stream()
                    .map(entry -> {
                        String depName = entry.getKey();
                        String depVersion = resolveVersion(entry.getValue().toString());
                        return buildDependencyNode(depName, depVersion, finalDepth, finalVisited, false);
                    })
                    .collect(Collectors.toList())
        ).flatMap(monoList -> 
            Mono.zip(monoList, objects -> Arrays.stream(objects)
                    .map(obj -> (DependencyNode) obj)
                    .collect(Collectors.toList()))
        ).onErrorReturn(Collections.emptyList());
    }

    private String resolveVersion(String versionRange) {
        // Simple version resolution - in real implementation, this would be more sophisticated
        if (versionRange.startsWith("^") || versionRange.startsWith("~")) {
            return versionRange.substring(1);
        }
        if (versionRange.startsWith(">=") || versionRange.startsWith("<=")) {
            return versionRange.substring(2);
        }
        if (versionRange.startsWith(">") || versionRange.startsWith("<")) {
            return versionRange.substring(1);
        }
        return versionRange;
    }
}